# Security: Authentication Architecture

> **Scope**: Registration, password hashing, JWT token lifecycle, and session validation.  
> **Source of Truth**: [`apps/api/src/auth/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/auth/).  
> **Last Verified**: 2026-09-24

---

## 1. Password Security
- Passwords are encrypted with `bcryptjs` using a cost factor (salt rounds) of `10`.
- Plaintext passwords are never persisted to MongoDB.

---

## 2. Token Lifecycle
- **Type**: HMAC-SHA256 Signed JSON Web Tokens (JWT).
- **Payload**: `{ sub: user.id, email: user.email, role: user.role }`.
- **Secret**: `JWT_SECRET` environment variable.
- **Expiration**: `JWT_EXPIRATION` (defaults to `7d`).
- **Header**: `Authorization: Bearer <accessToken>`.
