# Operations: Monitoring & Health Verification

> **Scope**: Health checks, connection verification, and log output.  
> **Source of Truth**: `apps/api/src/main.ts` and `apps/api/src/websocket/events.gateway.ts`.  
> **Last Verified**: 2026-09-24

---

## 1. Application Liveness & Health Verification

1. **API Server Liveness**:
   - Check standard endpoints (e.g. `GET /forms` with valid auth or `GET /admin/dashboard/stats`).
   - If MongoDB connection drops, Mongoose triggers reconnect attempts and emits error events to stdout/stderr.
2. **WebSocket Gateway Health**:
   - Monitored via connection logs in `EventsGateway`:
     `[EventsGateway] Client <socket-id> connected and joined room user:<user-id>`.
