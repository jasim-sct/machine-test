# Graph Report - multi-tenant-form-builder  (2026-09-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 731 nodes · 1530 edges · 41 communities (32 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- src/index.ts
- UserDto
- form.ts
- auth/auth.service.ts
- components/index.ts
- AppRouter.tsx
- web/package.json
- FormEditorPage.tsx
- api/package.json
- AdminUsersPage.tsx
- ProfileCard.tsx
- forms/forms.service.ts
- compilerOptions
- dependencies
- react
- compilerOptions
- devDependencies
- package.json
- public-forms.controller.ts
- FormsService
- Sidebar/Sidebar.tsx
- shared/package.json
- compilerOptions
- auth.module.ts
- AdminLayout.tsx
- AdminDashboardPage.tsx
- compilerOptions
- scripts
- UpdateVersionDto
- CreateVersionDto
- nest-cli.json
- CreateFormDto
- JwtStrategy
- PublicFormPage.tsx
- vite-env.d.ts
- FormsModule
- MinLength
- Injectable
- InjectModel
- Prop
- Schema

## God Nodes (most connected - your core abstractions)
1. `react` - 68 edges
2. `@nestjs/common` - 30 edges
3. `UserDto` - 27 edges
4. `useAuth()` - 26 edges
5. `Role` - 23 edges
6. `UserStatus` - 21 edges
7. `UsersService` - 21 edges
8. `react-router-dom` - 21 edges
9. `compilerOptions` - 19 edges
10. `FormsService` - 18 edges

## Surprising Connections (you probably didn't know these)
- `UserStatusBadgeProps` --references--> `UserStatus`  [EXTRACTED]
  apps/web/src/components/UserStatusBadge/UserStatusBadge.tsx → packages/shared/src/index.ts
- `ProfileCardProps` --references--> `UserDto`  [EXTRACTED]
  apps/web/src/components/ProfileCard/ProfileCard.tsx → packages/shared/src/index.ts
- `AuthContextType` --references--> `UserDto`  [EXTRACTED]
  apps/web/src/app/providers/AuthProvider.tsx → packages/shared/src/index.ts
- `ProfileFormProps` --references--> `UserDto`  [EXTRACTED]
  apps/web/src/components/ProfileForm/ProfileForm.tsx → packages/shared/src/index.ts
- `User` --references--> `Role`  [EXTRACTED]
  apps/api/src/users/schemas/user.schema.ts → packages/shared/src/index.ts

## Import Cycles
- None detected.

## Communities (41 total, 9 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.06
Nodes (45): AdminModule, Module, AppModule, Module, Roles(), ROLES_KEY, ActiveUserGuard, Injectable (+37 more)

### Community 1 - "UserDto"
Cohesion: 0.06
Nodes (28): AdminController, Controller, Get, Param, Patch, UseGuards, AdminService, Injectable (+20 more)

### Community 2 - "form.ts"
Cohesion: 0.07
Nodes (39): CurrentUser, FormsController, Body, Controller, Get, Param, Patch, Post (+31 more)

### Community 3 - "auth/auth.service.ts"
Cohesion: 0.09
Nodes (24): AuthController, Body, Controller, Post, AuthService, Injectable, LoginDto, IsEmail (+16 more)

### Community 4 - "components/index.ts"
Cohesion: 0.07
Nodes (20): AlertProps, AuthLayoutProps, ButtonProps, ConfirmDialog(), ConfirmDialogProps, ContentContainerProps, DialogProps, EmptyState() (+12 more)

### Community 5 - "AppRouter.tsx"
Cohesion: 0.16
Nodes (21): AuthContext, useAuth(), AdminRoute(), RoleAwareLayout(), RootRedirect(), ProtectedRoute(), PublicRoute(), AuthCard() (+13 more)

### Community 6 - "web/package.json"
Cohesion: 0.06
Nodes (31): dependencies, react, react-dom, react-router-dom, @saas/shared, socket.io-client, devDependencies, sass (+23 more)

### Community 7 - "FormEditorPage.tsx"
Cohesion: 0.11
Nodes (20): ElementPalette(), ElementPaletteProps, PALETTE_ITEMS, PaletteItem, FieldRenderer(), FieldRendererProps, ActiveDragKind, FormCanvasHierarchical() (+12 more)

### Community 8 - "api/package.json"
Cohesion: 0.08
Nodes (25): @saas/shared, socket.io-client, typescript, name, private, version, bcryptjs, class-transformer (+17 more)

### Community 9 - "AdminUsersPage.tsx"
Cohesion: 0.17
Nodes (17): Alert(), Badge(), Button(), ContentContainer(), Column, DataTable(), DataTableProps, Dialog() (+9 more)

