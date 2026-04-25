# API Documentation — Calories & Fitness Tracker

> **Base URL:** `http://localhost:3005`  
> **Content-Type:** `application/json` (trừ upload file dùng `multipart/form-data`)  
> **Swagger UI:** `http://localhost:3005/api/docs`

## Quy tắc chung

### Response envelope
Mọi response đều được bọc trong cấu trúc:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... }
}
```
Lỗi trả về:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Mô tả lỗi"
}
```

### Authentication
Các endpoint yêu cầu đăng nhập phải gửi header:
```
Authorization: Bearer <access_token>
```

### Rate Limiting
- Default: 10 req/s, 100 req/phút  
- Auth endpoints: hạn chế thêm (xem từng endpoint)

---

## Mục lục

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Dashboard](#3-dashboard)
4. [Notifications](#4-notifications)
5. [Streaks](#5-streaks)
6. [Foods](#6-foods)
7. [Meal Logs](#7-meal-logs)
8. [AI Scan](#8-ai-scan)
9. [Activity Logs](#9-activity-logs)
10. [Body Metrics](#10-body-metrics)
11. [Training](#11-training)
12. [Blog](#12-blog)
13. [Chatbot](#13-chatbot)
14. [Admin](#14-admin)

---

## 1. Auth

### POST `/auth/register`
Đăng ký tài khoản mới. Email xác thực sẽ được gửi sau.

**Rate limit:** 5 req/60s

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "display_name": "Nguyen Van A"
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `email` | string | ✅ | format email |
| `password` | string | ✅ | 8–100 ký tự |
| `display_name` | string | ✅ | 2–50 ký tự |

**Response `201`:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "Nguyen Van A",
      "role": "user"
    }
  }
}
```

---

### POST `/auth/login`
Đăng nhập. Yêu cầu email đã xác thực.

**Rate limit:** 10 req/60s

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response `201`:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "Nguyen Van A",
      "role": "user"
    }
  }
}
```

**Lỗi:**
- `401` — Sai mật khẩu
- `403` — Email chưa xác thực

---

### POST `/auth/refresh`
Làm mới access token (access token hết hạn sau 15 phút).

**Request:**
```json
{ "refresh_token": "eyJhbGciOiJIUzI1NiJ9..." }
```

**Response `201`:**
```json
{
  "data": { "access_token": "eyJhbGciOiJIUzI1NiJ9..." }
}
```

---

### POST `/auth/logout`
Đăng xuất, vô hiệu hóa refresh token.  
🔒 **Auth required**

**Response `201`:**
```json
{ "data": { "message": "Logged out successfully" } }
```

---

### POST `/auth/send-verification`
Gửi lại email xác thực.

**Request:**
```json
{ "email": "user@example.com" }
```

**Response `201`:**
```json
{ "data": { "message": "If that email exists, a verification link has been sent." } }
```

---

### POST `/auth/verify-email`
Xác thực email bằng token nhận từ mail.

**Request:**
```json
{ "token": "verification-token-from-email" }
```

**Response `201`:**
```json
{ "data": { "message": "Email verified successfully" } }
```

---

### POST `/auth/forgot-password`
Gửi email reset mật khẩu.

**Rate limit:** 3 req/60s

**Request:**
```json
{ "email": "user@example.com" }
```

**Response `201`:**
```json
{ "data": { "message": "If that email exists, a verification link has been sent." } }
```

---

### POST `/auth/reset-password`
Đặt lại mật khẩu bằng token từ email.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPass@2024"
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `token` | string | ✅ | |
| `newPassword` | string | ✅ | 8–100 ký tự |

**Response `201`:**
```json
{ "data": { "message": "Password reset successfully" } }
```

---

### GET `/auth/google`
Redirect đến Google OAuth consent screen. Dùng trực tiếp trên browser.

### GET `/auth/google/callback`
Google OAuth callback. Tự động xử lý và trả về JWT tokens.

---

## 2. Users

### GET `/users/me`
Lấy thông tin người dùng hiện tại.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Nguyen Van A",
    "avatar_url": "https://res.cloudinary.com/...",
    "role": "user",
    "is_verified": true,
    "created_at": "2024-01-15T08:00:00Z"
  }
}
```

---

### PATCH `/users/:id`
Cập nhật thông tin cá nhân. (Chỉ được sửa tài khoản của mình)  
🔒 **Auth required**

**Request:**
```json
{
  "display_name": "Nguyen Van B"
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `display_name` | string | ❌ | 2–100 ký tự |
| `avatar_url` | string | ❌ | URL hợp lệ |

**Response `200`:** User object đã cập nhật.

---

### POST `/users/me/avatar`
Upload ảnh đại diện.  
🔒 **Auth required** — `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `file` | image | ✅ |

**Response `201`:**
```json
{
  "data": { "id": "uuid", "avatar_url": "https://res.cloudinary.com/..." }
}
```

---

### GET `/users/me/health-profile`
Lấy hồ sơ sức khỏe.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "birthDate": "1999-01-01",
    "gender": "male",
    "heightCm": 170,
    "initialWeightKg": 65,
    "activityLevel": "moderately_active",
    "dietType": "balanced",
    "foodAllergies": [],
    "weightGoalKg": 60,
    "waterGoalMl": 2000,
    "caloriesGoal": 1800
  }
}
```

---

### PUT `/users/me/health-profile`
Tạo hoặc cập nhật hồ sơ sức khỏe.  
🔒 **Auth required**

**Request:**
```json
{
  "birthDate": "1999-01-01",
  "gender": "male",
  "heightCm": 170,
  "initialWeightKg": 65,
  "activityLevel": "moderately_active",
  "weightGoalKg": 60,
  "waterGoalMl": 2000,
  "caloriesGoal": 1800
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `birthDate` | string | ❌ | YYYY-MM-DD |
| `gender` | string | ❌ | `male` / `female` / `other` |
| `heightCm` | number | ❌ | 50–300 |
| `initialWeightKg` | number | ❌ | 10–500 |
| `activityLevel` | string | ❌ | `sedentary` / `lightly_active` / `moderately_active` / `very_active` / `extra_active` |
| `dietType` | string | ❌ | max 30 ký tự |
| `foodAllergies` | string[] | ❌ | |
| `weightGoalKg` | number | ❌ | 10–500 |
| `waterGoalMl` | number | ❌ | 500–10000 |
| `caloriesGoal` | number | ❌ | 500–10000 |

**Response `200`:** Health profile object đã cập nhật.

---

## 3. Dashboard

### GET `/dashboard`
Tổng kết ngày (mặc định hôm nay).  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `date` | string | ❌ | hôm nay |

**Response `200`:**
```json
{
  "data": {
    "date": "2024-01-15",
    "caloriesConsumed": 1450,
    "caloriesGoal": 1800,
    "proteinGrams": 85,
    "carbsGrams": 180,
    "fatGrams": 55,
    "stepsCount": 7200,
    "waterIntakeMl": 1500,
    "waterGoalMl": 2000,
    "workoutMinutes": 45,
    "workoutCaloriesBurned": 320,
    "streak": { "current": 7, "type": "workout" }
  }
}
```

---

### GET `/dashboard/weekly`
Báo cáo 7 ngày liên tiếp.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required |
|-------|------|----------|
| `weekStart` | string (YYYY-MM-DD) | ✅ |

**Response `200`:**
```json
{
  "data": {
    "weekStart": "2024-01-08",
    "dailySummaries": [
      { "date": "2024-01-08", "caloriesConsumed": 1400, "stepsCount": 5000 },
      { "date": "2024-01-09", "caloriesConsumed": 1600, "stepsCount": 8000 }
    ]
  }
}
```

---

### GET `/dashboard/monthly`
Báo cáo cả tháng.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required |
|-------|------|----------|
| `year` | number | ✅ |
| `month` | number | ✅ |

---

## 4. Notifications

### GET `/notifications`
Danh sách thông báo.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `unread` | boolean | ❌ | Lọc chỉ chưa đọc |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "GOAL_PROGRESS",
      "title": "Đã đạt mục tiêu nước uống! 💧",
      "body": "Bạn đã uống 2000ml hôm nay!",
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET `/notifications/unread-count`
Số thông báo chưa đọc.  
🔒 **Auth required**

**Response `200`:**
```json
{ "data": { "count": 3 } }
```

---

### PATCH `/notifications/read-all`
Đánh dấu tất cả đã đọc.  
🔒 **Auth required**

**Response `200`:**
```json
{ "data": { "updated": 5 } }
```

---

### PATCH `/notifications/:id/read`
Đánh dấu một thông báo đã đọc.  
🔒 **Auth required**

---

### DELETE `/notifications/:id`
Xóa thông báo.  
🔒 **Auth required** — `204 No Content`

---

## 5. Streaks

### GET `/streaks`
Thông tin streak của người dùng.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": {
    "workoutStreak": 7,
    "calorieStreak": 3,
    "waterStreak": 14,
    "lastUpdatedAt": "2024-01-15T00:00:00Z"
  }
}
```

---

## 6. Foods

### GET `/foods`
Tìm kiếm thực phẩm (public).

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `search` | string | ❌ | |
| `page` | number | ❌ | 1 |
| `limit` | number | ❌ | 20 |

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Cơm trắng",
        "category": "Ngũ cốc",
        "calories_per_100g": 130,
        "protein_per_100g": 2.7,
        "carbs_per_100g": 28,
        "fat_per_100g": 0.3,
        "food_type": "dish",
        "is_verified": true
      }
    ],
    "total": 250,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET `/foods/explore`
Khám phá món ăn phổ biến (public).

**Query Params:** `page`, `limit`, `category`

---

### GET `/foods/:id`
Chi tiết thực phẩm (public).

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Cơm trắng",
    "calories_per_100g": 130,
    "protein_per_100g": 2.7,
    "carbs_per_100g": 28,
    "fat_per_100g": 0.3,
    "serving_size_g": 100,
    "is_verified": true,
    "recipe": null
  }
}
```

---

### GET `/foods/barcode/:barcode`
Tìm thực phẩm qua mã vạch (public).

---

### GET `/foods/favorites`
Danh sách thực phẩm yêu thích.  
🔒 **Auth required**

---

### POST `/foods/:id/favorite`
Thêm vào yêu thích.  
🔒 **Auth required**

**Response `201`:**
```json
{ "data": { "message": "Added to favorites" } }
```

---

### DELETE `/foods/:id/favorite`
Xóa khỏi yêu thích.  
🔒 **Auth required**

---

### POST `/foods`
Tạo thực phẩm mới (cần admin duyệt).  
🔒 **Auth required**

**Request:**
```json
{
  "name": "Bánh mì",
  "nameEn": "Bread",
  "category": "Bánh",
  "foodType": "product",
  "servingSizeG": 50,
  "caloriesPer100g": 265,
  "proteinPer100g": 9,
  "carbsPer100g": 49,
  "fatPer100g": 3.2
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `name` | string | ✅ | |
| `caloriesPer100g` | number | ✅ | ≥ 0 |
| `foodType` | string | ❌ | `ingredient` / `dish` / `product` |
| `servingSizeG` | number | ❌ | default 100 |
| `proteinPer100g` | number | ❌ | ≥ 0 |
| `carbsPer100g` | number | ❌ | ≥ 0 |
| `fatPer100g` | number | ❌ | ≥ 0 |

---

### GET `/foods/custom`
Thực phẩm do người dùng hiện tại tạo.  
🔒 **Auth required**

---

### GET `/foods/:id/recipe`
Công thức nấu ăn của món.

---

### GET `/foods/:id/ingredients`
Danh sách nguyên liệu.

---

### POST `/foods/:id/image`
Upload ảnh thực phẩm.  
🔒 **Auth required** — `multipart/form-data`, field `file`

---

## 7. Meal Logs

### POST `/meal-logs`
Tạo bữa ăn.  
🔒 **Auth required**

**Request:**
```json
{
  "log_date": "2024-01-15",
  "meal_type": "lunch",
  "notes": "Bữa trưa văn phòng",
  "items": [
    { "food_id": "uuid", "quantity": 1.5, "unit": "serving" }
  ]
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `log_date` | string | ❌ | YYYY-MM-DD, default hôm nay |
| `meal_type` | string | ✅ | `breakfast` / `lunch` / `dinner` / `snack` |
| `notes` | string | ❌ | |
| `items` | array | ❌ | |
| `items[].food_id` | string | ✅ | UUID |
| `items[].quantity` | number | ✅ | > 0 |
| `items[].unit` | string | ❌ | `serving` / `g` / `ml` |

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "log_date": "2024-01-15T00:00:00Z",
    "meal_type": "lunch",
    "total_calories": 450,
    "total_protein_g": 25,
    "total_carbs_g": 60,
    "total_fat_g": 12,
    "items": [
      {
        "id": "uuid",
        "food_id": "uuid",
        "food": { "name": "Cơm trắng", "calories_per_100g": 130 },
        "quantity": 1.5,
        "unit": "serving",
        "calories": 195
      }
    ]
  }
}
```

---

### GET `/meal-logs`
Tất cả bữa ăn trong ngày.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `date` | string | ❌ | hôm nay |

**Response `200`:** Array of meal log objects.

---

### GET `/meal-logs/history`
Lịch sử bữa ăn theo khoảng ngày.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `fromDate` | string | ❌ | hôm nay |
| `toDate` | string | ❌ | hôm nay |

**Ví dụ:** `GET /meal-logs/history?fromDate=2024-01-01&toDate=2024-01-31`

**Response `200`:** Array of meal log objects.

---

### GET `/meal-logs/history/:date`
Tất cả bữa ăn của một ngày cụ thể.  
🔒 **Auth required**

**Ví dụ:** `GET /meal-logs/history/2024-01-15`

**Response `200`:** Array of meal log objects.

---

### GET `/meal-logs/summary`
Tổng kết dinh dưỡng trong ngày.  
🔒 **Auth required**

**Query Params:** `date` (YYYY-MM-DD, default hôm nay)

**Response `200`:**
```json
{
  "data": {
    "date": "2024-01-15",
    "totalCalories": 1450,
    "totalProteinG": 85,
    "totalCarbsG": 180,
    "totalFatG": 55,
    "mealBreakdown": {
      "breakfast": { "calories": 350, "protein": 20 },
      "lunch": { "calories": 600, "protein": 35 },
      "dinner": { "calories": 500, "protein": 30 }
    }
  }
}
```

---

### GET `/meal-logs/:id`
Chi tiết một bữa ăn.  
🔒 **Auth required**

---

### PATCH `/meal-logs/:id`
Cập nhật bữa ăn.  
🔒 **Auth required**

**Request:**
```json
{ "meal_type": "dinner", "notes": "Bữa tối gia đình" }
```

---

### DELETE `/meal-logs/:id`
Xóa bữa ăn.  
🔒 **Auth required** — `204 No Content`

---

### POST `/meal-logs/:id/image`
Upload ảnh bữa ăn.  
🔒 **Auth required** — `multipart/form-data`, field `file`

---

### POST `/meal-logs/:id/image/base64`
Upload ảnh dạng base64.  
🔒 **Auth required**

**Request:**
```json
{ "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..." }
```

---

### POST `/meal-logs/:id/items`
Thêm món ăn vào bữa.  
🔒 **Auth required**

**Request:**
```json
{ "food_id": "uuid", "quantity": 2, "unit": "serving" }
```

---

### PATCH `/meal-logs/:id/items/:itemId`
Cập nhật số lượng món.  
🔒 **Auth required**

**Request:**
```json
{ "quantity": 1.5 }
```

---

### DELETE `/meal-logs/:id/items/:itemId`
Xóa món khỏi bữa ăn.  
🔒 **Auth required** — `204 No Content`

---

## 8. AI Scan

### POST `/ai-scan`
Nhận diện thực phẩm từ ảnh bằng AI.  
🔒 **Auth required** — `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `file` | image | ✅ |

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "detected_foods": [
      {
        "name": "Cơm chiên",
        "confidence": 0.92,
        "estimated_calories": 450,
        "food_id": "uuid"
      }
    ],
    "image_url": "https://res.cloudinary.com/...",
    "scanned_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 9. Activity Logs

### PATCH `/activity-logs/steps`
Ghi số bước chân.  
🔒 **Auth required**

**Request:**
```json
{ "logDate": "2024-01-15", "steps": 8500 }
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `logDate` | string | ✅ | YYYY-MM-DD |
| `steps` | number | ✅ | ≥ 0 |

**Response `200`:**
```json
{
  "data": {
    "userId": "uuid",
    "logDate": "2024-01-15",
    "steps": 8500,
    "caloriesBurned": 0,
    "waterMl": 0,
    "activeMinutes": 0
  }
}
```

---

### PATCH `/activity-logs/water`
Ghi lượng nước uống.  
🔒 **Auth required**

**Request:**
```json
{ "logDate": "2024-01-15", "waterMl": 2000 }
```

> ⚠️ Nếu đạt `waterGoalMl` trong health profile → tự động tạo notification `GOAL_PROGRESS`.

---

### PATCH `/activity-logs/calories-burned`
Ghi calo tiêu thụ.  
🔒 **Auth required**

**Request:**
```json
{
  "logDate": "2024-01-15",
  "caloriesBurned": 350,
  "activeMinutes": 45,
  "exerciseNotes": "Chạy bộ buổi sáng"
}
```
| Field | Type | Required |
|-------|------|----------|
| `logDate` | string | ✅ |
| `caloriesBurned` | number | ✅ |
| `activeMinutes` | number | ❌ |
| `exerciseNotes` | string | ❌ |

---

### GET `/activity-logs`
Activity log theo ngày.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `date` | string | ❌ | hôm nay |

**Response `200`:**
```json
{
  "data": {
    "userId": "uuid",
    "logDate": "2024-01-15",
    "steps": 8500,
    "caloriesBurned": 350,
    "activeMinutes": 45,
    "waterMl": 2000,
    "exerciseNotes": "Chạy bộ"
  }
}
```

---

### GET `/activity-logs/range`
Activity logs theo khoảng ngày.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `fromDate` | string | ❌ | hôm nay |
| `toDate` | string | ❌ | fromDate |

**Ví dụ:** `GET /activity-logs/range?fromDate=2024-01-01&toDate=2024-01-31`

**Response `200`:** Array of activity log objects.

---

## 10. Body Metrics

### POST `/body-metrics`
Ghi chỉ số cơ thể (upsert — mỗi ngày 1 bản ghi).  
🔒 **Auth required**

**Request:**
```json
{
  "weightKg": 65.5,
  "bodyFatPct": 18.5,
  "muscleMassPct": 40,
  "recordedAt": "2024-01-15"
}
```
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `weightKg` | number | ❌ | Cân nặng (kg) |
| `bodyFatPct` | number | ❌ | % mỡ cơ thể |
| `muscleMassPct` | number | ❌ | % khối cơ |
| `recordedAt` | string | ❌ | YYYY-MM-DD, default hôm nay |

**Response `200/201`:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "weightKg": 65.5,
    "bodyFatPct": 18.5,
    "bmi": 22.7,
    "bmr": 1680,
    "tdee": 2310,
    "recordedAt": "2024-01-15"
  }
}
```
> BMI, BMR, TDEE tự động tính nếu có đủ thông tin trong health profile.

---

### GET `/body-metrics`
Lịch sử chỉ số cơ thể với query linh hoạt.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `date` | string | ❌ | Lọc theo ngày cụ thể |
| `fromDate` | string | ❌ | Từ ngày |
| `toDate` | string | ❌ | Đến ngày |

**Response `200`:** Array of body metric objects.

---

### GET `/body-metrics/history`
Lịch sử theo khoảng ngày.  
🔒 **Auth required**

**Query Params:** `fromDate`, `toDate` (YYYY-MM-DD)

**Ví dụ:** `GET /body-metrics/history?fromDate=2024-01-01&toDate=2024-01-31`

---

### GET `/body-metrics/history/:date`
Chỉ số của một ngày cụ thể.  
🔒 **Auth required**

**Ví dụ:** `GET /body-metrics/history/2024-01-15`

---

### GET `/body-metrics/latest`
Chỉ số mới nhất.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "weightKg": 65.5,
    "bmi": 22.7,
    "bmr": 1680,
    "tdee": 2310,
    "recordedAt": "2024-01-15"
  }
}
```

---

### GET `/body-metrics/summary`
Tổng kết tiến trình cân nặng.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": {
    "startWeight": 72.0,
    "currentWeight": 65.5,
    "weightChange": -6.5,
    "startDate": "2023-06-01",
    "latestDate": "2024-01-15",
    "totalRecords": 45
  }
}
```

---

### GET `/body-metrics/photos`
Ảnh tiến trình cơ thể.  
🔒 **Auth required**

**Query Params:** `limit` (number, default 10)

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "photoUrl": "https://res.cloudinary.com/...",
      "photoType": "front",
      "bodyMetricId": "uuid",
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ]
}
```

---

### POST `/body-metrics/photos`
Upload ảnh tiến trình.  
🔒 **Auth required** — `multipart/form-data`

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `file` | image | ✅ | |
| `photoType` | string | ❌ | `front` / `back` / `side` |
| `bodyMetricId` | string (UUID) | ❌ | Gắn với lần đo |

---

### DELETE `/body-metrics/photos/:id`
Xóa ảnh tiến trình.  
🔒 **Auth required** — `204 No Content`

---

## 11. Training

### GET `/training/exercises`
Danh sách bài tập (public).

**Query Params:**
| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `name` | string | ❌ | Tìm theo tên |
| `muscleGroup` | string | ❌ | Nhóm cơ |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Push-up",
      "primaryMuscleGroup": "CHEST",
      "intensity": "MODERATE",
      "metValue": 4.0,
      "description": "Hít đất cơ bản",
      "instructions": "Nằm sấp, chống tay...",
      "imageAvtUrl": "https://...",
      "favoritesCount": 120
    }
  ]
}
```

---

### GET `/training/history`
Lịch sử các buổi tập.  
🔒 **Auth required**

**Query Params:**
| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `limit` | number | ❌ | N buổi gần nhất (default 20) |
| `fromDate` | string | ❌ | YYYY-MM-DD (dùng thay limit) |
| `toDate` | string | ❌ | YYYY-MM-DD |

> Nếu có `fromDate` hoặc `toDate` → filter theo date range, bỏ qua `limit`.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "exercise": { "name": "Push-up", "primaryMuscleGroup": "CHEST" },
      "sessionDate": "2024-01-15",
      "durationMinutes": 30,
      "sets": 4,
      "repsPerSet": 15,
      "weightKg": null,
      "caloriesBurnedSnapshot": 180
    }
  ]
}
```

