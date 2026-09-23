# Graph Report - multi-tenant-form-builder  (2026-09-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 727 nodes · 1519 edges · 40 communities (32 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- src/index.ts
- UserDto
- form.ts
- web/package.json
- FormEditorPage.tsx
- AuthService
- api/package.json
- AdminUsersPage.tsx
- AppRouter.tsx
- react
- forms/forms.service.ts
- compilerOptions
- components/index.ts
- dependencies
- AdminDashboardPage.tsx
- compilerOptions
- devDependencies
- package.json
- public-forms.controller.ts
- ProfileForm.tsx
- AdminLayout.tsx
- FormsService
- shared/package.json
- compilerOptions
- SocketProvider.tsx
- Sidebar/Sidebar.tsx
- compilerOptions
- scripts
- UpdateVersionDto
- CreateVersionDto
- CreateFormDto
- nest-cli.json
- Card/CardFooter.tsx
- vite-env.d.ts
- FormsModule
- MinLength
- Injectable
- InjectModel
- Prop
- Schema

## God Nodes (most connected - your core abstractions)
1. `react` - 67 edges
2. `@nestjs/common` - 30 edges
3. `UserDto` - 27 edges
4. `useAuth()` - 26 edges
5. `Role` - 23 edges
6. `UsersService` - 21 edges
7. `UserStatus` - 21 edges
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

## Communities (40 total, 8 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.05
Nodes (54): AdminModule, Module, AppModule, Module, AuthModule, Module, JwtPayload, JwtStrategy (+46 more)

### Community 1 - "UserDto"
Cohesion: 0.06
Nodes (27): AdminController, Controller, Get, Param, Patch, UseGuards, AdminService, Injectable (+19 more)

### Community 2 - "form.ts"
Cohesion: 0.07
Nodes (35): CurrentUser, FormsController, Body, Controller, Get, Param, Patch, Post (+27 more)

### Community 3 - "web/package.json"
Cohesion: 0.06
Nodes (31): dependencies, react, react-dom, react-router-dom, @saas/shared, socket.io-client, devDependencies, sass (+23 more)

### Community 4 - "FormEditorPage.tsx"
Cohesion: 0.10
Nodes (22): ElementPalette(), ElementPaletteProps, PALETTE_ITEMS, PaletteItem, FieldRenderer(), FieldRendererProps, FormCanvasProps, ActiveDragKind (+14 more)

### Community 5 - "AuthService"
Cohesion: 0.09
Nodes (23): AuthController, Body, Controller, Post, AuthService, Injectable, LoginDto, IsEmail (+15 more)

### Community 6 - "api/package.json"
Cohesion: 0.07
Nodes (27): @saas/shared, socket.io-client, typescript, name, private, version, class-transformer, jest (+19 more)

### Community 7 - "AdminUsersPage.tsx"
Cohesion: 0.15
Nodes (20): Alert(), Badge(), Button(), Card(), CardContent(), CardHeader(), ConfirmDialog(), ConfirmDialogProps (+12 more)

### Community 8 - "AppRouter.tsx"
Cohesion: 0.21
Nodes (17): AuthContext, useAuth(), AdminRoute(), RoleAwareLayout(), RootRedirect(), ProtectedRoute(), PublicRoute(), AuthCard() (+9 more)

### Community 9 - "react"
Cohesion: 0.08
Nodes (14): AuthCardProps, AuthLayoutProps, ButtonProps, ContentContainerProps, EmptyState(), EmptyStateProps, ErrorStateProps, PageHeaderProps (+6 more)

### Community 10 - "forms/forms.service.ts"
Cohesion: 0.19
Nodes (17): Form, FormDocument, FormSchema, Prop, Schema, FormSubmission, FormSubmissionDocument, FormSubmissionSchema (+9 more)

### Community 11 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 12 - "components/index.ts"
Cohesion: 0.15
Nodes (9): Avatar(), AvatarProps, BadgeProps, CardProps, CardContentProps, CardHeaderProps, ProfileTileProps, UserStatusBadge() (+1 more)

### Community 13 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, bcryptjs, class-transformer, class-validator, dotenv, mongoose, @nestjs/common, @nestjs/config (+13 more)

### Community 14 - "AdminDashboardPage.tsx"
Cohesion: 0.12
Nodes (11): Get, Skeleton(), SkeletonProps, StatCard(), StatCardProps, AdminDashboardPage(), adminService, api (+3 more)

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

### Community 19 - "ProfileForm.tsx"
Cohesion: 0.16
Nodes (8): AlertProps, FormField(), FormFieldProps, FormLabel(), FormLabelProps, FormMessage(), FormMessageProps, InputProps

### Community 20 - "AdminLayout.tsx"
Cohesion: 0.16
Nodes (10): AppShell(), AppShellProps, Header(), HeaderProps, ProfileMenu(), ProfileMenuProps, ProfileTile(), Sidebar() (+2 more)

### Community 21 - "FormsService"
Cohesion: 0.18
Nodes (3): FormsService, Injectable, InjectModel

### Community 22 - "shared/package.json"
Cohesion: 0.15
Nodes (12): description, devDependencies, typescript, exports, typescript, main, name, scripts (+4 more)

### Community 23 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+4 more)

### Community 24 - "SocketProvider.tsx"
Cohesion: 0.22
Nodes (6): App(), AuthProvider(), SocketContext, SocketContextType, SocketProvider(), AppRouter()

### Community 25 - "Sidebar/Sidebar.tsx"
Cohesion: 0.29
Nodes (5): SidebarProps, SidebarItem(), SidebarItemProps, SidebarNavigation(), SidebarNavigationProps

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

### Community 30 - "CreateFormDto"
Cohesion: 0.33
Nodes (5): CreateFormDto, IsNotEmpty, IsString, MaxLength, MinLength

### Community 31 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, entryFile, $schema, sourceRoot

## Knowledge Gaps
- **242 isolated node(s):** `JwtPayload`, `AvatarProps`, `BadgeProps`, `CardProps`, `ProfileTileProps` (+237 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 351 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Card/CardFooter.tsx`, `web/package.json`, `FormEditorPage.tsx`, `AdminUsersPage.tsx`, `AppRouter.tsx`, `components/index.ts`, `AdminDashboardPage.tsx`, `ProfileForm.tsx`, `AdminLayout.tsx`, `SocketProvider.tsx`, `Sidebar/Sidebar.tsx`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `@nestjs/common` connect `src/index.ts` to `forms/forms.service.ts`, `public-forms.controller.ts`, `api/package.json`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `UserDto` connect `UserDto` to `src/index.ts`, `AuthService`, `AdminUsersPage.tsx`, `AppRouter.tsx`, `components/index.ts`, `AdminDashboardPage.tsx`, `ProfileForm.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `JwtPayload`, `AvatarProps`, `BadgeProps` to the rest of the system?**
  _242 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053860719545550176 - nodes in this community are weakly interconnected._
- **Should `UserDto` be split into smaller, more focused modules?**
  _Cohesion score 0.0603921568627451 - nodes in this community are weakly interconnected._
- **Should `form.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07215541165587419 - nodes in this community are weakly interconnected._