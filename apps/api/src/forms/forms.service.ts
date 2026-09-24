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
import { UpdateDraftDto } from './dto/update-draft.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import {
  FormDto,
  FormDraftDto,
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

  private ensureDraft(form: FormDocument, fallbackVersions: FormVersionDocument[] = []): FormDraftDto {
    if (form.draft && form.draft.title) {
      return {
        title: form.draft.title,
        elements: form.draft.elements || [],
        sections: form.draft.sections || [],
        formLayout: (form.draft.formLayout as LayoutDirection) || 'column',
        customCss: form.draft.customCss || '',
        updatedAt: form.draft.updatedAt
          ? new Date(form.draft.updatedAt).toISOString()
          : form.updatedAt?.toISOString() || new Date().toISOString(),
      };
    }

    // Fallback if legacy form without draft field
    if (fallbackVersions.length > 0) {
      const latest = fallbackVersions[fallbackVersions.length - 1];
      const draft: FormDraftDto = {
        title: latest.title,
        elements: latest.elements || [],
        sections: latest.sections || [],
        formLayout: (latest.formLayout as LayoutDirection) || 'column',
        customCss: latest.customCss || '',
        updatedAt: latest.updatedAt?.toISOString() || new Date().toISOString(),
      };
      form.draft = {
        ...draft,
        updatedAt: new Date(draft.updatedAt || Date.now()),
      };
      return draft;
    }

    const seed = getRealisticDefaultForm(form.name);
    const draft: FormDraftDto = {
      title: form.name,
      elements: seed.elements,
      sections: seed.sections,
      formLayout: seed.formLayout,
      customCss: '',
      updatedAt: new Date().toISOString(),
    };
    form.draft = {
      ...draft,
      updatedAt: new Date(),
    };
    return draft;
  }

  async create(userId: string, dto: CreateFormDto): Promise<FormDto> {
    const publicId = this.generatePublicId();
    const formName = dto.name.trim();
    const seed = getRealisticDefaultForm(formName);

    const initialDraft = {
      title: formName,
      elements: seed.elements,
      sections: seed.sections,
      formLayout: seed.formLayout,
      customCss: '',
      updatedAt: new Date(),
    };

    const form = await this.formModel.create({
      name: formName,
      userId: new Types.ObjectId(userId),
      publicId,
      draft: initialDraft,
      deployedVersionId: null,
      deployments: [],
      activities: [
        {
          id: `act_${randomBytes(4).toString('hex')}`,
          formId: '', // populated below
          type: 'form_created',
          title: 'Form created',
          description: `Form "${formName}" was created with initial editable draft.`,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    form.activities[0].formId = form._id.toString();
    await form.save();

    const formJson = form.toJSON();

    return {
      id: formJson.id,
      name: formJson.name,
      userId: formJson.userId.toString(),
      publicId: formJson.publicId,
      draft: {
        title: initialDraft.title,
        elements: initialDraft.elements,
        sections: initialDraft.sections,
        formLayout: initialDraft.formLayout,
        customCss: initialDraft.customCss,
        updatedAt: initialDraft.updatedAt.toISOString(),
      },
      deployedVersionId: null,
      deployedVersion: null,
      versionsCount: 0,
      submissionsCount: 0,
      settings: form.settings,
      deployments: [],
      activities: form.activities,
      versions: [],
      hasUnpublishedChanges: true,
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
      const submissionsCount = await this.formSubmissionModel.countDocuments({ formId: form._id });

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

      const draft = this.ensureDraft(form);

      results.push({
        id: formJson.id,
        name: formJson.name,
        userId: formJson.userId.toString(),
        publicId: formJson.publicId,
        draft,
        deployedVersionId: form.deployedVersionId ? form.deployedVersionId.toString() : null,
        deployedVersion,
        versionsCount,
        submissionsCount,
        settings: form.settings,
        deployments: form.deployments || [],
        activities: form.activities || [],
        hasUnpublishedChanges: !deployedVersion || Boolean(form.draft && form.draft.updatedAt > (deployedVersion?.updatedAt ? new Date(deployedVersion.updatedAt) : new Date(0))),
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

    // Load deployment history versions (ordered ASC by version number)
    const versions = await this.formVersionModel
      .find({ formId: form._id })
      .sort({ versionNumber: 1 })
      .exec();

    const draft = this.ensureDraft(form, versions);
    if (!form.draft) {
      await form.save();
    }

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
    const submissionsCount = await this.formSubmissionModel.countDocuments({ formId: form._id });

    // Deployments
    let deployments = form.deployments || [];
    if (deployments.length === 0 && deployedVersion) {
      deployments = [
        {
          id: `dep_${deployedVersion.id}`,
          formId: formJson.id,
          versionId: deployedVersion.id,
          versionNumber: deployedVersion.versionNumber,
          deployedAt: deployedVersion.updatedAt || deployedVersion.createdAt,
          deployedBy: 'Workspace Member',
          isCurrent: true,
          notes: `Production deployment of Version ${deployedVersion.versionNumber}`,
        },
      ];
    }

    // Synthesize activities if empty
    let activities = form.activities || [];
    if (activities.length === 0) {
      const generatedActivities: any[] = [];

      generatedActivities.push({
        id: `act_init_${formJson.id}`,
        formId: formJson.id,
        type: 'form_created',
        title: 'Form created',
        description: `Form "${formJson.name}" was created.`,
        timestamp: formJson.createdAt?.toISOString?.() || new Date().toISOString(),
      });

      for (const d of deployments) {
        generatedActivities.push({
          id: `act_dep_${d.id}`,
          formId: formJson.id,
          type: 'version_deployed',
          title: `Version ${d.versionNumber} deployed`,
          description: `Version ${d.versionNumber} was published to production.`,
          timestamp: d.deployedAt,
          versionNumber: d.versionNumber,
        });
      }

      const recentSubs = await this.formSubmissionModel
        .find({ formId: form._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();
      for (const s of recentSubs) {
        generatedActivities.push({
          id: `act_sub_${s.id}`,
          formId: formJson.id,
          type: 'submission_received',
          title: 'New submission received',
          description: 'A user submitted a response to the form.',
          timestamp: s.createdAt?.toISOString?.() || new Date().toISOString(),
        });
      }

      generatedActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      activities = generatedActivities;
    }

    // Determine whether draft has unpublished changes compared to deployed version
    let hasUnpublishedChanges = false;
    if (!deployedVersion) {
      hasUnpublishedChanges = true;
    } else {
      const draftTitle = (draft.title || '').trim();
      const depTitle = (deployedVersion.title || '').trim();
      const draftLayout = draft.formLayout || 'column';
      const depLayout = deployedVersion.formLayout || 'column';
      const draftCss = (draft.customCss || '').trim();
      const depCss = (deployedVersion.customCss || '').trim();
      const draftSecStr = JSON.stringify(draft.sections || []);
      const depSecStr = JSON.stringify(deployedVersion.sections || []);
      if (draftTitle !== depTitle || draftLayout !== depLayout || draftCss !== depCss || draftSecStr !== depSecStr) {
        hasUnpublishedChanges = true;
      }
    }

    return {
      id: formJson.id,
      name: formJson.name,
      userId: formJson.userId.toString(),
      publicId: formJson.publicId,
      draft,
      deployedVersionId: deployedVersionIdStr,
      deployedVersion,
      versions: versionDtos,
      versionsCount: versionDtos.length,
      submissionsCount,
      settings: form.settings || {
        submissionLimit: null,
        allowMultipleSubmissions: true,
        successMessage: 'Thank you! Your response has been submitted successfully.',
        redirectUrl: '',
        closedMessage: 'This form is currently closed and not accepting new responses.',
        isAcceptingSubmissions: true,
        notifyOnSubmission: false,
        notificationEmails: [],
        webhookUrl: '',
      },
      deployments,
      activities,
      hasUnpublishedChanges,
      createdAt: formJson.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: formJson.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  // Update current draft (does NOT create a version or multiple drafts)
  async updateDraft(
    userId: string,
    formId: string,
    dto: UpdateDraftDto,
  ): Promise<FormDto> {
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

    const existingDraft = this.ensureDraft(form);

    const title = dto.title !== undefined ? dto.title.trim() : existingDraft.title;
    if (dto.title !== undefined && !title) {
      throw new BadRequestException('Title cannot be empty');
    }

    let sections = dto.sections !== undefined ? dto.sections : (existingDraft.sections || []);
    let elements = dto.elements;
    if (elements === undefined) {
      if (sections && sections.length > 0) {
        elements = extractAllElements(sections);
      } else {
        elements = existingDraft.elements || [];
      }
    }

    const formLayout = dto.formLayout !== undefined ? dto.formLayout : (existingDraft.formLayout || 'column');
    const customCss = dto.customCss !== undefined ? dto.customCss : (existingDraft.customCss || '');

    form.draft = {
      title,
      elements,
      sections,
      formLayout,
      customCss,
      updatedAt: new Date(),
    };

    form.updatedAt = new Date();
    await form.save();

    return this.findOne(userId, formId);
  }

  // Deploy current draft -> Creates next immutable version (Version 1, Version 2, ...) and publishes it
  async deployDraft(userId: string, formId: string): Promise<FormDto> {
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

    const draft = this.ensureDraft(form);

    // Block deployment while duplicate references exist!
    if (draft.sections && draft.sections.length > 0) {
      const duplicates = checkDuplicateReferences(draft.sections);
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Deployment blocked: duplicate field reference(s) found: [${duplicates.join(', ')}]. Each field reference must be unique across the entire form.`,
        );
      }
    }

    // Determine next sequential version number based on deployment history
    const latestVersion = await this.formVersionModel
      .findOne({ formId: form._id })
      .sort({ versionNumber: -1 })
      .exec();

    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;
    const elements = draft.sections && draft.sections.length > 0
      ? extractAllElements(draft.sections)
      : (draft.elements || []);

    // Create immutable deployment version snapshot
    const newVersion = await this.formVersionModel.create({
      formId: form._id,
      versionNumber: nextVersionNumber,
      title: draft.title || form.name,
      elements,
      sections: draft.sections || [],
      formLayout: draft.formLayout || 'column',
      customCss: draft.customCss || '',
    });

    // Make this version the active deployed version
    form.deployedVersionId = newVersion._id as any;
    form.updatedAt = new Date();

    // Record deployment history
    const previousDeployments = (form.deployments || []).map((d: any) => ({
      ...d,
      isCurrent: false,
    }));

    const newDeployment = {
      id: `dep_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      versionId: newVersion._id.toString(),
      versionNumber: newVersion.versionNumber,
      deployedAt: new Date().toISOString(),
      deployedBy: 'Workspace Member',
      isCurrent: true,
      notes: `Production deployment of Version ${newVersion.versionNumber}`,
    };

    form.deployments = [newDeployment, ...previousDeployments];

    // Add activity log
    const activity = {
      id: `act_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      type: 'version_deployed',
      title: `Version ${newVersion.versionNumber} deployed`,
      description: `Version ${newVersion.versionNumber} ("${newVersion.title}") was published to production.`,
      timestamp: new Date().toISOString(),
      versionNumber: newVersion.versionNumber,
    };
    form.activities = [activity, ...(form.activities || [])];

    await form.save();
    return this.findOne(userId, formId);
  }

  // Compatibility method: deployVersion delegates to deployDraft or sets active version
  async deployVersion(userId: string, formId: string, versionId?: string): Promise<FormDto> {
    if (!versionId) {
      return this.deployDraft(userId, formId);
    }

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
      // If versionId does not exist, deploy the current draft as next version
      return this.deployDraft(userId, formId);
    }

    // Set existing version as the active deployed version
    form.deployedVersionId = version._id as any;
    form.updatedAt = new Date();

    const previousDeployments = (form.deployments || []).map((d: any) => ({
      ...d,
      isCurrent: false,
    }));

    const newDeployment = {
      id: `dep_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      versionId: version._id.toString(),
      versionNumber: version.versionNumber,
      deployedAt: new Date().toISOString(),
      deployedBy: 'Workspace Member',
      isCurrent: true,
      notes: `Re-activated Version ${version.versionNumber} for production`,
    };

    form.deployments = [newDeployment, ...previousDeployments];

    const activity = {
      id: `act_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      type: 'version_deployed',
      title: `Version ${version.versionNumber} activated`,
      description: `Version ${version.versionNumber} ("${version.title}") is now active in production.`,
      timestamp: new Date().toISOString(),
      versionNumber: version.versionNumber,
    };
    form.activities = [activity, ...(form.activities || [])];

    await form.save();
    return this.findOne(userId, formId);
  }

  // Compatibility: createVersion delegates to deployDraft
  async createVersion(
    userId: string,
    formId: string,
    dto: CreateVersionDto,
  ): Promise<FormVersionDto> {
    if (dto.title || dto.sections || dto.elements) {
      await this.updateDraft(userId, formId, dto);
    }
    const updatedForm = await this.deployDraft(userId, formId);
    return updatedForm.deployedVersion!;
  }

  // Compatibility: updateVersion updates the draft
  async updateVersion(
    userId: string,
    formId: string,
    _versionId: string,
    dto: UpdateVersionDto,
  ): Promise<FormVersionDto> {
    const updatedForm = await this.updateDraft(userId, formId, dto);
    const draft = updatedForm.draft!;
    return {
      id: 'draft',
      formId: updatedForm.id,
      versionNumber: (updatedForm.versions?.length || 0) + 1,
      title: draft.title,
      elements: draft.elements,
      sections: draft.sections,
      formLayout: draft.formLayout,
      customCss: draft.customCss,
      isDeployed: false,
      createdAt: draft.updatedAt || new Date().toISOString(),
      updatedAt: draft.updatedAt || new Date().toISOString(),
    };
  }

  // Compatibility: duplicateVersion copies into draft
  async duplicateVersion(
    userId: string,
    formId: string,
    versionId: string,
  ): Promise<FormVersionDto> {
    if (!Types.ObjectId.isValid(formId) || !Types.ObjectId.isValid(versionId)) {
      throw new NotFoundException('Form or version not found');
    }

    const form = await this.formModel.findById(formId).exec();
    if (!form || form.userId.toString() !== userId) {
      throw new NotFoundException('Form not found');
    }

    const sourceVersion = await this.formVersionModel.findOne({
      _id: new Types.ObjectId(versionId),
      formId: form._id,
    });

    if (!sourceVersion) {
      throw new NotFoundException('Source version not found');
    }

    // Load into current draft
    form.draft = {
      title: `${sourceVersion.title} (Draft)`,
      elements: JSON.parse(JSON.stringify(sourceVersion.elements || [])),
      sections: JSON.parse(JSON.stringify(sourceVersion.sections || [])),
      formLayout: sourceVersion.formLayout || 'column',
      customCss: sourceVersion.customCss || '',
      updatedAt: new Date(),
    };

    form.updatedAt = new Date();
    await form.save();

    return {
      id: 'draft',
      formId: form.id,
      versionNumber: (form.deployments?.length || 0) + 1,
      title: form.draft.title,
      elements: form.draft.elements,
      sections: form.draft.sections,
      formLayout: form.draft.formLayout as LayoutDirection,
      customCss: form.draft.customCss,
      isDeployed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateSettings(
    userId: string,
    formId: string,
    dto: UpdateSettingsDto,
  ): Promise<FormDto> {
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

    if (dto.name && dto.name.trim()) {
      form.name = dto.name.trim();
    }

    if (dto.settings) {
      form.settings = { ...(form.settings || {}), ...dto.settings };
    }

    form.updatedAt = new Date();
    const activity = {
      id: `act_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      type: 'settings_updated',
      title: 'Form settings updated',
      description: 'Form configuration and policy settings were updated.',
      timestamp: new Date().toISOString(),
    };
    form.activities = [activity, ...(form.activities || [])];

    await form.save();
    return this.findOne(userId, formId);
  }

  // Public live form is STABLE and points to the ACTIVE DEPLOYED VERSION snapshot
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
        customCss: '',
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

  // Submissions are recorded against the active deployed version snapshot
  async submitPublicForm(
    publicId: string,
    dto: SubmitFormDto,
  ): Promise<{ message: string; id: string }> {
    const form = await this.formModel.findOne({ publicId }).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.deployedVersionId) {
      throw new BadRequestException('This form has not been deployed yet and is not accepting submissions');
    }

    if (form.settings?.isAcceptingSubmissions === false) {
      throw new BadRequestException(
        form.settings.closedMessage || 'This form is currently closed and not accepting new responses.',
      );
    }

    if (form.settings?.submissionLimit && form.settings.submissionLimit > 0) {
      const count = await this.formSubmissionModel.countDocuments({ formId: form._id });
      if (count >= form.settings.submissionLimit) {
        throw new BadRequestException('This form has reached its maximum submission limit.');
      }
    }

    const deployedVersion = await this.formVersionModel.findById(form.deployedVersionId).exec();
    if (!deployedVersion) {
      throw new BadRequestException('Active deployed version not found');
    }

    // Validate data fields
    const elements = deployedVersion.elements || [];
    for (const el of elements) {
      if (!isDataField(el.type)) continue;

      const refKey = el.reference || el.id;
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

    const subActivity = {
      id: `act_${randomBytes(4).toString('hex')}`,
      formId: form._id.toString(),
      type: 'submission_received',
      title: 'New submission received',
      description: `Submission recorded for Version ${deployedVersion.versionNumber}.`,
      timestamp: new Date().toISOString(),
      versionNumber: deployedVersion.versionNumber,
    };
    form.activities = [subActivity, ...(form.activities || [])];
    await form.save();

    const subJson = submission.toJSON();
    return {
      message: 'Submission received successfully',
      id: subJson.id,
    };
  }

  // Data Sheet: Preserves all historical submitted data across all deployed versions
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

    // Retrieve all deployment versions ordered by versionNumber ASC
    const versions = await this.formVersionModel
      .find({ formId: form._id })
      .sort({ versionNumber: 1 })
      .exec();

    const versionMap = new Map<string, number>();
    const columnsMap = new Map<string, FormDataColumnDto>();

    // Accumulate columns from EVERY deployed version (preserving historical fields)
    for (const v of versions) {
      const vJson = v.toJSON();
      versionMap.set(vJson.id, vJson.versionNumber);
      const elements = vJson.elements || [];
      for (const el of elements) {
        if (!isDataField(el.type)) continue;

        const key = el.reference || el.id;
        if (!columnsMap.has(key) && !columnsMap.has(el.id)) {
          columnsMap.set(key, {
            id: el.id,
            label: el.label || el.name || el.id,
            type: el.type,
            reference: el.reference,
          });
        } else {
          const col = columnsMap.get(key) || columnsMap.get(el.id);
          if (col && (el.label || el.name)) {
            col.label = el.label || el.name || col.label;
            col.type = el.type;
            if (el.reference) col.reference = el.reference;
          }
        }
      }
    }

    // Retrieve all submissions ordered newest first
    const submissions = await this.formSubmissionModel
      .find({ formId: form._id })
      .sort({ createdAt: -1 })
      .exec();

    // If submissions contain raw fields not yet in columnsMap, add them dynamically
    for (const sub of submissions) {
      const sJson = sub.toJSON();
      const rawData = sJson.data || {};
      for (const rawKey of Object.keys(rawData)) {
        if (!columnsMap.has(rawKey)) {
          // Check if key is reference or ID
          const alreadyMatched = Array.from(columnsMap.values()).some(
            (c) => c.id === rawKey || c.reference === rawKey,
          );
          if (!alreadyMatched) {
            columnsMap.set(rawKey, {
              id: rawKey,
              label: rawKey,
              type: 'text',
              reference: rawKey,
            });
          }
        }
      }
    }

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
        if (val === undefined) {
          val = rawData[col.label];
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