### Community 10 - "ProfileCard.tsx"
Cohesion: 0.12
Nodes (13): Avatar(), AvatarProps, Card(), CardProps, CardContent(), CardContentProps, CardFooter(), CardFooterProps (+5 more)

### Community 11 - "forms/forms.service.ts"
Cohesion: 0.19
Nodes (17): Form, FormDocument, FormSchema, Prop, Schema, FormSubmission, FormSubmissionDocument, FormSubmissionSchema (+9 more)

### Community 12 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 13 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, bcryptjs, class-transformer, class-validator, dotenv, mongoose, @nestjs/common, @nestjs/config (+13 more)

### Community 14 - "react"
Cohesion: 0.12
Nodes (11): App(), AuthProvider(), SocketContext, SocketContextType, SocketProvider(), AppRouter(), AuthCardProps, Select (+3 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, socket.io-client, supertest, ts-jest (+8 more)

### Community 17 - "package.json"
Cohesion: 0.12
Nodes (15): devDependencies, concurrently, typescript, typescript, name, private, scripts, build (+7 more)

### Community 18 - "public-forms.controller.ts"
Cohesion: 0.17
Nodes (10): SubmitFormDto, IsNotEmpty, PublicFormsController, Body, Controller, Get, Param, Post (+2 more)

### Community 19 - "FormsService"
Cohesion: 0.18
Nodes (3): FormsService, Injectable, InjectModel

### Community 20 - "Sidebar/Sidebar.tsx"
Cohesion: 0.23
Nodes (6): BadgeProps, SidebarProps, SidebarItem(), SidebarItemProps, SidebarNavigation(), SidebarNavigationProps

### Community 21 - "shared/package.json"
Cohesion: 0.15
Nodes (12): description, devDependencies, typescript, exports, typescript, main, name, scripts (+4 more)

### Community 22 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+4 more)

### Community 23 - "auth.module.ts"
Cohesion: 0.21
Nodes (9): AuthModule, Module, JwtPayload, @nestjs/config, @nestjs/jwt, @nestjs/passport, @nestjs/websockets, passport-jwt (+1 more)

### Community 24 - "AdminLayout.tsx"
Cohesion: 0.22
Nodes (7): AppShell(), AppShellProps, Header(), HeaderProps, Sidebar(), AdminLayout(), UserLayout()

### Community 25 - "AdminDashboardPage.tsx"
Cohesion: 0.20
Nodes (6): Skeleton(), SkeletonProps, StatCard(), StatCardProps, AdminDashboardPage(), adminService

### Community 26 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, skipLibCheck, sourceMap (+2 more)

### Community 27 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:seed, dev, lint, seed, start, start:prod (+1 more)

### Community 28 - "UpdateVersionDto"
Cohesion: 0.25
Nodes (7): IsArray, IsIn, IsOptional, IsString, MaxLength, UpdateVersionDto, MinLength

### Community 29 - "CreateVersionDto"
Cohesion: 0.29
Nodes (6): CreateVersionDto, IsArray, IsIn, IsOptional, IsString, MaxLength

### Community 30 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, entryFile, $schema, sourceRoot

### Community 31 - "CreateFormDto"
Cohesion: 0.40
Nodes (5): CreateFormDto, IsNotEmpty, IsString, MaxLength, MinLength

## Knowledge Gaps
- **243 isolated node(s):** `AvatarProps`, `CardProps`, `SocketContextType`, `AuthCardProps`, `SelectProps` (+238 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 351 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `PublicFormPage.tsx`, `components/index.ts`, `AppRouter.tsx`, `web/package.json`, `FormEditorPage.tsx`, `AdminUsersPage.tsx`, `ProfileCard.tsx`, `Sidebar/Sidebar.tsx`, `AdminLayout.tsx`, `AdminDashboardPage.tsx`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `@nestjs/common` connect `src/index.ts` to `auth/auth.service.ts`, `api/package.json`, `forms/forms.service.ts`, `public-forms.controller.ts`, `auth.module.ts`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `UserDto` connect `UserDto` to `src/index.ts`, `auth/auth.service.ts`, `components/index.ts`, `AppRouter.tsx`, `AdminUsersPage.tsx`, `ProfileCard.tsx`, `AdminDashboardPage.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `AvatarProps`, `CardProps`, `SocketContextType` to the rest of the system?**
  _243 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06265432098765432 - nodes in this community are weakly interconnected._
- **Should `UserDto` be split into smaller, more focused modules?**
  _Cohesion score 0.059932659932659935 - nodes in this community are weakly interconnected._
- **Should `form.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06857142857142857 - nodes in this community are weakly interconnected._