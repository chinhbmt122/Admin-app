# Next.js 14 Admin App - Authentication & Authorization (RBAC) Guide with Clerk

> ⚠️ **IMPORTANT**: Hệ thống đang sử dụng **Clerk** cho authentication, không phải custom JWT!

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Roles và Permissions](#2-roles-và-permissions)
3. [Authentication Flow với Clerk](#3-authentication-flow-với-clerk)
4. [Authorization (RBAC)](#4-authorization-rbac)
5. [Backend API Contract](#5-backend-api-contract)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Scoping Logic](#7-scoping-logic)
8. [TODO: Cần Backend Implement](#8-todo-cần-backend-implement)
9. [Diagrams](#9-diagrams)
10. [Best Practices](#10-best-practices)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Tổng quan hệ thống

### 1.1 Mục tiêu

Xây dựng hệ thống Authentication + Authorization cho Admin App quản lý rạp chiếu phim với:
- **Authentication**: Xác thực qua **Clerk** (third-party auth service)
- **Authorization**: Phân quyền dựa trên Role-Based Access Control (RBAC)
- **Scoping**: Giới hạn phạm vi truy cập theo cinema_ids (MANAGER)

### 1.2 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Authentication**: **Clerk** (`@clerk/nextjs`)
- **Backend Auth**: Clerk SDK (`@clerk/clerk-sdk-node`)
- **RBAC**: Custom implementation với Prisma
- **Session Storage**: Clerk-managed (cookie `__session`)

---

## 2. Roles và Permissions

### 2.1 Định nghĩa Roles

#### ADMIN
- **Quyền hạn**: Toàn quyền trên toàn hệ thống
- **Phạm vi**: Tất cả cinemas, movies, showtimes
- **Đặc quyền**:
  - Quản lý users (tạo MANAGER, phân quyền)
  - Truy cập toàn bộ cinemas
  - Xem báo cáo tổng thể
  - Cấu hình hệ thống

#### MANAGER
- **Quyền hạn**: Giới hạn trong phạm vi cinemas được gán
- **Phạm vi**: Chỉ các cinema_ids trong UserRole
- **Hạn chế**:
  - ❌ Không thể tạo/xóa cinemas
  - ❌ Không thể quản lý users khác
  - ❌ Không thể xem cinemas ngoài quyền
  - ✅ Chỉ quản lý movies/showtimes trong cinemas của mình

### 2.2 Permission List

```typescript
// permissions.ts
export const PERMISSIONS = {
  // Cinema Management
  'cinema:read': 'View cinema details',
  'cinema:create': 'Create new cinema',
  'cinema:update': 'Update cinema info',
  'cinema:delete': 'Delete cinema',
  
  // Movie Management
  'movie:read': 'View movies',
  'movie:create': 'Add new movie',
  'movie:update': 'Update movie info',
  'movie:delete': 'Remove movie',
  
  // Showtime Management
  'showtime:read': 'View showtimes',
  'showtime:create': 'Create showtime',
  'showtime:update': 'Update showtime',
  'showtime:delete': 'Delete showtime',
  
  // Hall Management
  'hall:read': 'View halls',
  'hall:create': 'Create hall',
  'hall:update': 'Update hall',
  'hall:delete': 'Delete hall',
  
  // User Management (Admin only)
  'user:read': 'View users',
  'user:create': 'Create users',
  'user:update': 'Update users',
  'user:delete': 'Delete users',
  
  // Reports
  'report:read': 'View reports',
  'report:export': 'Export reports',
  
  // Settings (Admin only)
  'settings:read': 'View settings',
  'settings:update': 'Update settings',
} as const;

export type Permission = keyof typeof PERMISSIONS;
```

### 2.3 Role → Permission Mapping

```typescript
// roles.ts
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    // Full access to everything
    'cinema:read', 'cinema:create', 'cinema:update', 'cinema:delete',
    'movie:read', 'movie:create', 'movie:update', 'movie:delete',
    'showtime:read', 'showtime:create', 'showtime:update', 'showtime:delete',
    'hall:read', 'hall:create', 'hall:update', 'hall:delete',
    'user:read', 'user:create', 'user:update', 'user:delete',
    'report:read', 'report:export',
    'settings:read', 'settings:update',
  ],
  
  MANAGER: [
    // Limited to assigned cinemas
    'cinema:read',
    'movie:read', 'movie:create', 'movie:update',
    'showtime:read', 'showtime:create', 'showtime:update', 'showtime:delete',
    'hall:read', 'hall:create', 'hall:update', 'hall:delete',
    'report:read',
  ],
};
```

### 2.4 So sánh ADMIN vs MANAGER

| Chức năng | ADMIN | MANAGER |
|-----------|-------|---------|
| Xem tất cả cinemas | ✅ | ❌ (chỉ cinemas được gán) |
| Tạo/Xóa cinema | ✅ | ❌ |
| Quản lý movies | ✅ (toàn bộ) | ✅ (trong cinemas của mình) |
| Quản lý showtimes | ✅ (toàn bộ) | ✅ (trong cinemas của mình) |
| Quản lý users | ✅ | ❌ |
| Xem báo cáo | ✅ (toàn hệ thống) | ✅ (cinemas của mình) |
| Cài đặt hệ thống | ✅ | ❌ |

---

## 3. Authentication Flow với Clerk

### 3.1 Clerk Overview

**Clerk** là third-party authentication service đã được tích hợp sẵn vào backend. Clerk xử lý:
- User registration/login
- Session management
- Token generation & validation
- OAuth providers (Google, GitHub, etc.)

**Lợi ích:**
- ✅ Không cần implement JWT manually
- ✅ Secure session management built-in
- ✅ Pre-built UI components
- ✅ Production-ready authentication

### 3.2 Clerk Token Structure

**Backend xác thực qua cookie `__session`:**

```typescript
// Backend: ClerkAuthGuard
const token = request.cookies?.__session;
const session = await clerkClient.verifyToken(token);
request.userId = session.sub; // Clerk user ID
```

**User data từ Clerk:**

```typescript
interface ClerkUser {
  id: string;              // user_user_xxxxx
  emailAddresses: Array<{
    emailAddress: string;
  }>;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
}
```

### 3.3 Authentication Flows

#### 3.3.1 Login Flow

```
1. User mở /login page
2. Clerk UI component hiển thị login form
3. User nhập email/password
4. Clerk xác thực credentials
5. Clerk tạo session và set cookie __session
6. Frontend redirect đến /admin/dashboard
7. Frontend call API backend để lấy permissions
```

#### 3.3.2 Logout Flow

```
1. User click "Logout"
2. Call Clerk signOut()
3. Clerk xóa __session cookie
4. Frontend clear local state
5. Redirect to /login
```

#### 3.3.3 Session Check

```
1. User load trang
2. Clerk middleware check __session cookie
3. Nếu valid → load user data
4. Nếu invalid → redirect /login
5. Frontend call /api/v1/users/:userId/permissions để lấy RBAC data
```

### 3.4 Clerk Environment Variables

**Backend cần:**

```env
# apps/api-gateway/.env
CLERK_SECRET_KEY=sk_test_xxxxx

# apps/user-service/.env
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Frontend cần:**

```env
# apps/Admin-app/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

> ⚠️ **TODO Backend**: Cần publish Clerk keys cho team frontend

---

## 4. Authorization (RBAC)

### 4.1 RBAC Architecture

```
Clerk User (userId) → UserRole → Role → RolePermission → Permission
                          ↓
                     cinema_ids (scope for MANAGER)
```

**Database Schema (đã có sẵn trong user-service):**

```prisma
model Role {
  id              String          @id @default(cuid())
  name            String          @unique
  rolePermissions RolePermission[]
  userRoles       UserRole[]
}

model Permission {
  id              String          @id @default(cuid())
  name            String          @unique
  rolePermissions RolePermission[]
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String   // Clerk user ID (user_xxxxx)
  roleId    String
  cinemaIds Int[]    // ⚠️ TODO Backend: Thêm field này
  role      Role     @relation(fields: [roleId], references: [id])
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
}
```

> ⚠️ **TODO Backend**: 
> 1. Chạy `docker compose exec user-service npx prisma db push` để tạo tables
> 2. Thêm field `cinemaIds Int[]` vào model `UserRole`
> 3. Tạo seed file để seed roles và permissions

### 4.2 Permission Checking Logic

```typescript
// lib/rbac/permission-checker.ts (Frontend)
export class PermissionChecker {
  constructor(
    private userId: string,
    private roles: string[],
    private permissions: string[],
    private cinemaIds: number[]
  ) {}

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  hasPermission(permission: Permission): boolean {
    // ADMIN has all permissions
    if (this.hasRole('ADMIN')) return true;

    // Check explicit permissions
    return this.permissions.includes(permission);
  }

  hasCinemaScope(cinemaId: number): boolean {
    // ADMIN has access to all cinemas
    if (this.hasRole('ADMIN')) return true;

    // MANAGER must have cinema_id in their scope
    if (this.hasRole('MANAGER')) {
      return this.cinemaIds.includes(cinemaId);
    }

    return false;
  }

  canAccessResource(
    permission: Permission,
    cinemaId?: number
  ): boolean {
    // Check permission first
    if (!this.hasPermission(permission)) return false;

    // If cinema-specific, check scope
    if (cinemaId !== undefined) {
      return this.hasCinemaScope(cinemaId);
    }

    return true;
  }
}
```

### 4.3 Scope Enforcement for MANAGER

**Quy tắc:**
1. MANAGER chỉ xem được data của cinemas trong `cinemaIds`
2. API calls phải filter theo `cinemaIds`
3. UI không hiển thị cinemas ngoài scope
4. Backend reject nếu MANAGER cố truy cập cinema không thuộc quyền

**Example:**

```typescript
// MANAGER với cinemaIds = [1, 3]

// ✅ Allowed
GET /cinemas/1/showtimes
POST /cinemas/3/showtimes
GET /movies?cinema_id=1

// ❌ Forbidden
GET /cinemas/2/showtimes  // cinema_id=2 not in scope
POST /cinemas/5/movies    // cinema_id=5 not in scope
GET /cinemas              // Cannot list all cinemas (unless filtered)
```

---

## 5. Backend API Contract

> ⚠️ **TODO Backend**: Cần implement các endpoints sau

### 5.1 User & Permission Endpoints

#### GET /api/v1/users/:userId/permissions

**Request:** (sử dụng Clerk session cookie `__session`)

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_2abc123xyz",
    "email": "manager@example.com",
    "roles": ["MANAGER"],
    "permissions": [
      "cinema:read",
      "movie:read",
      "movie:create",
      "movie:update",
      "showtime:read",
      "showtime:create",
      "showtime:update",
      "showtime:delete",
      "hall:read",
      "hall:create",
      "hall:update",
      "hall:delete",
      "report:read"
    ],
    "cinemaIds": [1, 3]
  }
}
```

**Implementation Status:** 
- ✅ Backend có `UserService.getPermissions(userId)` rồi
- ⚠️ Chưa có endpoint expose ra API Gateway
- ⚠️ Chưa trả về `roles` và `cinemaIds`

#### POST /api/v1/users/:userId/roles

**Request:**
```json
{
  "roleId": "role_manager_id",
  "cinemaIds": [1, 3]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_2abc123xyz",
    "roleId": "role_manager_id",
    "cinemaIds": [1, 3]
  }
}
```

**Implementation Status:** ⚠️ Chưa có endpoint này

#### DELETE /api/v1/users/:userId/roles/:roleId

**Implementation Status:** ⚠️ Chưa có endpoint này

### 5.2 Protected Endpoints (Đã có sẵn)

Backend đã có `ClerkAuthGuard` và `@Permission()` decorator:

```typescript
// Example: Cinema Controller
@Post('cinema')
@UseGuards(ClerkAuthGuard)
@Permission('cinema:create')  // ⚠️ TODO: Backend cần uncomment và config
createCinema(@Body() dto: CreateCinemaRequest) {
  // ...
}
```

**Current Status:**
- ✅ `ClerkAuthGuard` đã implement
- ✅ `@Permission()` decorator đã có
- ⚠️ Permission checking chưa enforce đầy đủ
- ⚠️ Cinema scope filtering chưa có

### 5.3 Scope Filtering (Cần Backend Implement)

**Ví dụ endpoint cần filter theo scope:**

#### GET /api/v1/cinemas

**ADMIN Response:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Cinema A"},
    {"id": 2, "name": "Cinema B"},
    {"id": 3, "name": "Cinema C"}
  ]
}
```

**MANAGER Response (cinemaIds=[1,3]):**
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Cinema A"},
    {"id": 3, "name": "Cinema C"}
  ]
}
```

> ⚠️ **TODO Backend**: Thêm middleware để filter results theo `cinemaIds`

#### POST /api/v1/cinemas/:id/showtimes

**Authorization Check:**
```typescript
// Backend cần check
if (user.roles.includes('MANAGER')) {
  if (!user.cinemaIds.includes(req.params.id)) {
    throw new ForbiddenException('Cinema not in your scope');
  }
}
```

**Forbidden Response (403):**
```json
{
  "success": false,
  "message": "Forbidden resource",
  "errors": [{
    "code": "FORBIDDEN",
    "message": "You don't have access to this cinema"
  }]
}
```

### 5.4 Backend Middleware (Cần Implement)

#### Scope Middleware

```typescript
// middleware/cinema-scope.middleware.ts
export class CinemaScopeMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const user = req['user']; // From ClerkAuthGuard
    const cinemaId = parseInt(req.params.cinemaId || req.body.cinemaId);

    // ADMIN can access all
    if (user.roles.includes('ADMIN')) {
      return next();
    }

    // MANAGER must have cinema in scope
    if (user.roles.includes('MANAGER')) {
      if (!user.cinemaIds?.includes(cinemaId)) {
        throw new ForbiddenException('Cinema not in your scope');
      }
    }

    next();
  }
}
```

> ⚠️ **TODO Backend**: Implement middleware này và apply vào routes

---

## 6. Frontend Implementation

### 6.1 Folder Structure

```
apps/Admin-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx         # Login with Clerk UI
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           # Protected layout
│   │   │   ├── page.tsx
│   │   │   ├── cinemas/
│   │   │   │   ├── page.tsx         # List cinemas (filtered by scope)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx     # Cinema detail
│   │   │   │   └── new/
│   │   │   │       └── page.tsx     # New cinema (ADMIN only)
│   │   │   ├── movies/
│   │   │   ├── showtimes/
│   │   │   └── halls/
│   │   └── middleware.ts            # Clerk middleware for auth
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── useAuth.ts           # Hook to get user + RBAC data
│   │   │   └── api.ts               # API client
│   │   │
│   │   ├── rbac/
│   │   │   ├── permissions.ts       # Permission definitions
│   │   │   ├── roles.ts             # Role mappings
│   │   │   ├── usePermissions.ts    # Permission hooks
│   │   │   └── useCinemaFilter.ts   # Scope filtering hook
│   │   │
│   │   └── api/
│   │       └── client.ts            # Axios client
│   │
│   └── components/
│       ├── guards/
│       │   ├── PermissionGate.tsx   # UI permission gate
│       │   └── RoleGate.tsx         # UI role gate
│       │
│       └── layouts/
│           ├── Sidebar.tsx          # Nav with permission-based items
│           └── Header.tsx
```

### 6.2 Install Dependencies

```bash
cd apps/Admin-app
npm install @clerk/nextjs
```

### 6.3 Setup Clerk Provider

```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 6.4 Middleware for Route Protection

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 6.5 Auth Hook with RBAC