---

### GET `/training/history/:date`
Buổi tập của một ngày cụ thể.  
🔒 **Auth required**

**Ví dụ:** `GET /training/history/2024-01-15`

---

### POST `/training/workout`
Ghi một buổi tập.  
🔒 **Auth required**

**Request:**
```json
{
  "exerciseId": "uuid",
  "sessionDate": "2024-01-15",
  "durationMinutes": 30,
  "sets": 4,
  "repsPerSet": 15,
  "weightKg": 0,
  "notes": ""
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `exerciseId` | string | ✅ | UUID |
| `sessionDate` | string | ✅ | YYYY-MM-DD |
| `durationMinutes` | number | ✅ | > 0 |
| `sets` | number | ❌ | |
| `repsPerSet` | number | ❌ | |
| `weightKg` | number | ❌ | |
| `notes` | string | ❌ | |

**Response `201`:** Workout session object (với `caloriesBurnedSnapshot` = MET × weight × duration).

---

### PATCH `/training/workout/:id`
Cập nhật buổi tập.  
🔒 **Auth required**

---

### DELETE `/training/workout/:id`
Xóa buổi tập.  
🔒 **Auth required** — `204 No Content`

---

### GET `/training/goals`
Danh sách mục tiêu tập luyện.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "goalType": "LOSE_WEIGHT",
      "targetValue": 60,
      "currentValue": 65.5,
      "deadline": "2024-06-01",
      "dailyCaloriesGoal": 1500,
      "proteinG": 120,
      "carbsG": 150,
      "fatG": 50
    }
  ]
}
```

