# Contracts: WebSocket & Real-Time Events

> **Scope**: WebSocket gateway protocols, connection authentication, rooms, and emitted event payloads.  
> **Source of Truth**: [`apps/api/src/websocket/events.gateway.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/websocket/events.gateway.ts) and [`packages/shared/src/index.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/packages/shared/src/index.ts).  
> **Last Verified**: 2026-09-24

---

## 1. Gateway Connection & Authentication

- **Protocol**: Socket.IO v4
- **Handshake Auth**:
  ```typescript
  io(WS_URL, {
    auth: { token: accessToken },
  })
  ```
- **Connection Logic**:
  - `EventsGateway.handleConnection(client: Socket)`
  - Extracts JWT token from handshake auth or headers.
  - Verifies token signature with `JWT_SECRET`.
  - Client joins room: `user:${userId}`.

---

## 2. Event Specifications

### `user:suspended` (`SOCKET_EVENTS.USER_SUSPENDED`)
- **Direction**: Server $\to$ Client
- **Target Room**: `user:${userId}`
- **Payload**:
  ```typescript
  {
    userId: string;
    message: string;
  }
  ```
- **Client Side Behavior**:
  - `SocketProvider` traps the event.
  - Purges tokens from `localStorage`.
  - Disconnects active socket.
  - Redirects user immediately to `/account-suspended`.
