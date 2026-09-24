import React, { useState } from 'react';
import {
  FormSection,
  FormZone,
  FormElement,
  LayoutDirection,
  ZoneWidthPreset,
  getZoneWidthPercent,
  generateReference,
  isDataField,
} from '@saas/shared';
import {
  FormField,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Badge,
} from '../../../components';
import './PropertiesPanel.scss';

export type SelectionType =
  | { type: 'form' }
  | { type: 'section'; sectionId: string }
  | { type: 'zone'; sectionId: string; zoneId: string }
  | { type: 'element'; sectionId: string; zoneId: string; elementId: string }
  | null;

export interface PropertiesPanelProps {
  selection: SelectionType;
  formLayout: LayoutDirection;
  onUpdateFormLayout: (layout: LayoutDirection) => void;
  sections: FormSection[];
  onUpdateSections: (sections: FormSection[]) => void;
  onAddSection: () => void;
  onAddZone: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteZone: (sectionId: string, zoneId: string) => void;
  onDeleteElement: (sectionId: string, zoneId: string, elementId: string) => void;
  duplicateReferences?: string[];
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  onPreviewDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onClose?: () => void;
}

const WIDTH_PRESETS: { key: ZoneWidthPreset; label: string; percent: string }[] = [
  { key: 'full', label: 'Full', percent: '100%' },
  { key: 'three_quarters', label: '3/4', percent: '75%' },
  { key: 'two_thirds', label: '2/3', percent: '66.7%' },
  { key: 'half', label: 'Half', percent: '50%' },
  { key: 'one_third', label: '1/3', percent: '33.3%' },
  { key: 'one_quarter', label: '1/4', percent: '25%' },
  { key: 'custom', label: 'Custom', percent: '%' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selection,
  formLayout,
  onUpdateFormLayout,
  sections,
  onUpdateSections,
  onAddSection,
  onAddZone,
  onDeleteSection,
  onDeleteZone,
  onDeleteElement,
  duplicateReferences: _duplicateReferences,
  previewDevice = 'desktop',
  onPreviewDeviceChange,
  onClose,
}) => {
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'tablet' | 'mobile'>(previewDevice);

  // Sync internal device tab when external preview device changes
  React.useEffect(() => {
    if (previewDevice && previewDevice !== activeDeviceTab) {
      setActiveDeviceTab(previewDevice);
    }
  }, [previewDevice]);

  const handleDeviceTabClick = (dev: 'desktop' | 'tablet' | 'mobile') => {
    setActiveDeviceTab(dev);
    onPreviewDeviceChange?.(dev);
  };

  if (!selection) {
    return null;
  }

  // 1. FORM PROPERTIES
  if (selection.type === 'form') {
    return (
      <aside className="properties-drawer">
        <div className="properties-drawer__header">
          <div className="properties-drawer__header-title">
            <span className="material-icon">view_quilt</span>
            <span>Form Properties</span>
            <Badge variant="info" size="small">Form</Badge>
          </div>
          <div className="properties-drawer__header-actions">
            {onClose && (
              <button
                type="button"
                className="properties-drawer__close-btn"
                onClick={onClose}
                title="Close properties"
              >
                <span className="material-icon">close</span>
              </button>
            )}
          </div>
        </div>
        <div className="properties-drawer__body">
          <div>
            <FormLabel>Sections Arrangement</FormLabel>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2) 0' }}>
              Controls how sections are arranged inside the overall form.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => onUpdateFormLayout('column')}
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: formLayout === 'column' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: formLayout === 'column' ? '#fff' : 'var(--color-text-primary)',
                  border: `1px solid ${formLayout === 'column' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                }}
              >
                <span>☰ Column</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>Stacked Vertically</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFormLayout('row')}
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: formLayout === 'row' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: formLayout === 'row' ? '#fff' : 'var(--color-text-primary)',
                  border: `1px solid ${formLayout === 'row' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                }}
              >
                <span>⫼ Row</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>Side by Side</span>
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Total Sections
              </span>
              <Badge variant="neutral" size="small">{sections.length}</Badge>
            </div>
            <Button variant="secondary" size="small" style={{ width: '100%' }} onClick={onAddSection}>
              + Add New Section
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // 2. SECTION PROPERTIES
  if (selection.type === 'section') {
    let sectionIndex = sections.findIndex((s) => s.id === selection.sectionId);
    if (sectionIndex === -1 && sections.length > 0) {
      sectionIndex = 0;
    }
    const section = sections[sectionIndex];
    if (!section) return null;

    const handleUpdateSection = (updates: Partial<FormSection>) => {
      const copy = [...sections];
      copy[sectionIndex] = { ...copy[sectionIndex], ...updates };
      onUpdateSections(copy);
    };

    return (
      <aside className="properties-drawer">
        <div className="properties-drawer__header">
          <div className="properties-drawer__header-title">
            <span className="material-icon">dashboard</span>
            <span>Section #{sectionIndex + 1}</span>
            <Badge variant="info" size="small">Section</Badge>
          </div>
          <div className="properties-drawer__header-actions">
            {onClose && (
              <button
                type="button"
                className="properties-drawer__close-btn"
                onClick={onClose}
                title="Close properties"
              >
                <span className="material-icon">close</span>
              </button>
            )}
          </div>
        </div>
        <div className="properties-drawer__body">
          <div className="properties-group">
            <div className="properties-group__subtitle">
              <span className="material-icon">badge</span>
              <span>Identity</span>
            </div>
            <FormField style={{ margin: 0 }}>
              <FormLabel htmlFor="section-title">Section Title</FormLabel>
              <Input
                id="section-title"
                value={section.title || section.name || ''}
                onChange={(e) => handleUpdateSection({ title: e.target.value, name: e.target.value })}
                placeholder="e.g. Account & Billing Details"
              />
            </FormField>
          </div>

          <div className="properties-group">
            <div className="properties-group__subtitle">
              <span className="material-icon">tune</span>
              <span>Configuration</span>
            </div>
            <div>
              <FormLabel>Zones Arrangement</FormLabel>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2) 0' }}>
              Controls how zones inside this section are arranged.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => handleUpdateSection({ layout: 'row' })}
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: section.layout === 'row' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: section.layout === 'row' ? '#fff' : 'var(--color-text-primary)',
                  border: `1px solid ${section.layout === 'row' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                }}
              >
                <span>⫼ Row</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>Horizontal Flow</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateSection({ layout: 'column' })}
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: section.layout === 'column' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: section.layout === 'column' ? '#fff' : 'var(--color-text-primary)',
                  border: `1px solid ${section.layout === 'column' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                }}
              >
                <span>☰ Column</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>Stacked Vertically</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button
              variant="secondary"
              size="small"
              onClick={() => onAddZone(section.id)}
              style={{ width: '100%' }}
            >
              + Add Zone to Section
            </Button>

            <Button
              variant="danger"
              size="small"
              onClick={() => onDeleteSection(section.id)}
              style={{ width: '100%' }}
            >
              Delete Section
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // 3. ZONE PROPERTIES
  if (selection.type === 'zone') {
    let sectionIndex = sections.findIndex((s) => s.id === selection.sectionId);
    let zoneIndex = sectionIndex !== -1 ? sections[sectionIndex].zones.findIndex((z) => z.id === selection.zoneId) : -1;

    if (zoneIndex === -1) {
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const zIdx = sections[sIdx].zones.findIndex((z) => z.id === selection.zoneId);
        if (zIdx !== -1) {
          sectionIndex = sIdx;
          zoneIndex = zIdx;
          break;
        }
      }
    }

    if (sectionIndex === -1 || zoneIndex === -1) return null;
    const section = sections[sectionIndex];
    const zone = section.zones[zoneIndex];
    if (!zone) return null;

    const handleUpdateZone = (updates: Partial<FormZone>) => {
      const copy = [...sections];
      const secCopy = { ...copy[sectionIndex] };
      const zonesCopy = [...secCopy.zones];
      zonesCopy[zoneIndex] = { ...zonesCopy[zoneIndex], ...updates };
      secCopy.zones = zonesCopy;
      copy[sectionIndex] = secCopy;
      onUpdateSections(copy);
    };

    const currentPreset = zone.responsiveWidth[activeDeviceTab];
    const customKey = `${activeDeviceTab}Custom` as 'desktopCustom' | 'tabletCustom' | 'mobileCustom';
    const customVal = zone.responsiveWidth[customKey] || 50;

    const handleSetPreset = (preset: ZoneWidthPreset) => {
      const nextResponsive = { ...zone.responsiveWidth, [activeDeviceTab]: preset };
      handleUpdateZone({ responsiveWidth: nextResponsive });
    };

    const handleSetCustomVal = (val: number) => {
      const clamped = Math.min(100, Math.max(10, val));
      const nextResponsive = {
        ...zone.responsiveWidth,
        [activeDeviceTab]: 'custom' as ZoneWidthPreset,
        [customKey]: clamped,
      };
      handleUpdateZone({ responsiveWidth: nextResponsive });
    };

    return (
      <aside className="properties-drawer">
        <div className="properties-drawer__header">
          <div className="properties-drawer__header-title">
            <span className="material-icon">view_column</span>
            <span>Zone #{zoneIndex + 1}</span>
            <Badge variant="warning" size="small">Zone</Badge>
          </div>
          <div className="properties-drawer__header-actions">
            {onClose && (
              <button
                type="button"
                className="properties-drawer__close-btn"
                onClick={onClose}
                title="Close properties"
              >
                <span className="material-icon">close</span>
              </button>
            )}
          </div>
        </div>
        <div className="properties-drawer__body">
          <div className="properties-group">
            <div className="properties-group__subtitle">
              <span className="material-icon">badge</span>
              <span>Identity</span>
            </div>
            <FormField style={{ margin: 0 }}>
              <FormLabel htmlFor="zone-name">Zone Label</FormLabel>
              <Input
                id="zone-name"
                value={zone.name || ''}
                onChange={(e) => handleUpdateZone({ name: e.target.value })}
                placeholder="e.g. Left Column, Contact Info"
              />
            </FormField>
          </div>

          <div className="properties-group">
            <div className="properties-group__subtitle">
              <span className="material-icon">tune</span>
              <span>Configuration</span>
            </div>
            {/* Responsive Width Controls */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <FormLabel style={{ marginBottom: 0 }}>Responsive Width</FormLabel>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                {getZoneWidthPercent(currentPreset, customVal)}%
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2) 0' }}>
              Set visual width for each device view without CSS or grid terminology.
            </p>

            {/* Device Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--color-bg-primary)',
                padding: '3px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-3)',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => handleDeviceTabClick('desktop')}
                style={{
                  flex: 1,
                  padding: '5px',
                  border: 'none',
                  background: activeDeviceTab === 'desktop' ? 'var(--color-primary)' : 'transparent',
                  color: activeDeviceTab === 'desktop' ? '#fff' : 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                }}
              >
                🖥 Desktop
              </button>
              <button
                type="button"
                onClick={() => handleDeviceTabClick('tablet')}
                style={{
                  flex: 1,
                  padding: '5px',
                  border: 'none',
                  background: activeDeviceTab === 'tablet' ? 'var(--color-primary)' : 'transparent',
                  color: activeDeviceTab === 'tablet' ? '#fff' : 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                }}
              >
                📱 Tablet
              </button>
              <button
                type="button"
                onClick={() => handleDeviceTabClick('mobile')}
                style={{
                  flex: 1,
                  padding: '5px',
                  border: 'none',
                  background: activeDeviceTab === 'mobile' ? 'var(--color-primary)' : 'transparent',
                  color: activeDeviceTab === 'mobile' ? '#fff' : 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                }}
              >
                📲 Mobile
              </button>
            </div>

            {/* Visual Width Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
              {WIDTH_PRESETS.map((preset) => {
                const isSelected = currentPreset === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleSetPreset(preset.key)}
                    style={{
                      padding: 'var(--space-2) var(--space-1)',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                      color: isSelected ? '#fff' : 'var(--color-text-primary)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'normal',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span>{preset.label}</span>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>{preset.percent}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom slider when custom is selected */}
            {currentPreset === 'custom' && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>
                  <span>Custom Width</span>
                  <span>{customVal}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={customVal}
                  onChange={(e) => handleSetCustomVal(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
              </div>
            )}
          </div>

          {/* Element Arrangement */}
          <div>
            <FormLabel>Elements Arrangement</FormLabel>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2) 0' }}>
              Controls how fields inside this zone are stacked or lined up.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => handleUpdateZone({ layout: 'column' })}
                style={{
                  padding: 'var(--space-2)',
                  backgroundColor: zone.layout === 'column' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: zone.layout === 'column' ? '#fff' : 'var(--color-text-primary)',
                  border: `1px solid ${zone.layout === 'column' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Stacked (Column)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateZone({ layout: 'row' })}
                style={{
                  padding: 'var(--space-2)',
                  backgroundColor: zone.layout === 'row' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: zone.layout === 'row' ? '#fff' : 'var(--color-text-primary)',
                  border: `1px solid ${zone.layout === 'row' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Side by Side (Row)
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            <Button
              variant="danger"
              size="small"
              onClick={() => onDeleteZone(section.id, zone.id)}
              style={{ width: '100%' }}
            >
              Delete Zone
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // 4. ELEMENT PROPERTIES
  if (selection.type === 'element') {
    let sectionIndex = sections.findIndex((s) => s.id === selection.sectionId);
    let zoneIndex = sectionIndex !== -1 ? sections[sectionIndex].zones.findIndex((z) => z.id === selection.zoneId) : -1;
    let elementIndex =
      sectionIndex !== -1 && zoneIndex !== -1
        ? sections[sectionIndex].zones[zoneIndex].elements.findIndex((e) => e.id === selection.elementId)
        : -1;

    if (elementIndex === -1) {
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const s = sections[sIdx];
        for (let zIdx = 0; zIdx < s.zones.length; zIdx++) {
          const eIdx = s.zones[zIdx].elements.findIndex((e) => e.id === selection.elementId);
          if (eIdx !== -1) {
            sectionIndex = sIdx;
            zoneIndex = zIdx;
            elementIndex = eIdx;
            break;
          }
        }
        if (elementIndex !== -1) break;
      }
    }

    if (sectionIndex === -1 || zoneIndex === -1 || elementIndex === -1) return null;
    const section = sections[sectionIndex];
    const zone = section.zones[zoneIndex];
    const element = zone.elements[elementIndex];
    if (!element) return null;

    const isData = isDataField(element.type);

    const handleUpdateElement = (updates: Partial<FormElement>) => {
      const copy = [...sections];
      const secCopy = { ...copy[sectionIndex] };
      const zonesCopy = [...secCopy.zones];
      const elementsCopy = [...zonesCopy[zoneIndex].elements];

      elementsCopy[elementIndex] = { ...elementsCopy[elementIndex], ...updates };
      zonesCopy[zoneIndex] = { ...zonesCopy[zoneIndex], elements: elementsCopy };
      secCopy.zones = zonesCopy;
      copy[sectionIndex] = secCopy;
      onUpdateSections(copy);
    };

    // Human-friendly label change: keep internal platform reference key automatically updated in the background
    const handleLabelChange = (newLabel: string) => {
      const updates: Partial<FormElement> = {
        label: newLabel,
        name: newLabel,
      };
      if (!element.isReferenceManual || !element.reference) {
        updates.reference = generateReference(newLabel);
      }
      handleUpdateElement(updates);
    };

    // Check which sections have meaningful properties for this element
    const hasConfiguration = [
      'select',
      'checkbox',
      'radio',
      'text',
      'textarea',
      'number',
      'email',
      'phone',
      'date',
      'file',
      'button',
      'title',
      'alert',
    ].includes(element.type);

    const hasValidation = isData && element.type !== 'button';

    return (
      <aside className="properties-drawer">
        <div className="properties-drawer__header">
          <div className="properties-drawer__header-title">
            <span className="material-icon">tune</span>
            <span>{element.label || element.name || 'Element'}</span>
            <Badge variant="success" size="small">{element.type.toUpperCase()}</Badge>
          </div>
          <div className="properties-drawer__header-actions">
            {onClose && (
              <button
                type="button"
                className="properties-drawer__close-btn"
                onClick={onClose}
                title="Close properties"
              >
                <span className="material-icon">close</span>
              </button>
            )}
          </div>
        </div>
        <div className="properties-drawer__body">
          {/* 1. IDENTITY */}
          <div className="properties-group">
            <div className="properties-group__subtitle">
              <span className="material-icon">badge</span>
              <span>Identity</span>
            </div>

            {/* Interactive Data Elements */}
            {isData && (
              <>
                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="field-label">Label</FormLabel>
                  <Input
                    id="field-label"
                    value={element.label ?? element.name ?? ''}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    placeholder="Field label shown to user..."
                  />
                </FormField>

                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="field-description">Description</FormLabel>
                  <Input
                    id="field-description"
                    value={element.helperText || ''}
                    onChange={(e) => handleUpdateElement({ helperText: e.target.value })}
                    placeholder="Optional guidance or help text..."
                  />
                </FormField>
              </>
            )}

            {/* Button */}
            {element.type === 'button' && (
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="btn-label">Label</FormLabel>
                <Input
                  id="btn-label"
                  value={element.buttonText || element.label || ''}
                  onChange={(e) =>
                    handleUpdateElement({
                      buttonText: e.target.value,
                      label: e.target.value,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Submit Application"
                />
              </FormField>
            )}

            {/* Title / Heading */}
            {element.type === 'title' && (
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="heading-text">Heading Text</FormLabel>
                <Input
                  id="heading-text"
                  value={element.content || element.label || ''}
                  onChange={(e) =>
                    handleUpdateElement({
                      content: e.target.value,
                      label: e.target.value,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter heading..."
                />
              </FormField>
            )}

            {/* Description Paragraph */}
            {element.type === 'description' && (
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="desc-content">Description</FormLabel>
                <Textarea
                  id="desc-content"
                  rows={4}
                  value={element.content || element.label || ''}
                  onChange={(e) =>
                    handleUpdateElement({
                      content: e.target.value,
                      label: e.target.value,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter descriptive instruction or paragraph..."
                />
              </FormField>
            )}

            {/* Alert / Notice */}
            {element.type === 'alert' && (
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="alert-content">Notice Message</FormLabel>
                <Textarea
                  id="alert-content"
                  rows={3}
                  value={element.content || element.label || ''}
                  onChange={(e) =>
                    handleUpdateElement({
                      content: e.target.value,
                      label: e.target.value,
                      name: e.target.value,
                    })
                  }
                  placeholder="Important instructions or notice..."
                />
              </FormField>
            )}

            {/* Divider */}
            {element.type === 'divider' && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Horizontal dividing line separating form content.
              </p>
            )}

            {/* Spacer */}
            {element.type === 'spacer' && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Vertical whitespace cushion between elements.
              </p>
            )}
          </div>

          {/* 2. CONFIGURATION (Only when applicable) */}
          {hasConfiguration && (
            <div className="properties-group">
              <div className="properties-group__subtitle">
                <span className="material-icon">tune</span>
                <span>Configuration</span>
              </div>

              {/* Select */}
              {element.type === 'select' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-options">Options (one per line)</FormLabel>
                    <Textarea
                      id="field-options"
                      rows={4}
                      value={(element.options || []).join('\n')}
                      onChange={(e) => {
                        const opts = e.target.value.split('\n');
                        handleUpdateElement({ options: opts });
                      }}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </FormField>

                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default-val">Default Value</FormLabel>
                    <Select
                      id="field-default-val"
                      value={element.defaultValue || ''}
                      onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                    >
                      <option value="">(None)</option>
                      {(element.options || []).filter(Boolean).map((opt, i) => (
                        <option key={`${opt}-${i}`} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <div className="properties-toggle-row">
                    <input
                      type="checkbox"
                      id="select-multiple"
                      checked={!!element.multiple}
                      onChange={(e) => handleUpdateElement({ multiple: e.target.checked })}
                    />
                    <label htmlFor="select-multiple">Multiple Selection</label>
                  </div>
                </>
              )}

              {/* Radio */}
              {element.type === 'radio' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-options">Options (one per line)</FormLabel>
                    <Textarea
                      id="field-options"
                      rows={4}
                      value={(element.options || []).join('\n')}
                      onChange={(e) => {
                        const opts = e.target.value.split('\n');
                        handleUpdateElement({ options: opts });
                      }}
                      placeholder="Option 1&#10;Option 2"
                    />
                  </FormField>

                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default-val">Default Value</FormLabel>
                    <Select
                      id="field-default-val"
                      value={element.defaultValue || ''}
                      onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                    >
                      <option value="">(None)</option>
                      {(element.options || []).filter(Boolean).map((opt, i) => (
                        <option key={`${opt}-${i}`} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </>
              )}

              {/* Checkbox */}
              {element.type === 'checkbox' && (
                <div className="properties-toggle-row">
                  <input
                    type="checkbox"
                    id="checkbox-default"
                    checked={!!element.defaultValue}
                    onChange={(e) => handleUpdateElement({ defaultValue: e.target.checked })}
                  />
                  <label htmlFor="checkbox-default">Checked by default</label>
                </div>
              )}

              {/* Text */}
              {element.type === 'text' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-placeholder">Placeholder</FormLabel>
                    <Input
                      id="field-placeholder"
                      value={element.placeholder || ''}
                      onChange={(e) => handleUpdateElement({ placeholder: e.target.value })}
                      placeholder="e.g. Enter text..."
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default">Default Value</FormLabel>
                    <Input
                      id="field-default"
                      value={element.defaultValue ?? ''}
                      onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                      placeholder="Initial value..."
                    />
                  </FormField>
                </>
              )}

              {/* Textarea */}
              {element.type === 'textarea' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-placeholder">Placeholder</FormLabel>
                    <Input
                      id="field-placeholder"
                      value={element.placeholder || ''}
                      onChange={(e) => handleUpdateElement({ placeholder: e.target.value })}
                      placeholder="e.g. Type your message here..."
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default">Default Value</FormLabel>
                    <Textarea
                      id="field-default"
                      rows={3}
                      value={element.defaultValue ?? ''}
                      onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                      placeholder="Initial content..."
                    />
                  </FormField>
                </>
              )}

              {/* Number */}
              {element.type === 'number' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-placeholder">Placeholder</FormLabel>
                    <Input
                      id="field-placeholder"
                      value={element.placeholder || ''}
                      onChange={(e) => handleUpdateElement({ placeholder: e.target.value })}
                      placeholder="e.g. 0"
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default">Default Value</FormLabel>
                    <Input
                      id="field-default"
                      type="number"
                      value={element.defaultValue ?? ''}
                      onChange={(e) =>
                        handleUpdateElement({
                          defaultValue: e.target.value !== '' ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 1"
                    />
                  </FormField>
                </>
              )}

              {/* Email */}
              {element.type === 'email' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-placeholder">Placeholder</FormLabel>
                    <Input
                      id="field-placeholder"
                      type="email"
                      value={element.placeholder || ''}
                      onChange={(e) => handleUpdateElement({ placeholder: e.target.value })}
                      placeholder="e.g. name@example.com"
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default">Default Value</FormLabel>
                    <Input
                      id="field-default"
                      type="email"
                      value={element.defaultValue ?? ''}
                      onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                      placeholder="e.g. user@domain.com"
                    />
                  </FormField>
                </>
              )}

              {/* Phone */}
              {element.type === 'phone' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-placeholder">Placeholder</FormLabel>
                    <Input
                      id="field-placeholder"
                      type="tel"
                      value={element.placeholder || ''}
                      onChange={(e) => handleUpdateElement({ placeholder: e.target.value })}
                      placeholder="e.g. +1 (555) 000-0000"
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="field-default">Default Value</FormLabel>
                    <Input
                      id="field-default"
                      type="tel"
                      value={element.defaultValue ?? ''}
                      onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                      placeholder="Initial phone..."
                    />
                  </FormField>
                </>
              )}

              {/* Date */}
              {element.type === 'date' && (
                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="field-default">Default Value</FormLabel>
                  <Input
                    id="field-default"
                    type="date"
                    value={element.defaultValue ?? ''}
                    onChange={(e) => handleUpdateElement({ defaultValue: e.target.value || undefined })}
                  />
                </FormField>
              )}

              {/* File */}
              {element.type === 'file' && (
                <div className="properties-toggle-row">
                  <input
                    type="checkbox"
                    id="file-multiple"
                    checked={!!element.multiple}
                    onChange={(e) => handleUpdateElement({ multiple: e.target.checked })}
                  />
                  <label htmlFor="file-multiple">Multiple Selection</label>
                </div>
              )}

              {/* Button */}
              {element.type === 'button' && (
                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="btn-action">Button Action</FormLabel>
                  <Select
                    id="btn-action"
                    value={element.buttonAction || 'submit'}
                    onChange={(e) => handleUpdateElement({ buttonAction: e.target.value as any })}
                  >
                    <option value="submit">Submit Form</option>
                    <option value="reset">Reset Form</option>
                    <option value="button">Standard Button</option>
                  </Select>
                </FormField>
              )}

              {/* Title */}
              {element.type === 'title' && (
                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="heading-level">Heading Level</FormLabel>
                  <Select
                    id="heading-level"
                    value={element.headingLevel || 2}
                    onChange={(e) =>
                      handleUpdateElement({ headingLevel: Number(e.target.value) as 1 | 2 | 3 })
                    }
                  >
                    <option value={1}>Heading 1 (Main Title)</option>
                    <option value={2}>Heading 2 (Section Title)</option>
                    <option value={3}>Heading 3 (Subheading)</option>
                  </Select>
                </FormField>
              )}

              {/* Alert */}
              {element.type === 'alert' && (
                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="alert-variant">Notice Style</FormLabel>
                  <Select
                    id="alert-variant"
                    value={element.alertVariant || 'info'}
                    onChange={(e) => handleUpdateElement({ alertVariant: e.target.value as any })}
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                  </Select>
                </FormField>
              )}
            </div>
          )}

          {/* 3. VALIDATION (Only when applicable) */}
          {hasValidation && (
            <div className="properties-group">
              <div className="properties-group__subtitle">
                <span className="material-icon">verified_user</span>
                <span>Validation</span>
              </div>

              {/* Required toggle */}
              <div className="properties-toggle-row">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={!!element.required}
                  onChange={(e) => handleUpdateElement({ required: e.target.checked })}
                />
                <label htmlFor="field-required">
                  {element.type === 'checkbox' ? 'Must be checked to submit' : 'Required'}
                </label>
              </div>

              {/* Text & Textarea Length rules */}
              {(element.type === 'text' || element.type === 'textarea') && (
                <div className="properties-two-col">
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="val-min-len">Minimum Length</FormLabel>
                    <Input
                      id="val-min-len"
                      type="number"
                      min={0}
                      value={element.validation?.minLength ?? ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? Number(e.target.value) : undefined;
                        handleUpdateElement({
                          validation: {
                            enabled: true,
                            ...element.validation,
                            minLength: val,
                          },
                        });
                      }}
                      placeholder="e.g. 2"
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="val-max-len">Maximum Length</FormLabel>
                    <Input
                      id="val-max-len"
                      type="number"
                      min={0}
                      value={element.validation?.maxLength ?? ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? Number(e.target.value) : undefined;
                        handleUpdateElement({
                          validation: {
                            enabled: true,
                            ...element.validation,
                            maxLength: val,
                          },
                        });
                      }}
                      placeholder="e.g. 100"
                    />
                  </FormField>
                </div>
              )}

              {/* Number Value rules */}
              {element.type === 'number' && (
                <div className="properties-two-col">
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="val-min-val">Minimum Value</FormLabel>
                    <Input
                      id="val-min-val"
                      type="number"
                      value={element.validation?.min ?? ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? Number(e.target.value) : undefined;
                        handleUpdateElement({
                          validation: {
                            enabled: true,
                            ...element.validation,
                            min: val,
                          },
                        });
                      }}
                      placeholder="e.g. 0"
                    />
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel htmlFor="val-max-val">Maximum Value</FormLabel>
                    <Input
                      id="val-max-val"
                      type="number"
                      value={element.validation?.max ?? ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? Number(e.target.value) : undefined;
                        handleUpdateElement({
                          validation: {
                            enabled: true,
                            ...element.validation,
                            max: val,
                          },
                        });
                      }}
                      placeholder="e.g. 100"
                    />
                  </FormField>
                </div>
              )}

              {/* Pattern / Regex for text, textarea, email, phone */}
              {(element.type === 'text' ||
                element.type === 'textarea' ||
                element.type === 'email' ||
                element.type === 'phone') && (
                <div>
                  <div className="properties-toggle-row">
                    <input
                      type="checkbox"
                      id="validation-pattern-enabled"
                      checked={Boolean(element.validation?.pattern)}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          handleUpdateElement({
                            validation: {
                              ...element.validation,
                              enabled: Boolean(
                                element.validation?.minLength ||
                                element.validation?.maxLength ||
                                element.validation?.min ||
                                element.validation?.max,
                              ),
                              pattern: undefined,
                              errorMessage: undefined,
                            },
                          });
                        } else {
                          handleUpdateElement({
                            validation: {
                              enabled: true,
                              ...element.validation,
                              pattern: '',
                              errorMessage: 'Invalid format',
                            },
                          });
                        }
                      }}
                    />
                    <label htmlFor="validation-pattern-enabled">Pattern / Regex</label>
                  </div>

                  {element.validation?.pattern !== undefined && (
                    <div className="properties-sub-box">
                      <FormField style={{ margin: 0 }}>
                        <FormLabel htmlFor="val-pattern">Pattern</FormLabel>
                        <Input
                          id="val-pattern"
                          value={element.validation.pattern || ''}
                          onChange={(e) =>
                            handleUpdateElement({
                              validation: {
                                enabled: true,
                                ...element.validation,
                                pattern: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g. ^[A-Za-z0-9]+$"
                          style={{ fontFamily: 'monospace', fontSize: '12px' }}
                        />
                      </FormField>

                      <FormField style={{ margin: 0 }}>
                        <FormLabel htmlFor="val-error">Error Message</FormLabel>
                        <Input
                          id="val-error"
                          value={element.validation.errorMessage || ''}
                          onChange={(e) =>
                            handleUpdateElement({
                              validation: {
                                enabled: true,
                                ...element.validation,
                                errorMessage: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g. Only letters and numbers allowed"
                        />
                      </FormField>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            <Button
              variant="danger"
              size="small"
              onClick={() => onDeleteElement(section.id, zone.id, element.id)}
              style={{ width: '100%' }}
            >
              Delete Element
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};