```typescript
// lib/auth/useAuth.ts
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface UserPermissions {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  cinemaIds: number[];
}

export function useAuth() {
  const { user, isLoaded } = useUser();
  const [rbacData, setRbacData] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      if (user) {
        try {
          // ⚠️ Backend cần implement endpoint này
          const response = await apiClient.get<UserPermissions>(
            `/users/${user.id}/permissions`
          );
          setRbacData(response);
        } catch (error) {
          console.error('Failed to load permissions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadPermissions();
    }
  }, [user, isLoaded]);

  return {
    user,
    isLoaded,
    loading,
    ...rbacData,
  };
}
```

### 6.6 Permission Hooks

```typescript
// lib/rbac/usePermissions.ts
'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { Permission } from './permissions';

export function usePermissions() {
  const { roles, permissions, cinemaIds } = useAuth();

  const hasRole = (role: string): boolean => {
    return roles?.includes(role) ?? false;
  };

  const hasPermission = (permission: Permission): boolean => {
    // ADMIN has all permissions
    if (hasRole('ADMIN')) return true;

    // Check explicit permissions
    return permissions?.includes(permission) ?? false;
  };

  const hasCinemaScope = (cinemaId: number): boolean => {
    // ADMIN has access to all cinemas
    if (hasRole('ADMIN')) return true;

    // MANAGER must have cinema_id in scope
    if (hasRole('MANAGER')) {
      return cinemaIds?.includes(cinemaId) ?? false;
    }

    return false;
  };

  const canAccessResource = (
    permission: Permission,
    cinemaId?: number
  ): boolean => {
    if (!hasPermission(permission)) return false;

    if (cinemaId !== undefined) {
      return hasCinemaScope(cinemaId);
    }

    return true;
  };

  return {
    hasRole,
    hasPermission,
    hasCinemaScope,
    canAccessResource,
  };
}
```

