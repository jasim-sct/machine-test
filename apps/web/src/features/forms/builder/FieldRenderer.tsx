import React, { useId } from 'react';
import { FormElement } from '@saas/shared';
import {
  FormField,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
} from '../../../components';

export interface FieldRendererProps {
  element: FormElement;
  value?: any;
  onChange?: (val: any) => void;
  disabled?: boolean;
  error?: string;
  onButtonClick?: () => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  element,
  value,
  onChange,
  disabled = false,
  error,
  onButtonClick,
}) => {
  const radioGroupId = useId();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (!onChange) return;
    if (element.type === 'checkbox') {
      onChange((e.target as HTMLInputElement).checked);
    } else if (element.type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      onChange(files && files.length > 0 ? files[0].name : '');
    } else {
      onChange(e.target.value);
    }
  };

  // Determine regex validation status if enabled and value is present
  let validationStatus: 'valid' | 'invalid' | null = null;
  let validationMessage: string | null = null;

  if (error) {
    validationStatus = 'invalid';
    validationMessage = error;
  } else if (
    element.validation?.enabled &&
    element.validation.pattern &&
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ''
  ) {
    try {
      const reg = new RegExp(element.validation.pattern);
      if (reg.test(String(value))) {
        validationStatus = 'valid';
        validationMessage = element.validation.successMessage || 'Field is valid';
      } else {
        validationStatus = 'invalid';
        validationMessage = element.validation.errorMessage || 'Field format is invalid';
      }
    } catch {
      // invalid regex
    }
  }

  // Non-interactive elements
  if (element.type === 'title') {
    const level = element.headingLevel || 2;
    const content = element.content || element.label || 'Section Heading';
    if (level === 1) {
      return (
        <h1
          style={{
            margin: 'var(--space-2) 0 var(--space-1) 0',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {content}
        </h1>
      );
    }
    if (level === 3) {
      return (
        <h3
          style={{
            margin: 'var(--space-2) 0 var(--space-1) 0',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {content}
        </h3>
      );
    }
    return (
      <h2
        style={{
          margin: 'var(--space-2) 0 var(--space-1) 0',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {content}
      </h2>
    );
  }

  if (element.type === 'description') {
    return (
      <p
        style={{
          margin: '0 0 var(--space-2) 0',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.6',
        }}
      >
        {element.content || element.label || 'Informational text or instructions for the user.'}
      </p>
    );
  }

  if (element.type === 'divider') {
    return (
      <div
        style={{
          width: '100%',
          height: '0.0625rem',
          backgroundColor: 'var(--color-border)',
          margin: 'var(--space-3) 0',
        }}
      />
    );
  }

  if (element.type === 'spacer') {
    return <div style={{ width: '100%', height: 'var(--space-6, 1.5rem)' }} />;
  }

  if (element.type === 'alert') {
    const variant = element.alertVariant || 'info';
    const bgMap = {
      info: 'rgba(2, 132, 199, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      success: 'rgba(16, 185, 129, 0.1)',
    };
    const borderMap = {
      info: 'rgba(2, 132, 199, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)',
      success: 'rgba(16, 185, 129, 0.3)',
    };
    const textMap = {
      info: '#38bdf8',
      warning: '#fbbf24',
      success: '#34d399',
    };
    const iconMap = {
      info: 'info',
      warning: 'warning',
      success: 'check_circle',
    };

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: bgMap[variant],
          border: `0.0625rem solid ${borderMap[variant]}`,
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-primary)',
          margin: 'var(--space-1) 0',
        }}
      >
        <span className="material-icon" style={{ color: textMap[variant], fontSize: '18px' }}>
          {iconMap[variant]}
        </span>
        <div style={{ flex: 1 }}>{element.content || element.label || 'Notice message.'}</div>
      </div>
    );
  }

  if (element.type === 'button') {
    const action = element.buttonAction || 'submit';
    const isSubmit = action === 'submit';
    return (
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Button
          type={isSubmit ? 'submit' : 'button'}
          variant={isSubmit ? 'primary' : 'secondary'}
          size="medium"
          disabled={disabled}
          onClick={onButtonClick}
        >
          {element.buttonText || element.label || (isSubmit ? 'Submit' : 'Action')}
        </Button>
      </div>
    );
  }

  // Interactive controls
  const renderControl = () => {
    switch (element.type) {
      case 'textarea':
        return (
          <Textarea
            id={element.id}
            placeholder={element.placeholder || 'Type here...'}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            rows={3}
            aria-invalid={validationStatus === 'invalid'}
          />
        );

      case 'select':
        return (
          <Select
            id={element.id}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          >
            <option value="">{element.placeholder || 'Select an option...'}</option>
            {(element.options || []).map((opt, i) => (
              <option key={`${opt}-${i}`} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        );

      case 'radio': {
        const options = element.options && element.options.length > 0 ? element.options : ['Option 1', 'Option 2'];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
            {options.map((opt, idx) => (
              <label
                key={`${opt}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="radio"
                  name={`${radioGroupId}-${element.id}`}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange && onChange(opt)}
                  disabled={disabled}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      }

      case 'checkbox':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) 0',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <input
              type="checkbox"
              id={element.id}
              checked={!!value}
              onChange={handleChange}
              disabled={disabled}
              style={{
                width: '1.125rem',
                height: '1.125rem',
                accentColor: 'var(--color-primary)',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            />
            <label
              htmlFor={element.id}
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                userSelect: 'none',
              }}
            >
              {element.label || element.name || 'Checkbox'}
              {element.required && (
                <span style={{ color: 'var(--color-danger)', marginLeft: 'var(--space-1)' }}>*</span>
              )}
            </label>
          </div>
        );

      case 'date':
        return (
          <Input
            id={element.id}
            type="date"
            placeholder={element.placeholder}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          />
        );

      case 'file':
        return (
          <Input
            id={element.id}
            type="file"
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          />
        );

      case 'number':
        return (
          <Input
            id={element.id}
            type="number"
            placeholder={element.placeholder || '0'}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          />
        );

      case 'email':
        return (
          <Input
            id={element.id}
            type="email"
            placeholder={element.placeholder || 'name@example.com'}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          />
        );

      case 'phone':
        return (
          <Input
            id={element.id}
            type="tel"
            placeholder={element.placeholder || '+1 (555) 000-0000'}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          />
        );

      case 'text':
      default:
        return (
          <Input
            id={element.id}
            type="text"
            placeholder={element.placeholder || 'Enter text...'}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={validationStatus === 'invalid'}
          />
        );
    }
  };

  // Dedicated validation feedback or secondary helper text area owned by the field component
  const renderFeedbackArea = () => {
    if (validationStatus === 'invalid' && validationMessage) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-danger)',
            marginTop: 'var(--space-1)',
          }}
        >
          <span className="material-icon" style={{ fontSize: '14px' }}>error</span>
          <span>{validationMessage}</span>
        </div>
      );
    }

    if (validationStatus === 'valid' && validationMessage) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-success)',
            marginTop: 'var(--space-1)',
          }}
        >
          <span className="material-icon" style={{ fontSize: '14px' }}>check_circle</span>
          <span>{validationMessage}</span>
        </div>
      );
    }

    if (element.helperText) {
      return (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}
        >
          {element.helperText}
        </div>
      );
    }

    return null;
  };

  if (element.type === 'checkbox') {
    return (
      <div style={{ width: '100%' }}>
        {renderControl()}
        {renderFeedbackArea()}
      </div>
    );
  }

  return (
    <FormField style={{ margin: 0, width: '100%' }}>
      <FormLabel htmlFor={element.id} required={element.required} style={{ marginBottom: 'var(--space-1)' }}>
        {element.label || element.name || 'Field'}
      </FormLabel>
      {renderControl()}
      {renderFeedbackArea()}
    </FormField>
  );
};
