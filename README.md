# 📚 Tài Liệu Dự Án - Mục Lục Chính

## 🗂️ Danh Sách Tài Liệu

### 1. 📖 **PROJECT_OVERVIEW.md** 
   **Tổng quan dự án**
   - Thông tin cơ bản
   - Architecture overview
   - 11 modules hoàn thiện
   - Feature checklist
   - Setup instructions
   - Command reference
   
   **👉 [Xem Chi Tiết](./PROJECT_OVERVIEW.md)**

---

### 2. 🔗 **BACKEND_API_DOCUMENTATION.md**
   **Tài liệu API toàn diện**
   - Base URL: `http://localhost:3005`
   - Swagger Docs: `http://localhost:3005/api/docs`
   - 78+ endpoints chi tiết
   - Request/Response examples
   - Authentication requirements
   - Error codes
   
   **Modules:**
   - Authentication (8 endpoints)
   - Users (6 endpoints)
   - Foods (7 endpoints)
   - Meal Logs (8 endpoints)
   - Body Metrics (7 endpoints)
   - Training (10 endpoints)
   - Activity Logs (5 endpoints)
   - Streaks (1 endpoint)
   - Dashboard (3 endpoints)
   - Notifications (5 endpoints)
   - Admin (18 endpoints)
   
   **👉 [Xem Chi Tiết](./BACKEND_API_DOCUMENTATION.md)**

---

### 3. 🔄 **BACKEND_WORKFLOWS_SUMMARY.md**
   **Tóm tắt các luồng chính**
   - Flow diagrams cho 11 workflows
   - Step-by-step explanations
   - Data flow & transformations
   - Example calculations
   - Security flows
   - Performance optimization
   
   **Luồng chính:**
   1. Xác thực & Quản lý tài khoản
   2. Quản lý hồ sơ người dùng
   3. Quản lý thực phẩm
   4. Ghi nhật ký ăn uống
   5. Theo dõi chỉ số cơ thể
   6. Quản lý bài tập thể dục
   7. Theo dõi hoạt động hàng ngày
   8. Tính streak (nước rút liên tiếp)
   9. Dashboard analytics
   10. Thông báo
   11. Admin panel
   
   **👉 [Xem Chi Tiết](./BACKEND_WORKFLOWS_SUMMARY.md)**

---

### 4. 🗄️ **DATABASE_SCHEMA.md**
   **Cơ sở dữ liệu & mối quan hệ**
   - Entity Relationship Diagram (ERD)
   - 15+ table definitions
   - TypeORM entity code
   - Relationships (1:1, 1:M, M:M)
   - Cascade rules
   - Indexes
   - Data persistence rules
   
   **Entities:**
   - User & UserHealthProfile
   - MealLog & MealLogItem
   - Food
   - BodyMetric & ProgressPhoto
   - WorkoutSession & WorkoutExercise
   - Exercise
   - ActivityLog
   - TrainingGoal
   - Notification
   - PasswordReset & EmailVerification
   - Blog
   
   **👉 [Xem Chi Tiết](./DATABASE_SCHEMA.md)**

---

## 🚀 Quick Start Guide

### Setup Backend (Port 3005)
```bash
cd /Users/UET/DACN/Project/backend

# Install dependencies
npm install

# Configure environment
# Edit .env with PostgreSQL credentials

# Start development server
npm run start:dev
```

### Setup Frontend (Port 5173)
```bash
cd /Users/UET/DACN/Project/web_client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3005
- **API Docs:** http://localhost:3005/api/docs
- **React Query Devtools:** Integrated in frontend

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Backend Modules | 11 ✅ |
| API Endpoints | 78+ ✅ |
| Database Tables | 15+ ✅ |
| Entities | 20+ ✅ |
| Frontend Pages | 15+ ✅ |
| Components | 50+ ✅ |
| Completed Workflows | 11 ✅ |
| Overall Status | 🟢 Production Ready |

---

## 🔐 Authentication

**JWT-based with Access + Refresh Tokens**

```
Access Token:  15 minutes
Refresh Token: 7 days