### 6.7 UI Permission Gates

```typescript
// components/guards/PermissionGate.tsx
'use client';

import { usePermissions } from '@/lib/rbac/usePermissions';
import { Permission } from '@/lib/rbac/permissions';

interface PermissionGateProps {
  permission: Permission;
  cinemaId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  cinemaId,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { canAccessResource } = usePermissions();

  if (!canAccessResource(permission, cinemaId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

**Usage Example:**

```typescript
// app/dashboard/cinemas/page.tsx
'use client';

import { PermissionGate } from '@/components/guards/PermissionGate';
import { useAuth } from '@/lib/auth/useAuth';

export default function CinemasPage() {
  const { cinemaIds, hasRole } = useAuth();
  const [cinemas, setCinemas] = useState([]);

  // Filter cinemas based on scope
  const visibleCinemas = hasRole('ADMIN') 
    ? cinemas 
    : cinemas.filter(c => cinemaIds?.includes(c.id));

  return (
    <div>
      <div className="flex justify-between">
        <h1>Cinemas</h1>
        
        {/* Only ADMIN can create cinema */}
        <PermissionGate permission="cinema:create">
          <Button onClick={createCinema}>Create Cinema</Button>
        </PermissionGate>
      </div>

      {visibleCinemas.map(cinema => (
        <div key={cinema.id}>
          <h2>{cinema.name}</h2>
          
          {/* Check both permission and scope */}
          <PermissionGate 
            permission="cinema:update"
            cinemaId={cinema.id}
          >
            <Button onClick={() => edit(cinema.id)}>Edit</Button>
          </PermissionGate>
        </div>
      ))}
    </div>
  );
}
```

### 6.8 Login Page

```typescript
// app/(auth)/login/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
          },
        }}
        redirectUrl="/dashboard"
      />
    </div>
  );
}
```

### 6.9 Protected Layout

```typescript
// app/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layouts/Sidebar';
import Header from '@/components/layouts/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 6.10 API Client

