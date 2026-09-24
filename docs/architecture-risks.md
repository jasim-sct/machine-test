# Architecture Risks & Technical Debt Registry

This document records the architectural risks, technical debt, and scalability constraints identified during the comprehensive repository audit.

---

## 1. Architectural Risks

### Risk 1: In-Memory WebSocket State across Scaled Instances
- **Evidence**: `EventsGateway` ([`apps/api/src/websocket/events.gateway.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/websocket/events.gateway.ts)) uses the default in-memory Socket.IO adapter.
- **Impact**: If multiple instances of `apps/api` are deployed behind a round-robin load balancer, an admin suspension event emitted on Instance A will not reach a user whose WebSocket is connected to Instance B.
- **Current Mitigation**: Single-instance deployment only.
- **Recommended Investigation**: Introduce `@socket.io/redis-adapter` when horizontally scaling the backend.

---

### Risk 2: Per-Request Database Lookup in `ActiveUserGuard`
- **Evidence**: `ActiveUserGuard` ([`apps/api/src/common/guards/active-user.guard.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/common/guards/active-user.guard.ts)) executes `this.userModel.findById(userId)` on every authenticated HTTP request.
- **Impact**: While this guarantees immediate token revocation for suspended users, high traffic volume creates significant database read pressure on the `users` collection.
- **Current Mitigation**: Indexed `_id` lookup in MongoDB.
- **Recommended Investigation**: Cache active user statuses in Redis with a short TTL (e.g. 30 seconds) or explicitly invalidate user cache entries on suspension.

---

### Risk 3: Synchronous Public Form Submissions without Queueing
- **Evidence**: `submitPublicForm` in `FormsService` ([`apps/api/src/forms/forms.service.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/forms.service.ts)) directly performs database lookups and creates `FormSubmission` documents within the HTTP request cycle.
- **Impact**: Viral traffic spikes on a public form could saturate MongoDB connection pools or thread event loops.
- **Current Mitigation**: Mongoose connection pooling and fast document writes.
- **Recommended Investigation**: Implement an asynchronous message queue (e.g., BullMQ with Redis) if public submission volume exceeds thousands of requests per minute.

---

### Risk 4: Stale / Dead Schema Artifact in Repository
- **Evidence**: [`apps/api/prisma/schema.prisma`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/prisma/schema.prisma) defines a PostgreSQL schema with `User` model, but is completely unused.
- **Impact**: New developers or AI agents may mistakenly assume the application runs on PostgreSQL and attempt to run Prisma migrations or import `@prisma/client`.
- **Current Mitigation**: Documented in `AGENTS.md`, `ARCHITECTURE.md`, and `docs/source-of-truth.md`.
- **Recommended Investigation**: Safely deprecate/remove the unused `prisma` directory or archive it.