---

### POST `/training/goals`
Tạo mục tiêu tập luyện.  
🔒 **Auth required**

**Request:**
```json
{
  "goalType": "LOSE_WEIGHT",
  "targetValue": 60,
  "deadline": "2024-06-01"
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `goalType` | string | ✅ | `LOSE_WEIGHT` / `GAIN_MUSCLE` / `MAINTAIN` |
| `targetValue` | number | ❌ | |
| `deadline` | string | ❌ | YYYY-MM-DD |

> Macro targets (calories, protein, carbs, fat) tự tính từ TDEE trong body metrics.

---

### PATCH `/training/goals/:id`
Cập nhật mục tiêu.  
🔒 **Auth required**

---

### DELETE `/training/goals/:id`
Xóa mục tiêu.  
🔒 **Auth required** — `204 No Content`

---

### GET `/training/exercises/favorites`
Bài tập yêu thích.  
🔒 **Auth required**

---

### POST `/training/exercises/:id/favorite`
Thêm bài tập vào yêu thích.  
🔒 **Auth required**

**Response `201`:** `{ "data": { "message": "Added to favorites" } }`

---

### DELETE `/training/exercises/:id/favorite`
Xóa bài tập khỏi yêu thích.  
🔒 **Auth required**

---

### GET `/training/tips`
Mẹo thể thao (public).

**Query Params:** `page`, `limit`, `sport_category`, `muscle_group`

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Warm-up trước khi chạy",
        "content": "...",
        "sport_category": "running",
        "muscle_group": "QUADS",
        "tags": ["warmup"],
        "thumbnail_url": "https://..."
      }
    ],
    "total": 50
  }
}
```

