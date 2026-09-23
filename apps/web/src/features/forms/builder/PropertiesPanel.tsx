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
  getDataTypeForElementType,
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
  duplicateReferences: string[];
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
  duplicateReferences,
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
          <FormField style={{ margin: 0 }}>
            <FormLabel htmlFor="section-name">Section Name (Internal)</FormLabel>
            <Input
              id="section-name"
              value={section.name || ''}
              onChange={(e) => handleUpdateSection({ name: e.target.value })}
              placeholder="e.g. Personal Information"
            />
          </FormField>

          <FormField style={{ margin: 0 }}>
            <FormLabel htmlFor="section-title">Section Header Title (Public)</FormLabel>
            <Input
              id="section-title"
              value={section.title || ''}
              onChange={(e) => handleUpdateSection({ title: e.target.value })}
              placeholder="e.g. Account & Billing Details"
            />
          </FormField>

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
          <FormField style={{ margin: 0 }}>
            <FormLabel htmlFor="zone-name">Zone Label</FormLabel>
            <Input
              id="zone-name"
              value={zone.name || ''}
              onChange={(e) => handleUpdateZone({ name: e.target.value })}
              placeholder="e.g. Left Column, Contact Info"
            />
          </FormField>

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
    const storedDataType = element.dataType || getDataTypeForElementType(element.type) || 'text';
    const isDuplicate = Boolean(element.reference && duplicateReferences.includes(element.reference));

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

    // When field name changes: auto-generate reference UNLESS user edited it manually
    const handleNameChange = (newName: string) => {
      const updates: Partial<FormElement> = { name: newName };
      if (!element.isReferenceManual) {
        updates.reference = generateReference(newName);
      }
      if (!element.label || element.label === element.name) {
        updates.label = newName;
      }
      handleUpdateElement(updates);
    };

    // When reference changes manually
    const handleReferenceChange = (newRef: string) => {
      const sanitized = generateReference(newRef);
      handleUpdateElement({
        reference: sanitized,
        isReferenceManual: true, // Manual lock
      });
    };

    return (
      <aside className="properties-drawer">
        <div className="properties-drawer__header">
          <div className="properties-drawer__header-title">
            <span className="material-icon">tune</span>
            <span>Element Properties</span>
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
          {/* Data Field Identity (Name & Reference) */}
          {isData ? (
            <>
              {/* Field Name */}
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="field-name">Field Name</FormLabel>
                <Input
                  id="field-name"
                  value={element.name || element.label || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Full Name"
                />
              </FormField>

              {/* Reference */}
              <FormField style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <FormLabel htmlFor="field-reference" style={{ marginBottom: 0 }}>
                    Reference (API Key)
                  </FormLabel>
                  <span
                    style={{
                      fontSize: '10px',
                      color: element.isReferenceManual ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    {element.isReferenceManual ? '🔒 Manual' : '⚡ Auto-generated'}
                  </span>
                </div>
                <Input
                  id="field-reference"
                  value={element.reference || ''}
                  onChange={(e) => handleReferenceChange(e.target.value)}
                  placeholder="e.g. full_name"
                  style={{
                    borderColor: isDuplicate ? 'var(--color-danger)' : undefined,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                {isDuplicate && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      color: 'var(--color-danger)',
                      fontSize: 'var(--font-size-xs)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    <span>✕</span>
                    <span>Duplicate reference! Must be unique across form.</span>
                  </div>
                )}
                {element.isReferenceManual && (
                  <button
                    type="button"
                    onClick={() => {
                      const autoRef = generateReference(element.name || element.label || '');
                      handleUpdateElement({ reference: autoRef, isReferenceManual: false });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: 'var(--space-1)',
                      textAlign: 'left',
                    }}
                  >
                    Reset to auto-generated from name
                  </button>
                )}
              </FormField>

              {/* Stored Data Type Indicator */}
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Stored Data Type</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                    {storedDataType}
                  </div>
                </div>
                <Badge variant="info" size="small">
                  {storedDataType.toUpperCase()}
                </Badge>
              </div>

              {/* Label & Placeholder */}
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="field-label">Display Label</FormLabel>
                <Input
                  id="field-label"
                  value={element.label || ''}
                  onChange={(e) => handleUpdateElement({ label: e.target.value })}
                  placeholder="Field label shown to user..."
                />
              </FormField>

              {element.type !== 'checkbox' && element.type !== 'date' && element.type !== 'file' && (
                <FormField style={{ margin: 0 }}>
                  <FormLabel htmlFor="field-placeholder">Placeholder Hint</FormLabel>
                  <Input
                    id="field-placeholder"
                    value={element.placeholder || ''}
                    onChange={(e) => handleUpdateElement({ placeholder: e.target.value })}
                    placeholder="Hint text..."
                  />
                </FormField>
              )}

              {/* Helper text */}
              <FormField style={{ margin: 0 }}>
                <FormLabel htmlFor="field-helper">Secondary Helper Text</FormLabel>
                <Input
                  id="field-helper"
                  value={element.helperText || ''}
                  onChange={(e) => handleUpdateElement({ helperText: e.target.value })}
                  placeholder="Optional guidance below the input..."
                />
              </FormField>

              {/* Required Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="checkbox"
                  id="field-required"
                  checked={!!element.required}
                  onChange={(e) => handleUpdateElement({ required: e.target.checked })}
                  style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                />
                <label htmlFor="field-required" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                  Required field for form submission
                </label>
              </div>

              {/* Select / Radio Options Configuration */}
              {(element.type === 'select' || element.type === 'radio') && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                  <FormLabel>Choices / Options (one per line)</FormLabel>
                  <Textarea
                    rows={4}
                    value={(element.options || []).join('\n')}
                    onChange={(e) => {
                      const opts = e.target.value.split('\n');
                      handleUpdateElement({ options: opts });
                    }}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}

              {/* Optional Regex Validation Rule */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <FormLabel style={{ marginBottom: 0 }}>Regex Validation</FormLabel>
                  <input
                    type="checkbox"
                    id="validation-enabled"
                    checked={!!element.validation?.enabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      handleUpdateElement({
                        validation: {
                          enabled,
                          pattern: element.validation?.pattern || '',
                          errorMessage: element.validation?.errorMessage || 'Invalid format',
                          successMessage: element.validation?.successMessage || 'Format is valid',
                        },
                      });
                    }}
                    style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                  />
                </div>

                {/* Only show validation configuration when enabled */}
                {element.validation?.enabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <FormField style={{ margin: 0 }}>
                      <FormLabel htmlFor="val-pattern">Regex Pattern</FormLabel>
                      <Input
                        id="val-pattern"
                        value={element.validation.pattern || ''}
                        onChange={(e) =>
                          handleUpdateElement({
                            validation: { ...element.validation!, pattern: e.target.value },
                          })
                        }
                        placeholder="e.g. ^[a-zA-Z0-9_]{3,15}$"
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                      />
                    </FormField>

                    <FormField style={{ margin: 0 }}>
                      <FormLabel htmlFor="val-error">Error Message (on mismatch)</FormLabel>
                      <Input
                        id="val-error"
                        value={element.validation.errorMessage || ''}
                        onChange={(e) =>
                          handleUpdateElement({
                            validation: { ...element.validation!, errorMessage: e.target.value },
                          })
                        }
                        placeholder="✕ Username format is invalid"
                      />
                    </FormField>

                    <FormField style={{ margin: 0 }}>
                      <FormLabel htmlFor="val-success">Success Message (on match)</FormLabel>
                      <Input
                        id="val-success"
                        value={element.validation.successMessage || ''}
                        onChange={(e) =>
                          handleUpdateElement({
                            validation: { ...element.validation!, successMessage: e.target.value },
                          })
                        }
                        placeholder="✓ Username is valid"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Non-Interactive Element Configurations */
            <>
              {element.type === 'title' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel>Heading Level</FormLabel>
                    <Select
                      value={element.headingLevel || 2}
                      onChange={(e) => handleUpdateElement({ headingLevel: Number(e.target.value) as 1 | 2 | 3 })}
                    >
                      <option value={1}>Heading 1 (Main Title)</option>
                      <option value={2}>Heading 2 (Section Title)</option>
                      <option value={3}>Heading 3 (Subheading)</option>
                    </Select>
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel>Heading Text</FormLabel>
                    <Input
                      value={element.content || element.label || ''}
                      onChange={(e) => handleUpdateElement({ content: e.target.value, label: e.target.value })}
                      placeholder="Enter heading..."
                    />
                  </FormField>
                </>
              )}

              {element.type === 'description' && (
                <FormField style={{ margin: 0 }}>
                  <FormLabel>Description Content</FormLabel>
                  <Textarea
                    rows={4}
                    value={element.content || element.label || ''}
                    onChange={(e) => handleUpdateElement({ content: e.target.value, label: e.target.value })}
                    placeholder="Enter descriptive instruction or paragraph..."
                  />
                </FormField>
              )}

              {element.type === 'alert' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel>Notice Variant</FormLabel>
                    <Select
                      value={element.alertVariant || 'info'}
                      onChange={(e) => handleUpdateElement({ alertVariant: e.target.value as any })}
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="success">Success (Green)</option>
                    </Select>
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel>Notice Message</FormLabel>
                    <Textarea
                      rows={3}
                      value={element.content || element.label || ''}
                      onChange={(e) => handleUpdateElement({ content: e.target.value, label: e.target.value })}
                      placeholder="Important instructions or guidance..."
                    />
                  </FormField>
                </>
              )}

              {element.type === 'button' && (
                <>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel>Button Action</FormLabel>
                    <Select
                      value={element.buttonAction || 'submit'}
                      onChange={(e) => handleUpdateElement({ buttonAction: e.target.value as any })}
                    >
                      <option value="submit">Submit Form</option>
                      <option value="reset">Reset Form</option>
                      <option value="button">Standard Button</option>
                    </Select>
                  </FormField>
                  <FormField style={{ margin: 0 }}>
                    <FormLabel>Button Text</FormLabel>
                    <Input
                      value={element.buttonText || element.label || ''}
                      onChange={(e) => handleUpdateElement({ buttonText: e.target.value, label: e.target.value })}
                      placeholder="e.g. Submit Application"
                    />
                  </FormField>
                </>
              )}

              {element.type === 'divider' && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Horizontal dividing line separating fields.
                </p>
              )}

              {element.type === 'spacer' && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Vertical whitespace cushion between elements.
                </p>
              )}
            </>
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