```typescript
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true, // Send Clerk cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 8. TODO: Cần Backend Implement

### 🔴 Critical (Blocking Frontend Development)

#### 1. Setup User Service Database
```bash
# Chạy migrations để tạo tables
docker compose exec user-service npx prisma db push
```

**Affected tables:**
- `Role`
- `Permission`
- `UserRole` (⚠️ cần thêm field `cinemaIds Int[]`)
- `RolePermission`

#### 2. Update Prisma Schema

```prisma
// apps/user-service/prisma/schema.prisma
model UserRole {
  id        String   @id @default(cuid())
  userId    String   // Clerk user ID
  roleId    String
  cinemaIds Int[]    // ⚠️ THÊM FIELD NÀY
  role      Role     @relation(fields: [roleId], references: [id])
  
  @@index([userId])
}
```

#### 3. Seed Roles & Permissions

Tạo file `apps/user-service/prisma/seed.ts`:

```typescript
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: { name: 'MANAGER' },
  });

  // 2. Create Permissions
  const permissions = [
    'cinema:read',
    'cinema:create',
    'cinema:update',
    'cinema:delete',
    'movie:read',
    'movie:create',
    'movie:update',
    'movie:delete',
    'showtime:read',
    'showtime:create',
    'showtime:update',
    'showtime:delete',
    'hall:read',
    'hall:create',
    'hall:update',
    'hall:delete',
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'report:read',
    'report:export',
    'settings:read',
    'settings:update',
  ];

  const createdPermissions = await Promise.all(
    permissions.map(name =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // 3. Assign ALL permissions to ADMIN
  await Promise.all(
    createdPermissions.map(perm =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      })
    )
  );

  // 4. Assign LIMITED permissions to MANAGER
  const managerPermissions = [
    'cinema:read',
    'movie:read',
    'movie:create',
    'movie:update',
    'showtime:read',
    'showtime:create',
    'showtime:update',
    'showtime:delete',
    'hall:read',
    'hall:create',
    'hall:update',
    'hall:delete',
    'report:read',
  ];

  await Promise.all(
    createdPermissions
      .filter(p => managerPermissions.includes(p.name))
      .map(perm =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: managerRole.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: managerRole.id,
            permissionId: perm.id,
          },
        })
      )
  );

  console.log('✅ Seeded roles and permissions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Chạy seed:**
```bash
docker compose exec user-service npx prisma db seed
```

#### 4. API Endpoint: GET /users/:userId/permissions

Tạo controller trong `api-gateway`:

```typescript
// apps/api-gateway/src/app/module/user/controller/user.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../common/guard/clerk-auth.guard';
import { CurrentUserId } from '../../../common/decorator/current-user-id.decorator';

@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId/permissions')
  @UseGuards(ClerkAuthGuard)
  async getUserPermissions(@Param('userId') userId: string) {
    const data = await this.userService.getUserWithPermissions(userId);
    return {
      success: true,
      data,
    };
  }
}
```

**Service:**
```typescript
// apps/api-gateway/src/app/module/user/service/user.service.ts
async getUserWithPermissions(userId: string) {
  // 1. Get permissions from user-service via microservice
  const permissions = await this.userClient.send(
    UserMessage.GET_PERMISSIONS,
    { userId }
  ).toPromise();

  // 2. Get user roles and cinemaIds from database
  const userRoles = await this.prisma.userRole.findMany({
    where: { userId },
    include: {
      role: true,
    },
  });

  const roles = userRoles.map(ur => ur.role.name);
  const cinemaIds = userRoles.flatMap(ur => ur.cinemaIds || []);

  // 3. Get user info from Clerk
  const clerkUser = await clerkClient.users.getUser(userId);

  return {
    userId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    roles,
    permissions,
    cinemaIds: [...new Set(cinemaIds)], // Remove duplicates
  };
}
```

#### 5. API Endpoint: POST /users/:userId/roles

```typescript
// Assign role to user (Admin only)
@Post(':userId/roles')
@UseGuards(ClerkAuthGuard)
@Permission('user:create')
async assignRole(
  @Param('userId') userId: string,
  @Body() dto: { roleId: string; cinemaIds?: number[] }
) {
  const userRole = await this.prisma.userRole.create({
    data: {
      userId,
      roleId: dto.roleId,
      cinemaIds: dto.cinemaIds || [],
    },
  });

  return {
    success: true,
    data: userRole,
  };
}
```

#### 6. Cinema Scope Middleware

```typescript
// apps/api-gateway/src/app/common/middleware/cinema-scope.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CinemaScopeMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req['userId']; // From ClerkAuthGuard
    const cinemaId = parseInt(req.params.cinemaId || req.body.cinemaId);

    if (!userId || !cinemaId) {
      return next();
    }

    // Get user roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const roles = userRoles.map(ur => ur.role.name);

    // ADMIN bypass
    if (roles.includes('ADMIN')) {
      return next();
    }

    // MANAGER scope check
    if (roles.includes('MANAGER')) {
      const cinemaIds = userRoles.flatMap(ur => ur.cinemaIds || []);
      
      if (!cinemaIds.includes(cinemaId)) {
        throw new ForbiddenException(
          `Cinema ${cinemaId} not in your scope. Your cinemas: [${cinemaIds.join(', ')}]`
        );
      }
    }

    next();
  }
}
```

**Apply middleware:**
```typescript
// apps/api-gateway/src/app/module/cinema/cinema.module.ts
export class CinemaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CinemaScopeMiddleware)
      .forRoutes(
        'cinemas/:cinemaId/showtimes',
        'cinemas/:cinemaId/halls',
        'cinemas/cinema/:cinemaId' // Update/Delete cinema
      );
  }
}
```

#### 7. Update ClerkAuthGuard để attach user roles

```typescript
// apps/api-gateway/src/app/common/guard/clerk-auth.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();

  // 1. Verify Clerk token
  const token = request.cookies?.__session;
  if (!token) return false;

  try {
    const session = await clerkClient.verifyToken(token);
    request.userId = session.sub;

    // 2. Attach user roles to request
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: session.sub },
      include: { role: true },
    });

    request.userRoles = userRoles.map(ur => ur.role.name);
    request.cinemaIds = userRoles.flatMap(ur => ur.cinemaIds || []);

    // 3. Permission check (existing logic)
    // ...

  } catch (err) {
    return false;
  }

  return true;
}
```

### 🟡 Medium Priority (Enhance Security)

#### 8. Add unique constraint for roleId_permissionId

```prisma
model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  
  @@unique([roleId, permissionId])  // ⚠️ THÊM CONSTRAINT NÀY
}
```

#### 9. Add API endpoint to list all roles

```typescript
@Get('roles')
@UseGuards(ClerkAuthGuard)
@Permission('user:read')
async getAllRoles() {
  const roles = await this.prisma.role.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return {
    success: true,
    data: roles,
  };
}
```

### 🟢 Low Priority (Nice to Have)

#### 10. Permission caching optimization

```typescript
// Cache permissions per user để giảm query
async getPermissions(userId: string): Promise<string[]> {
  const cacheKey = `permissions:${userId}`;
  const cached = await this.cacheManager.get<string[]>(cacheKey);
  if (cached) return cached;

  const permissions = await this.prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: {
          role: {
            userRoles: {
              some: { userId },
            },
          },
        },
      },
    },
    select: { name: true },
  }).then(r => r.map(p => p.name));

  await this.cacheManager.set(cacheKey, permissions, 3600); // 1 hour
  return permissions;
}
```

#### 11. Audit log cho role assignment

```typescript
@Post(':userId/roles')
async assignRole(...) {
  // ... create role

  // Log activity
  await this.auditLog.log({
    action: 'ASSIGN_ROLE',
    userId: req.userId, // Admin who assigned
    targetUserId: userId,
    metadata: { roleId, cinemaIds },
  });
}
```

---

## 📋 Checklist Tổng Hợp

### Backend Tasks

- [ ] **Database Setup**
  - [ ] Chạy `prisma db push` để tạo tables
  - [ ] Thêm field `cinemaIds Int[]` vào model `UserRole`
  - [ ] Add unique constraint `@@unique([roleId, permissionId])`

- [ ] **Seeding**
  - [ ] Tạo seed file `apps/user-service/prisma/seed.ts`
  - [ ] Seed 2 roles: ADMIN, MANAGER
  - [ ] Seed 24 permissions
  - [ ] Map permissions to roles

- [ ] **API Endpoints**
  - [ ] `GET /users/:userId/permissions` - Trả về user RBAC data
  - [ ] `POST /users/:userId/roles` - Assign role to user
  - [ ] `DELETE /users/:userId/roles/:roleId` - Remove role
  - [ ] `GET /roles` - List all roles với permissions

- [ ] **Middleware**
  - [ ] Implement `CinemaScopeMiddleware`
  - [ ] Apply middleware vào cinema-related routes
  - [ ] Update `ClerkAuthGuard` để attach `userRoles` và `cinemaIds` vào request

- [ ] **Permission Enforcement**
  - [ ] Uncomment `@Permission()` decorators trong controllers
  - [ ] Test permission checks với ADMIN và MANAGER

- [ ] **Environment Variables**
  - [ ] Share Clerk keys với frontend team
  - [ ] Document environment setup

### Frontend Tasks

- [ ] **Setup Clerk**
  - [ ] Install `@clerk/nextjs`
  - [ ] Wrap app với `ClerkProvider`
  - [ ] Create middleware.ts với route protection

- [ ] **Auth Integration**
  - [ ] Create `useAuth` hook
  - [ ] Implement login page với Clerk UI
  - [ ] Create protected layout

- [ ] **RBAC Implementation**
  - [ ] Create permission definitions (`permissions.ts`)
  - [ ] Create role mappings (`roles.ts`)
  - [ ] Implement `usePermissions` hook
  - [ ] Create `PermissionGate` component

- [ ] **UI Guards**
  - [ ] Protect routes với middleware
  - [ ] Add permission checks vào buttons/actions
  - [ ] Filter cinemas based on scope

- [ ] **API Client**
  - [ ] Setup axios với withCredentials
  - [ ] Call `/users/:userId/permissions` on app load
  - [ ] Handle 403 errors gracefully

---

## 🚀 Deployment Order

1. **Backend First:**
   ```bash
   # 1. Update schema
   # 2. Run migrations
   docker compose exec user-service npx prisma db push
   
   # 3. Run seed
   docker compose exec user-service npx prisma db seed
   
   # 4. Deploy API endpoints
   # 5. Deploy middleware
   
   # 6. Test with Postman/curl
   ```

2. **Frontend After Backend Ready:**
   ```bash
   # 1. Install Clerk
   npm install @clerk/nextjs
   
   # 2. Setup environment variables
   # 3. Implement auth flow
   # 4. Add permission guards
   # 5. Test with real users
   ```

### 7.1 MANAGER Scope Rules

**Core Principle:**
> MANAGER chỉ được làm việc với cinemas trong `cinema_ids` của họ

### 7.2 Frontend Enforcement

```typescript
// lib/rbac/useCinemaFilter.ts
'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { usePermissions } from './usePermissions';

export function useCinemaFilter() {
  const { user } = useAuth();
  const { hasRole } = usePermissions();

  const filterCinemas = <T extends { id: number }>(
    cinemas: T[]
  ): T[] => {
    // ADMIN sees all
    if (hasRole('ADMIN')) {
      return cinemas;
    }

    // MANAGER sees only assigned cinemas
    if (hasRole('MANAGER') && user?.cinema_ids) {
      return cinemas.filter(cinema =>
        user.cinema_ids!.includes(cinema.id)
      );
    }

    return [];
  };

  const getAccessibleCinemaIds = (): number[] => {
    if (hasRole('ADMIN')) {
      return []; // Empty = all cinemas
    }

    return user?.cinema_ids || [];
  };

  return { filterCinemas, getAccessibleCinemaIds };
}
```

**Usage:**

```typescript
// app/admin/cinemas/page.tsx
'use client';

import { useCinemaFilter } from '@/lib/rbac/useCinemaFilter';

export default function CinemasPage() {
  const [allCinemas, setAllCinemas] = useState<Cinema[]>([]);
  const { filterCinemas } = useCinemaFilter();

  useEffect(() => {
    // Fetch all cinemas from API
    apiClient.get<Cinema[]>('/cinemas').then(setAllCinemas);
  }, []);

  // Only show cinemas in scope
  const accessibleCinemas = filterCinemas(allCinemas);

  return (
    <div>
      <h1>My Cinemas</h1>
      {accessibleCinemas.map(cinema => (
        <CinemaCard key={cinema.id} cinema={cinema} />
      ))}
    </div>
  );
}
```

### 7.3 Backend Enforcement

```typescript
// backend/middleware/cinema-scope.ts
export function enforceCinemaScope() {
  return async (req, res, next) => {
    const user = req.user;
    const cinemaId = parseInt(req.params.cinema_id || req.body.cinema_id);

    // ADMIN can access all
    if (user.roles.includes('ADMIN')) {
      return next();
    }

    // MANAGER must have cinema_id in scope
    if (user.roles.includes('MANAGER')) {
      if (!user.cinema_ids.includes(cinemaId)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: `Cinema ${cinemaId} not in your scope`,
        });
      }
    }

    next();
  };
}
```

### 7.4 API Query Filtering

```typescript
// backend/services/showtime-service.ts
export class ShowtimeService {
  async getShowtimes(user: User, filters: any) {
    const query = db.select().from(showtimes);

    // Apply cinema scope for MANAGER
    if (user.roles.includes('MANAGER')) {
      query.where(
        inArray(showtimes.cinema_id, user.cinema_ids)
      );
    }

    // Apply other filters
    if (filters.cinema_id) {
      query.where(eq(showtimes.cinema_id, filters.cinema_id));
    }

    return query.execute();
  }
}
```

---

## 7. Scoping Logic

### 7.1 MANAGER Scope Rules

**Core Principle:**
> MANAGER chỉ được làm việc với cinemas trong `cinemaIds` của họ

### 7.2 Frontend Enforcement

```typescript
// lib/rbac/useCinemaFilter.ts
'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { usePermissions } from './usePermissions';

export function useCinemaFilter() {
  const { cinemaIds } = useAuth();
  const { hasRole } = usePermissions();

  const filterCinemas = <T extends { id: number }>(
    cinemas: T[]
  ): T[] => {
    // ADMIN sees all
    if (hasRole('ADMIN')) {
      return cinemas;
    }

    // MANAGER sees only assigned cinemas
    if (hasRole('MANAGER') && cinemaIds) {
      return cinemas.filter(cinema =>
        cinemaIds.includes(cinema.id)
      );
    }

    return [];
  };

  const getAccessibleCinemaIds = (): number[] => {
    if (hasRole('ADMIN')) {
      return []; // Empty = all cinemas
    }

    return cinemaIds || [];
  };

  return { filterCinemas, getAccessibleCinemaIds };
}
```

**Usage:**

```typescript
// app/dashboard/cinemas/page.tsx
'use client';

import { useCinemaFilter } from '@/lib/rbac/useCinemaFilter';

export default function CinemasPage() {
  const [allCinemas, setAllCinemas] = useState<Cinema[]>([]);
  const { filterCinemas } = useCinemaFilter();

  useEffect(() => {
    // Fetch all cinemas from API
    apiClient.get<Cinema[]>('/cinemas').then(setAllCinemas);
  }, []);

  // Only show cinemas in scope
  const accessibleCinemas = filterCinemas(allCinemas);

  return (
    <div>
      <h1>My Cinemas</h1>
      {accessibleCinemas.map(cinema => (
        <CinemaCard key={cinema.id} cinema={cinema} />
      ))}
    </div>
  );
}
```

### 7.3 Backend Enforcement (Middleware)

> ⚠️ **Backend cần implement:** See section [8. TODO: Cần Backend Implement](#8-todo-cần-backend-implement) for details

### 7.4 API Query Filtering Example

```typescript
// Example: Backend service filtering
async getShowtimes(userId: string, filters: any) {
  const userRoles = await this.getUserRoles(userId);
  
  // Build query
  const query = this.db.select().from(showtimes);

  // Apply cinema scope for MANAGER
  if (userRoles.some(r => r.role.name === 'MANAGER')) {
    const cinemaIds = userRoles.flatMap(r => r.cinemaIds);
    query.where(inArray(showtimes.cinemaId, cinemaIds));
  }

  // Apply other filters
  if (filters.cinemaId) {
    query.where(eq(showtimes.cinemaId, filters.cinemaId));
  }

  return query.execute();
}
```

---

## 9. Diagrams

---

## 9. Diagrams

### 9.1 Authentication Flow với Clerk

```
┌─────────────────────────────────────────────────────────────────┐
│                   Clerk Authentication Flow                     │
└─────────────────────────────────────────────────────────────────┘

User                Frontend (Clerk)    Backend (API Gateway)    Clerk Server
  │                      │                     │                      │
  │  1. Open /login      │                     │                      │
  ├─────────────────────>│                     │                      │
  │                      │  2. Show Clerk UI   │                      │
  │<─────────────────────┤                     │                      │
  │                      │                     │                      │
  │  3. Enter email/pwd  │                     │                      │
  ├─────────────────────>│                     │                      │
  │                      │  4. POST /sign-in   │                      │
  │                      ├─────────────────────┼─────────────────────>│
  │                      │                     │  5. Validate user    │
  │                      │                     │<─────────────────────┤
  │                      │  6. Set cookie      │                      │
  │                      │     __session       │                      │
  │<─────────────────────┤                     │                      │
  │                      │                     │                      │
  │  7. Redirect to      │                     │                      │
  │     /dashboard       │                     │                      │
  │<─────────────────────┤                     │                      │
  │                      │                     │                      │
  │                      │  8. GET /users/:id/permissions            │
  │                      ├─────────────────────>│                     │
  │                      │     (with __session)│                     │
  │                      │                     │  9. Verify token    │
  │                      │                     ├─────────────────────>│
  │                      │                     │<─────────────────────┤
  │                      │                     │  10. Valid!          │
  │                      │                     │                      │
  │                      │                     │  11. Query DB for    │
  │                      │                     │      roles, perms,   │
  │                      │                     │      cinemaIds       │
  │                      │                     │                      │
  │                      │  12. Return RBAC    │                      │
  │                      │      data           │                      │
  │<─────────────────────┤<────────────────────┤                      │
  │  {roles, permissions,│                     │                      │
  │   cinemaIds}         │                     │                      │
```

### 9.2 RBAC Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         RBAC Flow                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Clerk User  │
│ (user_xxx)   │
└──────┬───────┘
       │
       │ Stored in user-service DB
       │
┌──────▼───────┐
│  UserRole    │
│              │
│ userId       │──> user_2abc123xyz
│ roleId       │──> role_manager_id
│ cinemaIds    │──> [1, 3]
└──────┬───────┘
       │
       │ Maps to
       │
┌──────▼───────────────────────────┐
│           Role                   │
│                                  │
│  ADMIN  → All permissions        │
│  MANAGER → Limited permissions   │
└──────┬───────────────────────────┘
       │
       │ Has many
       │
┌──────▼──────────────────────────┐
│     RolePermission              │
│                                 │
│  roleId → permissionId          │
└──────┬──────────────────────────┘
       │
       │ Points to
       │
┌──────▼──────────────────────────────┐
│       Permission                    │
│                                     │
│  • cinema:read                      │
│  • movie:create                     │
│  • showtime:update                  │
│  • ...                              │
└─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│              Permission Check Flow                              │
└─────────────────────────────────────────────────────────────────┘

Request: POST /cinemas/2/showtimes
          (MANAGER with cinemaIds=[1,3])
     │
     ▼
┌─────────────────────────┐
│  ClerkAuthGuard         │
│                         │
│  1. Verify __session    │
│  2. Extract userId      │
│  3. Load user roles     │
│  4. Attach to request   │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  @Permission() Check    │
│                         │
│  Required:              │
│  'showtime:create'      │
│                         │
│  Has permission? ✓      │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  CinemaScopeMiddleware  │
│                         │
│  Cinema ID: 2           │
│  User cinemaIds: [1,3]  │
│                         │
│  2 in [1,3]? ✗         │
└─────────┬───────────────┘
          │
          ▼
     ❌ 403 FORBIDDEN
     "Cinema 2 not in your scope"
```

### 9.3 Scope Enforcement Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              MANAGER Scope Enforcement                          │
└─────────────────────────────────────────────────────────────────┘

MANAGER User (cinemaIds = [1, 3])
     │
     │ 1. Request: GET /cinemas
     │
     ▼
┌─────────────────────────┐
│  Backend Service        │
│                         │
│  - Check user role      │
│  - If MANAGER:          │
│    WHERE id IN [1, 3]   │
│  - If ADMIN:            │
│    (no filter)          │
└────────┬────────────────┘
         │
         │ 2. Response
         │
         ▼
┌─────────────────────────┐
│  Frontend Filter        │
│                         │
│  - Receive cinemas      │
│  - Apply UI filter      │
│  - Only show [1, 3]     │
└────────┬────────────────┘
         │
         │ 3. Render UI
         │
         ▼
┌─────────────────────────┐
│  User Interface         │
│                         │
│  ☑ Cinema #1 ✓          │
│  ☐ Cinema #2 (hidden)   │
│  ☑ Cinema #3 ✓          │
└─────────────────────────┘
```

```
src/
│
├── app/                         # Next.js 14 App Router
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── layout.tsx           # Public layout
│   │
│   ├── admin/                   # Protected admin routes
│   │   ├── layout.tsx           # ⚠️ Protected layout with auth check
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── cinemas/
│   │   │   ├── page.tsx         # List cinemas (filtered by scope)
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx     # Cinema detail
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx # Edit cinema (ADMIN only)
│   │   │   └── new/
│   │   │       └── page.tsx     # New cinema (ADMIN only)
│   │   ├── movies/
│   │   │   └── ...
│   │   └── showtimes/
│   │       └── ...
│   │
│   ├── api/                     # API Routes (proxy to backend)
│   │   └── auth/
│   │       ├── login/
│   │       ├── logout/
│   │       ├── refresh/
│   │       └── me/
│   │
│   └── middleware.ts            # ⚠️ Global route protection
│
├── lib/
│   ├── auth/                    # 🔐 Authentication
│   │   ├── auth-provider.tsx    # Context + state management
│   │   ├── useAuth.ts           # Hook to access auth context
│   │   └── session.ts           # Session utilities
│   │
│   ├── rbac/                    # 🛡️ Authorization
│   │   ├── permissions.ts       # Permission definitions
│   │   ├── roles.ts             # Role-permission mapping
│   │   ├── usePermissions.ts    # Permission check hooks
│   │   ├── useCinemaFilter.ts   # Scope filtering hook
│   │   ├── withAuthGuard.tsx    # HOC for component protection
│   │   └── ProtectedRoute.tsx   # Route wrapper component
│   │
│   └── api/
│       └── client.ts            # API client with auto-refresh
│
└── components/
    ├── guards/                  # 🚧 UI Guards
    │   ├── PermissionGate.tsx   # Show/hide based on permission
    │   └── RoleGate.tsx         # Show/hide based on role
    │
    ├── layout/
    │   ├── Sidebar.tsx          # Nav with permission-based items
    │   └── Header.tsx
    │
    └── ...


Key Files Interaction:
======================

middleware.ts
    ↓ (checks JWT cookie)
    ↓
admin/layout.tsx
    ↓ (verifies role server-side)
    ↓
auth-provider.tsx
    ↓ (provides user context)
    ↓
usePermissions.ts
    ↓ (checks permissions client-side)
    ↓
PermissionGate.tsx
    ↓ (renders UI conditionally)
```

---

## 10. Best Practices

### 10.1 Authentication with Clerk

✅ **DO:**
- Use Clerk's built-in session management
- Trust Clerk's token validation
- Use `__session` cookie from Clerk
- Leverage Clerk UI components for login/signup
- Check `auth()` on server components
- Use `useUser()` hook on client components

❌ **DON'T:**
- Store Clerk tokens in localStorage
- Try to manually refresh Clerk sessions
- Implement custom JWT alongside Clerk
- Skip Clerk middleware for protected routes

### 10.2 Permission Checking

✅ **DO:**
- Check permissions on both client and server
- Use component-level guards for UI (`PermissionGate`)
- Use middleware for route protection
- Validate scope (cinemaIds) for MANAGER
- Return 403 for permission denied (not 404)
- Cache permission queries with Redis

❌ **DON'T:**
- Rely only on client-side checks
- Expose all data and hide with CSS
- Trust frontend without backend validation
- Return detailed error messages revealing system internals
- Query permissions on every API call (use caching)

### 10.3 Code Organization

✅ **DO:**
- Separate auth (Clerk) and RBAC concerns
- Use hooks for reusable logic (`useAuth`, `usePermissions`)
- Create typed permission constants
- Document role requirements in components
- Use TypeScript for type safety
- Keep permission definitions in one place

❌ **DON'T:**
- Mix auth logic with business logic
- Hardcode permission strings everywhere
- Duplicate permission checks
- Skip TypeScript types for auth objects
- Scatter role checks throughout codebase

### 10.4 Security

✅ **DO:**
- Let Clerk handle token validation
- Verify user identity on every protected API call
- Implement RBAC on backend (don't trust frontend)
- Rate limit auth endpoints
- Log suspicious auth attempts
- Use HTTPS in production
- Implement CSRF protection (Clerk handles this)
- Validate and sanitize all inputs

❌ **DON'T:**
- Trust client-side validation alone
- Store passwords in plain text (Clerk manages this)
- Skip input validation
- Expose internal error details to users
- Allow user to modify their own roles/permissions

### 9.5 Scalability

✅ **DO:**
- Design for multiple roles (not just 2)
- Use permission-based system (not role-based checks everywhere)
- Make permissions configurable
- Support role hierarchy
- Cache permission checks where appropriate

❌ **DON'T:**
- Hardcode role names throughout codebase
- Use if-else chains for role checks
- Couple business logic to specific roles
- Make permissions too granular initially

### 10.6 User Experience

✅ **DO:**
- Show loading states during auth/permission checks
- Provide clear "Access Denied" messages
- Auto-redirect after Clerk login
- Persist session across tab refreshes (Clerk handles this)
- Handle permission-denied gracefully
- Show contextual feedback ("You need ADMIN role")

❌ **DON'T:**
- Leave users on blank screens during loading
- Show technical error messages
- Hide buttons without explanation
- Force re-login on every page refresh (Clerk prevents this)
- Display confusing "403" without context

### 9.7 Testing

✅ **DO:**
- Test all permission combinations
- Test scope enforcement
- Test token refresh flow
- Test expired token handling
- Test unauthorized access attempts
- Mock auth in component tests

❌ **DON'T:**
- Skip edge cases
- Test only happy path
- Assume backend is always correct
- Forget to test middleware

---

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
// __tests__/rbac/usePermissions.test.ts
import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/lib/rbac/usePermissions';

// Mock useAuth
jest.mock('@/lib/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/lib/auth/useAuth';

describe('usePermissions', () => {
  it('ADMIN has all permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      roles: ['ADMIN'],
      permissions: [],
      cinemaIds: [],
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('cinema:delete')).toBe(true);
    expect(result.current.hasCinemaScope(999)).toBe(true);
  });

  it('MANAGER has limited permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      roles: ['MANAGER'],
      permissions: ['cinema:read', 'movie:create'],
      cinemaIds: [1, 3],
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('cinema:read')).toBe(true);
    expect(result.current.hasPermission('cinema:delete')).toBe(false);
  });

  it('MANAGER respects cinema scope', () => {
    (useAuth as jest.Mock).mockReturnValue({
      roles: ['MANAGER'],
      permissions: [],
      cinemaIds: [1, 3],
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasCinemaScope(1)).toBe(true);
    expect(result.current.hasCinemaScope(2)).toBe(false);
    expect(result.current.hasCinemaScope(3)).toBe(true);
  });
});
```

### 11.2 Integration Tests (Backend)

```typescript
// __tests__/api/users.test.ts
describe('GET /users/:userId/permissions', () => {
  it('returns RBAC data for ADMIN', async () => {
    const response = await request(app)
      .get('/users/user_admin123/permissions')
      .set('Cookie', '__session=valid_admin_token');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      userId: 'user_admin123',
      roles: ['ADMIN'],
      permissions: expect.arrayContaining([
        'cinema:create',
        'cinema:delete',
        'user:create',
      ]),
      cinemaIds: [],
    });
  });

  it('returns RBAC data for MANAGER with scope', async () => {
    const response = await request(app)
      .get('/users/user_manager456/permissions')
      .set('Cookie', '__session=valid_manager_token');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      userId: 'user_manager456',
      roles: ['MANAGER'],
      permissions: expect.not.arrayContaining(['cinema:delete']),
      cinemaIds: [1, 3],
    });
  });
});

