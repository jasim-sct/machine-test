# Security: Authorization & Permissions

> **Scope**: Role-based access control, active user guards, and resource ownership verification.  
> **Source of Truth**: [`apps/api/src/common/guards/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/common/guards/).  
> **Last Verified**: 2026-09-24

---

## 1. Roles & Permissions

- **`Role.ADMIN`**: Full platform management, user moderation, suspension/unsuspension, platform dashboard analytics.
- **`Role.USER`**: Form creation, continuous drafting, deployment release, submission view, CSV export.

---

## 2. Guard Execution Hierarchy

1. **`JwtAuthGuard`**: Extracts and verifies JWT from `Authorization: Bearer <token>`.
2. **`ActiveUserGuard`**: Verifies user exists in MongoDB and `user.status === 'ACTIVE'`.
3. **`RolesGuard`**: Checks whether user's `role` satisfies the `@Roles(...)` metadata on the controller handler.
4. **Service-Level Ownership Checks**: Enforces `form.userId.toString() === userId` on all sensitive form operations.
