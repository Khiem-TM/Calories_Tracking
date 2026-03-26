-- ============================================================
-- SEED DATA - CALORIES TRACKER
-- Generated: 2026-03-26
-- ============================================================

-- ============================================================
-- 1. USERS - Tạo 3 users test
-- ============================================================
INSERT INTO users (email, password_hash, display_name, role, is_verified, is_active)
VALUES
  ('admin@caloriestracker.vn', '$2b$10$OG9Aw7X0v2wXcJ1K3mL9pe0L9f9g8h7i6j5k4l3m2n1o0p9q8r7s6', 'Admin User', 'admin', true, true),
  ('john@example.com', '$2b$10$OG9Aw7X0v2wXcJ1K3mL9pe0L9f9g8h7i6j5k4l3m2n1o0p9q8r7s6', 'John Doe', 'user', true, true),
  ('jane@example.com', '$2b$10$OG9Aw7X0v2wXcJ1K3mL9pe0L9f9g8h7i6j5k4l3m2n1o0p9q8r7s6', 'Jane Smith', 'user', true, true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. USER HEALTH PROFILES - Tạo health profile cho users
-- ============================================================
INSERT INTO user_health_profiles (user_id, birth_date, gender, height_cm, initial_weight_kg, activity_level, diet_type, food_allergies)
SELECT 
  id,
  '1990-05-15'::date,
  'male',
  175.0,
  75.0,
  'moderate',
  'normal',
  '{"peanuts", "shellfish"}'::text[]
FROM users WHERE email = 'john@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_health_profiles (user_id, birth_date, gender, height_cm, initial_weight_kg, activity_level, diet_type, food_allergies)
SELECT 
  id,
  '1995-08-22'::date,
  'female',
  162.0,
  58.0,
  'light',
  'vegetarian',
  '{"dairy"}'::text[]
FROM users WHERE email = 'jane@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 3. USER GOALS - Mục tiêu dinh dưỡng
-- ============================================================
INSERT INTO user_goals (user_id, goal_type, target_weight_kg, weekly_rate_kg, daily_calories_goal, protein_g, fat_g, carbs_g, fiber_g, is_active)
SELECT
  id,
  'lose_weight',
  70.0,
  0.5,
  2200,
  150.0,
  60.0,
  250.0,
  30.0,
  true
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO user_goals (user_id, goal_type, target_weight_kg, weekly_rate_kg, daily_calories_goal, protein_g, fat_g, carbs_g, fiber_g, is_active)
SELECT
  id,
  'maintain',
  58.0,
  0.0,
  1800,
  90.0,
  50.0,
  225.0,
  28.0,
  true
FROM users WHERE email = 'jane@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. FOODS - Thêm các food phổ biến
-- ============================================================
INSERT INTO foods (name, name_en, category, food_type, serving_size_g, serving_unit, 
                   calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, 
                   fiber_per_100g, sugar_per_100g, sodium_per_100g, is_verified, is_active)
VALUES
  -- Grains
  ('Cơm trắng luộc', 'Steamed White Rice', 'grain', 'dish', 150, 'bowl', 130, 2.7, 0.3, 28.2, 0.4, 0.0, 1.0, true, true),
  ('Bánh mì', 'Bread', 'grain', 'product', 30, 'slice', 265, 9.0, 3.3, 49.4, 2.7, 4.0, 580.0, true, true),
  ('Yến mạch', 'Oatmeal', 'grain', 'ingredient', 40, 'g', 389, 17.0, 7.0, 66.0, 10.0, 1.0, 2.0, true, true),
  
  -- Proteins
  ('Thịt gà ức', 'Chicken Breast', 'protein', 'ingredient', 100, 'g', 165, 31.0, 3.6, 0.0, 0.0, 0.0, 74.0, true, true),
  ('Cá hồi', 'Salmon', 'protein', 'ingredient', 100, 'g', 208, 20.0, 13.0, 0.0, 0.0, 0.0, 75.0, true, true),
  ('Trứng gà', 'Chicken Egg', 'protein', 'ingredient', 60, 'piece', 155, 13.0, 11.0, 1.1, 0.0, 1.1, 124.0, true, true),
  ('Tôm', 'Shrimp', 'protein', 'ingredient', 100, 'g', 99, 24.0, 0.3, 0.0, 0.0, 0.0, 224.0, true, true),
  
  -- Vegetables
  ('Rau muống', 'Water Spinach', 'vegetable', 'ingredient', 100, 'g', 19, 2.6, 0.2, 2.7, 2.1, 0.0, 113.0, true, true),
  ('Cà chua', 'Tomato', 'vegetable', 'ingredient', 100, 'g', 18, 0.9, 0.2, 3.9, 1.2, 2.6, 5.0, true, true),
  ('Bông cải xanh', 'Broccoli', 'vegetable', 'ingredient', 100, 'g', 34, 2.8, 0.4, 7.0, 2.4, 1.7, 64.0, true, true),
  
  -- Fruits
  ('Chuối', 'Banana', 'fruit', 'ingredient', 100, 'g', 89, 1.1, 0.3, 23.0, 2.6, 12.0, 1.0, true, true),
  ('Táo', 'Apple', 'fruit', 'ingredient', 100, 'g', 52, 0.3, 0.2, 14.0, 2.4, 10.0, 2.0, true, true),
  ('Dâu tây', 'Strawberry', 'fruit', 'ingredient', 100, 'g', 32, 0.8, 0.3, 7.7, 2.0, 4.9, 2.0, true, true),
  
  -- Dairy
  ('Sữa tươi', 'Fresh Milk', 'dairy', 'product', 200, 'ml', 42, 3.4, 1.0, 5.0, 0.0, 5.0, 44.0, true, true),
  ('Phô mai', 'Cheese', 'dairy', 'product', 30, 'g', 402, 25.0, 33.0, 1.3, 0.0, 0.7, 621.0, true, true),
  ('Sữa chua', 'Yogurt', 'dairy', 'product', 100, 'g', 59, 10.0, 0.4, 3.3, 0.0, 3.3, 75.0, true, true),
  
  -- Oils
  ('Dầu ô liu', 'Olive Oil', 'fat', 'ingredient', 15, 'tbsp', 884, 0.0, 100.0, 0.0, 0.0, 0.0, 2.0, true, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. EXERCISES - Thêm các bài tập
-- ============================================================
INSERT INTO exercises (name, name_en, description, muscle_group, equipment, difficulty, 
                       calories_per_min_light, calories_per_min_moderate, calories_per_min_heavy, is_active)
VALUES
  ('Chạy bộ', 'Running', 'Chạy trên đường hoặc máy chạy', 'cardio', 'treadmill', 'beginner', 8.5, 12.0, 16.0, true),
  ('Đi bộ', 'Walking', 'Đi bộ bình thường', 'cardio', NULL, 'beginner', 3.5, 5.0, 7.0, true),
  ('Đẩy tạ', 'Push Ups', 'Bài tập với trọng lượng cơ thể', 'chest', 'bodyweight', 'beginner', 5.0, 7.0, 10.0, true),
  ('Kéo xà', 'Pull Ups', 'Bài tập lưng cơ bản', 'back', 'bodyweight', 'intermediate', 6.0, 9.0, 12.0, true),
  ('Squat', 'Squat', 'Bài tập chân', 'legs', 'barbell', 'intermediate', 7.0, 10.0, 14.0, true),
  ('Deadlift', 'Deadlift', 'Bài tập nâng toàn thân', 'full_body', 'barbell', 'advanced', 8.0, 12.0, 16.0, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. MEAL LOGS - Tạo meal logs cho hôm nay
-- ============================================================
INSERT INTO meal_logs (user_id, log_date, meal_type, notes)
SELECT
  id,
  CURRENT_DATE,
  'breakfast',
  'Ăn sáng bình thường'
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO meal_logs (user_id, log_date, meal_type, notes)
SELECT
  id,
  CURRENT_DATE,
  'lunch',
  'Ăn trưa tại công ty'
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO meal_logs (user_id, log_date, meal_type, notes)
SELECT
  id,
  CURRENT_DATE,
  'breakfast',
  'Ăn sáng nhẹ'
FROM users WHERE email = 'jane@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. MEAL LOG ITEMS - Chi tiết các món ăn
-- ============================================================
INSERT INTO meal_log_items 
  (meal_log_id, food_id, quantity, serving_unit, quantity_in_grams,
   calories_snapshot, protein_snapshot, fat_snapshot, carbs_snapshot, fiber_snapshot, source)
SELECT
  ml.id,
  f.id,
  2,
  'bowl',
  300,
  390,
  8.1,
  0.9,
  84.6,
  1.2,
  'manual'
FROM meal_logs ml
JOIN users u ON ml.user_id = u.id
JOIN foods f ON f.name = 'Cơm trắng luộc'
WHERE u.email = 'john@example.com' AND ml.meal_type = 'breakfast'
ON CONFLICT DO NOTHING;

INSERT INTO meal_log_items 
  (meal_log_id, food_id, quantity, serving_unit, quantity_in_grams,
   calories_snapshot, protein_snapshot, fat_snapshot, carbs_snapshot, fiber_snapshot, source)
SELECT
  ml.id,
  f.id,
  1,
  'g',
  100,
  165,
  31.0,
  3.6,
  0.0,
  0.0,
  'manual'
FROM meal_logs ml
JOIN users u ON ml.user_id = u.id
JOIN foods f ON f.name = 'Thịt gà ức'
WHERE u.email = 'john@example.com' AND ml.meal_type = 'lunch'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. BODY METRICS - Đo lường cơ thể
-- ============================================================
INSERT INTO body_metrics (user_id, recorded_date, weight_kg, body_fat_pct, bmi, waist_cm, hip_cm, notes)
SELECT
  id,
  CURRENT_DATE - INTERVAL '5 days',
  75.5,
  22.0,
  24.6,
  85.0,
  95.0,
  'Đo lường hàng tuần'
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO body_metrics (user_id, recorded_date, weight_kg, body_fat_pct, bmi, waist_cm, hip_cm, notes)
SELECT
  id,
  CURRENT_DATE,
  75.0,
  21.8,
  24.4,
  84.5,
  94.5,
  'Đo lường hôm nay'
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO body_metrics (user_id, recorded_date, weight_kg, body_fat_pct, bmi, waist_cm, hip_cm, notes)
SELECT
  id,
  CURRENT_DATE,
  58.2,
  19.5,
  22.1,
  70.0,
  90.0,
  'Đo lường sáng nay'
FROM users WHERE email = 'jane@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. ACTIVITY LOGS - Hoạt động thể chất
-- ============================================================
INSERT INTO activity_logs (user_id, log_date, steps, calories_burned, active_minutes, water_ml, exercise_notes)
SELECT
  id,
  CURRENT_DATE,
  8500,
  350.0,
  45,
  2000,
  'Chạy bộ 5km sáng, đi bộ chiều'
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (user_id, log_date, steps, calories_burned, active_minutes, water_ml, exercise_notes)
SELECT
  id,
  CURRENT_DATE,
  6200,
  180.0,
  30,
  1500,
  'Yoga sáng 30 phút'
FROM users WHERE email = 'jane@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. WORKOUT SESSIONS - Buổi tập
-- ============================================================
INSERT INTO workout_sessions (user_id, exercise_id, session_date, intensity, duration_minutes, calories_burned, notes)
SELECT
  u.id,
  e.id,
  CURRENT_DATE - INTERVAL '1 day',
  'moderate',
  30,
  300.0,
  'Chạy bộ vừa phải'
FROM users u, exercises e
WHERE u.email = 'john@example.com' AND e.name = 'Chạy bộ'
ON CONFLICT DO NOTHING;

INSERT INTO workout_sessions (user_id, exercise_id, session_date, intensity, duration_minutes, calories_burned, notes)
SELECT
  u.id,
  e.id,
  CURRENT_DATE,
  'light',
  20,
  70.0,
  'Đi bộ nhẹ'
FROM users u, exercises e
WHERE u.email = 'jane@example.com' AND e.name = 'Đi bộ'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. TRAINING GOALS - Mục tiêu tập luyện
-- ============================================================
INSERT INTO training_goals (user_id, title, description, goal_type, target_value, target_unit, start_date, status)
SELECT
  id,
  'Giảm 5kg trong 3 tháng',
  'Kết hợp chạy bộ 3 lần/tuần và kiểm soát chế độ ăn',
  'lose_weight',
  5.0,
  'kg',
  CURRENT_DATE - INTERVAL '30 days',
  'active'
FROM users WHERE email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO training_goals (user_id, title, description, goal_type, target_value, target_unit, start_date, status)
SELECT
  id,
  'Tập yoga 4 lần/tuần',
  'Cải thiện sức khỏe tinh thần và linh hoạt',
  'improve_endurance',
  4.0,
  'sessions_per_week',
  CURRENT_DATE - INTERVAL '15 days',
  'active'
FROM users WHERE email = 'jane@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. STREAKS - Streak tracking
-- ============================================================
INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
SELECT
  id,
  'meal_log',
  5,
  7,
  CURRENT_DATE
FROM users WHERE email = 'john@example.com'
ON CONFLICT (user_id, streak_type) DO NOTHING;

INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
SELECT
  id,
  'body_check',
  2,
  3,
  CURRENT_DATE
FROM users WHERE email = 'john@example.com'
ON CONFLICT (user_id, streak_type) DO NOTHING;

INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
SELECT
  id,
  'activity',
  3,
  5,
  CURRENT_DATE
FROM users WHERE email = 'jane@example.com'
ON CONFLICT (user_id, streak_type) DO NOTHING;

-- ============================================================
-- 13. BLOG TAGS
-- ============================================================
INSERT INTO blog_tags (name, slug)
VALUES
  ('Dinh dưỡng', 'dinh-duong'),
  ('Tập luyện', 'tap-luyen'),
  ('Sức khỏe', 'suc-khoe'),
  ('Mẹo giảm cân', 'meo-giam-can')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. BLOG POSTS
-- ============================================================
INSERT INTO blog_posts (author_id, title, slug, content, summary, status, published_at)
SELECT
  id,
  '5 Thực phẩm tốt nhất cho cơ bắp',
  '5-thuc-pham-tot-nhat-cho-co-bap',
  '<h2>Giới thiệu</h2><p>Để xây dựng cơ bắp, bạn cần ăn những thực phẩm giàu protein...</p>',
  'Tìm hiểu về 5 thực phẩm giúp xây dựng cơ bắp hiệu quả nhất',
  'published',
  CURRENT_TIMESTAMP
FROM users WHERE email = 'admin@caloriestracker.vn'
ON CONFLICT DO NOTHING;

INSERT INTO blog_posts (author_id, title, slug, content, summary, status, published_at)
SELECT
  id,
  'Hướng dẫn chạy bộ cho người mới bắt đầu',
  'huong-dan-chay-bo-cho-nguoi-moi-bat-dau',
  '<h2>Bắt đầu từ đâu?</h2><p>Chạy bộ là một cách tuyệt vời để bắt đầu luyện tập...</p>',
  'Hướng dẫn chi tiết cho người mới muốn chạy bộ',
  'published',
  CURRENT_TIMESTAMP
FROM users WHERE email = 'admin@caloriestracker.vn'
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION - Kiểm tra dữ liệu
-- ============================================================
SELECT 'Users' as "Table", COUNT(*) FROM users
UNION ALL
SELECT 'User Health Profiles', COUNT(*) FROM user_health_profiles
UNION ALL
SELECT 'User Goals', COUNT(*) FROM user_goals
UNION ALL
SELECT 'Foods', COUNT(*) FROM foods
UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'Meal Logs', COUNT(*) FROM meal_logs
UNION ALL
SELECT 'Meal Log Items', COUNT(*) FROM meal_log_items
UNION ALL
SELECT 'Body Metrics', COUNT(*) FROM body_metrics
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs
UNION ALL
SELECT 'Workout Sessions', COUNT(*) FROM workout_sessions
UNION ALL
SELECT 'Training Goals', COUNT(*) FROM training_goals
UNION ALL
SELECT 'Streaks', COUNT(*) FROM streaks
UNION ALL
SELECT 'Blog Tags', COUNT(*) FROM blog_tags
UNION ALL
SELECT 'Blog Posts', COUNT(*) FROM blog_posts;