describe('POST /cinemas/:id/showtimes', () => {
  it('allows ADMIN to create showtime for any cinema', async () => {
    const response = await request(app)
      .post('/cinemas/5/showtimes')
      .set('Cookie', '__session=admin_token')
      .send({ movieId: 10, startTime: '2024-01-15T19:00:00Z' });

    expect(response.status).toBe(201);
  });

  it('blocks MANAGER from creating showtime outside scope', async () => {
    const response = await request(app)
      .post('/cinemas/5/showtimes')
      .set('Cookie', '__session=manager_token') // cinemaIds=[1,3]
      .send({ movieId: 10, startTime: '2024-01-15T19:00:00Z' });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('not in your scope');
  });
});
```

### 11.3 E2E Tests (Playwright)

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MANAGER auth flow', () => {
  test('login and check cinema scope', async ({ page }) => {
    // 1. Login with Clerk
    await page.goto('/login');
    
    // Fill Clerk login form
    await page.fill('input[name="identifier"]', 'manager@test.com');
    await page.click('button:has-text("Continue")');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Continue")');

    // 2. Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // 3. Go to cinemas page
    await page.click('a:has-text("Cinemas")');

    // 4. Should only see cinemas in scope
    const cinemaCards = page.locator('[data-testid=cinema-card]');
    await expect(cinemaCards).toHaveCount(2); // cinemaIds = [1, 3]

    // 5. Should not see create button (no permission)
    const createButton = page.locator('button:has-text("Create Cinema")');
    await expect(createButton).not.toBeVisible();
  });

  test('MANAGER blocked from accessing cinema outside scope', async ({ page }) => {
    // Login as MANAGER
    await page.goto('/login');
    // ... login flow

    // Try to navigate to cinema #2 (not in scope)
    await page.goto('/dashboard/cinemas/2');

    // Should see access denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
});

test.describe('ADMIN auth flow', () => {
  test('has full access', async ({ page }) => {
    await page.goto('/login');
    // Login as ADMIN
    await page.fill('input[name="identifier"]', 'admin@test.com');
    await page.click('button:has-text("Continue")');
    await page.fill('input[name="password"]', 'admin_password');
    await page.click('button:has-text("Continue")');

    await page.goto('/dashboard/cinemas');

    // Should see all cinemas
    const cinemaCards = page.locator('[data-testid=cinema-card]');
    await expect(cinemaCards).toHaveCount(5); // All cinemas

    // Should see create button
    const createButton = page.locator('button:has-text("Create Cinema")');
    await expect(createButton).toBeVisible();
  });
});
```

