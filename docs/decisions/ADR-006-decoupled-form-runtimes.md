# ADR-006: Decoupled Form Editor and Public Runtimes

## Status
Accepted

## Context
Form builders often attempt to share a single "Universal Form Renderer" across both the drag-and-drop editor and the public form view. Over time, this leads to leaky abstractions, tangled conditional statements (`if (isEditing) ...`), and layout regressions in the public runtime.

## Decision
Keep the **Form Editor Canvas** ([`FormCanvasHierarchical.tsx`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/features/forms/builder/FormCanvasHierarchical.tsx)) and the **Public Form Runtime** ([`PublicFormView.tsx`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/features/forms/public/PublicFormView.tsx)) as decoupled, independently composable components.
They share only the AST contract types and basic field UI primitives ([`FieldElement.tsx`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/components/fields/FieldElement.tsx)).

## Consequences
- **Positive**: Editor can evolve complex drag-and-drop handles, hierarchical selection borders, delete buttons, and property panels without adding runtime weight or visual bugs to public forms.
- **Negative**: Layout improvements (like custom widths and heights) must be applied to both canvas and public view wrappers.

## Related Areas
- [`apps/web/src/features/forms/builder/FormCanvasHierarchical.tsx`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/features/forms/builder/FormCanvasHierarchical.tsx)
- [`apps/web/src/features/forms/public/PublicFormView.tsx`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/features/forms/public/PublicFormView.tsx)
