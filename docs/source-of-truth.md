# Source of Truth Mapping

This document maps all core architectural domains, domain schemas, contracts, and logic to their authoritative source files in the repository.

---

## 1. Domain & Contract Mapping

| Domain / Concept | Authoritative Source of Truth | Secondary / Dependent Files | Notes |
|---|---|---|---|
| **Shared Enums & DTOs** | [`packages/shared/src/index.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/packages/shared/src/index.ts) | `apps/api/src/**/*.dto.ts`, `apps/web/src/**/*.ts` | Defines `Role`, `UserStatus`, `UserDto`, `AuthResponse`, `SOCKET_EVENTS`. |
| **Form AST & Schema Types** | [`packages/shared/src/types/form.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/packages/shared/src/types/form.ts) | `apps/web/src/features/forms/**`, `apps/api/src/forms/**` | Defines `FormElement`, `FormSection`, `FormZone`, `FormDto`, `FormVersionDto`. |
| **User Data Model** | [`apps/api/src/users/schemas/user.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/users/schemas/user.schema.ts) | `apps/api/src/seed.ts`, `apps/api/src/auth/auth.service.ts` | Mongoose schema with `email` index and `toJSON` password hash stripping. |
| **Form Data Model** | [`apps/api/src/forms/schemas/form.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form.schema.ts) | `apps/api/src/forms/forms.service.ts` | Stores canonical metadata, embedded `draft` document, and settings. |
| **Form Version Data Model** | [`apps/api/src/forms/schemas/form-version.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form-version.schema.ts) | `apps/api/src/forms/forms.service.ts` | Stores immutable frozen releases. Compound index `{ formId: 1, versionNumber: 1 }`. |
| **Form Submission Model** | [`apps/api/src/forms/schemas/form-submission.schema.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/schemas/form-submission.schema.ts) | `apps/api/src/forms/forms.service.ts` | Stores response payloads. Compound index `{ formId: 1, createdAt: -1 }`. |
| **Authentication Logic** | [`apps/api/src/auth/auth.service.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/auth/auth.service.ts) | `apps/api/src/auth/strategies/jwt.strategy.ts` | Handles bcrypt password validation, JWT signing, and user registration. |
| **Authorization Guards** | [`apps/api/src/common/guards/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/common/guards/) | `apps/api/src/**/*.controller.ts` | `JwtAuthGuard`, `ActiveUserGuard`, `RolesGuard`. |
| **Form Lifecycle Service** | [`apps/api/src/forms/forms.service.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/forms/forms.service.ts) | `apps/api/src/forms/forms.controller.ts` | Single draft autosave, release deployment snapshotting, submission intake. |
| **Real-Time WebSockets** | [`apps/api/src/websocket/events.gateway.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/websocket/events.gateway.ts) | `apps/web/src/app/providers/SocketProvider.tsx` | Socket.IO gateway with JWT room joining and targeted suspension broadcasting. |
| **Client Routing & Auth** | [`apps/web/src/app/router/AppRouter.tsx`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/app/router/AppRouter.tsx) | `apps/web/src/app/providers/AuthProvider.tsx` | Role-aware route guards (`AdminRoute`, `ProtectedRoute`, `PublicRoute`). |
| **Design Tokens & Styles** | [`apps/web/src/styles/tokens.scss`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/web/src/styles/tokens.scss) | `apps/web/src/**/*.scss` | Defines color palette, spacing, typography, borders, and shadows. |
| **Database Seeding** | [`apps/api/src/seed.ts`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/seed.ts) | Root `package.json` | Seeds default Admin and sample active/suspended user accounts. |

---

## 2. Inactive / Stale Artifacts (Explicitly Not Sources of Truth)

* **[`apps/api/prisma/schema.prisma`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/prisma/schema.prisma)**: Legacy PostgreSQL Prisma definition. It is not imported, generated, or connected to any active application code. The sole active database engine is MongoDB via `@nestjs/mongoose`.
