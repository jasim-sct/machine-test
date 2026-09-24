# Security Policy & Controls

> **Scope**: Vulnerability reporting, authentication mechanisms, authorization boundaries, and threat model.  
> **Source of Truth**: [`apps/api/src/auth`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/auth), [`apps/api/src/common/guards`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/common/guards), and [`apps/api/src/websocket`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/websocket).  
> **Last Verified**: 2026-09-24

---

## 1. Security Architecture & Controls

### 1.1 Authentication
- **Password Security**: Passwords are hashed using `bcryptjs` with a work factor (salt rounds) of `10`.
- **JWT Tokens**: Signed using `HMAC-SHA256` via `@nestjs/jwt`. Expiration defaults to `7d` (configurable via `JWT_EXPIRATION`).
- **Secret Protection**: Passwords and `passwordHash` are stripped from all JSON serialization outputs via Mongoose schema `toJSON` transformation.

### 1.2 Authorization & Access Control
- **Role-Based Access Control (RBAC)**: Supported roles are `Role.ADMIN` and `Role.USER`.
- **Active User Enforcement (`ActiveUserGuard`)**: Verifies on every request that the user document in MongoDB has `status === 'ACTIVE'`. Suspended users receive an immediate `403 Forbidden` (`ACCOUNT_SUSPENDED`).
- **Resource Ownership**: Endpoints in `FormsController` verify `form.userId === req.user.id` to prevent IDOR (Insecure Direct Object Reference).

### 1.3 Real-Time Session Invalidation
- When an administrator suspends a user, the backend emits a targeted WebSocket message (`user:suspended`) strictly to the user's dedicated socket room (`user:${userId}`).
- The client-side `SocketProvider` traps the event, purges local session tokens from `localStorage`, disconnects the socket, and forces navigation to `/account-suspended`.

---

## 2. Threat Model & Mitigation Matrix

| Threat / Attack Vector | Attack Surface | Implemented Mitigation | Residual Exposure |
|---|---|---|---|
| **Stale JWT Usage Post-Suspension** | API Endpoints | `ActiveUserGuard` queries user status on every authenticated request. | Database query overhead per request. |
| **Cross-Tenant / Cross-User Access (IDOR)** | Form CRUD endpoints | `FormsService` enforces `form.userId.toString() === userId` check before reading or modifying form data. | Public forms are openly accessible by design via `publicId`. |
| **Credential Leakage** | API Responses | `toJSON` transforms in Mongoose schemas explicitly delete `passwordHash` and `__v`. | Application logs must avoid logging raw request bodies on `/auth/login`. |
| **Public Form Spam / Abuse** | `POST /public/forms/:publicId/submissions` | Payload size caps and validation via `SubmitFormDto`. | Rate limiting on public submissions is currently handled at web server / reverse proxy layer. |

---

## 3. Reporting Vulnerabilities

If you discover a security vulnerability in this repository, please send a private report to `security@saas.local` or open a private security advisory. Do not disclose security vulnerabilities publicly until an official fix has been released.
