import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Form, FormDocument } from '../forms/schemas/form.schema';
import { FormVersion, FormVersionDocument } from '../forms/schemas/form-version.schema';
import {
  FormSubmission,
  FormSubmissionDocument,
} from '../forms/schemas/form-submission.schema';
import {
  FormDataViewDto,
  FormDataColumnDto,
  FormDataRowDto,
  FormElement,
  FormSection,
} from '@saas/shared';
import { SubmitFormDto } from '../forms/dto/submit-form.dto';
import { QueueService } from '../infrastructure/queue/queue.service';
import { safeRegexTest } from '../common/utils/safe-regex';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Form.name) private readonly formModel: Model<FormDocument>,
    @InjectModel(FormVersion.name) private readonly formVersionModel: Model<FormVersionDocument>,
    @InjectModel(FormSubmission.name) private readonly formSubmissionModel: Model<FormSubmissionDocument>,
    private readonly queueService: QueueService,
  ) {}

  private validateSubmissionPayload(data: Record<string, any>): void {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Submission data must be an object');
    }

    const keys = Object.keys(data);
    if (keys.length > 200) {
      throw new BadRequestException('Submission contains too many fields (maximum 200 fields allowed)');
    }

    for (const key of keys) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new BadRequestException('Invalid submission field key detected');
      }

      if (key.length > 100) {
        throw new BadRequestException(`Field key "${key.substring(0, 20)}..." exceeds maximum allowed length of 100 characters`);
      }

      const val = data[key];
      if (typeof val === 'string' && val.length > 50000) {
        throw new BadRequestException(`Field "${key}" exceeds maximum allowed length of 50,000 characters`);
      }

      if (Array.isArray(val) && val.length > 100) {
        throw new BadRequestException(`Field "${key}" contains too many items (maximum 100 items allowed)`);
      }
    }
  }

  async submit(publicId: string, dto: SubmitFormDto): Promise<{ message: string; id: string }> {
    const form = await this.formModel.findOne({ publicId }).exec();
    if (!form) {
      throw new NotFoundException(`Public form with ID "${publicId}" not found`);
    }

    if (!form.deployedVersionId) {
      throw new BadRequestException('This form has not been deployed yet and cannot accept submissions');
    }

    const settings = form.settings || {};
    if (settings.isAcceptingSubmissions === false) {
      throw new BadRequestException(
        settings.closedMessage || 'This form is currently closed and not accepting new responses.',
      );
    }

    if (settings.submissionLimit && settings.submissionLimit > 0) {
      const existingCount = await this.formSubmissionModel.countDocuments({ formId: form._id });
      if (existingCount >= settings.submissionLimit) {
        throw new BadRequestException(
          'This form has reached its maximum submission limit and is no longer accepting responses.',
        );
      }
    }

    const deployedVersion = await this.formVersionModel.findById(form.deployedVersionId).exec();
    if (!deployedVersion) {
      throw new BadRequestException('The deployed version for this form is unavailable');
    }

    // Payload limits and anti-abuse validation
    this.validateSubmissionPayload(dto.data || {});

    // Server-side validation against the deployed immutable version schema
    const elements: FormElement[] = [];
    if (deployedVersion.sections && deployedVersion.sections.length > 0) {
      for (const section of deployedVersion.sections) {
        for (const zone of section.zones || []) {
          for (const el of zone.elements || []) {
            elements.push(el);
          }
        }
      }
    } else if (deployedVersion.elements && deployedVersion.elements.length > 0) {
      elements.push(...deployedVersion.elements);
    }

    const submittedData = dto.data || {};

    for (const el of elements) {
      const isDataField =
        el.type !== 'button' &&
        el.type !== 'title' &&
        el.type !== 'description' &&
        el.type !== 'divider' &&
        el.type !== 'spacer' &&
        el.type !== 'alert';

      if (!isDataField) continue;

      const fieldKey = el.reference || el.id;
      const rawVal = submittedData[fieldKey] !== undefined ? submittedData[fieldKey] : submittedData[el.id];

      // Required check
      if (el.required) {
        const isEmpty =
          rawVal === undefined ||
          rawVal === null ||
          rawVal === '' ||
          (Array.isArray(rawVal) && rawVal.length === 0);

        if (isEmpty) {
          throw new BadRequestException(`Field "${el.label || el.name || fieldKey}" is required`);
        }
      }

      // Safe Regex validation pattern check (ReDoS-safe)
      if (el.validation?.enabled && el.validation.pattern && rawVal !== undefined && rawVal !== null && rawVal !== '') {
        const regexResult = safeRegexTest(el.validation.pattern, String(rawVal), 5000);
        if (!regexResult.matches) {
          throw new BadRequestException(
            el.validation.errorMessage || regexResult.error || `Field "${el.label || el.name || fieldKey}" has an invalid format`,
          );
        }
      }
    }

    // Derive tenant identity server-side from form
    const tenantId = form.tenantId || form.userId.toString();

    // Persist immutable submission record linked permanently to the versionId and tenantId
    const submission = await this.formSubmissionModel.create({
      formId: form._id,
      tenantId,
      versionId: deployedVersion._id,
      data: submittedData,
    });

    // Record submission activity on Form document
    const activity = {
      id: `act_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      type: 'submission_received',
      title: 'New submission received',
      description: `Submission recorded under Version ${deployedVersion.versionNumber}.`,
      timestamp: new Date().toISOString(),
      versionNumber: deployedVersion.versionNumber,
    };

    await this.formModel.updateOne(
      { _id: form._id },
      { $push: { activities: { $each: [activity], $position: 0 } } },
    );

    // Asynchronously dispatch webhook notification if configured
    if (settings.webhookUrl) {
      await this.queueService.dispatch('webhook_notification', {
        url: settings.webhookUrl,
        formId: form._id.toString(),
        submissionId: submission._id.toString(),
        data: submittedData,
      });
    }

    return {
      message: 'Submission received successfully',
      id: submission._id.toString(),
    };
  }

  async getDataView(userId: string, formId: string, tenantId?: string): Promise<FormDataViewDto> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new NotFoundException('Form not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId.toString() !== userId || (tenantId && form.tenantId && form.tenantId !== tenantId)) {
      throw new ForbiddenException('You do not have access to this form data');
    }

    // Query all versions ever deployed for this form
    const allVersions = await this.formVersionModel
      .find({ formId: form._id })
      .sort({ versionNumber: 1 })
      .exec();

    // Query all submissions for this form with tenant scoping
    const subFilter: any = { formId: form._id };
    if (tenantId) {
      subFilter.tenantId = tenantId;
    }

    const submissions = await this.formSubmissionModel
      .find(subFilter)
      .sort({ createdAt: -1 })
      .exec();

    const versionMap = new Map<string, number>();
    for (const v of allVersions) {
      versionMap.set(v._id.toString(), v.versionNumber);
    }

    // Build cumulative column set across all versions ever deployed
    const columnsMap = new Map<string, FormDataColumnDto>();

    for (const v of allVersions) {
      const allElements: FormElement[] = [];
      if (v.sections && v.sections.length > 0) {
        for (const s of v.sections as FormSection[]) {
          for (const z of s.zones || []) {
            for (const el of z.elements || []) {
              allElements.push(el);
            }
          }
        }
      } else if (v.elements) {
        allElements.push(...v.elements);
      }

      for (const el of allElements) {
        const isDataField =
          el.type !== 'button' &&
          el.type !== 'title' &&
          el.type !== 'description' &&
          el.type !== 'divider' &&
          el.type !== 'spacer' &&
          el.type !== 'alert';

        if (!isDataField) continue;

        const key = el.reference || el.id;
        if (!columnsMap.has(key)) {
          columnsMap.set(key, {
            id: key,
            label: el.label || el.name || key,
            type: el.type,
            reference: el.reference || key,
          });
        }
      }
    }

    // Inspect submitted data for any extra dynamic fields
    for (const sub of submissions) {
      const data = sub.data || {};
      for (const rawKey of Object.keys(data)) {
        if (!columnsMap.has(rawKey)) {
          columnsMap.set(rawKey, {
            id: rawKey,
            label: rawKey,
            type: 'text',
            reference: rawKey,
          });
        }
      }
    }

    const columns = Array.from(columnsMap.values());

    const rows: FormDataRowDto[] = submissions.map((sub) => {
      const subJson = sub.toJSON();
      const versionNum = versionMap.get(sub.versionId?.toString()) || 1;
      const data = sub.data || {};

      const rowData: Record<string, any> = {};
      for (const col of columns) {
        let val = data[col.reference || col.id];
        if (val === undefined && col.id) {
          val = data[col.id];
        }
        rowData[col.id] = val !== undefined ? val : '';
      }

      return {
        id: subJson.id,
        submittedAt: subJson.createdAt?.toISOString?.() || new Date().toISOString(),
        versionNumber: versionNum,
        data: rowData,
      };
    });

    return {
      formId: form._id.toString(),
      formName: form.name,
      totalCount: rows.length,
      columns,
      rows,
    };
  }
}
