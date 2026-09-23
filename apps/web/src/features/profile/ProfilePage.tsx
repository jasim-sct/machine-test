import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import {
  PageHeader,
  ContentContainer,
  Card,
  CardHeader,
  CardContent,
  FormField,
  FormLabel,
  Input,
  Button,
  Alert,
  UserStatusBadge,
  Badge,
} from '../../components';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!user) return null;

  const handleCancel = () => {
    setName(user.name || '');
    setEmail(user.email || '');
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Name cannot be empty');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <ContentContainer>
      <PageHeader
        title="Profile Settings"
        description="Manage your personal account details"
        actions={
          !isEditing && (
            <Button
              variant="primary"
              onClick={() => {
                setIsEditing(true);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              id="edit-profile-btn"
            >
              Edit Profile
            </Button>
          )
        }
      />

      {successMessage && (
        <Alert variant="success" id="profile-success-alert">
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" id="profile-error-alert">
          {errorMessage}
        </Alert>
      )}

      <div style={{ maxWidth: '680px' }}>
        <Card>
          <CardHeader
            title={isEditing ? 'Edit Profile Details' : 'Account Details'}
            description={
              isEditing
                ? 'Update your full name and primary email address.'
                : 'Your current account profile information.'
            }
          />
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} id="edit-profile-form">
                <FormField>
                  <FormLabel htmlFor="edit-name" required>
                    Full Name
                  </FormLabel>
                  <Input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="edit-email" required>
                    Email Address
                  </FormLabel>
                  <Input
                    id="edit-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <div
                  style={{
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 'var(--space-4)',
                    }}
                  >
                    <div>
                      <FormLabel>Role (Non-editable)</FormLabel>
                      <div>
                        <Badge variant="info">{user.role}</Badge>
                      </div>
                    </div>

                    <div>
                      <FormLabel>Status (Non-editable)</FormLabel>
                      <div>
                        <UserStatusBadge status={user.status} />
                      </div>
                    </div>

                    <div>
                      <FormLabel>User ID</FormLabel>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {user.id}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    marginTop: 'var(--space-6)',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    id="cancel-edit-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    id="save-profile-btn"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <FormLabel>Full Name</FormLabel>
                  <div
                    id="profile-display-name"
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {user.name}
                  </div>
                </div>

                <div>
                  <FormLabel>Email Address</FormLabel>
                  <div
                    id="profile-display-email"
                    style={{
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {user.email}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--space-4)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <FormLabel>Role</FormLabel>
                    <div>
                      <Badge variant="info">{user.role}</Badge>
                    </div>
                  </div>

                  <div>
                    <FormLabel>Account Status</FormLabel>
                    <div>
                      <UserStatusBadge status={user.status} />
                    </div>
                  </div>

                  <div>
                    <FormLabel>Member Since</FormLabel>
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentContainer>
  );
};
