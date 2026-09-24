# Contracts: Database Schema & Collections

> **Scope**: MongoDB collection definitions, Mongoose schemas, compound indexes, and lifecycle hooks.  
> **Source of Truth**: Mongoose schemas in `apps/api/src/*/schemas/`.  
> **Last Verified**: 2026-09-24

---

## 1. Collection Specifications

### Collection: `users`
- **Schema**: [`apps/api/src/users/schemas/user.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/users/schemas/user.schema.ts)
- **Indexes**:
  - `{ email: 1 }` (Unique, lowercase, trimmed)
- **Serialization**: `toJSON` transform strips `passwordHash`, `__v`, and maps `_id` $\to$ `id`.

---

### Collection: `forms`
- **Schema**: [`apps/api/src/forms/schemas/form.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form.schema.ts)
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ userId: 1 }`
- **Fields**:
  - `name`: string
  - `userId`: ObjectId (ref: `User`)
  - `publicId`: string (e.g. `f_a1b2c3d4e5f6`)
  - `deployedVersionId`: ObjectId (ref: `FormVersion`, nullable)
  - `draft`: Embedded object `{ title, elements, sections, formLayout, customCss, updatedAt }`
  - `settings`: Embedded object
  - `deployments`: Array of deployment log records
  - `activities`: Array of activity log records

---

### Collection: `formversions` (model: `FormVersion`)
- **Schema**: [`apps/api/src/forms/schemas/form-version.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form-version.schema.ts)
- **Indexes**:
  - `{ formId: 1, versionNumber: 1 }` (Unique compound index)
- **Fields**:
  - `formId`: ObjectId (ref: `Form`)
  - `versionNumber`: number (1, 2, 3...)
  - `title`: string
  - `elements`: `FormElement[]`
  - `sections`: `FormSection[]`
  - `formLayout`: string
  - `customCss`: string

---

### Collection: `formsubmissions` (model: `FormSubmission`)
- **Schema**: [`apps/api/src/forms/schemas/form-submission.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form-submission.schema.ts)
- **Indexes**:
  - `{ formId: 1, createdAt: -1 }` (Optimized for dashboard queries)
- **Fields**:
  - `formId`: ObjectId (ref: `Form`)
  - `versionId`: ObjectId (ref: `FormVersion`)
  - `data`: `Record<string, any>` (polymorphic field values)
