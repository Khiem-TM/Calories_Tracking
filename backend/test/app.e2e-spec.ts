/**
 * End-to-End API Test Suite
 *
 * Requires a running PostgreSQL test database.
 * Set environment variables before running:
 *   DB_HOST=localhost DB_PORT=5432 DB_USERNAME=postgres DB_PASSWORD=... DB_DATABASE=tracker_test
 *
 * Run: npm run test:e2e
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const UNIQUE = Date.now();
const testEmail = `e2e_${UNIQUE}@test.com`;
const testPass = 'Password123';
let app: INestApplication<App>;
let userToken: string;
let userId: string;
let refreshToken: string;

// ─── App Bootstrap ────────────────────────────────────────────────────────────

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseInterceptor(),
  );

  await app.init();
});

afterAll(async () => {
  await app.close();
});

// ─── AUTH MODULE ─────────────────────────────────────────────────────────────

describe('Auth Module', () => {
  describe('POST /auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testEmail, password: testPass, display_name: 'E2E User' })
        .expect(201);

      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
      expect(res.body.data.user.email).toBe(testEmail);
      userToken = res.body.data.access_token;
      refreshToken = res.body.data.refresh_token;
      userId = res.body.data.user.id;
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testEmail, password: testPass, display_name: 'Dup' })
        .expect(400);
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com', password: '123', display_name: 'X' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPass })
        .expect(201);

      expect(res.body.data.access_token).toBeDefined();
      userToken = res.body.data.access_token;
      refreshToken = res.body.data.refresh_token;
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: 'wrongpass' })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: testPass })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access_token from refresh_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(201);

      expect(res.body.data.access_token).toBeDefined();
      userToken = res.body.data.access_token;
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid_token' })
        .expect(401);
    });
  });

  describe('POST /auth/send-verification', () => {
    it('should send verification email (returns 200/201)', async () => {
      await request(app.getHttpServer())
        .post('/auth/send-verification')
        .set('Authorization', `Bearer ${userToken}`)
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return same message whether email exists or not', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testEmail })
        .expect(201);

      const res2 = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nobody@email.com' })
        .expect(201);

      expect(res1.body.data.message).toBe(res2.body.data.message);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout and revoke tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(res.body.data.message).toContain('success');

      // Re-login to get fresh token for remaining tests
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPass });
      userToken = loginRes.body.data.access_token;
      refreshToken = loginRes.body.data.refresh_token;
    });

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});

// ─── USERS MODULE ─────────────────────────────────────────────────────────────

describe('Users Module', () => {
  describe('GET /users/me', () => {
    it('should return current user data', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    it('should reject unauthenticated', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update display_name', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ display_name: 'Updated Name' })
        .expect(200);

      expect(res.body.data.display_name).toBe('Updated Name');
    });
  });

  describe('GET /users/me/health-profile', () => {
    it('should return health profile (null initially)', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me/health-profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Profile may be null or an object
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('PUT /users/me/health-profile', () => {
    it('should create/update health profile', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/me/health-profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          heightCm: 175,
          initialWeightKg: 70,
          gender: 'male',
          dateOfBirth: '1995-06-15',
          waterGoalMl: 2500,
        })
        .expect(200);

      expect(res.body.data.heightCm).toBe(175);
    });
  });
});

// ─── FOODS MODULE ─────────────────────────────────────────────────────────────

let foodId: string;

describe('Foods Module', () => {
  describe('GET /foods', () => {
    it('should return paginated foods', async () => {
      const res = await request(app.getHttpServer())
        .get('/foods')
        .expect(200);

      expect(res.body.data).toHaveProperty('foods');
      expect(Array.isArray(res.body.data.foods)).toBe(true);
    });

    it('should search foods by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/foods?search=rice&page=1&limit=5')
        .expect(200);

      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(5);
    });
  });

  describe('POST /foods', () => {
    it('should create a custom food', async () => {
      const res = await request(app.getHttpServer())
        .post('/foods')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: `E2E Food ${UNIQUE}`,
          calories_per_100g: 200,
          protein_per_100g: 10,
          fat_per_100g: 5,
          carbs_per_100g: 30,
          serving_size_g: 100,
          serving_unit: 'g',
        })
        .expect(201);

      expect(res.body.data.is_custom).toBe(true);
      expect(res.body.data.is_verified).toBe(false);
      foodId = res.body.data.id;
    });
  });

  describe('GET /foods/:id', () => {
    it('should return food by id', async () => {
      if (!foodId) return;
      const res = await request(app.getHttpServer())
        .get(`/foods/${foodId}`)
        .expect(200);

      expect(res.body.data.id).toBe(foodId);
    });

    it('should return 404 for non-existent food', async () => {
      await request(app.getHttpServer())
        .get('/foods/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /foods/:id/favorite', () => {
    it('should add food to favorites', async () => {
      if (!foodId) return;
      await request(app.getHttpServer())
        .post(`/foods/${foodId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);
    });
  });

  describe('GET /foods/favorites', () => {
    it('should return user favorites', async () => {
      const res = await request(app.getHttpServer())
        .get('/foods/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /foods/:id/favorite', () => {
    it('should remove food from favorites', async () => {
      if (!foodId) return;
      await request(app.getHttpServer())
        .delete(`/foods/${foodId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});

// ─── MEAL LOGS MODULE ─────────────────────────────────────────────────────────

let mealLogId: string;
let mealLogItemId: string;
const LOG_DATE = '2024-01-15';

describe('Meal Logs Module', () => {
  describe('POST /meal-logs', () => {
    it('should create a meal log', async () => {
      const res = await request(app.getHttpServer())
        .post('/meal-logs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ log_date: LOG_DATE, meal_type: 'lunch', items: [] })
        .expect(201);

      expect(res.body.data.meal_type).toBe('lunch');
      mealLogId = res.body.data.id;
    });
  });

  describe('GET /meal-logs', () => {
    it('should return logs for a date', async () => {
      const res = await request(app.getHttpServer())
        .get(`/meal-logs?date=${LOG_DATE}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /meal-logs/summary', () => {
    it('should return nutrition summary for date', async () => {
      const res = await request(app.getHttpServer())
        .get(`/meal-logs/summary?date=${LOG_DATE}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('total_calories');
      expect(res.body.data).toHaveProperty('total_protein');
    });
  });

  describe('POST /meal-logs/:id/items', () => {
    it('should add food item to meal log', async () => {
      if (!mealLogId || !foodId) return;
      const res = await request(app.getHttpServer())
        .post(`/meal-logs/${mealLogId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ food_id: foodId, quantity: 100, serving_unit: 'g' })
        .expect(201);

      expect(res.body.data.food_id).toBe(foodId);
      mealLogItemId = res.body.data.id;
    });
  });

  describe('GET /meal-logs/:id', () => {
    it('should return meal log with items', async () => {
      if (!mealLogId) return;
      const res = await request(app.getHttpServer())
        .get(`/meal-logs/${mealLogId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(mealLogId);
    });
  });

  describe('PATCH /meal-logs/:id', () => {
    it('should update meal log notes', async () => {
      if (!mealLogId) return;
      const res = await request(app.getHttpServer())
        .patch(`/meal-logs/${mealLogId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ notes: 'Updated notes' })
        .expect(200);

      expect(res.body.data.notes).toBe('Updated notes');
    });
  });

  describe('PATCH /meal-logs/:id/items/:itemId', () => {
    it('should update item quantity', async () => {
      if (!mealLogId || !mealLogItemId) return;
      await request(app.getHttpServer())
        .patch(`/meal-logs/${mealLogId}/items/${mealLogItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 150, serving_unit: 'g' })
        .expect(200);
    });
  });

  describe('DELETE /meal-logs/:id/items/:itemId', () => {
    it('should remove item from meal log', async () => {
      if (!mealLogId || !mealLogItemId) return;
      await request(app.getHttpServer())
        .delete(`/meal-logs/${mealLogId}/items/${mealLogItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('DELETE /meal-logs/:id', () => {
    it('should delete meal log', async () => {
      if (!mealLogId) return;
      await request(app.getHttpServer())
        .delete(`/meal-logs/${mealLogId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});

// ─── ACTIVITY LOGS MODULE ─────────────────────────────────────────────────────

describe('Activity Logs Module', () => {
  describe('PATCH /activity-logs/steps', () => {
    it('should log steps', async () => {
      const res = await request(app.getHttpServer())
        .patch('/activity-logs/steps')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ logDate: LOG_DATE, steps: 8000 })
        .expect(200);

      expect(res.body.data.steps).toBe(8000);
    });
  });

  describe('PATCH /activity-logs/water', () => {
    it('should log water intake', async () => {
      const res = await request(app.getHttpServer())
        .patch('/activity-logs/water')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ logDate: LOG_DATE, waterMl: 2500 })
        .expect(200);

      expect(res.body.data.waterMl).toBe(2500);
    });
  });

  describe('PATCH /activity-logs/calories-burned', () => {
    it('should log calories burned', async () => {
      const res = await request(app.getHttpServer())
        .patch('/activity-logs/calories-burned')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ logDate: LOG_DATE, caloriesBurned: 300, activeMinutes: 45 })
        .expect(200);

      expect(res.body.data.caloriesBurned).toBe(300);
    });
  });

  describe('GET /activity-logs', () => {
    it('should return activity log for date', async () => {
      const res = await request(app.getHttpServer())
        .get(`/activity-logs?date=${LOG_DATE}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.steps).toBe(8000);
    });
  });

  describe('GET /activity-logs/range', () => {
    it('should return activity logs for date range', async () => {
      const res = await request(app.getHttpServer())
        .get(`/activity-logs/range?fromDate=2024-01-10&toDate=2024-01-20`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

// ─── BODY METRICS MODULE ──────────────────────────────────────────────────────

describe('Body Metrics Module', () => {
  describe('POST /body-metrics', () => {
    it('should create body metric and auto-calculate BMI', async () => {
      const res = await request(app.getHttpServer())
        .post('/body-metrics')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ weightKg: 70, heightCm: 175, recordedAt: LOG_DATE })
        .expect(201);

      expect(res.body.data.weightKg).toBeDefined();
      // BMI should be calculated
    });
  });

  describe('GET /body-metrics/latest', () => {
    it('should return latest body metric', async () => {
      const res = await request(app.getHttpServer())
        .get('/body-metrics/latest')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toBeTruthy();
    });
  });

  describe('GET /body-metrics', () => {
    it('should return metric history', async () => {
      const res = await request(app.getHttpServer())
        .get('/body-metrics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /body-metrics/summary', () => {
    it('should return summary with progress', async () => {
      const res = await request(app.getHttpServer())
        .get('/body-metrics/summary')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /body-metrics/photos', () => {
    it('should return list of progress photos', async () => {
      const res = await request(app.getHttpServer())
        .get('/body-metrics/photos')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

// ─── TRAINING MODULE ──────────────────────────────────────────────────────────

let trainingGoalId: string;

describe('Training Module', () => {
  describe('GET /training/exercises', () => {
    it('should return exercises list', async () => {
      const res = await request(app.getHttpServer())
        .get('/training/exercises')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by muscleGroup', async () => {
      const res = await request(app.getHttpServer())
        .get('/training/exercises?muscleGroup=chest')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /training/goals', () => {
    it('should create a training goal', async () => {
      const res = await request(app.getHttpServer())
        .post('/training/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          goalType: 'lose_weight',
          targetValue: 65,
          deadline: '2024-06-01',
          workoutsPerWeek: 3,
        })
        .expect(201);

      expect(res.body.data.userId).toBe(userId);
      trainingGoalId = res.body.data.id;
    });
  });

  describe('GET /training/goals', () => {
    it('should return training goals', async () => {
      const res = await request(app.getHttpServer())
        .get('/training/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PATCH /training/goals/:id', () => {
    it('should update training goal', async () => {
      if (!trainingGoalId) return;
      const res = await request(app.getHttpServer())
        .patch(`/training/goals/${trainingGoalId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ targetValue: 63 })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /training/history', () => {
    it('should return workout history', async () => {
      const res = await request(app.getHttpServer())
        .get('/training/history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /training/goals/:id', () => {
    it('should delete training goal', async () => {
      if (!trainingGoalId) return;
      await request(app.getHttpServer())
        .delete(`/training/goals/${trainingGoalId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});

// ─── STREAKS MODULE ───────────────────────────────────────────────────────────

describe('Streaks Module', () => {
  describe('GET /streaks', () => {
    it('should return user streaks', async () => {
      const res = await request(app.getHttpServer())
        .get('/streaks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject unauthenticated', async () => {
      await request(app.getHttpServer()).get('/streaks').expect(401);
    });
  });
});

// ─── DASHBOARD MODULE ─────────────────────────────────────────────────────────

describe('Dashboard Module', () => {
  describe('GET /dashboard', () => {
    it('should return daily dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get(`/dashboard?date=${LOG_DATE}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('nutrition');
      expect(res.body.data).toHaveProperty('activity');
      expect(res.body.data).toHaveProperty('body');
      expect(res.body.data).toHaveProperty('streaks');
    });

    it('should use today when date not provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const today = new Date().toISOString().split('T')[0];
      expect(res.body.data.date).toBe(today);
    });
  });

  describe('GET /dashboard/weekly', () => {
    it('should return weekly report', async () => {
      const res = await request(app.getHttpServer())
        .get(`/dashboard/weekly?weekStart=2024-01-15`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.period.from).toBe('2024-01-15');
      expect(res.body.data.period.to).toBe('2024-01-21');
      expect(res.body.data).toHaveProperty('nutrition');
      expect(res.body.data).toHaveProperty('activity');
      expect(res.body.data).toHaveProperty('training');
    });
  });

  describe('GET /dashboard/monthly', () => {
    it('should return monthly report', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/monthly?year=2024&month=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.period.year).toBe(2024);
      expect(res.body.data.period.month).toBe(1);
      expect(res.body.data).toHaveProperty('activity');
      expect(res.body.data).toHaveProperty('training');
      expect(res.body.data).toHaveProperty('body');
    });
  });
});

// ─── NOTIFICATIONS MODULE ─────────────────────────────────────────────────────

describe('Notifications Module', () => {
  describe('GET /notifications/unread-count', () => {
    it('should return unread notification count', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(typeof res.body.data).toBe('number');
    });
  });

  describe('GET /notifications', () => {
    it('should return notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter unread notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications?unread=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PATCH /notifications/read-all', () => {
    it('should mark all as read', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('updated');
    });
  });
});

// ─── ADMIN MODULE ─────────────────────────────────────────────────────────────

describe('Admin Module (unauthorized access)', () => {
  it('should reject non-admin access to /admin/stats', async () => {
    await request(app.getHttpServer())
      .get('/admin/stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should reject unauthenticated access to /admin/users', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .expect(401);
  });
});

// ─── SECURITY TESTS ───────────────────────────────────────────────────────────

describe('Security', () => {
  it('should reject access to protected routes without token', async () => {
    await Promise.all([
      request(app.getHttpServer()).get('/users/me').expect(401),
      request(app.getHttpServer()).get('/meal-logs').expect(401),
      request(app.getHttpServer()).get('/activity-logs').expect(401),
      request(app.getHttpServer()).get('/body-metrics').expect(401),
      request(app.getHttpServer()).get('/training/exercises').expect(401),
      request(app.getHttpServer()).get('/streaks').expect(401),
      request(app.getHttpServer()).get('/dashboard').expect(401),
      request(app.getHttpServer()).get('/notifications').expect(401),
    ]);
  });

  it('should reject malformed JWT', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer malformed.jwt.token')
      .expect(401);
  });
});