---

## Kết luận

File guide này đã được **cập nhật hoàn toàn** để phù hợp với **Clerk authentication** thay vì custom JWT.

### 🎯 Key Differences từ bản cũ:

| Aspect | Bản cũ (Custom JWT) | Bản mới (Clerk) |
|--------|---------------------|-----------------|
| **Authentication** | Tự implement JWT | Clerk SDK |
| **Token Storage** | `access_token`, `refresh_token` cookies | `__session` cookie |
| **Session Management** | Manual refresh logic | Clerk auto-manages |
| **Login Flow** | Custom `/auth/login` endpoint | Clerk UI component |
| **Token Validation** | jwt.verify() manually | clerkClient.verifyToken() |
| **Frontend Setup** | Custom AuthProvider | ClerkProvider từ SDK |
| **Complexity** | High (3-5 days work) | Low (1 day setup) |

### ✅ Backend cần làm gì:

Xem chi tiết trong **Section 8: TODO: Cần Backend Implement**:
1. Setup database (prisma db push)
2. Add `cinemaIds` field to UserRole
3. Seed roles & permissions
4. Implement `/users/:userId/permissions` endpoint
5. Implement `/users/:userId/roles` endpoints
6. Add CinemaScopeMiddleware
7. Update ClerkAuthGuard để attach roles