---

### GET `/training/tips/:id`
Chi tiết một mẹo thể thao (public).

---

### POST `/training/exercises/:id/image/avatar`
Upload ảnh đại diện bài tập.  
🔒 **Auth required** — `multipart/form-data`, field `file`

---

### POST `/training/exercises/:id/image/gallery`
Thêm ảnh minh họa vào gallery.  
🔒 **Auth required** — `multipart/form-data`, field `file`

---

### DELETE `/training/exercises/:id/image/gallery/:publicId`
Xóa ảnh gallery.  
🔒 **Auth required**

---

## 12. Blog

### GET `/blogs`
Danh sách blog đã duyệt (public).

**Query Params:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| `page` | number | ❌ | 1 |
| `limit` | number | ❌ | 20 |
| `tag` | string | ❌ | |

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "5 Thực Phẩm Giúp Giảm Cân Hiệu Quả",
        "thumbnailUrl": "https://...",
        "tags": ["diet", "weight-loss"],
        "author": { "id": "uuid", "display_name": "Admin" },
        "likeCount": 42,
        "commentCount": 8,
        "created_at": "2024-01-15T08:00:00Z"
      }
    ],
    "total": 120
  }
}
```

---

### GET `/blogs/:id`
Chi tiết blog kèm nội dung blocks (public).

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "title": "5 Thực Phẩm Giúp Giảm Cân",
    "thumbnailUrl": "https://...",
    "tags": ["diet"],
    "author": { "id": "uuid", "display_name": "Admin", "avatar_url": null },
    "blocks": [
      { "order": 0, "type": "text", "text_content": "Nội dung đoạn 1..." },
      { "order": 1, "type": "image", "image_url": "https://..." }
    ],
    "likeCount": 42,
    "isLiked": false,
    "comments": [
      { "id": "uuid", "content": "Hay quá!", "author": { "display_name": "User A" }, "created_at": "..." }
    ],
    "created_at": "2024-01-15T08:00:00Z"
  }
}
```

