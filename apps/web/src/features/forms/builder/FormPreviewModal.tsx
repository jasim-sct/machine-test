import React, { useState } from 'react';
import {
  FormElement,
  FormSection,
  LayoutDirection,
  isDataField,
  formatSubmissionData,
  extractAllElements,
} from '@saas/shared';
import { Dialog, Button, Alert, Badge } from '../../../components';
import { FormRenderer } from '../renderer/FormRenderer';
import './FormCanvasHierarchical.scss';

export interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  elements?: FormElement[];
  sections?: FormSection[];
  formLayout?: LayoutDirection;
  versionNumber?: number;
  customCss?: string;
  formId?: string;
}

export const FormPreviewModal: React.FC<FormPreviewModalProps> = ({
  isOpen,
  onClose,
  formTitle,
  elements = [],
  sections = [],
  formLayout = 'column',
  versionNumber,
  customCss = '',
  formId,
}) => {
  const [testValues, setTestValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedData, setCopiedData] = useState(false);

  const allElements = sections.length > 0 ? extractAllElements(sections) : elements;
  const dataFields = allElements.filter((el) => isDataField(el.type));

  const handleReset = () => {
    setTestValues({});
    setErrors({});
    setSubmitted(false);
    setSubmittedData(null);
  };

  const handleFieldChange = (key: string, val: any) => {
    setTestValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleTestSubmit = (e: React.FormEvent, formattedData: Record<string, any>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    for (const field of dataFields) {
      const key = field.reference || field.id;
      const val = testValues[key] !== undefined ? testValues[key] : testValues[field.id];

      // Required validation
      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[key] = `${field.label || field.name || 'This field'} is required`;
          continue;
        }
      }

      // Regex validation
      if (field.validation?.enabled && field.validation.pattern && val !== undefined && val !== null && val !== '') {
        try {
          const reg = new RegExp(field.validation.pattern);
          if (!reg.test(String(val))) {
            newErrors[key] = field.validation.errorMessage || 'Invalid format';
          }
        } catch {
          // ignore regex errors in simulated preview
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitted(false);
      setSubmittedData(null);
      return;
    }

    setErrors({});
    setSubmitted(true);
    setSubmittedData(formattedData);
  };

  const deviceWidthMap = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  // Live formatted data for inspection
  const currentFormattedData = formatSubmissionData(dataFields, testValues);

  const copyDataToClipboard = () => {
    const payload = submittedData || currentFormattedData;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Form Preview: ${formTitle || 'Untitled Form'} (Draft v${versionNumber || 1})`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            ⚠️ User Preview: No editor controls, full interactive field behavior, and real validation rules.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" size="small" onClick={handleReset}>
              Reset Form
            </Button>
            <Button variant="primary" size="small" onClick={onClose}>
              Done Previewing
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ padding: 'var(--space-2) 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Viewport device switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-bg-primary)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            gap: '2px',
            marginBottom: 'var(--space-4)',
          }}
        >
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            style={{
              padding: '4px 10px',
              border: 'none',
              background: previewDevice === 'desktop' ? 'var(--color-primary)' : 'transparent',
              color: previewDevice === 'desktop' ? '#fff' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            🖥 Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('tablet')}
            style={{
              padding: '4px 10px',
              border: 'none',
              background: previewDevice === 'tablet' ? 'var(--color-primary)' : 'transparent',
              color: previewDevice === 'tablet' ? '#fff' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            📱 Tablet (768px)
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            style={{
              padding: '4px 10px',
              border: 'none',
              background: previewDevice === 'mobile' ? 'var(--color-primary)' : 'transparent',
              color: previewDevice === 'mobile' ? '#fff' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            📲 Mobile (375px - 320px)
          </button>
        </div>

        {/* Device Frame Viewport Container */}
        <div
          style={{
            width: deviceWidthMap[previewDevice],
            minWidth: previewDevice === 'mobile' ? '320px' : undefined,
            transition: 'all 0.25s ease',
            backgroundColor: 'var(--color-bg-primary)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            boxSizing: 'border-box',
          }}
        >
          {submitted && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Alert variant="success">
                ✓ Form simulation completed successfully! All validation requirements satisfied.
              </Alert>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Alert variant="error">
                Please fix the {Object.keys(errors).length} validation error(s) highlighted below.
              </Alert>
            </div>
          )}

          {/* Unified Shared Form Renderer */}
          <FormRenderer
            mode="preview"
            formTitle={formTitle}
            formLayout={formLayout}
            sections={sections}
            elements={elements}
            device={previewDevice}
            values={testValues}
            onChange={handleFieldChange}
            errors={errors}
            onSubmit={handleTestSubmit}
            onReset={handleReset}
            showSubmitButton={true}
            submitButtonText="Simulate Submit Response"
            customCss={customCss}
            formId={formId}
          />

          {/* Data Structure Preview Card */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Submitted Data Preview (Mapped by Reference)
                </span>
                <Badge variant={submitted ? 'success' : 'neutral'} size="small">
                  {submitted ? 'Submitted Payload' : 'Live Data Stream'}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={copyDataToClipboard}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {copiedData ? '✓ Copied' : '📋 Copy JSON'}
              </Button>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#38bdf8',
                overflowX: 'auto',
                lineHeight: 1.4,
              }}
            >
              {JSON.stringify(
                submittedData || (Object.keys(currentFormattedData).length > 0 ? currentFormattedData : {}),
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
