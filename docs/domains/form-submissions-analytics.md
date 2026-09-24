# Domain: Form Submissions & Analytics

> **Scope**: Public submission intake, response validation, tabular data projection, and CSV export.  
> **Source of Truth**: [`apps/api/src/forms/public-forms.controller.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/public-forms.controller.ts) and [`apps/api/src/forms/forms.service.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/forms.service.ts).  
> **Last Verified**: 2026-09-24

---

## 1. Submission Lifecycle

1. **Intake (`POST /public/forms/:publicId/submissions`)**:
   - Publicly accessible endpoint without authentication.
   - Finds Form by `publicId` and loads its `deployedVersionId`.
   - Validates submission settings (`isAcceptingSubmissions`, `submissionLimit`).
   - Creates `FormSubmission` document:
     ```typescript
     {
       formId: form._id,
       versionId: form.deployedVersionId,
       data: dto.data,
       createdAt: new Date()
     }
     ```
2. **Data View Projection (`GET /forms/:id/data`)**:
   - Extracts all data fields across the form's sections/zones to build dynamic column headers (`FormDataColumnDto[]`).
   - Retrieves all submissions for the form sorted by `createdAt: -1`.
   - Returns rows mapped against column keys.
3. **CSV Export (`GET /forms/:id/data?format=csv`)**:
   - Generates RFC 4180-compliant CSV output with escaped headers and values.
   - Streams response with `Content-Type: text/csv` and `Content-Disposition: attachment`.
