# Minimal Full-Stack SaaS Monorepo

A clean, modular, and production-ready full-stack SaaS application monorepo featuring a single React application (Admin & User areas), a NestJS backend, MongoDB with Mongoose, JWT authentication, and immediate session termination via Socket.IO WebSocket events upon user suspension.

---

## Architecture & Monorepo Structure

```text
/
├── apps/
│   ├── web/                 # React 19 + TypeScript + Vite frontend
│   └── api/                 # NestJS + TypeScript + Mongoose backend
│
├── packages/
│   └── shared/              # Shared types, DTO interfaces, enums, constants
│
├── package.json             # Root workspace scripts (dev, build, lint, test, seed)
├── pnpm-workspace.yaml      # pnpm workspace definition
└── README.md
```

- **Frontend**: Single React application containing both Admin and User interfaces.
- **Backend**: Modular NestJS application (`auth`, `users`, `admin`, `dashboard`, `websocket`, `common`).
- **Database**: Local MongoDB connected via Mongoose (`mongodb://127.0.0.1:27017/saas_db`).
- **Real-Time**: Socket.IO for immediate targeted user suspension.
- **Authentication**: JWT-based authentication with role authorization and backend suspension enforcement.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Setup & Run

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Seed the Database**:
   ```bash
   pnpm seed
   ```
   *Seeded Accounts:*
   - **Administrator:**
     - **Email:** `admin@saas.local`
     - **Password:** `AdminPassword123!`
     - **Role:** `ADMIN`
   - **Sample Users (Password for all: `UserPassword123!`):**
     - `alex.morgan@company.com` (Active)
     - `sarah.chen@techflow.io` (Active)
     - `marcus.vance@vancestudios.com` (Active)
     - `david.kim@apexdesign.co` (Suspended)
     - `hannah.schmidt@berlinai.de` (Suspended)
     - `lucas.silva@paulista.br` (Suspended)
     - ...and more (15+ sample users)

3. **Start Development Environment**:
   ```bash
   pnpm dev
   ```
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:3000](http://localhost:3000)

4. **Run Automated Tests**:
   ```bash
   pnpm test
   ```

5. **Typecheck & Lint**:
   ```bash
   pnpm lint
   ```

6. **Production Build**:
   ```bash
   pnpm build
   ```

---

## 2. Environment Configuration

### Backend (`apps/api/.env`)
```ini
PORT=3000
MONGODB_URI="mongodb://127.0.0.1:27017/saas_db"
JWT_SECRET="super-secret-jwt-key-replace-in-production"
JWT_EXPIRATION="7d"
ADMIN_NAME="SaaS Administrator"
ADMIN_EMAIL="admin@saas.local"
ADMIN_PASSWORD="AdminPassword123!"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`apps/web/.env`)
```ini
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="http://localhost:3000"
```

---

## 3. Features & User Flows

### A. Authentication & Registration
- **/login**: Unified login supporting both Admin and User credentials.
  - Admin $\to$ `/admin/dashboard`
  - Normal User $\to$ `/dashboard`
  - Suspended User $\to$ Rejection with immediate redirect to `/account-suspended`
- **/register**: Public registration restricted exclusively to regular users (`ROLE: USER`).
- **Single Admin Guarantee**: Admin accounts cannot register publicly; the sole administrator is configured via environment seed.

### B. User Roles, Navigation & Layout
- **Roles:** `ADMIN` and `USER`.
- **Sidebar Navigation:**
  - **Admin Sidebar:**
    - `Dashboard` (`/admin/dashboard`)
    - `Users` (`/admin/users`)
    - `Profile` (`/profile`)
    - `──────────────`
    - `Logout`
  - **User Sidebar:**
    - `Dashboard` (`/dashboard` - Upcoming page)
    - `Profile` (`/profile`)
    - `──────────────`
    - `Logout`
- **Header Profile Tile:**
  - Displayed on both Admin and User headers:
    - User Avatar / Initial circle
    - Full Name
    - Email address
  - Clicking the tile navigates directly to `/profile`.
- **Profile Management (`/profile`):**
  - Displays read-only account details: Role, Account Status, User ID, Member Since date.
  - Interactive **Edit Profile** form allowing users to update their **Name** and **Email**.
  - All profile updates are persisted to MongoDB via `PATCH /users/me`.
  - Non-editable fields (`id`, `role`, `status`) are strictly protected on the backend.

### C. Real-Time Account Suspension
1. Admin navigates to `/admin/users`, searches for a user, and clicks **Suspend**.
2. Confirmation dialog prompts before executing destructive action.
3. Backend updates user's status in MongoDB to `SUSPENDED`.
4. Backend triggers targeted WebSocket event (`user:suspended`) strictly to `user:{userId}` room.
5. Suspended user's browser receives real-time event without requiring page refresh:
   - Auth session is wiped.
   - Socket is terminated.
   - Browser redirects to `/account-suspended`.
6. Independent backend enforcement: Any subsequent API call attempted with the suspended user's token is immediately rejected with HTTP `403 Forbidden` (`ACCOUNT_SUSPENDED`).
7. Admin can click **Unsuspend**, restoring active status so user can log in again.

### D. Admin Dashboard & Metrics
- `/admin/dashboard` fetches live statistics from `GET /admin/dashboard/stats`:
  - **Total Users**
  - **Active Users**
  - **Suspended Users**

### E. 404 Fallback
- `/404`: Global fallback handling invalid routes with smart navigation buttons back to the appropriate dashboard.

---

## 4. API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a normal user |
| `POST` | `/auth/login` | Public | Login for admin and users |
| `GET` | `/users/me` | Authenticated | Get current authenticated user's profile |
| `PATCH` | `/users/me` | Authenticated | Update user's own profile (`name`, `email`) |
| `GET` | `/admin/dashboard/stats` | Admin | Get real-time user statistics |
| `GET` | `/admin/users` | Admin | List users with search query (`?search=`) |
| `GET` | `/admin/users/:id` | Admin | Get user details |
| `PATCH` | `/admin/users/:id/suspend` | Admin | Suspend user & emit socket event |
| `PATCH` | `/admin/users/:id/unsuspend` | Admin | Unsuspend user account |

# machine-test
