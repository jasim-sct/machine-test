export type LayoutDirection = 'row' | 'column';

export type ZoneWidthPreset =
  | 'full'
  | 'three_quarters'
  | 'two_thirds'
  | 'half'
  | 'one_third'
  | 'one_quarter'
  | 'custom';

export interface ResponsiveZoneWidth {
  desktop: ZoneWidthPreset;
  desktopCustom?: number;
  tablet: ZoneWidthPreset;
  tabletCustom?: number;
  mobile: ZoneWidthPreset;
  mobileCustom?: number;
}

export type FormElementType =
  // Interactive Data Fields
  | 'text'
  | 'email'
  | 'number'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'button'
  // Non-Interactive Elements
  | 'title'
  | 'description'
  | 'divider'
  | 'alert'
  | 'spacer';

export type FieldDataType = 'text' | 'number' | 'date' | 'boolean' | 'file';

export interface FieldValidation {
  enabled: boolean;
  pattern?: string;
  errorMessage?: string;
  successMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface FormElement {
  id: string;
  type: FormElementType;
  name?: string;
  reference?: string;
  isReferenceManual?: boolean;
  dataType?: FieldDataType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  defaultValue?: any;
  multiple?: boolean;
  options?: string[]; // for select, radio
  buttonAction?: 'submit' | 'reset' | 'button'; // for button
  buttonText?: string;
  headingLevel?: 1 | 2 | 3; // for title
  content?: string; // for title, description, alert
  alertVariant?: 'info' | 'warning' | 'success'; // for alert
  validation?: FieldValidation;
  colSpan?: number; // legacy backward compatibility
}

export interface FormZone {
  id: string;
  name?: string;
  layout: LayoutDirection; // controls element arrangement: 'column' | 'row'
  responsiveWidth: ResponsiveZoneWidth;
  elements: FormElement[];
}

export interface FormSection {
  id: string;
  name?: string;
  title?: string;
  layout: LayoutDirection; // controls zone arrangement: 'row' | 'column'
  zones: FormZone[];
}

export interface FormVersionDto {
  id: string;
  formId: string;
  versionNumber: number;
  title: string;
  elements: FormElement[];
  sections?: FormSection[];
  formLayout?: LayoutDirection;
  customCss?: string;
  isDeployed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormSettingsDto {
  submissionLimit?: number | null;
  allowMultipleSubmissions?: boolean;
  successMessage?: string;
  redirectUrl?: string;
  closedMessage?: string;
  isAcceptingSubmissions?: boolean;
  notifyOnSubmission?: boolean;
  notificationEmails?: string[];
  webhookUrl?: string;
}

export interface FormDeploymentDto {
  id: string;
  formId: string;
  versionId: string;
  versionNumber: number;
  deployedAt: string;
  deployedBy?: string;
  isCurrent: boolean;
  notes?: string;
}

export interface FormActivityDto {
  id: string;
  formId: string;
  type: 'form_created' | 'version_created' | 'version_deployed' | 'field_updated' | 'submission_received' | 'settings_updated';
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  versionNumber?: number;
  metadata?: Record<string, any>;
}

export interface FormDto {
  id: string;
  name: string;
  userId: string;
  publicId: string;
  deployedVersionId: string | null;
  deployedVersion?: FormVersionDto | null;
  versions?: FormVersionDto[];
  versionsCount?: number;
  submissionsCount?: number;
  settings?: FormSettingsDto;
  deployments?: FormDeploymentDto[];
  activities?: FormActivityDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicFormDto {
  name: string;
  title: string | null;
  elements: FormElement[];
  sections?: FormSection[];
  formLayout?: LayoutDirection;
  customCss?: string;
  isDeployed: boolean;
  publicId: string;
  updatedAt: string;
}

export interface CreateFormDto {
  name: string;
}

export interface CreateVersionDto {
  title?: string;
  elements?: FormElement[];
  sections?: FormSection[];
  formLayout?: LayoutDirection;
  customCss?: string;
}

export interface UpdateVersionDto {
  title?: string;
  elements?: FormElement[];
  sections?: FormSection[];
  formLayout?: LayoutDirection;
  customCss?: string;
}

export interface SubmitFormDto {
  data: Record<string, any>;
}

export interface FormSubmissionDto {
  id: string;
  formId: string;
  versionId: string;
  versionNumber?: number;
  data: Record<string, any>;
  createdAt: string;
}

export interface FormDataColumnDto {
  id: string;
  label: string;
  type: FormElementType;
  reference?: string;
}

export interface FormDataRowDto {
  id: string;
  submittedAt: string;
  versionNumber?: number;
  data: Record<string, any>;
}

export interface FormDataViewDto {
  formId: string;
  formName: string;
  columns: FormDataColumnDto[];
  rows: FormDataRowDto[];
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Helpers & Utilities
// ---------------------------------------------------------------------------

export const INTERACTIVE_ELEMENT_TYPES: readonly FormElementType[] = [
  'text',
  'email',
  'number',
  'phone',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'date',
  'file',
  'button',
] as const;

export const NON_INTERACTIVE_ELEMENT_TYPES: readonly FormElementType[] = [
  'title',
  'description',
  'divider',
  'alert',
  'spacer',
] as const;

export function isInteractiveElement(type: FormElementType): boolean {
  return INTERACTIVE_ELEMENT_TYPES.includes(type);
}

export function isDataField(type: FormElementType): boolean {
  return isInteractiveElement(type) && type !== 'button';
}

export function getDataTypeForElementType(type: FormElementType): FieldDataType | undefined {
  switch (type) {
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'checkbox':
      return 'boolean';
    case 'file':
      return 'file';
    case 'text':
    case 'email':
    case 'phone':
    case 'textarea':
    case 'select':
    case 'radio':
      return 'text';
    default:
      return undefined;
  }
}

export function generateReference(name: string): string {
  if (!name || !name.trim()) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getZoneWidthPercent(preset: ZoneWidthPreset, customVal?: number): number {
  switch (preset) {
    case 'full':
      return 100;
    case 'three_quarters':
      return 75;
    case 'two_thirds':
      return 66.67;
    case 'half':
      return 50;
    case 'one_third':
      return 33.33;
    case 'one_quarter':
      return 25;
    case 'custom': {
      if (typeof customVal === 'number' && !isNaN(customVal)) {
        return Math.min(100, Math.max(10, Math.round(customVal * 10) / 10));
      }
      return 50;
    }
    default:
      return 100;
  }
}

export function extractAllElements(sections: FormSection[]): FormElement[] {
  const elements: FormElement[] = [];
  if (!sections) return elements;
  for (const sec of sections) {
    if (!sec.zones) continue;
    for (const zone of sec.zones) {
      if (!zone.elements) continue;
      elements.push(...zone.elements);
    }
  }
  return elements;
}

export function extractInteractiveElements(sections: FormSection[]): FormElement[] {
  return extractAllElements(sections).filter((el) => isDataField(el.type));
}

export function checkDuplicateReferences(sections: FormSection[]): string[] {
  const dataElements = extractInteractiveElements(sections);
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const el of dataElements) {
    const ref = (el.reference || el.id).trim();
    if (!ref) continue;
    if (seen.has(ref)) {
      duplicates.add(ref);
    } else {
      seen.add(ref);
    }
  }

  return Array.from(duplicates);
}

export function getRealisticDefaultForm(title = 'Registration & Feedback Form'): {
  formLayout: LayoutDirection;
  sections: FormSection[];
  elements: FormElement[];
} {
  const sections: FormSection[] = [
    {
      id: 'sec_personal_details',
      name: 'Personal Information',
      title: title || 'Section 1: Account & Contact',
      layout: 'row',
      zones: [
        {
          id: 'zone_account_info',
          name: 'Account Credentials',
          layout: 'column',
          responsiveWidth: {
            desktop: 'half',
            tablet: 'full',
            mobile: 'full',
          },
          elements: [
            {
              id: 'el_title_profile',
              type: 'title',
              headingLevel: 2,
              content: 'Personal Details',
            },
            {
              id: 'el_desc_profile',
              type: 'description',
              content: 'Please enter your identity details and account credentials below.',
            },
            {
              id: 'el_full_name',
              type: 'text',
              name: 'Full Name',
              reference: 'full_name',
              isReferenceManual: false,
              dataType: 'text',
              label: 'Full Name',
              placeholder: 'Jane Doe',
              required: true,
              helperText: 'Your legal name as it appears on documents',
            },
            {
              id: 'el_username',
              type: 'text',
              name: 'Username',
              reference: 'user_name',
              isReferenceManual: false,
              dataType: 'text',
              label: 'Username',
              placeholder: 'jane_doe',
              required: true,
              helperText: '3-15 characters, letters, numbers, and underscores',
              validation: {
                enabled: true,
                pattern: '^[a-zA-Z0-9_]{3,15}$',
                errorMessage: 'Username format is invalid (3-15 alphanumeric characters)',
                successMessage: 'Username is valid',
              },
            },
          ],
        },
        {
          id: 'zone_contact_info',
          name: 'Contact & Demographics',
          layout: 'column',
          responsiveWidth: {
            desktop: 'half',
            tablet: 'full',
            mobile: 'full',
          },
          elements: [
            {
              id: 'el_work_email',
              type: 'email',
              name: 'Work Email',
              reference: 'work_email',
              isReferenceManual: false,
              dataType: 'text',
              label: 'Work Email',
              placeholder: 'jane@company.com',
              required: true,
              validation: {
                enabled: true,
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                errorMessage: 'Please enter a valid email address',
                successMessage: 'Email format is valid',
              },
            },
            {
              id: 'el_phone',
              type: 'phone',
              name: 'Phone Number',
              reference: 'phone_number',
              isReferenceManual: false,
              dataType: 'number',
              label: 'Phone Number',
              placeholder: '+1 (555) 019-2834',
              required: false,
            },
            {
              id: 'el_dob',
              type: 'date',
              name: 'Date of Birth',
              reference: 'date_of_birth',
              isReferenceManual: false,
              dataType: 'date',
              label: 'Date of Birth',
              required: false,
            },
          ],
        },
      ],
    },
    {
      id: 'sec_feedback_submission',
      name: 'Feedback & Submission',
      title: 'Section 2: Feedback & Verification',
      layout: 'column',
      zones: [
        {
          id: 'zone_feedback',
          name: 'Feedback Zone',
          layout: 'column',
          responsiveWidth: {
            desktop: 'full',
            tablet: 'full',
            mobile: 'full',
          },
          elements: [
            {
              id: 'el_divider_1',
              type: 'divider',
            },
            {
              id: 'el_feedback_type',
              type: 'select',
              name: 'Feedback Category',
              reference: 'feedback_category',
              isReferenceManual: false,
              dataType: 'text',
              label: 'How did you hear about us?',
              options: ['Search Engine', 'Colleague Recommendation', 'Social Media', 'Other'],
              required: true,
            },
            {
              id: 'el_message',
              type: 'textarea',
              name: 'Additional Comments',
              reference: 'comments',
              isReferenceManual: false,
              dataType: 'text',
              label: 'Additional Comments & Feedback',
              placeholder: 'Share any details or requests you have...',
              required: false,
            },
            {
              id: 'el_subscribe',
              type: 'checkbox',
              name: 'Newsletter Subscription',
              reference: 'newsletter_opt_in',
              isReferenceManual: false,
              dataType: 'boolean',
              label: 'Subscribe to our product updates and monthly newsletter',
              required: false,
            },
            {
              id: 'el_submit_btn',
              type: 'button',
              label: 'Submit Application',
              buttonText: 'Submit Application',
              buttonAction: 'submit',
            },
          ],
        },
      ],
    },
  ];

  const elements = extractAllElements(sections);

  return {
    formLayout: 'column',
    sections,
    elements,
  };
}

export function formatSubmissionData(
  elements: FormElement[],
  rawValues: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const el of elements) {
    if (!isDataField(el.type)) continue;
    const key = el.reference || el.id;
    const rawVal = rawValues[key] !== undefined ? rawValues[key] : rawValues[el.id];
    if (rawVal === undefined || rawVal === null || rawVal === '') continue;

    const dataType = el.dataType || getDataTypeForElementType(el.type);
    if (dataType === 'number') {
      const num = Number(rawVal);
      result[key] = !isNaN(num) ? num : rawVal;
    } else if (dataType === 'boolean') {
      result[key] = Boolean(rawVal);
    } else {
      result[key] = rawVal;
    }
  }
  return result;
}
