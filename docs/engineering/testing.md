# Engineering: Testing Strategy & E2E Suites

> **Scope**: Automated testing setup, test runner commands, and test suites.  
> **Source of Truth**: [`apps/api/test/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/test/) and `apps/api/package.json`.  
> **Last Verified**: 2026-09-24

---

## 1. Test Architecture & Runner

- **Runner**: Jest with `ts-jest` executed via `supertest`.
- **Execution**: `pnpm test` or `pnpm --filter @saas/api test`.
- **Config**: `apps/api/test/jest-e2e.json` running with `--runInBand` against the MongoDB database.

---

## 2. Test Suites

1. **`app.e2e-spec.ts`**:
   - Authentication (Registration, Login, Invalid credentials).
   - Profile retrieval and updates (`GET /users/me`, `PATCH /users/me`).
   - Admin moderation (User listing, search, suspension, unsuspension, stats).
2. **`forms.e2e-spec.ts`**:
   - Form creation, listing, detail retrieval.
   - Continuous draft updating and autosave.
   - Version deployment and immutable release creation.
   - Public form retrieval and submission intake.
   - Submissions data view and CSV export verification.
3. **`websocket.e2e-spec.ts`**:
   - Socket connection authentication.
   - Targeted room joining and suspension event reception.
