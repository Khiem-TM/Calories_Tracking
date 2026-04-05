# API Test Report
> Generated: 2026-04-04 02:46:45

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 74 |
| ✅ Passed | 74 |
| ❌ Failed | 0 |
| ⏭ Skipped/Pending | 0 |
| Duration | 2.83s |

## 📸 Image Upload Endpoints

| Module | Endpoint | Method | Test | Status | Notes |
|--------|----------|--------|------|--------|-------|
| Users Module | `/users/me/avatar` | POST | should upload avatar image (local disk) | ✅ PASSED |  |
| Foods Module | `/foods/:id/image` | POST | should upload food image to Cloudinary | ✅ PASSED |  |
| Meal Logs Module | `/meal-logs/:id/image` | POST | should upload meal image (multipart) | ✅ PASSED |  |
| Meal Logs Module | `/meal-logs/:id/image/base64` | POST | should upload meal image (base64 data-URI) | ✅ PASSED |  |
| Body Metrics Module | `/body-metrics/photos` | GET | should return list of progress photos | ✅ PASSED |  |
| Body Metrics Module | `/body-metrics/photos` | POST | should upload progress photo (front) to Cloudinary | ✅ PASSED |  |
| Training Module | `/training/exercises/:id/image` | POST | should upload exercise image to Cloudinary | ✅ PASSED |  |

## Results by Module

### ✅ Auth Module (12/12 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/auth/register` | POST | should register a new user and return tokens | ✅ PASSED | 180ms |
| `/auth/register` | POST | should reject duplicate email | ✅ PASSED | 4ms |
| `/auth/register` | POST | should reject short password | ✅ PASSED | 2ms |
| `/auth/login` | POST | should login with valid credentials | ✅ PASSED | 141ms |
| `/auth/login` | POST | should reject invalid credentials | ✅ PASSED | 70ms |
| `/auth/login` | POST | should reject non-existent user | ✅ PASSED | 5ms |
| `/auth/refresh` | POST | should return new access_token from refresh_token | ✅ PASSED | 73ms |
| `/auth/refresh` | POST | should reject invalid refresh token | ✅ PASSED | 2ms |
| `/auth/send-verification` | POST | should send verification email (returns 200/201) | ✅ PASSED | 18ms |
| `/auth/forgot-password` | POST | should return same message whether email exists or not | ✅ PASSED | 8ms |
| `/auth/logout` | POST | should logout and revoke tokens | ✅ PASSED | 145ms |
| `/auth/logout` | POST | should reject unauthenticated request | ✅ PASSED | 1ms |

### ✅ Users Module (6/6 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/users/me` | GET | should return current user data | ✅ PASSED | 4ms |
| `/users/me` | GET | should reject unauthenticated | ✅ PASSED | 1ms |
| `/users/:id` | PATCH | should update display_name | ✅ PASSED | 11ms |
| `/users/me/avatar` | POST | should upload avatar image (local disk) | ✅ PASSED | 10ms |
| `/users/me/health-profile` | GET | should return 404 when no profile exists yet | ✅ PASSED | 3ms |
| `/users/me/health-profile` | PUT | should create/update health profile | ✅ PASSED | 11ms |

### ✅ Foods Module (9/9 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/foods` | GET | should return paginated foods | ✅ PASSED | 8ms |
| `/foods` | GET | should search foods by name | ✅ PASSED | 4ms |
| `/foods` | POST | should create a custom food | ✅ PASSED | 8ms |
| `/foods/:id/image` | POST | should upload food image to Cloudinary | ✅ PASSED | 10ms |
| `/foods/:id` | GET | should return food by id | ✅ PASSED | 2ms |
| `/foods/:id` | GET | should return 404 for non-existent food | ✅ PASSED | 6ms |
| `/foods/:id/favorite` | POST | should add food to favorites | ✅ PASSED | 6ms |
| `/foods/favorites` | GET | should return user favorites | ✅ PASSED | 4ms |
| `/foods/:id/favorite` | DELETE | should remove food from favorites | ✅ PASSED | 5ms |

