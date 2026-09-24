# Engineering: Backend Architecture

> **Scope**: NestJS modular organization, dependency injection, service patterns, and MongoDB integration.  
> **Source of Truth**: [`apps/api/src/`](file:///c:/Users/Muhammed%20Jasim/machine-test/apps/api/src/).  
> **Last Verified**: 2026-09-24

---

## 1. Modular Organization

```text
apps/api/src/
├── app.module.ts                # Root module configuring MongooseModule and feature modules
├── auth/                        # AuthController, AuthService, JwtStrategy
├── users/                       # UsersController, UsersService, UserSchema
├── forms/                       # FormsController, PublicFormsController, FormsService
├── admin/                       # AdminController, AdminService
├── dashboard/                   # DashboardController, DashboardService
├── websocket/                   # EventsGateway, EventsModule
└── common/                      # Guards, Decorators
```

---

## 2. Dependency Injection & Service Layer

- Modules declare controllers and providers cleanly.
- Services inject Mongoose models using `@InjectModel(SchemaName.name)`.
- Global `ValidationPipe` transforms and validates plain request JSON into strongly typed DTO instances.