Flow:
1. Register → Verify Email → Login
2. Get tokens → Store securely
3. Use access token for requests
4. Refresh when expired
5. Logout → Invalidate session
```

---

## 📱 Features Overview

### ✅ User Features (Complete)
- Account management (register, login, password reset)
- Profile customization (avatar, bio, health info)
- Meal logging with calorie tracking
- Body metrics with progress photos
- Workout logging and goals
- Activity tracking (steps, water, calories)
- Analytics dashboard (daily, weekly, monthly)
- Streak tracking
- Notifications

### ✅ Admin Features (Complete)
- User management (list, ban, verify)
- Content management (foods, exercises, blogs)
- Platform statistics
- Image management

---

## 🔧 Technology Stack

### Backend
```
Runtime:     Node.js 18+
Framework:   NestJS 11
Language:    TypeScript
Database:    PostgreSQL 13+
ORM:         TypeORM
Auth:        JWT + Bcrypt
Storage:     Cloudinary
Email:       Nodemailer
```

### Frontend
```
Framework:   React 19
Language:    TypeScript
Routing:     React Router 6
HTTP:        Axios
State:       Zustand
Forms:       React Hook Form
Validation:  Zod
UI:          TailwindCSS
Charts:      Recharts
```

---

## 📋 Complete Endpoint List

### Auth Endpoints (8)
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/send-verification
- POST /auth/verify-email
- POST /auth/forgot-password
- POST /auth/reset-password

### Users Endpoints (6)
- GET /users/me
- PATCH /users/:id
- POST /users/me/avatar
- PATCH /users/:id/deactivate
- GET /users/me/health-profile
- PATCH /users/me/health-profile

### Foods Endpoints (7)
- GET /foods
- GET /foods/barcode/:barcode
- GET /foods/favorites
- GET /foods/:id
- POST /foods
- POST /foods/:id/image
- DELETE /foods/:id/image

### Meal Logs Endpoints (8)
- POST /meal-logs
- GET /meal-logs
- GET /meal-logs/summary
- GET /meal-logs/:id
- PATCH /meal-logs/:id
- DELETE /meal-logs/:id
- POST /meal-logs/:id/image/base64
- POST /meal-logs/:id/image

### Body Metrics Endpoints (7)
- GET /body-metrics
- POST /body-metrics
- GET /body-metrics/latest
- GET /body-metrics/summary
- GET /body-metrics/photos
- POST /body-metrics/photos
- DELETE /body-metrics/photos/:id

### Training Endpoints (10)
- GET /training/exercises
- POST /training/exercises/:id/image/avatar
- POST /training/exercises/:id/image/gallery
- DELETE /training/exercises/:id/image/gallery/:publicId
- POST /training/workout
- GET /training/history
- GET /training/goals
- POST /training/goals
- PATCH /training/goals/:id
- DELETE /training/goals/:id

### Activity Logs Endpoints (5)
- GET /activity-logs
- GET /activity-logs/range
- PATCH /activity-logs/steps
- PATCH /activity-logs/calories-burned
- PATCH /activity-logs/water

### Streaks Endpoints (1)
- GET /streaks

### Dashboard Endpoints (3)
- GET /dashboard
- GET /dashboard/weekly
- GET /dashboard/monthly

### Notifications Endpoints (5)
- GET /notifications
- GET /notifications/unread-count
- PATCH /notifications/read-all
- PATCH /notifications/:id/read
- DELETE /notifications/:id

### Admin Endpoints (18)
- GET /admin/stats
- GET /admin/users
- GET /admin/users/:id
- PATCH /admin/users/:id/ban
- PATCH /admin/users/:id/unban
- PATCH /admin/users/:id/verify-email
- GET /admin/foods
- POST /admin/foods
- PATCH /admin/foods/:id
- DELETE /admin/foods/:id
- GET /admin/exercises
- POST /admin/exercises
- PATCH /admin/exercises/:id
- DELETE /admin/exercises/:id
- GET /admin/blogs
- POST /admin/blogs
- PATCH /admin/blogs/:id
- DELETE /admin/blogs/:id

---

## 🛡️ Security Features

✅ JWT Authentication  
✅ Password Hashing (Bcrypt)  
✅ Rate Limiting  
✅ Input Validation  
✅ SQL Injection Prevention  
✅ CORS Configuration  
✅ Role-Based Access Control  
✅ Email Verification  
✅ Token Expiration  
✅ Secure Password Reset  

---

## 📈 Performance Optimization

✅ Database Indexes  
✅ Query Optimization  
✅ Pagination (default 20 items)  
✅ Lazy Loading  
✅ Caching Strategies  
✅ Response Compression  
✅ Code Splitting (Frontend)  
✅ Efficient API Design  

---

## 🧪 Testing

### Test Files
- `tests/CaloriesTracker.postman_collection.json` - Postman tests
- Unit tests & E2E tests framework

### Running Tests
```bash
# Backend
npm run test           # Run unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

---

## 📞 Troubleshooting

### Backend Issues
```
Port 3005 already in use?
→ Change PORT in .env

Database connection error?
→ Check DB_* environment variables
→ Ensure PostgreSQL is running

JWT secret not configured?
→ Set JWT_SECRET in .env
```

### Frontend Issues
```
API connection refused?
→ Ensure backend is running on port 3005
→ Check VITE_API_URL in .env.local

CORS errors?
→ Check ALLOWED_ORIGINS in backend .env

Token not saving?
→ Check localStorage/session storage
→ Check browser DevTools → Application tab
```

---

## 📅 Version History

| Version | Date | Status |
|---------|------|--------|
| 1.0.0 | Apr 12, 2026 | 🟢 Production Ready |
| 0.9.0 | Apr 2026 | ✅ Feature Complete |
| 0.1.0 | Jan 2024 | ✅ Initial Setup |

---

## 🤝 Contributing

When working on new features:

1. Create feature branch from `develop`
2. Make changes following code standards
3. Write tests for new endpoints
4. Update documentation
5. Create pull request to `develop`
6. Merge to `master` after review

---

## 📞 Support

For issues or questions:

1. Check documentation files above
2. Review API documentation at `/api/docs`
3. Check error logs in console
4. Review database schema for entity relationships

---

## ✨ Key Highlights

🎯 **11 Complete Modules** - All major features implemented  
🔐 **Secure Authentication** - JWT + refresh token pattern  
📊 **Comprehensive Analytics** - Daily, weekly, monthly reports  
🏋️ **Full Fitness Tracking** - Workouts, exercises, goals  
🍎 **Nutrition Management** - Foods, macros, meal planning  
📸 **Progress Tracking** - Photos, metrics, trends  
🔔 **Notifications** - Real-time updates  
👨‍💼 **Admin Panel** - Full content management  
🎨 **Modern UI** - React + TailwindCSS  
⚡ **High Performance** - Optimized queries & caching  

---

**Status:** 🟢 **PRODUCTION READY**

**Backend Port:** 3005  
**Frontend Port:** 5173  
**Database:** PostgreSQL  

All workflows complete and tested.  
Ready for deployment! 🚀

---

*Generated: 12 tháng 4, 2026*  
*Last Updated: Today*
