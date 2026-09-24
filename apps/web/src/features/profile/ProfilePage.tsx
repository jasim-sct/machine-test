import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import {
  PageHeader,
  ContentContainer,
  FormField,
  FormLabel,
  Input,
  Button,
  Alert,
  UserStatusBadge,
  Badge,
  Avatar,
} from '../../components';
import './ProfilePage.scss';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!user) return null;

  const isDirty = name !== (user.name || '') || email !== (user.email || '');

  const handleReset = () => {
    setName(user.name || '');
    setEmail(user.email || '');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      setSuccessMessage('Profile information updated successfully');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (!user.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <ContentContainer size="wide" className="profile-page">
      {/* Page Header */}
      <PageHeader
        title="Profile"
        description="Manage your personal information, account role, and session credentials."
      />

      {/* Status Alerts */}
      {successMessage && (
        <Alert
          variant="success"
          id="profile-success-alert"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          variant="error"
          id="profile-error-alert"
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Main Multi-Column Layout */}
      <div className="profile-grid">
        {/* Left Column: Personal Information Form */}
        <section className="profile-card profile-card--primary" aria-label="Personal Information">
          <div className="profile-card__header">
            <h2 className="profile-card__title">Personal Information</h2>
            <p className="profile-card__subtitle">
              Update your display name and primary contact address.
            </p>
          </div>

          {/* User Identity Banner */}
          <div className="profile-identity">
            <Avatar name={user.name || user.email} size="lg" />
            <div className="profile-identity__info">
              <div className="profile-identity__name-row">
                <span className="profile-identity__name">{user.name || 'User'}</span>
                <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>
                  {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                </Badge>
              </div>
              <span className="profile-identity__email">{user.email}</span>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} id="profile-edit-form" className="profile-form">
            <div className="profile-form__fields">
              <FormField>
                <FormLabel htmlFor="profile-name" required>
                  Full Name
                </FormLabel>
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g., Jane Doe"
                  required
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="profile-email" required>
                  Email Address
                </FormLabel>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g., jane@company.com"
                  required
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <div className="profile-form__actions">
              {isDirty && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  id="profile-reset-btn"
                >
                  Reset
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!isDirty || isSubmitting}
                id="profile-save-btn"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        {/* Right Column: Account Information & Security */}
        <div className="profile-sidebar">
          {/* Account Details Section */}
          <section className="profile-card" aria-label="Account Information">
            <div className="profile-card__header">
              <h2 className="profile-card__title">Account Details</h2>
              <p className="profile-card__subtitle">
                System-managed account attributes and role permissions.
              </p>
            </div>

            <div className="profile-details-list">
              <div className="profile-detail-item">
                <span className="profile-detail-item__label">Account Role</span>
                <span className="profile-detail-item__value">
                  <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>
                    {user.role}
                  </Badge>
                </span>
              </div>

              <div className="profile-detail-item">
                <span className="profile-detail-item__label">Account Status</span>
                <span className="profile-detail-item__value">
                  <UserStatusBadge status={user.status} />
                </span>
              </div>

              <div className="profile-detail-item">
                <span className="profile-detail-item__label">Member Since</span>
                <span className="profile-detail-item__value profile-detail-item__value--text">
                  {formattedDate}
                </span>
              </div>

              <div className="profile-detail-item profile-detail-item--id">
                <span className="profile-detail-item__label">Account ID</span>
                <div className="profile-id-box">
                  <code className="profile-id-box__code">{user.id}</code>
                  <button
                    type="button"
                    className="profile-id-box__copy-btn"
                    onClick={handleCopyId}
                    title="Copy Account ID"
                    aria-label="Copy Account ID"
                  >
                    <span className="material-icon" style={{ fontSize: '14px' }}>
                      {copiedId ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Session Actions */}
          <section className="profile-card" aria-label="Security and Session Actions">
            <div className="profile-card__header">
              <h2 className="profile-card__title">Security & Session</h2>
              <p className="profile-card__subtitle">
                Authentication status and active workspace session.
              </p>
            </div>

            <div className="profile-security-body">
              <div className="profile-security-info">
                <div className="profile-security-info__icon">
                  <span className="material-icon">verified_user</span>
                </div>
                <div className="profile-security-info__text">
                  <span className="profile-security-info__title">Active Authentication</span>
                  <span className="profile-security-info__desc">
                    Signed in via secure JWT token session
                  </span>
                </div>
              </div>

              <div className="profile-security-actions">
                <Button
                  variant="secondary"
                  onClick={logout}
                  id="profile-signout-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span className="material-icon" style={{ fontSize: '18px', marginRight: '6px' }}>
                    logout
                  </span>
                  Sign Out of Session
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ContentContainer>
  );
};
