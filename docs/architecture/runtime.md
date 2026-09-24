# Architecture: Runtime & Process Model

> **Scope**: Process execution, memory model, port assignments, and inter-process communication.  
> **Source of Truth**: `package.json`, `apps/api/src/main.ts`, and `apps/web/vite.config.ts`.  
> **Last Verified**: 2026-09-24

---

## 1. Runtime Processes

| Process | Runtime Engine | Default Port | Entry Point | Description |
|---|---|---|---|---|
| **Web Dev Server** | Node.js (Vite 6) | `5173` | `apps/web/src/main.tsx` | Serves client React bundle with HMR |
| **API Server** | Node.js (NestJS 11) | `3000` | `apps/api/src/main.ts` | Hosts Express REST API and Socket.IO WebSocket Gateway |
| **Database** | MongoDB 6.x / 7.x | `27017` | `mongod` | Local database server hosting `saas_db` |

---

## 2. Process Communication & Protocols

1. **HTTP/1.1 REST**:
   - Web application communicates with the API over JSON payloads.
   - Authentication via `Authorization: Bearer <JWT>` header.
2. **WebSocket (Socket.IO v4)**:
   - Handshake performs token verification in `EventsGateway.handleConnection`.
   - On successful handshake, client joins private room `user:${userId}`.
   - Server broadcasts events (such as `user:suspended`) directly to target user rooms.
3. **MongoDB Wire Protocol**:
   - Connection pool maintained by Mongoose (`MongooseModule.forRootAsync`).
