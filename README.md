# SaaS Form Platform Monorepo

A modular, full-stack SaaS form-building and submission platform featuring a Single Page Application (Admin & User workspaces, Drag-and-Drop Form Builder, Form Preview, Submissions Data Table, and Public Form Runtime), a NestJS REST API with Socket.IO real-time event broadcasting, and a MongoDB database with Mongoose ODM.

---

## 1. Monorepo Structure

```text
/
├── apps/
│   ├── web/                 # React 19 + TypeScript + Vite frontend
│   └── api/                 # NestJS 11 + Mongoose backend REST API & WebSocket server
│
├── packages/
│   └── shared/              # Shared types, DTO interfaces, enums, AST schema definitions
│
├── docs/                    # Complete architectural, domain, and operational documentation
├── package.json             # Root workspace scripts (dev, build, lint, test, seed)
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── AGENTS.md                # Engineering rules and directives for AI agents
├── ARCHITECTURE.md          # System architecture and data flow blueprints
├── CONTRIBUTING.md          # Contributor guide and PR workflow
└── SECURITY.md              # Security policies and threat model
```

---

## 2. Quick Start

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017/saas_db`

### Installation & Local Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Seed Database**:
   ```bash
   pnpm seed
   ```
   *Seeded Credentials:*
   - **Administrator Account:**
     - Email: `admin@saas.local`
     - Password: `AdminPassword123!`
     - Role: `ADMIN`
   - **Sample User Accounts (Password: `UserPassword123!`):**
     - `alex.morgan@company.com` (Active)
     - `sarah.chen@techflow.io` (Active)
     - `david.kim@apexdesign.co` (Suspended)
     - `hannah.schmidt@berlinai.de` (Suspended)

3. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   - **Frontend Application**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)

4. **Run Verification & Tests**:
   ```bash
   # Typecheck and lint across all packages
   pnpm lint

   # Run automated Jest E2E test suites
   pnpm test

   # Full production build
   pnpm build
   ```

---

## 3. Key Capabilities & Feature Modules

### A. Authentication & Session Management
- **Role-Based Portals**: Unified `/login` seamlessly routes Admins to `/admin/dashboard` and regular users to `/dashboard`.
- **User Registration**: `/register` provisions standard users (`Role.USER`). Admin creation is strictly controlled via environment seeding.
- **Real-Time Session Revocation**: When an admin suspends a user account (`PATCH /admin/users/:id/suspend`), the backend issues an immediate WebSocket event (`user:suspended`) over Socket.IO to terminate the active browser session instantly.

### B. Form Builder & Continuous Drafting
- **Hierarchical Form Canvas**: Sections $\to$ Zones $\to$ Elements canvas composition with dynamic responsive column grids.
- **Continuous Autosave**: Edits mutate the active `Form.draft` without impacting deployed versions.
- **Properties Panel**: Granular dimension controls (width presets, custom width, custom height) constrained with `maxWidth: 100%` and anti-overflow protections.

### C. Deployment & Versioning
- **Immutable Releases**: Deploying a draft snapshots the schema into a frozen `FormVersion` record with incremental version numbers (`Version 1`, `Version 2`, etc.).
- **Live Public Form**: Public forms are served at `/f/:publicId` without requiring authentication.
- **Historical Integrity**: Submissions are permanently indexed against the active `versionId` deployed at the time of submission.

### D. Submissions & Analytics
- **Interactive Data Table**: View submissions with dynamic column projections derived from field labels.
- **CSV Export**: Streamed submission data exports via `GET /forms/:id/data?format=csv`.
- **Form Analytics**: Total responses, version count, and activity feeds.

---

## 4. Environment Variables

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

## 5. Documentation Navigation

Detailed technical documentation is available in the [`docs/`](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/) directory:

- [Documentation Index](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/README.md)
- [Source of Truth Mapping](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/source-of-truth.md)
- [Documentation Audit & Verification Matrix](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/documentation-audit.md)
- [Architecture Risks & Technical Debt](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/architecture-risks.md)
- [Architecture Decision Records (ADRs)](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/decisions/README.md)
- [Domain Specifications](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/domains/README.md)
- [API & Database Contracts](file:///c:/Users/Muhammed%20Jasim/machine-test/docs/contracts/api.md)