### ✅ Meal Logs Module (11/11 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/meal-logs` | POST | should create a meal log | ✅ PASSED | 16ms |
| `/meal-logs` | GET | should return logs for a date | ✅ PASSED | 6ms |
| `/meal-logs/summary` | GET | should return nutrition summary for date | ✅ PASSED | 4ms |
| `/meal-logs/:id/items` | POST | should add food item to meal log | ✅ PASSED | 10ms |
| `/meal-logs/:id` | GET | should return meal log with items | ✅ PASSED | 6ms |
| `/meal-logs/:id` | PATCH | should update meal log notes | ✅ PASSED | 12ms |
| `/meal-logs/:id/image` | POST | should upload meal image (multipart) | ✅ PASSED | 12ms |
| `/meal-logs/:id/image/base64` | POST | should upload meal image (base64 data-URI) | ✅ PASSED | 15ms |
| `/meal-logs/:id/items/:itemId` | PATCH | should update item quantity | ✅ PASSED | 12ms |
| `/meal-logs/:id/items/:itemId` | DELETE | should remove item from meal log | ✅ PASSED | 6ms |
| `/meal-logs/:id` | DELETE | should delete meal log | ✅ PASSED | 6ms |

### ✅ Activity Logs Module (5/5 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/activity-logs/steps` | PATCH | should log steps | ✅ PASSED | 11ms |
| `/activity-logs/water` | PATCH | should log water intake | ✅ PASSED | 4ms |
| `/activity-logs/calories-burned` | PATCH | should log calories burned | ✅ PASSED | 4ms |
| `/activity-logs` | GET | should return activity log for date | ✅ PASSED | 2ms |
| `/activity-logs/range` | GET | should return activity logs for date range | ✅ PASSED | 2ms |

### ✅ Body Metrics Module (6/6 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/body-metrics` | POST | should create body metric and auto-calculate BMI | ✅ PASSED | 6ms |
| `/body-metrics/latest` | GET | should return latest body metric | ✅ PASSED | 3ms |
| `/body-metrics` | GET | should return metric history | ✅ PASSED | 2ms |
| `/body-metrics/summary` | GET | should return summary with progress | ✅ PASSED | 3ms |
| `/body-metrics/photos` | GET | should return list of progress photos | ✅ PASSED | 2ms |
| `/body-metrics/photos` | POST | should upload progress photo (front) to Cloudinary | ✅ PASSED | 5ms |

### ✅ Training Module (11/11 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/training/exercises` | GET | should return exercises list | ✅ PASSED | 3ms |
| `/training/exercises` | GET | should filter by muscleGroup | ✅ PASSED | 3ms |
| `/training/exercises/:id/image` | POST | should upload exercise image to Cloudinary | ✅ PASSED | 8ms |
| `/training/workout` | POST | should log a workout session | ✅ PASSED | 11ms |
| `/training/workout/:id` | PATCH | should update workout session notes | ✅ PASSED | 9ms |
| `/training/workout/:id` | DELETE | should delete workout session | ✅ PASSED | 4ms |
| `/training/goals` | POST | should create a training goal | ✅ PASSED | 5ms |
| `/training/goals` | GET | should return training goals | ✅ PASSED | 3ms |
| `/training/goals/:id` | PATCH | should update training goal | ✅ PASSED | 4ms |
| `/training/history` | GET | should return workout history | ✅ PASSED | 2ms |
| `/training/goals/:id` | DELETE | should delete training goal | ✅ PASSED | 3ms |

### ✅ Streaks Module (2/2 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/streaks` | GET | should return user streaks | ✅ PASSED | 2ms |
| `/streaks` | GET | should reject unauthenticated | ✅ PASSED | 1ms |

### ✅ Dashboard Module (4/4 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/dashboard` | GET | should return daily dashboard | ✅ PASSED | 14ms |
| `/dashboard` | GET | should use today when date not provided | ✅ PASSED | 6ms |
| `/dashboard/weekly` | GET | should return weekly report | ✅ PASSED | 13ms |
| `/dashboard/monthly` | GET | should return monthly report | ✅ PASSED | 4ms |

### ✅ Notifications Module (4/4 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `/notifications/unread-count` | GET | should return unread notification count | ✅ PASSED | 3ms |
| `/notifications` | GET | should return notifications | ✅ PASSED | 2ms |
| `/notifications` | GET | should filter unread notifications | ✅ PASSED | 2ms |
| `/notifications/read-all` | PATCH | should mark all as read | ✅ PASSED | 2ms |

### ✅ Admin Module (unauthorized access) (2/2 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `Admin Module (unauthorized access)` | - | should reject non-admin access to /admin/stats | ✅ PASSED | 1ms |
| `Admin Module (unauthorized access)` | - | should reject unauthenticated access to /admin/users | ✅ PASSED | 1ms |

### ✅ Security (2/2 passed)

| Endpoint | Method | Test | Status | Duration |
|----------|--------|------|--------|----------|
| `Security` | - | should reject access to protected routes without token | ✅ PASSED | 3ms |
| `Security` | - | should reject malformed JWT | ✅ PASSED | 1ms |
