import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormDto, FormVersionDto, isDataField } from '@saas/shared';
import { formsService } from '../../../../services/forms.service';
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
} from '../../../../components';
import { VersionComparisonModal } from './VersionComparisonModal';
import { FormDetailTab } from '../FormDetailPage.types';

interface VersionsSectionProps {
  form: FormDto;
  onRefresh: () => Promise<void>;
  onNavigateTab: (tab: FormDetailTab) => void;
}

export const VersionsSection: React.FC<VersionsSectionProps> = ({
  form,
  onRefresh,
  onNavigateTab,
}) => {
  const navigate = useNavigate();

  // Dialog & Action states
  const [deployTargetVersion, setDeployTargetVersion] = useState<FormVersionDto | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCreatingNewVersion, setIsCreatingNewVersion] = useState(false);
  const [duplicatingVersionId, setDuplicatingVersionId] = useState<string | null>(null);

  // Comparison modal state
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonSourceId, setComparisonSourceId] = useState<string | undefined>();
  const [comparisonTargetId, setComparisonTargetId] = useState<string | undefined>();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const versions = form.versions || [];
  // Sort descending by version number
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const deployedVersionId = form.deployedVersionId;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Deploy handler
  const handleConfirmDeploy = async () => {
    if (!deployTargetVersion) return;
    setIsDeploying(true);
    setNotification(null);
    try {
      await formsService.deployVersion(form.id, deployTargetVersion.id);
      setNotification({
        type: 'success',
        message: `Version ${deployTargetVersion.versionNumber} ("${deployTargetVersion.title}") has been published to live production!`,
      });
      setDeployTargetVersion(null);
      await onRefresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to deploy version',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Create new draft version
  const handleCreateNewDraft = async () => {
    setIsCreatingNewVersion(true);
    setNotification(null);
    try {
      const created = await formsService.createVersion(form.id, {
        title: `${form.name} (Draft v${(sortedVersions[0]?.versionNumber || 0) + 1})`,
      });
      await onRefresh();
      setNotification({
        type: 'success',
        message: `New Draft Version ${created.versionNumber} created successfully!`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create new draft version',
      });
    } finally {
      setIsCreatingNewVersion(false);
    }
  };

  // Duplicate specific version
  const handleDuplicateVersion = async (v: FormVersionDto) => {
    setDuplicatingVersionId(v.id);
    setNotification(null);
    try {
      const cloned = await formsService.duplicateVersion(form.id, v.id);
      await onRefresh();
      setNotification({
        type: 'success',
        message: `Cloned Version ${v.versionNumber} into new Draft Version ${cloned.versionNumber}!`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to duplicate version',
      });
    } finally {
      setDuplicatingVersionId(null);
    }
  };

  // Launch comparison tool between target version and deployed
  const handleOpenComparison = (versionId: string) => {
    setComparisonSourceId(versionId);
    setComparisonTargetId(deployedVersionId || sortedVersions[0]?.id);
    setComparisonModalOpen(true);
  };

  return (
    <div className="form-detail-versions" id="section-versions">
      {/* 1. Section Header Bar */}
      <div className="form-detail-versions__header">
        <div>
          <h3 className="form-detail-versions__title">Versions & Drafts History</h3>
          <p className="form-detail-versions__subtitle">
            All immutable versions and working drafts of this form. The active production release is highlighted below.
          </p>
        </div>

        <div className="form-detail-versions__header-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setComparisonSourceId(sortedVersions[0]?.id);
              setComparisonTargetId(deployedVersionId || sortedVersions[1]?.id);
              setComparisonModalOpen(true);
            }}
            disabled={versions.length < 2}
            id="open-comparison-tool-btn"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icon" style={{ fontSize: '16px' }}>compare_arrows</span>
              Compare Versions
            </span>
          </Button>

          <Button
            variant="primary"
            size="small"
            onClick={handleCreateNewDraft}
            isLoading={isCreatingNewVersion}
            id="create-new-draft-btn"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icon" style={{ fontSize: '16px' }}>add</span>
              New Draft Version
            </span>
          </Button>
        </div>
      </div>

      {notification && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert variant={notification.type}>{notification.message}</Alert>
        </div>
      )}

      {/* 2. Version Cards List */}
      <div className="form-detail-versions__list">
        {sortedVersions.map((v) => {
          const isDeployed = v.id === deployedVersionId || v.isDeployed;
          const interactiveFields = (v.elements || []).filter((el) => isDataField(el.type)).length;
          const sectionsCount = v.sections?.length || 1;

          return (
            <div
              key={v.id}
              className={`form-detail-versions__card ${isDeployed ? 'is-deployed' : 'is-draft'}`}
              id={`version-card-${v.versionNumber}`}
            >
              {/* Left Column: Number, Status, Meta */}
              <div className="form-detail-versions__card-main">
                <div className="form-detail-versions__card-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="form-detail-versions__version-tag">
                      Version {v.versionNumber}
                    </span>

                    {isDeployed ? (
                      <Badge variant="success" withDot>
                        DEPLOYED PRODUCTION
                      </Badge>
                    ) : (
                      <Badge variant="neutral">DRAFT</Badge>
                    )}
                  </div>

                  <span className="form-detail-versions__timestamp">
                    Updated {formatDate(v.updatedAt || v.createdAt)}
                  </span>
                </div>

                <h4 className="form-detail-versions__card-title">{v.title}</h4>

                {/* Structural Summary */}
                <div className="form-detail-versions__summary-chips">
                  <span className="summary-chip" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="material-icon" style={{ fontSize: '14px', marginRight: '4px' }}>list_alt</span>
                    {interactiveFields} {interactiveFields === 1 ? 'Data Field' : 'Data Fields'}
                  </span>
                  <span className="summary-chip" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="material-icon" style={{ fontSize: '14px', marginRight: '4px' }}>view_quilt</span>
                    {sectionsCount} {sectionsCount === 1 ? 'Section' : 'Sections'}
                  </span>
                  <span className="summary-chip" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="material-icon" style={{ fontSize: '14px', marginRight: '4px' }}>dashboard_customize</span>
                    {v.formLayout || 'column'} layout
                  </span>
                  <span className="summary-chip" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="material-icon" style={{ fontSize: '14px', marginRight: '4px' }}>person</span>
                    Workspace Member
                  </span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="form-detail-versions__card-actions">
                {/* Edit draft (or inspect if deployed) */}
                <Button
                  variant={isDeployed ? 'secondary' : 'primary'}
                  size="small"
                  onClick={() => navigate(`/forms/${form.id}/edit?version=${v.id}`)}
                  id={`edit-version-btn-${v.versionNumber}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-icon" style={{ fontSize: '14px' }}>
                      {isDeployed ? 'content_copy' : 'edit'}
                    </span>
                    {isDeployed ? 'Edit Copy' : 'Edit Draft'}
                  </span>
                </Button>

                {/* Preview */}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    window.open(`/forms/${form.id}/preview?version=${v.id}`, '_blank')
                  }
                  id={`preview-version-btn-${v.versionNumber}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-icon" style={{ fontSize: '14px' }}>visibility</span>
                    Preview
                  </span>
                </Button>

                {/* Compare with deployed (if this isn't already the deployed version) */}
                {deployedVersionId && !isDeployed && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleOpenComparison(v.id)}
                    title="Compare differences against currently deployed version"
                    id={`compare-version-btn-${v.versionNumber}`}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icon" style={{ fontSize: '14px' }}>compare_arrows</span>
                      Diff vs Live
                    </span>
                  </Button>
                )}

                {/* Duplicate */}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleDuplicateVersion(v)}
                  isLoading={duplicatingVersionId === v.id}
                  title="Duplicate this version into a new draft"
                  id={`duplicate-version-btn-${v.versionNumber}`}
                >
                  Duplicate
                </Button>

                {/* Deploy action */}
                {!isDeployed ? (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => setDeployTargetVersion(v)}
                    id={`deploy-version-btn-${v.versionNumber}`}
                    style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icon" style={{ fontSize: '14px' }}>rocket_launch</span>
                      Deploy
                    </span>
                  </Button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div className="form-detail-versions__active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icon" style={{ fontSize: '14px' }}>check_circle</span>
                      Currently Live
                    </div>
                    {onNavigateTab && (
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onNavigateTab('deployments')}
                        title="View production deployment history"
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          Deployments
                          <span className="material-icon" style={{ fontSize: '14px' }}>arrow_forward</span>
                        </span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deploy Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deployTargetVersion}
        onClose={() => setDeployTargetVersion(null)}
        onConfirm={handleConfirmDeploy}
        title={`Deploy Version ${deployTargetVersion?.versionNumber} to Production?`}
        message={
          <div>
            <p>
              You are about to publish <strong>Version {deployTargetVersion?.versionNumber}</strong> ("{deployTargetVersion?.title}") as the active live production version of <strong>{form.name}</strong>.
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Public visitors to <code>/f/{form.publicId}</code> will immediately see this updated form structure. Previous submissions remain safely preserved.
            </p>
          </div>
        }
        confirmLabel="Publish to Production"
        confirmVariant="primary"
        isLoading={isDeploying}
      />

      {/* Version Comparison Modal */}
      {comparisonModalOpen && (
        <VersionComparisonModal
          isOpen={comparisonModalOpen}
          onClose={() => setComparisonModalOpen(false)}
          form={form}
          initialSourceVersionId={comparisonSourceId}
          initialTargetVersionId={comparisonTargetId}
          onDeployVersion={async (vId) => {
            await formsService.deployVersion(form.id, vId);
            await onRefresh();
          }}
        />
      )}
    </div>
  );
};
