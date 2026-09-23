import React, { useState } from 'react';
import { FormDto, FormVersionDto } from '@saas/shared';
import { FloatingPanel } from './FloatingPanel';
import './FloatingSettingsPanel.scss';

export interface FloatingSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormDto;
  selectedVersionId: string | null;
  onSelectVersion: (version: FormVersionDto) => void;
  onCreateVersion: () => void;
  isCreatingVersion: boolean;
  formTitle: string;
  onChangeFormTitle: (title: string) => void;
  onNavigateToSubmissions: () => void;
}

export const FloatingSettingsPanel: React.FC<FloatingSettingsPanelProps> = ({
  isOpen,
  onClose,
  form,
  selectedVersionId,
  onSelectVersion,
  onCreateVersion,
  isCreatingVersion,
  formTitle,
  onChangeFormTitle,
  onNavigateToSubmissions,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyPublicUrl = () => {
    if (!form.publicId) return;
    const url = `${window.location.origin}/f/${form.publicId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <FloatingPanel
      title="Form Settings"
      icon="tune"
      isOpen={isOpen}
      onClose={onClose}
      width={400}
      defaultPosition={{ x: Math.round(window.innerWidth / 2 - 200), y: window.innerHeight - 560 }}
    >
      <div className="settings-panel-content">
        {/* Form Identity */}
        <div className="settings-group">
          <span className="settings-group__title">Form Identity</span>
          <div className="settings-field">
            <label htmlFor="settings-form-name">Form Display Name</label>
            <input
              id="settings-form-name"
              type="text"
              value={formTitle}
              onChange={(e) => onChangeFormTitle(e.target.value)}
              placeholder="Enter form title..."
            />
          </div>
          <div className="settings-field">
            <label>Public Slug / Identifier</label>
            <input type="text" value={form.publicId || 'Unassigned'} disabled readOnly />
          </div>
        </div>

        {/* Versions Management */}
        <div className="settings-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="settings-group__title">Version History</span>
            <button
              type="button"
              className="settings-btn"
              onClick={onCreateVersion}
              disabled={isCreatingVersion}
              style={{ padding: '2px 8px', fontSize: '11px', flex: 'none' }}
            >
              <span className="material-icon">add</span>
              <span>{isCreatingVersion ? 'Creating...' : 'New Draft'}</span>
            </button>
          </div>

          <div className="settings-versions-list">
            {(form.versions || []).map((v) => {
              const isSelected = v.id === selectedVersionId;
              const isDeployed = v.id === form.deployedVersionId;
              return (
                <div
                  key={v.id}
                  className={`settings-version-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectVersion(v)}
                >
                  <div className="settings-version-item__left">
                    <span className="material-icon" style={{ fontSize: '16px', color: isSelected ? '#818cf8' : '#64748b' }}>
                      history_edu
                    </span>
                    <div>
                      <div className="settings-version-item__num">Version {v.versionNumber}</div>
                      <div className="settings-version-item__title">{v.title}</div>
                    </div>
                  </div>
                  <div>
                    {isDeployed ? (
                      <span className="settings-version-item__badge live">● Live Deployed</span>
                    ) : (
                      <span className="settings-version-item__badge draft">Draft</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Public Sharing & Submissions */}
        <div className="settings-group">
          <span className="settings-group__title">Sharing & Responses</span>
          <div className="settings-btn-row">
            <button
              type="button"
              className="settings-btn"
              onClick={copyPublicUrl}
              disabled={!form.deployedVersionId}
              title={form.deployedVersionId ? 'Copy live public link' : 'Deploy a version first'}
            >
              <span className="material-icon">content_copy</span>
              <span>{copiedLink ? 'Copied URL!' : 'Copy Share Link'}</span>
            </button>

            {form.deployedVersionId && form.publicId && (
              <button
                type="button"
                className="settings-btn"
                onClick={() => window.open(`/f/${form.publicId}`, '_blank')}
              >
                <span className="material-icon">open_in_new</span>
                <span>Open Form</span>
              </button>
            )}
          </div>

          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              className="settings-btn settings-btn--primary"
              onClick={onNavigateToSubmissions}
              style={{ width: '100%' }}
            >
              <span className="material-icon">bar_chart</span>
              <span>View Submitted Responses</span>
            </button>
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
};
