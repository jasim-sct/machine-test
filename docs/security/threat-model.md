# Security: Threat Model & Attack Surface

> **Scope**: Realistic attack vectors, attack surfaces, implemented defenses, and residual risk.  
> **Source of Truth**: Implementation across `apps/api/src/common/guards/` and `apps/api/src/auth/`.  
> **Last Verified**: 2026-09-24

---

## 1. Attack Vectors & Defense Matrix

| Attack Vector | Vulnerability / Surface | Implemented Defense | Residual Risk |
|---|---|---|---|
| **Stale Token Replay Post-Suspension** | Client retains unexpired JWT after admin suspends account | `ActiveUserGuard` checks MongoDB on every authenticated request and immediately returns 403 | Database read overhead |
| **Cross-User Data Access (IDOR)** | Form manipulation (`PATCH /forms/:id/draft`, `GET /forms/:id/data`) | `FormsService` verifies `form.userId.toString() === userId` | Public forms intentionally open by design via `publicId` |
| **Credential / Password Extraction** | API responses, log dumps | Bcrypt 10 rounds hashing; Mongoose `toJSON` transforms remove `passwordHash` | Raw passwords must never be logged in debug interceptors |
| **Spam / Malicious Submissions** | `POST /public/forms/:publicId/submissions` | Payload size caps and class-validator schema checking | Reverse-proxy rate limiting recommended in production |
