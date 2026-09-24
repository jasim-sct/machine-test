# Architecture: Scalability & Performance Model

> **Scope**: Concurrency model, database query efficiency, and horizontal scaling characteristics.  
> **Source of Truth**: Implementation across `apps/api/src/forms/forms.service.ts` and database schemas.  
> **Last Verified**: 2026-09-24

---

## 1. Concurrency & Performance Profile

### Backend Concurrency Model
- The NestJS application runs on Node.js single-threaded event loop.
- I/O operations (MongoDB queries, network sockets) are asynchronous and non-blocking using `async`/`await` and Promises.

### Database Indexing & Query Optimization
- **`User` Collection**: Unique index on `email`. Lookup in `ActiveUserGuard` leverages primary key index `_id`.
- **`Form` Collection**:
  - Unique index on `publicId` for fast public form resolution.
  - Index on `userId` for workspace form lists.
- **`FormVersion` Collection**:
  - Compound unique index `{ formId: 1, versionNumber: 1 }` prevents race conditions during version creation.
- **`FormSubmission` Collection**:
  - Compound index `{ formId: 1, createdAt: -1 }` optimizes paginated dashboard queries and CSV streaming exports.

---

## 2. Horizontal Scaling Roadmap & Bottlenecks

1. **WebSocket Session Distribution**:
   - Currently, Socket.IO runs in-memory.
   - *Scale Strategy*: Deploy a Redis instance and attach `@socket.io/redis-adapter` to distribute socket events across clustered API instances.
2. **Read vs. Write Load**:
   - Public form views are read-heavy and can be cached via edge CDN or Redis.
   - Submissions are write-heavy and can be sharded on `{ formId: "hashed" }` in MongoDB Atlas.
