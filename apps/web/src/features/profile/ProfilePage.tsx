import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import {
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

// ─────────────────────────────────────────────────────────────────────────────
// View-mode field row — label on left, value on right
// ─────────────────────────────────────────────────────────────────────────────
interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}
const FieldRow: React.FC<FieldRowProps> = ({ label, children }) => (
  <div className="profile-field">
    <dt className="profile-field__label">{label}</dt>
    <dd className="profile-field__value profile-field__value--text">{children}</dd>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Security action row — description on left, action on right
// ─────────────────────────────────────────────────────────────────────────────
interface SecurityRowProps {
  label: string;
  description: string;
  action: React.ReactNode;
}
const SecurityRow: React.FC<SecurityRowProps> = ({ label, description, action }) => (
  <div className="profile-security-row">
    <div className="profile-security-row__text">
      <span className="profile-security-row__label">{label}</span>
      <span className="profile-security-row__desc">{description}</span>
    </div>
    <div className="profile-security-row__action">{action}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Misc
  const [copiedId, setCopiedId] = useState(false);

  const enterEdit = useCallback(() => {
    if (!user) return;
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  }, [user]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrorMessage(null);
  }, []);

  // Keep draft in sync if user object updates while not editing
  useEffect(() => {
    if (!isEditing && user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user, isEditing]);

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!editName.trim()) {
      setErrorMessage('Full name is required');
      return;
    }
    if (!editEmail.trim()) {
      setErrorMessage('Email address is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
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

  const roleName = user.role === 'ADMIN' ? 'Administrator' : 'Member';

  return (
    <ContentContainer size="narrow" className="profile-page">

      {/* ── Profile Overview ───────────────────────────────────────────── */}
      <div className="profile-overview">
        <div className="profile-overview__identity">
          <Avatar name={user.name || user.email} size="lg" />
          <div className="profile-overview__info">
            <span className="profile-overview__name">{user.name || 'User'}</span>
            <span className="profile-overview__email">{user.email}</span>
            <div className="profile-overview__meta">
              <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>{roleName}</Badge>
              <UserStatusBadge status={user.status} />
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="profile-overview__action">
            <Button variant="secondary" size="small" onClick={enterEdit} id="profile-edit-btn">
              <span className="material-icon" style={{ fontSize: '15px' }}>edit</span>
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Global status alerts */}
      {successMessage && (
        <Alert variant="success" id="profile-success-alert" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <hr className="profile-divider" aria-hidden="true" />

      {/* ── Personal Information ─────────────────────────────────────── */}
      <section className="profile-section" aria-labelledby="section-personal">
        <div className="profile-section__header">
          <h2 className="profile-section__title" id="section-personal">
            Personal Information
          </h2>
        </div>

        {isEditing ? (
          /* ── Edit mode ─────────────────────────────────────────────── */
          <form onSubmit={handleUpdate} id="profile-edit-form" noValidate>
            {errorMessage && (
              <Alert variant="error" id="profile-error-alert" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <div className="profile-edit-fields">
              <FormField>
                <FormLabel htmlFor="profile-name" required>Full Name</FormLabel>
                <Input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="profile-email" required>Email Address</FormLabel>
                <Input
                  id="profile-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <div className="profile-edit-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEdit}
                disabled={isSubmitting}
                id="profile-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                id="profile-save-btn"
              >
                Update
              </Button>
            </div>
          </form>
        ) : (
          /* ── View mode ─────────────────────────────────────────────── */
          <dl className="profile-fields">
            <FieldRow label="Full Name">{user.name || '—'}</FieldRow>
            <FieldRow label="Email">{user.email}</FieldRow>
          </dl>
        )}
      </section>

      <hr className="profile-divider" aria-hidden="true" />

      {/* ── Account ──────────────────────────────────────────────────── */}
      <section className="profile-section" aria-labelledby="section-account">
        <div className="profile-section__header">
          <h2 className="profile-section__title" id="section-account">Account</h2>
        </div>

        <dl className="profile-fields">
          <FieldRow label="Role">
            <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>{roleName}</Badge>
          </FieldRow>

          <FieldRow label="Status">
            <UserStatusBadge status={user.status} />
          </FieldRow>

          <FieldRow label="Member Since">{formattedDate}</FieldRow>

          <div className="profile-field profile-field--block">
            <dt className="profile-field__label">Account ID</dt>
            <dd className="profile-field__value">
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
            </dd>
          </div>

          {user.tenantId && user.tenantId !== user.id && (
            <div className="profile-field profile-field--block">
              <dt className="profile-field__label">Organization ID</dt>
              <dd className="profile-field__value">
                <div className="profile-id-box">
                  <code className="profile-id-box__code">{user.tenantId}</code>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <hr className="profile-divider" aria-hidden="true" />

      {/* ── Security ─────────────────────────────────────────────────── */}
      <section className="profile-section" aria-labelledby="section-security">
        <div className="profile-section__header">
          <h2 className="profile-section__title" id="section-security">Security</h2>
        </div>

        <div className="profile-security-list">
          <SecurityRow
            label="Password"
            description="Secure your account with a strong password"
            action={
              <Button variant="secondary" size="small" disabled id="profile-change-password-btn">
                Change Password
              </Button>
            }
          />
          <SecurityRow
            label="Active Sessions"
            description="Manage where you are currently signed in"
            action={
              <Button
                variant="secondary"
                size="small"
                onClick={logout}
                id="profile-signout-btn"
              >
                <span className="material-icon" style={{ fontSize: '15px' }}>logout</span>
                Sign Out
              </Button>
            }
          />
        </div>
      </section>

      <hr className="profile-divider" aria-hidden="true" />

      {/* ── Preferences ──────────────────────────────────────────────── */}
      <section className="profile-section profile-section--last" aria-labelledby="section-preferences">
        <div className="profile-section__header">
          <h2 className="profile-section__title" id="section-preferences">Preferences</h2>
        </div>

        <dl className="profile-fields">
          <FieldRow label="Language">English (US)</FieldRow>
          <FieldRow label="Timezone">{Intl.DateTimeFormat().resolvedOptions().timeZone}</FieldRow>
          <FieldRow label="Notifications">Enabled</FieldRow>
        </dl>
      </section>

    </ContentContainer>
  );
};
