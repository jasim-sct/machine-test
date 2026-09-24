# Domain: Administration & Moderation

> **Scope**: Admin dashboard metrics, user search, account suspension, and real-time moderation broadcasting.  
> **Source of Truth**: [`apps/api/src/admin/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/admin/) and [`apps/api/src/dashboard/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/dashboard/).  
> **Last Verified**: 2026-09-24

---

## 1. Capabilities & Endpoints

- **Platform Stats (`GET /admin/dashboard/stats`)**:
  - `totalUsers`: Total number of users registered in MongoDB.
  - `activeUsers`: Users with `status === 'ACTIVE'`.
  - `suspendedUsers`: Users with `status === 'SUSPENDED'`.
- **User Search & Listing (`GET /admin/users?search=query`)**:
  - Performs case-insensitive regex search on `name` and `email`.
- **User Suspension (`PATCH /admin/users/:id/suspend`)**:
  - Prevents admin from suspending their own account (`BadRequestException`).
  - Sets `user.status = 'SUSPENDED'` in MongoDB.
  - Calls `EventsGateway.emitUserSuspended(userId)` to notify connected client sockets instantly.
- **User Unsuspension (`PATCH /admin/users/:id/unsuspend`)**:
  - Restores `user.status = 'ACTIVE'`.