### ✅ Frontend cần làm gì:

1. Install `@clerk/nextjs`
2. Setup ClerkProvider và middleware
3. Create `useAuth` hook (call backend API)
4. Implement `usePermissions` hook
5. Create `PermissionGate` component
6. Apply guards vào UI

### 📚 Resources:

- Clerk Docs: https://clerk.com/docs/quickstarts/nextjs
- Clerk + Next.js 14: https://clerk.com/docs/references/nextjs/overview
- Backend Prisma schema: `apps/user-service/prisma/schema.prisma`
- Clerk keys: Check `.env` files

**Bất cứ thắc mắc gì, ping backend team để clarify TODO items! 🚀**

### 10.1 Unit Tests

```typescript
// __tests__/rbac/usePermissions.test.ts
import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { AuthProvider } from '@/lib/auth/auth-provider';

describe('usePermissions', () => {
  it('ADMIN has all permissions', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => usePermissions(), {
      wrapper,
      initialProps: {
        user: {
          id: 1,
          roles: ['ADMIN'],
          cinema_ids: [],
        },
      },
    });

    expect(result.current.hasPermission('cinema:delete')).toBe(true);
    expect(result.current.hasCinemaScope(999)).toBe(true);
  });

  it('MANAGER has limited permissions', () => {
    // ... test MANAGER permissions
  });

  it('MANAGER respects cinema scope', () => {
    const { result } = renderHook(() => usePermissions(), {
      initialProps: {
        user: {
          id: 2,
          roles: ['MANAGER'],
          cinema_ids: [1, 3],
        },
      },
    });

    expect(result.current.hasCinemaScope(1)).toBe(true);
    expect(result.current.hasCinemaScope(2)).toBe(false);
  });
});
```