---

### POST `/blogs/:id/like`
Like / unlike blog.  
🔒 **Auth required**

**Response `201`:**
```json
{ "data": { "liked": true, "likeCount": 43 } }
```

---

### GET `/blogs/:id/comments`
Danh sách bình luận.

---

### POST `/blogs/:id/comments`
Thêm bình luận.  
🔒 **Auth required**

**Request:**
```json
{ "content": "Bài viết rất hay và bổ ích!" }
```

---

### DELETE `/blogs/:id/comments/:commentId`
Xóa bình luận của mình.  
🔒 **Auth required** — `204 No Content`

---

### GET `/user/blogs`
Danh sách blog của mình (mọi trạng thái).  
🔒 **Auth required**

**Query Params:** `page`, `limit`

---

### POST `/user/blogs`
Viết blog mới (gửi duyệt).  
🔒 **Auth required**

**Request:**
```json
{
  "title": "Kinh nghiệm chạy marathon đầu tiên",
  "tags": ["running", "marathon"],
  "status": "pending",
  "blocks": [
    { "order": 0, "type": "text", "text_content": "Mở đầu câu chuyện..." },
    { "order": 1, "type": "image", "image_base64": "data:image/jpeg;base64,..." }
  ]
}
```
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `title` | string | ✅ | |
| `tags` | string[] | ❌ | max 50 ký tự/tag |
| `status` | string | ❌ | `draft` / `pending` |
| `blocks` | array | ❌ | |
| `blocks[].order` | number | ✅ | ≥ 0 |
| `blocks[].type` | string | ✅ | `text` / `image` |
| `blocks[].text_content` | string | ❌ | khi type = text |
| `blocks[].image_base64` | string | ❌ | data-URI |
| `blocks[].image_url` | string | ❌ | URL ảnh có sẵn |

---

### PATCH `/user/blogs/:id`
Cập nhật blog của mình (tự động re-submit nếu đã reject).  
🔒 **Auth required**

---

### DELETE `/user/blogs/:id`
Xóa blog của mình.  
🔒 **Auth required** — `204 No Content`

---

## 13. Chatbot

### POST `/chatbot/sessions`
Tạo phiên chat mới.  
🔒 **Auth required**

**Response `201`:**
```json
{
  "data": { "id": "uuid", "user_id": "uuid", "created_at": "2024-01-15T10:00:00Z" }
}
```

---

### GET `/chatbot/sessions`
Danh sách 10 phiên gần nhất.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": [
    { "id": "uuid", "title": "Hỏi về chế độ ăn", "created_at": "2024-01-15T10:00:00Z" }
  ]
}
```

---

### GET `/chatbot/sessions/:id`
Lịch sử tin nhắn của phiên.  
🔒 **Auth required**

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "messages": [
      { "role": "user", "content": "Hôm nay ăn gì?" },
      { "role": "assistant", "content": "Dựa vào mục tiêu của bạn, tôi đề xuất..." }
    ]
  }
}
```

