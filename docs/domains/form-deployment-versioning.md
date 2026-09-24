# Domain: Form Deployment & Versioning

> **Scope**: Release deployment, immutable version snapshots, deployment logs, and activity audit trails.  
> **Source of Truth**: [`apps/api/src/forms/forms.service.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/forms.service.ts) and [`apps/api/src/forms/schemas/form-version.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form-version.schema.ts).  
> **Last Verified**: 2026-09-24

---

## 1. Release Lifecycle & Snapshotting

```mermaid
sequenceDiagram
    participant User as User Action
    participant Service as FormsService
    participant VCollection as form_versions
    participant FCollection as forms

    User->>Service: POST /forms/:id/deploy
    Service->>VCollection: Count existing versions -> nextNumber = N + 1
    Service->>VCollection: Create FormVersion document (frozen snapshot of draft)
    Service->>FCollection: Update deployedVersionId = newVersion._id
    Service->>FCollection: Append deployment log { versionNumber, deployedAt, deployedBy }
    Service->>FCollection: Append activity log { type: 'version_deployed', ... }
```

---

## 2. Invariants & Rules

1. **Immutability**: Once a `FormVersion` document is saved, its `elements`, `sections`, and layout properties are immutable.
2. **Sequential Versioning**: Version numbers increment monotonically (`1, 2, 3...`) per form.
3. **Draft Independence**: Publishing creates a snapshot copy. Subsequent edits to `Form.draft` do not modify the published version until the next explicit deployment.