### 10.2 Integration Tests

```typescript
// __tests__/api/showtimes.test.ts
import { POST } from '@/app/api/showtimes/route';
import { NextRequest } from 'next/server';

describe('POST /api/showtimes', () => {
  it('allows ADMIN to create showtime for any cinema', async () => {
    const request = new NextRequest('http://localhost/api/showtimes', {
      method: 'POST',
      body: JSON.stringify({
        cinema_id: 5,
        movie_id: 10,
      }),
      headers: {
        cookie: 'access_token=admin_token_here',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it('blocks MANAGER from creating showtime outside scope', async () => {
    const request = new NextRequest('http://localhost/api/showtimes', {
      method: 'POST',
      body: JSON.stringify({
        cinema_id: 5, // Not in MANAGER's scope
      }),
      headers: {
        cookie: 'access_token=manager_token_here',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});
```

### 10.3 E2E Tests (Playwright/Cypress)

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test('MANAGER login and scope check', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', 'manager@test.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');

  // Should redirect to dashboard
  await expect(page).toHaveURL('/admin/dashboard');

  // Go to cinemas page
  await page.goto('/admin/cinemas');

  // Should only see cinemas in scope
  const cinemaCards = page.locator('[data-testid=cinema-card]');
  await expect(cinemaCards).toHaveCount(2); // cinema_ids = [1, 3]

  // Should not see create button (no permission)
  const createButton = page.locator('button:has-text("Create Cinema")');
  await expect(createButton).not.toBeVisible();
});

test('ADMIN has full access', async ({ page }) => {
  await page.goto('/login');
  // Login as ADMIN
  await page.fill('[name=email]', 'admin@test.com');
  await page.fill('[name=password]', 'admin_password');
  await page.click('button[type=submit]');

  await page.goto('/admin/cinemas');

  // Should see all cinemas
  const cinemaCards = page.locator('[data-testid=cinema-card]');
  await expect(cinemaCards).toHaveCount(5); // All cinemas

  // Should see create button
  const createButton = page.locator('button:has-text("Create Cinema")');
  await expect(createButton).toBeVisible();
});
```

---

## Phụ lục A: Example Payloads

### A.1 JWT Token Example

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": 123,
    "email": "manager@example.com",
    "roles": ["MANAGER"],
    "cinema_ids": [1, 3],
    "iat": 1704067200,
    "exp": 1704068100
  }
}
```

### A.2 Login Response

```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "manager@example.com",
    "name": "John Doe",
    "roles": ["MANAGER"],
    "cinema_ids": [1, 3],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### A.3 Error Responses

```json
// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}

// 403 Forbidden
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to perform this action",
  "required_permission": "cinema:delete"
}

// 403 Scope Error
{
  "error": "FORBIDDEN",
  "message": "Cinema 5 is not in your scope",
  "your_cinemas": [1, 3]
}
```

---

## Phụ lục B: Quick Reference

### B.1 Permission Cheat Sheet

| Resource | Actions | ADMIN | MANAGER |
|----------|---------|-------|---------|
| Cinema | read | ✅ All | ✅ Scoped |
| Cinema | create/delete | ✅ | ❌ |
| Movie | read/create/update | ✅ | ✅ Scoped |
| Movie | delete | ✅ | ❌ |
| Showtime | All | ✅ | ✅ Scoped |
| User | All | ✅ | ❌ |
| Report | read/export | ✅ | ✅ Scoped |
| Settings | All | ✅ | ❌ |

### B.2 Common Hooks

```typescript
// Auth
const { user, login, logout } = useAuth();

// Permissions
const { hasRole, hasPermission, hasCinemaScope } = usePermissions();

// Scope filtering
const { filterCinemas, getAccessibleCinemaIds } = useCinemaFilter();

// API
const data = await apiClient.get('/endpoint');
```

### B.3 Component Guards

```typescript
// Permission gate
<PermissionGate permission="cinema:update" cinemaId={1}>
  <EditButton />
</PermissionGate>

// Role gate
<RoleGate roles={['ADMIN']}>
  <AdminPanel />
</RoleGate>

// HOC
export default withAuthGuard(Component, {
  roles: ['ADMIN'],
  permissions: ['cinema:create'],
});
```

---

## Kết luận

Tài liệu này cung cấp blueprint đầy đủ để implement Authentication + RBAC cho Admin App với Next.js 14. Key takeaways:

1. **Sử dụng JWT với HTTP-only cookies** cho bảo mật tối đa
2. **Implement RBAC** với permission-based system để dễ scale
3. **Enforce scope** ở cả client và server cho MANAGER
4. **Guard components và routes** để kiểm soát truy cập
5. **Auto refresh tokens** để UX mượt mà

Hệ thống này có thể mở rộng cho 5-10+ roles trong tương lai bằng cách:
- Thêm roles vào `ROLE_PERMISSIONS`
- Define permissions mới
- Không cần thay đổi core logic

**Next Steps:**
1. Implement backend API endpoints
2. Setup frontend structure theo diagram
3. Write unit tests cho permission logic
4. E2E test flows chính
5. Deploy với HTTPS và secure cookies