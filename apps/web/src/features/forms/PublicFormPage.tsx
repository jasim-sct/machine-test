import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PublicFormDto,
  FormElement,
  isDataField,
} from '@saas/shared';
import { formsService } from '../../services/forms.service';
import {
  AuthLayout,
  Card,
  CardHeader,
  CardContent,
  Spinner,
  Alert,
  Button,
} from '../../components';
import { FormRenderer } from './renderer/FormRenderer';
import './builder/FormCanvasHierarchical.scss';

export const PublicFormPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [form, setForm] = useState<PublicFormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!publicId) return;

    let isMounted = true;
    async function loadPublicForm() {
      try {
        setLoading(true);
        setError(null);
        const data = await formsService.getPublic(publicId as string);
        if (isMounted) {
          setForm(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Form not found or inaccessible');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPublicForm();

    return () => {
      isMounted = false;
    };
  }, [publicId]);

  const handleFieldChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !publicId) return;

    // Collect all data fields
    const allFields: FormElement[] =
      form.sections && form.sections.length > 0
        ? form.sections.flatMap((s) => s.zones.flatMap((z) => z.elements)).filter((el) => isDataField(el.type))
        : (form.elements || []).filter((el) => isDataField(el.type));

    const errors: Record<string, string> = {};

    for (const el of allFields) {
      const key = el.reference || el.id;
      const val = formData[key] !== undefined ? formData[key] : formData[el.id];

      // Required check
      if (el.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[key] = `${el.label || el.name || 'This field'} is required`;
          continue;
        }
      }

      // Regex validation check
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
            errors[key] = el.validation.errorMessage || 'Invalid format';
          }
        } catch {
          // ignore invalid regex
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Prepare submission payload sending values under both reference and ID for total compatibility
    const submissionPayload: Record<string, any> = {};
    for (const el of allFields) {
      const primaryKey = el.reference || el.id;
      const val = formData[primaryKey] !== undefined ? formData[primaryKey] : formData[el.id];
      if (val !== undefined) {
        submissionPayload[primaryKey] = val;
        if (el.reference && el.id !== el.reference) {
          submissionPayload[el.id] = val;
        }
      }
    }

    try {
      await formsService.submitPublic(publicId, submissionPayload);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({});
    setValidationErrors({});
    setSubmitted(false);
    setError(null);
  };

  if (loading) {
    return (
      <AuthLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="large" />
        </div>
      </AuthLayout>
    );
  }

  if (error && !form) {
    return (
      <AuthLayout>
        <div style={{ maxWidth: '480px', width: '100%' }}>
          <Card>
            <CardContent>
              <Alert variant="error" title="Form Unavailable">
                {error || 'The requested public form could not be found.'}
              </Alert>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  if (!form || !form.isDeployed) {
    return (
      <AuthLayout>
        <div style={{ maxWidth: '520px', width: '100%' }}>
          <Card>
            <CardHeader title={form?.name || 'Form'} />
            <CardContent>
              <Alert variant="warning" title="Form Not Deployed">
                This form has not been deployed yet. Please check back later.
              </Alert>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <Card>
          <CardHeader
            title={
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {form.name}
              </span>
            }
          />

          <CardContent style={{ padding: 'var(--space-8)' }}>
            <h1
              id="public-form-title"
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                margin: '0 0 var(--space-6) 0',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              {form.title || form.name}
            </h1>

            {error && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            {submitted ? (
              <div
                id="submission-success-card"
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-8) var(--space-4)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-3)' }}>
                  🎉
                </div>
                <h2
                  style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 var(--space-2) 0',
                  }}
                >
                  Thank You!
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  Your response has been recorded successfully.
                </p>
                <Button variant="secondary" onClick={handleReset} id="submit-another-btn">
                  Submit Another Response
                </Button>
              </div>
            ) : (
              <FormRenderer
                mode="published"
                formLayout={form.formLayout || 'column'}
                sections={form.sections || []}
                elements={form.elements || []}
                values={formData}
                onChange={handleFieldChange}
                errors={validationErrors}
                disabled={submitting}
                isSubmitting={submitting}
                onSubmit={handleSubmit}
                onReset={handleReset}
                showSubmitButton={true}
                submitButtonText="Submit Response"
                customCss={form.customCss}
                formId={form.publicId}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};
