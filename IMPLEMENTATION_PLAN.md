# 🚀 CALORIES TRACKER - IMPLEMENTATION PLAN

**Ngày:** 25 tháng 3, 2026  
**Status:** ✅ Database Schema + Config Ready | ⏳ Backend Implementation

---

## 📊 TỔNG QUAN DỰ ÁN

**Tech Stack:**

- Backend: NestJS 11 + TypeORM
- Database: PostgreSQL 16
- Runtime: Node.js
- API: RESTful

**Database Entities:** 17 tables (Users, Foods, Meal Logs, Body Metrics, AI Sessions, etc.)

---

## ✅ BƯỚC 1: KHỞI CHẠY DATABASE (HÒA VÀO)

**Status:** ✓ Đã hoàn thành

- [x] PostgreSQL container chạy (`docker compose up -d`)
- [x] Database `calories_tracker` tồn tại
- [x] Kết nối từ NestJS thành công (TypeORM async config)
- [x] ConfigModule load `.env` variables

**Xác minh:**

```bash
docker exec calories_tracker psql -U postgres -d calories_tracker -c "\dt"
```

---

## ⏳ BƯỚC 2: IMPORT DATABASE SCHEMA (NGAY LẬP TỨC)

### 2.1 Chọn một trong 2 cách:

#### **Cách 1: Chạy SQL qua CLI (⚡ Nhanh)**

```bash
docker exec calories_tracker psql -U postgres -d calories_tracker \
  < /Users/UET/DACN/Project/backend/src/shared/database/init.sql
```

#### **Cách 2: Chạy qua DBeaver/DataGrip** (Recommended)

1. Mở DataGrip → Connect PostgreSQL (localhost:5432)
2. Open file: `backend/src/shared/database/init.sql`
3. Select All (Ctrl+A) → Execute (Ctrl+Shift+F10)

#### **Cách 3: Chạy qua TypeORM Migrations** (Best Practice)

```bash
# Tạo migration từ schema hiện tại
npm run typeorm migration:generate -- src/migrations/InitialSchema

# Chạy migration
npm run typeorm migration:run
```

### 2.2 Sau khi import:

- ✓ 17 tables được tạo
- ✓ Indexes + Constraints + Views
- ✓ Seed data (optional - uncomment tại cuối init.sql)

---

## 🔧 BƯỚC 3: TẠO TYPEORM ENTITIES (CORE - NGAY LẬP TỨC)

### 3.1 Cấu trúc thư mục entities:

```
src/modules/
├── users/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── user-health-profile.entity.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
│
├── foods/
│   ├── entities/
│   │   ├── food.entity.ts
│   │   └── food-barcode.entity.ts
│   ├── foods.service.ts
│   ├── foods.controller.ts
│   └── foods.module.ts
│
├── meal-logs/
│   ├── entities/
│   │   ├── meal-log.entity.ts
│   │   └── meal-log-item.entity.ts
│   ├── meal-logs.service.ts
│   ├── meal-logs.controller.ts
│   └── meal-logs.module.ts
│
├── body-metrics/
│   ├── entities/
│   │   ├── body-metric.entity.ts
│   │   └── body-progress-photo.entity.ts
│   ├── body-metrics.service.ts
│   ├── body-metrics.controller.ts
│   └── body-metrics.module.ts
│
├── activity-logs/
│   ├── entities/
│   │   └── activity-log.entity.ts
│   ├── activity-logs.service.ts
│   ├── activity-logs.controller.ts
│   └── activity-logs.module.ts
│
├── auth/
│   ├── entities/
│   │   └── refresh-token.entity.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
│
├── streaks/
│   ├── entities/
│   │   └── streak.entity.ts
│   ├── streaks.service.ts
│   ├── streaks.controller.ts
│   └── streaks.module.ts
│
└── dashboard/
    ├── dashboard.service.ts
    ├── dashboard.controller.ts
    └── dashboard.module.ts
```

### 3.2 Ví dụ Entity (User):

```typescript
// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { UserHealthProfile } from "./user-health-profile.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password_hash: string;

  @Column({ type: "varchar", length: 100 })
  display_name: string;

  @Column({ type: "varchar", default: "user" })
  role: "user" | "admin";

  @Column({ type: "boolean", default: false })
  is_verified: boolean;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "timestamp", default: () => "NOW()" })
  created_at: Date;

  @Column({ type: "timestamp", default: () => "NOW()" })
  updated_at: Date;

  @OneToOne(() => UserHealthProfile, (profile) => profile.user)
  health_profile: UserHealthProfile;
}
```

