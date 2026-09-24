# Contracts: REST API Specification

> **Scope**: Complete list of endpoints, HTTP methods, request/response structures, and authentication requirements.  
> **Source of Truth**: NestJS Controllers in `apps/api/src/`.  
> **Last Verified**: 2026-09-24

---

## 1. Authentication & Users

### `POST /auth/register`
- **Access**: Public
- **Request Body**: `{ name: string, email: string, password: string }`
- **Response**: `{ accessToken: string, user: UserDto }`

### `POST /auth/login`
- **Access**: Public
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ accessToken: string, user: UserDto }`

### `GET /users/me`
- **Access**: Authenticated (`Bearer Token`, Active User)
- **Response**: `UserDto`

### `PATCH /users/me`
- **Access**: Authenticated (`Bearer Token`, Active User)
- **Request Body**: `{ name?: string, email?: string }`
- **Response**: `UserDto`

---

## 2. Administration

### `GET /admin/dashboard/stats`
- **Access**: Admin (`Role.ADMIN`)
- **Response**: `{ totalUsers: number, activeUsers: number, suspendedUsers: number }`

### `GET /admin/users`
- **Access**: Admin (`Role.ADMIN`)
- **Query Params**: `?search=string`
- **Response**: `UserDto[]`

### `PATCH /admin/users/:id/suspend`
- **Access**: Admin (`Role.ADMIN`)
- **Response**: `UserDto`

### `PATCH /admin/users/:id/unsuspend`
- **Access**: Admin (`Role.ADMIN`)
- **Response**: `UserDto`

---

## 3. Forms (Workspace)

### `POST /forms`
- **Access**: Authenticated
- **Request Body**: `{ name: string }`
- **Response**: `FormDto`

### `GET /forms`
- **Access**: Authenticated
- **Response**: `FormDto[]`

### `GET /forms/:id`
- **Access**: Authenticated (Owner only)
- **Response**: `FormDto`

### `PATCH /forms/:id/draft`
- **Access**: Authenticated (Owner only)
- **Request Body**: `{ title?: string, elements?: FormElement[], sections?: FormSection[], formLayout?: string, customCss?: string }`
- **Response**: `FormDto`

### `POST /forms/:id/deploy`
- **Access**: Authenticated (Owner only)
- **Response**: `FormDto`

### `PATCH /forms/:id/settings`
- **Access**: Authenticated (Owner only)
- **Request Body**: `UpdateSettingsDto`
- **Response**: `FormDto`

### `GET /forms/:id/data`
- **Access**: Authenticated (Owner only)
- **Query Params**: `?format=csv` (optional)
- **Response**: `FormDataViewDto` or CSV stream

---

## 4. Public Forms Runtime

### `GET /public/forms/:publicId`
- **Access**: Public
- **Response**: `PublicFormDto`

### `POST /public/forms/:publicId/submissions`
- **Access**: Public
- **Request Body**: `{ data: Record<string, any> }`
- **Response**: `{ message: string, id: string }`
