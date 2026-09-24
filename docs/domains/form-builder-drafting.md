# Domain: Form Builder & Drafting

> **Scope**: Hierarchical schema AST (Sections $\to$ Zones $\to$ Elements), properties configuration, and continuous draft autosave.  
> **Source of Truth**: [`packages/shared/src/types/form.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/packages/shared/src/types/form.ts) and [`apps/web/src/features/forms/builder/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/features/forms/builder/).  
> **Last Verified**: 2026-09-24

---

## 1. Hierarchical Form Schema Structure

```text
Form Document
 └── FormDraft
      ├── title: string
      ├── formLayout: 'column' | 'row'
      ├── customCss: string
      └── sections: FormSection[]
           ├── id, title, description, customWidth, customHeight
           └── zones: FormZone[]
                ├── id, name, columns, customWidth, customHeight
                └── elements: FormElement[]
                     ├── id, type, label, name, placeholder, required
                     ├── validationRules: ValidationRule[]
                     ├── options: Option[] (for select/radio/checkbox)
                     └── customWidth, customHeight
```

---

## 2. Selection Hierarchy & Dimensions Invariants

1. **Selection Drill-down**:
   - Level 1: Form root settings
   - Level 2: Section selection
   - Level 3: Zone selection
   - Level 4: Element / Field selection
2. **Dimension Constraints**:
   - Width and height properties (`customWidth`, `customHeight`) support preset units (`100%`, `75%`, `50%`, `33%`, `25%`, or custom values like `450px`).
   - All renderers must enforce `maxWidth: 100%` and `boxSizing: border-box` to prevent canvas or viewport horizontal overflow.
3. **Draft Autosave (`PATCH /forms/:id/draft`)**:
   - Updates `Form.draft` without publishing or altering any active `FormVersion`.