---

## 🔐 BƯỚC 4: AUTHENTICATION MODULE (PRIORITY)

### 4.1 Tính năng:

- [x] Login/Register (Email + Password)
- [ ] JWT Access Token (15min)
- [ ] Refresh Token (30 days)
- [ ] Password Hashing (bcrypt)
- [ ] OAuth2 (Google, Facebook) - Phase 2

### 4.2 Cần cài thêm:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

### 4.3 Files cần tạo:

```
src/modules/auth/
├── auth.service.ts          # Login, Register, RefreshToken
├── auth.controller.ts       # POST /auth/login, /auth/register
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── refresh-token.dto.ts
│   └── auth-response.dto.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── jwt-refresh.strategy.ts
├── entities/
│   └── refresh-token.entity.ts
└── auth.module.ts
```

---

## 👤 BƯỚC 5: USERS MODULE

### 5.1 Tính năng:

- [x] Get User Profile
- [x] Update User Info
- [x] User Health Profile (Create/Update)
- [ ] Change Password
- [ ] Avatar Upload

### 5.2 Endpoints:

```
GET    /users/me
PATCH  /users/:id
POST   /users/health-profile
PATCH  /users/health-profile
```

---

## 🍔 BƯỚC 6: FOODS MODULE

### 6.1 Tính năng:

- [ ] Get Foods (with pagination, search, filter)
- [ ] Get Food Details
- [ ] Search Foods (Full-text)
- [ ] Get User Favorites
- [ ] Add/Remove Favorite
- [ ] Create Custom Food
- [ ] Food Barcode Lookup

### 6.2 Endpoints:

```
GET    /foods?search=...&category=...&page=1
GET    /foods/:id
GET    /foods/favorites (my favorites)
POST   /foods/:id/favorite
DELETE /foods/:id/favorite
POST   /foods (create custom)
GET    /foods/barcode/:code
```

---

## 📝 BƯỚC 7: MEAL LOGS MODULE

### 7.1 Tính năng:

- [ ] Create Meal Log (Header + Items)
- [ ] Get Daily Meals (breakfast/lunch/dinner/snack)
- [ ] Update Meal Log Item
- [ ] Delete Meal Log Item
- [ ] Bulk Add Items (from favorites/history)
- [ ] Daily Summary (total calories/macros)

### 7.2 Endpoints:

```
POST   /meal-logs               # Create meal log + items
GET    /meal-logs?date=...
GET    /meal-logs/:id
PATCH  /meal-logs/:id
PATCH  /meal-logs/:id/items/:itemId
DELETE /meal-logs/:id/items/:itemId
GET    /meal-logs/summary?date=...
```

---

## 📊 BƯỚC 8: BODY METRICS MODULE

### 8.1 Tính năng:

- [ ] Log Body Metrics (weight, body_fat, measurements)
- [ ] Get Latest Metrics
- [ ] Get Metrics History (30/90 days)
- [ ] Upload Progress Photos
- [ ] Calculate BMI (auto)

### 8.2 Endpoints:

```
POST   /body-metrics
GET    /body-metrics/latest
GET    /body-metrics?days=30
POST   /body-metrics/:id/photos
GET    /body-metrics/:id/photos
```

---

## 🏃 BƯỚC 9: ACTIVITY LOGS MODULE

### 9.1 Tính năng:

- [ ] Log Activity (steps, calories_burned, water, exercise)
- [ ] Get Daily Activity
- [ ] Get Activity History
- [ ] Sync từ Fitness APIs (Apple Health, Google Fit) - Phase 2

### 9.2 Endpoints:

```
POST   /activity-logs
GET    /activity-logs?date=...
PATCH  /activity-logs/:id
```

---

## 🎯 BƯỚC 10: DASHBOARD MODULE

### 10.1 Tính năng:

- [ ] Daily Summary (intake vs goal)
- [ ] Weekly Progress Chart
- [ ] Current Streak
- [ ] Body Progress Timeline
- [ ] Goal Progress

### 10.2 Endpoints:

```
GET    /dashboard/today
GET    /dashboard/weekly
GET    /dashboard/progress
GET    /dashboard/streaks
```

---

## 🏆 BƯỚC 11: STREAKS MODULE

### 11.1 Tính năng:

- [ ] Get Streaks (meal_log, body_check, activity)
- [ ] Cron Job (tính toán mỗi đêm 00:05)

### 11.2 Cần cài:

```bash
npm install @nestjs/schedule
```

---

## 🤖 BƯỚC 12: AI SCAN MODULE (Phase 2)

