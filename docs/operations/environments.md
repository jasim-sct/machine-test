# Operations: Environment Configuration

> **Scope**: Environment variables, configuration files, and default values.  
> **Source of Truth**: [`apps/api/.env.example`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/.env.example) and [`apps/web/.env.example`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/.env.example).  
> **Last Verified**: 2026-09-24

---

## 1. Backend Environment Variables (`apps/api/.env`)

| Variable | Default Value | Required | Description |
|---|---|---|---|
| `PORT` | `3000` | No | Port for Express & Socket.IO server |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/saas_db` | Yes | MongoDB connection URI |
| `JWT_SECRET` | `super-secret-jwt-key-replace-in-production` | Yes (Prod) | HMAC key for signing JWTs |
| `JWT_EXPIRATION` | `7d` | No | JWT lifespan |
| `ADMIN_NAME` | `SaaS Administrator` | No | Name for seeded administrator account |
| `ADMIN_EMAIL` | `admin@saas.local` | Yes | Email for seeded administrator account |
| `ADMIN_PASSWORD` | `AdminPassword123!` | Yes | Initial password for seeded admin |
| `FRONTEND_URL` | `http://localhost:5173` | No | Allowed CORS origin for web app |

---

## 2. Frontend Environment Variables (`apps/web/.env`)

| Variable | Default Value | Required | Description |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Yes | Base URL for REST API endpoints |
| `VITE_WS_URL` | `http://localhost:3000` | Yes | Base URL for Socket.IO WebSocket gateway |
