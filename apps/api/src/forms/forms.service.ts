import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Form, FormDocument } from './schemas/form.schema';
import { FormVersion, FormVersionDocument } from './schemas/form-version.schema';
import { FormSubmission, FormSubmissionDocument } from './schemas/form-submission.schema';
import { CreateFormDto } from './dto/create-form.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import {
  FormDto,
  FormVersionDto,
  PublicFormDto,
  FormDataViewDto,
  FormDataColumnDto,
  FormDataRowDto,
  LayoutDirection,
  checkDuplicateReferences,
  extractAllElements,
  getRealisticDefaultForm,
  isDataField,
} from '@saas/shared';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(Form.name)
    private readonly formModel: Model<FormDocument>,
    @InjectModel(FormVersion.name)
    private readonly formVersionModel: Model<FormVersionDocument>,
    @InjectModel(FormSubmission.name)
    private readonly formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  private generatePublicId(): string {
    return `f_${randomBytes(6).toString('hex')}`;
  }

  async create(userId: string, dto: CreateFormDto): Promise<FormDto> {
    const publicId = this.generatePublicId();

    const form = await this.formModel.create({
      name: dto.name.trim(),
      userId: new Types.ObjectId(userId),
      publicId,
      deployedVersionId: null,
    });

    // Automatically create initial Draft v1 seeded with a realistic default form
    const seed = getRealisticDefaultForm(dto.name.trim());
    const initialVersion = await this.formVersionModel.create({
      formId: form._id,
      versionNumber: 1,
      title: dto.name.trim(),
      elements: seed.elements,
      sections: seed.sections,
      formLayout: seed.formLayout,
    });

    const formJson = form.toJSON();
    const versionJson = initialVersion.toJSON();

    return {
      id: formJson.id,
      name: formJson.name,
      userId: formJson.userId.toString(),
      publicId: formJson.publicId,
      deployedVersionId: null,
      deployedVersion: null,
      versionsCount: 1,
      versions: [
        {
          id: versionJson.id,
          formId: formJson.id,
          versionNumber: versionJson.versionNumber,
          title: versionJson.title,
          elements: versionJson.elements || [],
          sections: versionJson.sections || [],
          formLayout: (versionJson.formLayout as LayoutDirection) || 'column',
          customCss: versionJson.customCss || '',
          isDeployed: false,
          createdAt: versionJson.createdAt?.toISOString?.() || new Date().toISOString(),
          updatedAt: versionJson.updatedAt?.toISOString?.() || new Date().toISOString(),
        },
      ],
      createdAt: formJson.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: formJson.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  async findAllForUser(userId: string): Promise<FormDto[]> {
    const forms = await this.formModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();

    const results: FormDto[] = [];

    for (const form of forms) {
      const formJson = form.toJSON();
      const versionsCount = await this.formVersionModel.countDocuments({ formId: form._id });

      let deployedVersion: FormVersionDto | null = null;
      if (form.deployedVersionId) {
        const dep = await this.formVersionModel.findById(form.deployedVersionId).exec();
        if (dep) {
          const depJson = dep.toJSON();
          deployedVersion = {
            id: depJson.id,
            formId: formJson.id,
            versionNumber: depJson.versionNumber,
            title: depJson.title,
            elements: depJson.elements || [],
            sections: depJson.sections || [],
            formLayout: (depJson.formLayout as LayoutDirection) || 'column',
            customCss: depJson.customCss || '',
            isDeployed: true,
            createdAt: depJson.createdAt?.toISOString?.() || new Date().toISOString(),
            updatedAt: depJson.updatedAt?.toISOString?.() || new Date().toISOString(),
          };
        }
      }

      results.push({
        id: formJson.id,
        name: formJson.name,
        userId: formJson.userId.toString(),
        publicId: formJson.publicId,
        deployedVersionId: form.deployedVersionId ? form.deployedVersionId.toString() : null,
        deployedVersion,
        versionsCount,
        createdAt: formJson.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: formJson.updatedAt?.toISOString?.() || new Date().toISOString(),
      });
    }

    return results;
  }

  async findOne(userId: string, formId: string): Promise<FormDto> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new NotFoundException('Form not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this form');
    }

    const formJson = form.toJSON();
    const deployedVersionIdStr = form.deployedVersionId ? form.deployedVersionId.toString() : null;

    const versions = await this.formVersionModel
      .find({ formId: form._id })
      .sort({ versionNumber: 1 })
      .exec();

    const versionDtos: FormVersionDto[] = versions.map((v) => {
      const vJson = v.toJSON();
      const isDeployed = vJson.id === deployedVersionIdStr;
      return {
        id: vJson.id,
        formId: formJson.id,
        versionNumber: vJson.versionNumber,
        title: vJson.title,
        elements: vJson.elements || [],
        sections: vJson.sections || [],
        formLayout: (vJson.formLayout as LayoutDirection) || 'column',
        customCss: vJson.customCss || '',
        isDeployed,
        createdAt: vJson.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: vJson.updatedAt?.toISOString?.() || new Date().toISOString(),
      };
    });

    const deployedVersion = versionDtos.find((v) => v.isDeployed) || null;

    return {
      id: formJson.id,
      name: formJson.name,
      userId: formJson.userId.toString(),
      publicId: formJson.publicId,
      deployedVersionId: deployedVersionIdStr,
      deployedVersion,
      versions: versionDtos,
      versionsCount: versionDtos.length,
      createdAt: formJson.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: formJson.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  async createVersion(
    userId: string,
    formId: string,
    dto: CreateVersionDto,
  ): Promise<FormVersionDto> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new NotFoundException('Form not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this form');
    }

    const latest = await this.formVersionModel
      .findOne({ formId: form._id })
      .sort({ versionNumber: -1 })
      .exec();

    const nextVersionNumber = (latest?.versionNumber || 0) + 1;
    const title = dto.title?.trim() || latest?.title || form.name;
    const sections = dto.sections !== undefined ? dto.sections : (latest?.sections || []);
    const formLayout = dto.formLayout !== undefined ? dto.formLayout : (latest?.formLayout || 'column');

    let elements = dto.elements;
    if (elements === undefined) {
      if (sections && sections.length > 0) {
        elements = extractAllElements(sections);
      } else {
        elements = latest?.elements || [];
      }
    }

    const newVersion = await this.formVersionModel.create({
      formId: form._id,
      versionNumber: nextVersionNumber,
      title,
      elements,
      sections,
      formLayout,
      customCss: dto.customCss !== undefined ? dto.customCss : (latest?.customCss || ''),
    });

    // Touch form updated timestamp
    form.updatedAt = new Date();
    await form.save();

    const vJson = newVersion.toJSON();
    return {
      id: vJson.id,
      formId: form._id.toString(),
      versionNumber: vJson.versionNumber,
      title: vJson.title,
      elements: vJson.elements || [],
      sections: vJson.sections || [],
      formLayout: (vJson.formLayout as LayoutDirection) || 'column',
      customCss: vJson.customCss || '',
      isDeployed: false,
      createdAt: vJson.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: vJson.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  async updateVersion(
    userId: string,
    formId: string,
    versionId: string,
    dto: UpdateVersionDto,
  ): Promise<FormVersionDto> {
    if (!Types.ObjectId.isValid(formId) || !Types.ObjectId.isValid(versionId)) {
      throw new NotFoundException('Form or version not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this form');
    }

    const version = await this.formVersionModel.findOne({
      _id: new Types.ObjectId(versionId),
      formId: form._id,
    });

    if (!version) {
      throw new NotFoundException('Version not found for this form');
    }

    if (dto.title !== undefined) {
      const trimmed = dto.title.trim();
      if (!trimmed) {
        throw new BadRequestException('Title cannot be empty');
      }
      version.title = trimmed;
    }

    if (dto.sections !== undefined) {
      version.sections = dto.sections;
      version.elements = extractAllElements(dto.sections);
    } else if (dto.elements !== undefined) {
      version.elements = dto.elements;
    }

    if (dto.formLayout !== undefined) {
      version.formLayout = dto.formLayout;
    }

    if (dto.customCss !== undefined) {
      version.customCss = dto.customCss;
    }

    await version.save();

    // Touch form updated timestamp
    form.updatedAt = new Date();
    await form.save();

    const vJson = version.toJSON();
    const isDeployed = form.deployedVersionId?.toString() === vJson.id;

    return {
      id: vJson.id,
      formId: form._id.toString(),
      versionNumber: vJson.versionNumber,
      title: vJson.title,
      elements: vJson.elements || [],
      sections: vJson.sections || [],
      formLayout: (vJson.formLayout as LayoutDirection) || 'column',
      customCss: vJson.customCss || '',
      isDeployed,
      createdAt: vJson.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: vJson.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  async deployVersion(userId: string, formId: string, versionId: string): Promise<FormDto> {
    if (!Types.ObjectId.isValid(formId) || !Types.ObjectId.isValid(versionId)) {
      throw new NotFoundException('Form or version not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this form');
    }

    const version = await this.formVersionModel.findOne({
      _id: new Types.ObjectId(versionId),
      formId: form._id,
    });

    if (!version) {
      throw new NotFoundException('Version not found for this form');
    }

    // Block deployment while duplicate references exist!
    if (version.sections && version.sections.length > 0) {
      const duplicates = checkDuplicateReferences(version.sections);
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Deployment blocked: duplicate field reference(s) found: [${duplicates.join(', ')}]. Each field reference must be unique across the entire form.`,
        );
      }
    }

    // Set as the sole deployed version
    form.deployedVersionId = version._id as any;
    form.updatedAt = new Date();
    await form.save();

    return this.findOne(userId, formId);
  }

  async getPublicForm(publicId: string): Promise<PublicFormDto> {
    const form = await this.formModel.findOne({ publicId }).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.deployedVersionId) {
      return {
        name: form.name,
        title: null,
        elements: [],
        sections: [],
        formLayout: 'column',
        isDeployed: false,
        publicId: form.publicId,
        updatedAt: form.updatedAt?.toISOString?.() || new Date().toISOString(),
      };
    }

    const deployedVersion = await this.formVersionModel.findById(form.deployedVersionId).exec();
    if (!deployedVersion) {
      return {
        name: form.name,
        title: null,
        elements: [],
        sections: [],
        formLayout: 'column',
        customCss: '',
        isDeployed: false,
        publicId: form.publicId,
        updatedAt: form.updatedAt?.toISOString?.() || new Date().toISOString(),
      };
    }

    return {
      name: form.name,
      title: deployedVersion.title,
      elements: deployedVersion.elements || [],
      sections: deployedVersion.sections || [],
      formLayout: (deployedVersion.formLayout as LayoutDirection) || 'column',
      customCss: deployedVersion.customCss || '',
      isDeployed: true,
      publicId: form.publicId,
      updatedAt: deployedVersion.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  async submitPublicForm(
    publicId: string,
    dto: SubmitFormDto,
  ): Promise<{ message: string; id: string }> {
    const form = await this.formModel.findOne({ publicId }).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.deployedVersionId) {
      throw new BadRequestException('This form is not currently accepting submissions');
    }

    const deployedVersion = await this.formVersionModel.findById(form.deployedVersionId).exec();
    if (!deployedVersion) {
      throw new BadRequestException('Deployed version not found');
    }

    // Validate required fields and regex
    const elements = deployedVersion.elements || [];
    for (const el of elements) {
      // Only interactive data fields participate in form submission
      if (!isDataField(el.type)) continue;

      const refKey = el.reference || el.id;
      // Value can be sent under reference key or element ID
      const val = dto.data
        ? dto.data[refKey] !== undefined
          ? dto.data[refKey]
          : dto.data[el.id]
        : undefined;

      if (el.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          throw new BadRequestException(`Field "${el.label || el.name || refKey}" is required`);
        }
      }

      // Regex validation if enabled and field is populated
      if (
        el.validation?.enabled &&
        el.validation.pattern &&
        val !== undefined &&
        val !== null &&
        val !== ''
      ) {
        try {
          const reg = new RegExp(el.validation.pattern);
          if (!reg.test(String(val))) {
            throw new BadRequestException(
              el.validation.errorMessage ||
                `Field "${el.label || el.name || refKey}" format is invalid`,
            );
          }
        } catch (e: any) {
          if (e instanceof BadRequestException) throw e;
        }
      }
    }

    const submission = await this.formSubmissionModel.create({
      formId: form._id,
      versionId: deployedVersion._id,
      data: dto.data || {},
    });

    const subJson = submission.toJSON();
    return {
      message: 'Submission received successfully',
      id: subJson.id,
    };
  }

  async getDataView(userId: string, formId: string): Promise<FormDataViewDto> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new NotFoundException('Form not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this form');
    }

    // Retrieve all versions for this form ordered by versionNumber ASC
    const versions = await this.formVersionModel
      .find({ formId: form._id })
      .sort({ versionNumber: 1 })
      .exec();

    const versionMap = new Map<string, number>();
    const columnsMap = new Map<string, FormDataColumnDto>();

    for (const v of versions) {
      const vJson = v.toJSON();
      versionMap.set(vJson.id, vJson.versionNumber);
      const elements = vJson.elements || [];
      for (const el of elements) {
        if (!isDataField(el.type)) continue;

        if (!columnsMap.has(el.id)) {
          columnsMap.set(el.id, {
            id: el.id,
            label: el.label || el.name || el.id,
            type: el.type,
            reference: el.reference,
          });
        } else {
          // If label or type updated in later version, use latest label
          if (el.label || el.name) {
            const existing = columnsMap.get(el.id)!;
            existing.label = el.label || el.name || el.id;
            existing.type = el.type;
            if (el.reference) {
              existing.reference = el.reference;
            }
          }
        }
      }
    }

    // Retrieve all submissions for this form ordered newest first
    const submissions = await this.formSubmissionModel
      .find({ formId: form._id })
      .sort({ createdAt: -1 })
      .exec();

    const columns = Array.from(columnsMap.values());

    const rows: FormDataRowDto[] = submissions.map((sub) => {
      const sJson = sub.toJSON();
      const rawData = sJson.data || {};
      const rowData: Record<string, any> = {};

      for (const col of columns) {
        let val = rawData[col.id];
        if (val === undefined && col.reference) {
          val = rawData[col.reference];
        }
        rowData[col.id] = val !== undefined && val !== null ? val : '';
      }

      return {
        id: sJson.id,
        submittedAt: sJson.createdAt?.toISOString?.() || new Date().toISOString(),
        versionNumber: versionMap.get(sJson.versionId?.toString()) ?? undefined,
        data: rowData,
      };
    });

    return {
      formId: form.id,
      formName: form.name,
      columns,
      rows,
      totalCount: rows.length,
    };
  }
}