### 12.1 Tính năng:

- [ ] Upload Meal Photo
- [ ] AI Food Detection (Vision API)
- [ ] Confirm Detection → Create Meal Log
- [ ] Store Detection History

---

## 📖 BƯỚC 13: BLOG MODULE (Phase 2)

### 13.1 Tính năng:

- [ ] Get Published Posts
- [ ] Get Single Post by Slug
- [ ] Admin: Create/Update/Publish Posts
- [ ] Admin: Tag Management

---

## 🔧 BƯỚC 14: COMMON INFRASTRUCTURE

### 14.1 Guards (Authentication):

```
src/common/guards/
├── jwt.guard.ts              # @UseGuards(JwtAuthGuard)
├── jwt-refresh.guard.ts
├── roles.guard.ts            # @Roles('admin')
└── public.guard.ts           # @Public()
```

### 14.2 Interceptors:

```
src/common/interceptors/
├── transform.interceptor.ts  # { code, data, message }
└── error.interceptor.ts      # Centralized error handling
```

### 14.3 DTOs (Validation):

```
src/common/dto/
├── pagination.dto.ts         # page, limit, sort
└── date-query.dto.ts         # date, startDate, endDate
```

### 14.4 Error Handling:

```
src/common/filters/
└── http-exception.filter.ts  # Custom error responses
```

---

## 📋 CHECKLIST TRIỂN KHAI

### Phase 1: Core Foundation (Week 1-2)

- [ ] **1.1** Chạy `init.sql` import schema ✓
- [ ] **1.2** Tạo all TypeORM Entities
- [ ] **1.3** Tạo Auth Module (Login/Register)
- [ ] **1.4** Tạo Users Module
- [ ] **1.5** Setup JWT Guards + Interceptors
- [ ] **1.6** Test API endpoints (Postman/Insomnia)

### Phase 2: Core Features (Week 2-3)

- [ ] **2.1** Foods Module (Search, Favorites)
- [ ] **2.2** Meal Logs Module (CRUD, Summary)
- [ ] **2.3** Body Metrics Module
- [ ] **2.4** Activity Logs Module
- [ ] **2.5** Dashboard Module
- [ ] **2.6** Streaks Module + Cron

### Phase 3: Advanced (Week 4+)

- [ ] **3.1** AI Food Detection
- [ ] **3.2** File Upload (S3/Cloudinary)
- [ ] **3.3** OAuth2 Integration
- [ ] **3.4** Blog Module
- [ ] **3.5** Unit Tests + E2E Tests
- [ ] **3.6** API Documentation (Swagger)

---

## 🚀 BƯỚC TIẾP THEO (NGAY LẬP TỨC)

### ① Chạy init.sql (5 phút)

```bash
# Cách 1: CLI
docker exec calories_tracker psql -U postgres -d calories_tracker \
  < /Users/UET/DACN/Project/backend/src/shared/database/init.sql

# Cách 2: DBeaver/DataGrip (recommended)
# Mở file init.sql → Ctrl+Shift+F10
```

### ② Cài dependencies thêm (2 phút)

```bash
cd /Users/UET/DACN/Project/backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

### ③ Tạo Auth Module (30 phút)

- Tạo entities, services, controllers
- DTOs: LoginDto, RegisterDto, AuthResponseDto
- JWT strategy + JWT Guard

### ④ Tạo Users Module (30 phút)

- User entity, UserHealthProfile entity
- CRUD endpoints
- Guards + Interceptors

### ⑤ Test & Verify (15 phút)

```bash
npm run start:dev
# Test: POST /auth/register, POST /auth/login, GET /users/me
```

---

## 📌 NOTES

1. **Tất cả tables** đã được thiết kế trong `init.sql`
2. **Constraints + Indexes** đã tối ưu (Foreign Keys, Unique, Checks)
3. **Views** để hỗ trợ Dashboard queries
4. **Seed data** có thể enable tại cuối init.sql
5. **Migration strategy**: Nên dùng TypeORM migrations cho production

---

## 🎯 RECOMMENDED ORDER

1. ✅ Database (init.sql)
2. ✅ Entities (All)
3. ✅ Auth (Foundation)
4. ✅ Users (Linked to Auth)
5. ✅ Common Infrastructure (Guards, Interceptors)
6. 🔄 Foods → Meal Logs → Body Metrics (Parallel)
7. 🔄 Activity Logs → Dashboard
8. 🔄 Streaks (Cron job)

---

**Prepared by:** Copilot  
**Last Updated:** 25-03-2026
