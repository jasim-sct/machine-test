import React, { useState, useEffect } from 'react';
import {
  FormSection,
  FormElement,
  LayoutDirection,
  getZoneWidthPercent,
  formatSubmissionData,
  extractAllElements,
} from '@saas/shared';
import { FieldRenderer } from '../builder/FieldRenderer';
import { Button } from '../../../components';
import { scopeCss } from '../builder/scopeCss';
import '../builder/FormCanvasHierarchical.scss';

export interface FormRendererProps {
  formTitle?: string;
  formDescription?: string;
  formLayout: LayoutDirection;
  sections: FormSection[];
  elements?: FormElement[];
  values: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  mode?: 'published' | 'preview';
  showSubmitButton?: boolean;
  submitButtonText?: string;
  isSubmitting?: boolean;
  customCss?: string;
  formId?: string;
  onSubmit?: (e: React.FormEvent, data: Record<string, any>) => void;
  onReset?: () => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  formTitle,
  formDescription,
  formLayout = 'column',
  sections = [],
  elements = [],
  values,
  onChange,
  errors = {},
  disabled = false,
  device,
  mode = 'published',
  showSubmitButton = true,
  submitButtonText = 'Submit Response',
  isSubmitting = false,
  customCss = '',
  formId,
  onSubmit,
  onReset,
}) => {
  const scopeClass = formId ? `form-scope-${formId}` : 'form-scope-renderer';
  const scopedStyles = React.useMemo(() => {
    return customCss ? scopeCss(customCss, `.${scopeClass}`) : '';
  }, [customCss, scopeClass]);
  // Dynamic viewport detection if device not explicitly specified
  const [windowDevice, setWindowDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    if (device) return; // Explicit device mode (e.g. simulated preview)

    const updateDevice = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setWindowDevice('mobile');
      } else if (w < 1024) {
        setWindowDevice('tablet');
      } else {
        setWindowDevice('desktop');
      }
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, [device]);

  const activeDevice = device || windowDevice;

  // Flattened elements for submission calculation
  const allElements = sections.length > 0 ? extractAllElements(sections) : elements;
  const hasSubmitButtonElement = allElements.some(
    (el) => el.type === 'button' && (el.buttonAction === 'submit' || !el.buttonAction),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    const formattedData = formatSubmissionData(allElements, values);
    onSubmit(e, formattedData);
  };

  return (
    <div className={`form-renderer-root ${scopeClass} form-renderer-root--${mode} form-renderer-root--device-${activeDevice}`}>
      {/* Scoped Custom CSS */}
      {scopedStyles && <style dangerouslySetInnerHTML={{ __html: scopedStyles }} />}

      {/* Optional Form Header */}
      {(formTitle || formDescription) && (
        <div style={{ marginBottom: 'var(--space-6)', borderBottom: '0.0625rem solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
          {formTitle && (
            <h1
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                margin: '0 0 var(--space-2) 0',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {formTitle}
            </h1>
          )}
          {formDescription && (
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {formDescription}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {sections.length > 0 ? (
          <div className={`sections-container sections-container--${formLayout}`}>
            {sections.map((section) => (
              <div
                key={section.id}
                className="form-section-view"
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius-lg)',
                  border: '0.0625rem solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {section.title && (
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      margin: '0 0 var(--space-4) 0',
                    }}
                  >
                    {section.title}
                  </h2>
                )}

                <div className={`zones-container zones-container--${section.layout}`}>
                  {section.zones.map((zone) => {
                    const preset = zone.responsiveWidth[activeDevice] || 'full';
                    const customVal =
                      activeDevice === 'desktop'
                        ? zone.responsiveWidth.desktopCustom
                        : activeDevice === 'tablet'
                        ? zone.responsiveWidth.tabletCustom
                        : zone.responsiveWidth.mobileCustom;

                    const widthPercent = getZoneWidthPercent(preset, customVal);

                    const gapRatio = (1 - widthPercent / 100).toFixed(4);
                    const calcWidth =
                      widthPercent >= 100
                        ? '100%'
                        : `calc(${widthPercent}% - (var(--space-3) * ${gapRatio}))`;

                    const zoneStyle: React.CSSProperties =
                      section.layout === 'row'
                        ? {
                            flex: `0 0 ${calcWidth}`,
                            maxWidth: calcWidth,
                            width: calcWidth,
                            minWidth: 0,
                            boxSizing: 'border-box',
                          }
                        : {
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                          };

                    return (
                      <div key={zone.id} style={zoneStyle} className="form-zone-view">
                        <div className={`elements-container elements-container--${zone.layout}`}>
                          {zone.elements.map((element) => {
                            const fieldKey = element.reference || element.id;
                            return (
                              <div
                                key={element.id}
                                className={`form-element-view ${
                                  zone.layout === 'row' ? 'form-element-view--row' : ''
                                }`}
                              >
                                <FieldRenderer
                                  element={element}
                                  value={values[fieldKey]}
                                  onChange={(val) => onChange(fieldKey, val)}
                                  disabled={disabled}
                                  error={errors[fieldKey]}
                                  onButtonClick={() => {
                                    if (element.buttonAction === 'reset' && onReset) {
                                      onReset();
                                    }
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : elements.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {elements.map((element) => {
              const fieldKey = element.reference || element.id;
              return (
                <FieldRenderer
                  key={element.id}
                  element={element}
                  value={values[fieldKey]}
                  onChange={(val) => onChange(fieldKey, val)}
                  disabled={disabled}
                  error={errors[fieldKey]}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            This form has no fields to display.
          </div>
        )}

        {/* Submit button when no explicit button element is in the form or requested */}
        {showSubmitButton && !hasSubmitButtonElement && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: 'var(--space-6)',
              marginTop: 'var(--space-4)',
              borderTop: '0.0625rem solid var(--color-border)',
            }}
          >
            <Button
              type="submit"
              variant="primary"
              size="large"
              isLoading={isSubmitting}
              disabled={disabled}
              id="form-submit-action-btn"
            >
              {submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
