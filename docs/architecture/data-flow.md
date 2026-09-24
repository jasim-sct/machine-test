# Architecture: Data Flow

> **Scope**: End-to-end data flows for Form Autosaving, Version Deployment, and Public Submissions.  
> **Source of Truth**: [`apps/api/src/forms/forms.service.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/forms.service.ts) and [`apps/web/src/features/forms/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/features/forms/).  
> **Last Verified**: 2026-09-24

---

## 1. Continuous Draft Autosaving Flow

```mermaid
sequenceDiagram
    actor Creator as Form Creator
    participant Editor as Form Editor (React)
    participant API as FormsController
    participant Service as FormsService
    participant DB as MongoDB (forms)

    Creator->>Editor: Updates element label / adds zone
    Editor->>API: PATCH /forms/:id/draft { title, elements, sections, ... }
    API->>Service: updateDraft(userId, formId, dto)
    Service->>Service: Validate ownership (form.userId === userId)
    Service->>DB: Update form.draft & form.updatedAt
    DB-->>Service: Saved
    Service-->>API: Return updated FormDto
    API-->>Editor: 200 OK (hasUnpublishedChanges = true)
```

---

## 2. Release Deployment & Version Snapshotting Flow

```mermaid
sequenceDiagram
    actor Creator as Form Creator
    participant Editor as Form Editor (React)
    participant API as FormsController
    participant Service as FormsService
    participant VModel as MongoDB (form_versions)
    participant FModel as MongoDB (forms)

    Creator->>Editor: Clicks "Deploy Form"
    Editor->>API: POST /forms/:id/deploy
    API->>Service: deployDraft(userId, formId)
    Service->>Service: Validate ownership & non-empty draft
    Service->>VModel: Find max versionNumber (e.g. 1) -> next is 2
    Service->>VModel: Create FormVersion { formId, versionNumber: 2, title, elements, sections, ... }
    VModel-->>Service: Saved new FormVersion document
    Service->>FModel: Update form.deployedVersionId = newVersion._id
    Service->>FModel: Append deployment record to form.deployments
    FModel-->>Service: Updated
    Service-->>API: Return updated FormDto
    API-->>Editor: 200 OK (hasUnpublishedChanges = false)
```

---

## 3. Public Form Submission Flow

```mermaid
sequenceDiagram
    actor Submitter as Public User
    participant Page as PublicFormView (/f/:publicId)
    participant API as PublicFormsController
    participant Service as FormsService
    participant DB as MongoDB (form_submissions)

    Submitter->>Page: Fills out form and clicks Submit
    Page->>API: POST /public/forms/:publicId/submissions { data }
    API->>Service: submitPublicForm(publicId, dto)
    Service->>Service: Look up Form by publicId
    Service->>Service: Verify form.deployedVersionId exists and accepting submissions
    Service->>DB: Create FormSubmission { formId, versionId: deployedVersionId, data }
    DB-->>Service: Created submission record
    Service-->>API: Return { message: "Thank you...", id: submission._id }
    API-->>Page: 201 Created
```