---

### POST `/chatbot/sessions/:id/messages`
Gửi tin nhắn và nhận phản hồi AI.  
🔒 **Auth required**

**Request:**
```json
{ "message": "Tôi nên tập bài gì cho ngày hôm nay?" }
```

**Response `201`:**
```json
{
  "data": {
    "role": "assistant",
    "content": "Dựa trên lịch tập của bạn, hôm nay phù hợp để tập nhóm cơ ngực...",
    "created_at": "2024-01-15T10:05:00Z"
  }
}
```

> AI có quyền truy cập lịch sử bữa ăn, body metrics, workout history, và health profile để đưa ra tư vấn cá nhân.

---

### DELETE `/chatbot/sessions/:id`
Xóa phiên chat.  
🔒 **Auth required** — `204 No Content`

---

## 14. Admin

> ⚠️ Tất cả admin endpoints yêu cầu token từ `/admin/auth/login` — khác với token user.

### POST `/admin/auth/login`
Đăng nhập admin.

**Request:**
```json
{ "email": "admin@gmail.com", "password": "admin" }
```

**Response `201`:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": "uuid", "email": "admin@gmail.com", "role": "ADMIN" }
  }
}
```

---

### GET `/admin/stats`
Thống kê platform.  
🔒 **Admin**

---

### GET `/admin/users`
Danh sách user.  
🔒 **Admin** — Query: `page`, `limit`, `search`

### GET `/admin/users/:id`
Chi tiết user (kèm health profile, workout history).  
🔒 **Admin**

### PATCH `/admin/users/:id/ban`
Khóa tài khoản.  
🔒 **Admin**

### PATCH `/admin/users/:id/unban`
Mở khóa tài khoản.  
🔒 **Admin**

### PATCH `/admin/users/:id/verify-email`
Xác minh email thủ công.  
🔒 **Admin**

---

### GET `/admin/foods`
Danh sách thực phẩm.  
🔒 **Admin** — Query: `page`, `limit`, `search`

### GET `/admin/foods/pending`
Thực phẩm chờ duyệt.  
🔒 **Admin**

### POST `/admin/foods`
Tạo thực phẩm (đã verified).  
🔒 **Admin**

**Request:**
```json
{
  "name": "Phở bò",
  "caloriesPer100g": 68,
  "proteinPer100g": 5.5,
  "carbsPer100g": 8.5,
  "fatPer100g": 1.5,
  "foodType": "dish",
  "isVerified": true
}
```

### PATCH `/admin/foods/:id`
Sửa thực phẩm.  
🔒 **Admin**

### PATCH `/admin/foods/:id/verify`
Duyệt thực phẩm.  
🔒 **Admin**

### PATCH `/admin/foods/:id/reject`
Từ chối thực phẩm.  
🔒 **Admin**

### DELETE `/admin/foods/:id`
Xóa thực phẩm.  
🔒 **Admin** — `204 No Content`

---

### GET `/admin/exercises`
Danh sách bài tập.  
🔒 **Admin** — Query: `page`, `limit`, `search`

### POST `/admin/exercises`
Tạo bài tập.  
🔒 **Admin**

**Request:**
```json
{
  "name": "Squat",
  "description": "Bài tập chân cơ bản",
  "primaryMuscleGroup": "QUADS",
  "intensity": "MODERATE",
  "metValue": 5.0,
  "instructions": "Đứng thẳng, hạ người...",
  "videoUrl": "https://youtube.com/..."
}
```

### PATCH `/admin/exercises/:id`
Sửa bài tập.  
🔒 **Admin**

### DELETE `/admin/exercises/:id`
Xóa bài tập.  
🔒 **Admin** — `204 No Content`

---

### GET `/admin/blogs`
Tất cả blog.  
🔒 **Admin** — Query: `page`, `limit`, `status`, `tag`

### GET `/admin/blogs/pending-count`
Số blog chờ duyệt.  
🔒 **Admin**

**Response `200`:**
```json
{ "data": { "count": 12 } }
```

### POST `/admin/blogs`
Tạo blog (published ngay).  
🔒 **Admin**

### PATCH `/admin/blogs/:id/approve`
Duyệt blog.  
🔒 **Admin**

### PATCH `/admin/blogs/:id/reject`
Từ chối blog.  
🔒 **Admin** — Body: `{ "reason": "Lý do từ chối" }`

### PATCH `/admin/blogs/batch-approve`
Duyệt nhiều blog.  
🔒 **Admin** — Body: `{ "ids": ["uuid1", "uuid2"] }`

### PATCH `/admin/blogs/batch-reject`
Từ chối nhiều blog.  
🔒 **Admin** — Body: `{ "ids": ["uuid1", "uuid2"], "reason": "Spam" }`

### PATCH `/admin/blogs/:id`
Sửa blog.  
🔒 **Admin**

### DELETE `/admin/blogs/:id`
Xóa blog.  
🔒 **Admin** — `204 No Content`

---

### GET `/admin/sport-tips`
Danh sách sport tips.  
🔒 **Admin** — Query: `page`, `limit`

### POST `/admin/sport-tips`
Tạo sport tip.  
🔒 **Admin**

**Request:**
```json
{
  "title": "Warm-up trước khi chạy",
  "content": "Luôn khởi động ít nhất 10 phút...",
  "sport_category": "running",
  "muscle_group": "QUADS",
  "tags": ["warmup"],
  "is_published": true
}
```

### PATCH `/admin/sport-tips/:id`
Sửa sport tip.  
🔒 **Admin**

### DELETE `/admin/sport-tips/:id`
Xóa sport tip.  
🔒 **Admin** — `204 No Content`

---

### POST `/admin/foods/:id/recipe`
Tạo / thay thế công thức nấu ăn.  
🔒 **Admin**

**Request:**
```json
{
  "prep_time_min": 10,
  "cook_time_min": 20,
  "servings": 2,
  "steps": [
    { "step_number": 1, "instruction": "Rửa gạo sạch" },
    { "step_number": 2, "instruction": "Cho vào nồi, thêm nước" }
  ]
}
```

### POST `/admin/foods/:id/recipe/steps`
Thêm bước nấu.  
🔒 **Admin**

**Request:**
```json
{
  "step_number": 3,
  "instruction": "Nấu với lửa vừa 15 phút",
  "image_base64": "data:image/jpeg;base64,..."
}
```

### DELETE `/admin/foods/:id/recipe/steps/:stepId`
Xóa bước nấu.  
🔒 **Admin** — `204 No Content`

---

## Phụ lục A — Enum Values

### `activityLevel`
| Value | Mô tả |
|-------|-------|
| `sedentary` | Ít vận động (ngồi nhiều) |
| `lightly_active` | Nhẹ nhàng (1-3 buổi/tuần) |
| `moderately_active` | Vừa phải (3-5 buổi/tuần) |
| `very_active` | Tích cực (6-7 buổi/tuần) |
| `extra_active` | Rất tích cực (vận động viên) |

### `meal_type`
`breakfast` · `lunch` · `dinner` · `snack`

### `goalType`
`LOSE_WEIGHT` · `GAIN_MUSCLE` · `MAINTAIN`

### `muscleGroup`
`CHEST` · `BACK` · `SHOULDERS` · `BICEPS` · `TRICEPS` · `FOREARMS` · `QUADS` · `HAMSTRINGS` · `CALVES` · `CORE`

### `intensity`
`LIGHT` · `MODERATE` · `HARD`

### `photoType`
`front` · `back` · `side`

### Blog `status`
`draft` · `pending` · `approved` · `rejected`

### Notification `type`
`GOAL_PROGRESS` · `REMINDER` · `SYSTEM`

---

## Phụ lục B — HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| `200` | Thành công (GET, PATCH) |
| `201` | Tạo thành công (POST) |
| `204` | Xóa thành công (không có body) |
| `400` | Dữ liệu không hợp lệ (validation error) |
| `401` | Chưa đăng nhập hoặc token hết hạn |
| `403` | Không có quyền (hoặc email chưa xác thực) |
| `404` | Resource không tồn tại |
| `409` | Xung đột dữ liệu (email đã tồn tại) |
| `429` | Rate limit exceeded |
| `500` | Lỗi server |

---

## Phụ lục C — Bảng tổng hợp 142 endpoints

| # | Method | Path | Auth | Module |
|---|--------|------|------|--------|
| 1 | POST | /auth/register | ❌ | Auth |
| 2 | POST | /auth/login | ❌ | Auth |
| 3 | POST | /auth/refresh | ❌ | Auth |
| 4 | POST | /auth/logout | 🔒 | Auth |
| 5 | POST | /auth/send-verification | ❌ | Auth |
| 6 | POST | /auth/verify-email | ❌ | Auth |
| 7 | POST | /auth/forgot-password | ❌ | Auth |
| 8 | POST | /auth/reset-password | ❌ | Auth |
| 9 | GET | /auth/google | ❌ | Auth |
| 10 | GET | /auth/google/callback | ❌ | Auth |
| 11 | GET | /users/me | 🔒 | Users |
| 12 | PATCH | /users/:id | 🔒 | Users |
| 13 | POST | /users/me/avatar | 🔒 | Users |
| 14 | PATCH | /users/:id/deactivate | 🔒 | Users |
| 15 | GET | /users/me/health-profile | 🔒 | Users |
| 16 | PUT | /users/me/health-profile | 🔒 | Users |
| 17 | GET | /dashboard | 🔒 | Dashboard |
| 18 | GET | /dashboard/weekly | 🔒 | Dashboard |
| 19 | GET | /dashboard/monthly | 🔒 | Dashboard |
| 20 | GET | /notifications | 🔒 | Notifications |
| 21 | GET | /notifications/unread-count | 🔒 | Notifications |
| 22 | PATCH | /notifications/read-all | 🔒 | Notifications |
| 23 | PATCH | /notifications/:id/read | 🔒 | Notifications |
| 24 | DELETE | /notifications/:id | 🔒 | Notifications |
| 25 | GET | /streaks | 🔒 | Streaks |
| 26 | GET | /foods | ❌ | Foods |
| 27 | GET | /foods/explore | ❌ | Foods |
| 28 | GET | /foods/barcode/:barcode | ❌ | Foods |
| 29 | GET | /foods/favorites | 🔒 | Foods |
| 30 | GET | /foods/custom | 🔒 | Foods |
| 31 | GET | /foods/:id | ❌ | Foods |
| 32 | GET | /foods/:id/recipe | ❌ | Foods |
| 33 | GET | /foods/:id/ingredients | ❌ | Foods |
| 34 | POST | /foods | 🔒 | Foods |
| 35 | POST | /foods/:id/image | 🔒 | Foods |
| 36 | DELETE | /foods/:id/image | 🔒 | Foods |
| 37 | POST | /foods/:id/favorite | 🔒 | Foods |
| 38 | DELETE | /foods/:id/favorite | 🔒 | Foods |
| 39 | POST | /foods/:id/ingredients | 🔒 | Foods |
| 40 | POST | /meal-logs | 🔒 | Meal Logs |
| 41 | GET | /meal-logs | 🔒 | Meal Logs |
| 42 | GET | /meal-logs/history | 🔒 | Meal Logs |
| 43 | GET | /meal-logs/history/:date | 🔒 | Meal Logs |
| 44 | GET | /meal-logs/summary | 🔒 | Meal Logs |
| 45 | GET | /meal-logs/:id | 🔒 | Meal Logs |
| 46 | PATCH | /meal-logs/:id | 🔒 | Meal Logs |
| 47 | DELETE | /meal-logs/:id | 🔒 | Meal Logs |
| 48 | POST | /meal-logs/:id/image | 🔒 | Meal Logs |
| 49 | POST | /meal-logs/:id/image/base64 | 🔒 | Meal Logs |
| 50 | POST | /meal-logs/:id/items | 🔒 | Meal Logs |
| 51 | PATCH | /meal-logs/:id/items/:itemId | 🔒 | Meal Logs |
| 52 | DELETE | /meal-logs/:id/items/:itemId | 🔒 | Meal Logs |
| 53 | POST | /ai-scan | 🔒 | AI Scan |
| 54 | PATCH | /activity-logs/steps | 🔒 | Activity Logs |
| 55 | PATCH | /activity-logs/water | 🔒 | Activity Logs |
| 56 | PATCH | /activity-logs/calories-burned | 🔒 | Activity Logs |
| 57 | GET | /activity-logs | 🔒 | Activity Logs |
| 58 | GET | /activity-logs/range | 🔒 | Activity Logs |
| 59 | POST | /body-metrics | 🔒 | Body Metrics |
| 60 | GET | /body-metrics | 🔒 | Body Metrics |
| 61 | GET | /body-metrics/history | 🔒 | Body Metrics |
| 62 | GET | /body-metrics/history/:date | 🔒 | Body Metrics |
| 63 | GET | /body-metrics/latest | 🔒 | Body Metrics |
| 64 | GET | /body-metrics/summary | 🔒 | Body Metrics |
| 65 | GET | /body-metrics/photos | 🔒 | Body Metrics |
| 66 | POST | /body-metrics/photos | 🔒 | Body Metrics |
| 67 | DELETE | /body-metrics/photos/:id | 🔒 | Body Metrics |
| 68 | GET | /training/exercises | ❌ | Training |
| 69 | POST | /training/exercises/:id/image/avatar | 🔒 | Training |
| 70 | POST | /training/exercises/:id/image/gallery | 🔒 | Training |
| 71 | DELETE | /training/exercises/:id/image/gallery/:publicId | 🔒 | Training |
| 72 | POST | /training/workout | 🔒 | Training |
| 73 | GET | /training/history | 🔒 | Training |
| 74 | GET | /training/history/:date | 🔒 | Training |
| 75 | PATCH | /training/workout/:id | 🔒 | Training |
| 76 | DELETE | /training/workout/:id | 🔒 | Training |
| 77 | GET | /training/goals | 🔒 | Training |
| 78 | POST | /training/goals | 🔒 | Training |
| 79 | PATCH | /training/goals/:id | 🔒 | Training |
| 80 | DELETE | /training/goals/:id | 🔒 | Training |
| 81 | GET | /training/exercises/favorites | 🔒 | Training |
| 82 | POST | /training/exercises/:id/favorite | 🔒 | Training |
| 83 | DELETE | /training/exercises/:id/favorite | 🔒 | Training |
| 84 | GET | /training/tips | ❌ | Training |
| 85 | GET | /training/tips/:id | ❌ | Training |
| 86 | GET | /blogs | ❌ | Blog |
| 87 | GET | /blogs/:id | ❌ | Blog |
| 88 | POST | /blogs/:id/like | 🔒 | Blog |
| 89 | GET | /blogs/:id/comments | ❌ | Blog |
| 90 | POST | /blogs/:id/comments | 🔒 | Blog |
| 91 | DELETE | /blogs/:id/comments/:commentId | 🔒 | Blog |
| 92 | GET | /user/blogs | 🔒 | Blog |
| 93 | POST | /user/blogs | 🔒 | Blog |
| 94 | PATCH | /user/blogs/:id | 🔒 | Blog |
| 95 | DELETE | /user/blogs/:id | 🔒 | Blog |
| 96 | POST | /chatbot/sessions | 🔒 | Chatbot |
| 97 | GET | /chatbot/sessions | 🔒 | Chatbot |
| 98 | GET | /chatbot/sessions/:id | 🔒 | Chatbot |
| 99 | DELETE | /chatbot/sessions/:id | 🔒 | Chatbot |
| 100 | POST | /chatbot/sessions/:id/messages | 🔒 | Chatbot |
| 101 | POST | /admin/auth/login | ❌ | Admin |
| 102 | GET | /admin/stats | 🔒Admin | Admin |
| 103 | GET | /admin/users | 🔒Admin | Admin |
| 104 | GET | /admin/users/:id | 🔒Admin | Admin |
| 105 | PATCH | /admin/users/:id/ban | 🔒Admin | Admin |
| 106 | PATCH | /admin/users/:id/unban | 🔒Admin | Admin |
| 107 | PATCH | /admin/users/:id/verify-email | 🔒Admin | Admin |
| 108 | GET | /admin/foods | 🔒Admin | Admin |
| 109 | GET | /admin/foods/pending | 🔒Admin | Admin |
| 110 | POST | /admin/foods | 🔒Admin | Admin |
| 111 | PATCH | /admin/foods/:id | 🔒Admin | Admin |
| 112 | PATCH | /admin/foods/:id/verify | 🔒Admin | Admin |
| 113 | PATCH | /admin/foods/:id/reject | 🔒Admin | Admin |
| 114 | DELETE | /admin/foods/:id | 🔒Admin | Admin |
| 115 | GET | /admin/exercises | 🔒Admin | Admin |
| 116 | POST | /admin/exercises | 🔒Admin | Admin |
| 117 | PATCH | /admin/exercises/:id | 🔒Admin | Admin |
| 118 | DELETE | /admin/exercises/:id | 🔒Admin | Admin |
| 119 | GET | /admin/blogs | 🔒Admin | Admin |
| 120 | GET | /admin/blogs/pending-count | 🔒Admin | Admin |
| 121 | POST | /admin/blogs | 🔒Admin | Admin |
| 122 | PATCH | /admin/blogs/:id | 🔒Admin | Admin |
| 123 | PATCH | /admin/blogs/:id/approve | 🔒Admin | Admin |
| 124 | PATCH | /admin/blogs/:id/reject | 🔒Admin | Admin |
| 125 | PATCH | /admin/blogs/batch-approve | 🔒Admin | Admin |
| 126 | PATCH | /admin/blogs/batch-reject | 🔒Admin | Admin |
| 127 | DELETE | /admin/blogs/:id | 🔒Admin | Admin |
| 128 | GET | /admin/sport-tips | 🔒Admin | Admin |
| 129 | POST | /admin/sport-tips | 🔒Admin | Admin |
| 130 | PATCH | /admin/sport-tips/:id | 🔒Admin | Admin |
| 131 | DELETE | /admin/sport-tips/:id | 🔒Admin | Admin |
| 132 | POST | /admin/foods/:id/recipe | 🔒Admin | Admin |
| 133 | POST | /admin/foods/:id/recipe/steps | 🔒Admin | Admin |
| 134 | DELETE | /admin/foods/:id/recipe/steps/:stepId | 🔒Admin | Admin |
