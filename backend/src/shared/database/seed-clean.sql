-- ============================================================
-- CLEAN & SEED DATA - CALORIES TRACKER
-- Generated: 2026-03-26
-- ============================================================

-- ============================================================
-- STEP 1: CLEAR OLD DATA (nếu cần)
-- ============================================================
TRUNCATE TABLE blog_post_tags CASCADE;
TRUNCATE TABLE blog_posts CASCADE;
TRUNCATE TABLE blog_tags CASCADE;
TRUNCATE TABLE training_goals CASCADE;
TRUNCATE TABLE workout_sessions CASCADE;
TRUNCATE TABLE streaks CASCADE;
TRUNCATE TABLE ai_scan_sessions CASCADE;
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE body_progress_photos CASCADE;
TRUNCATE TABLE body_metrics CASCADE;
TRUNCATE TABLE meal_log_items CASCADE;
TRUNCATE TABLE meal_logs CASCADE;
TRUNCATE TABLE food_user_favorites CASCADE;
TRUNCATE TABLE food_barcodes CASCADE;
TRUNCATE TABLE foods CASCADE;
TRUNCATE TABLE exercises CASCADE;
TRUNCATE TABLE user_goals CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE user_health_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================================
-- STEP 2: INSERT USERS (clear, simple data)
-- ============================================================
INSERT INTO users (id, email, password_hash, display_name, role, is_verified, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@caloriestracker.vn', '$2b$10$OG9Aw7X0v2wXcJ1K3mL9pe0L9f9g8h7i6j5k4l3m2n1o0p9q8r7s6', 'Admin User', 'admin', true, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'john@example.com', '$2b$10$OG9Aw7X0v2wXcJ1K3mL9pe0L9f9g8h7i6j5k4l3m2n1o0p9q8r7s6', 'John Doe', 'user', true, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'jane@example.com', '$2b$10$OG9Aw7X0v2wXcJ1K3mL9pe0L9f9g8h7i6j5k4l3m2n1o0p9q8r7s6', 'Jane Smith', 'user', true, true, NOW(), NOW());

-- ============================================================
-- STEP 3: INSERT USER HEALTH PROFILES
-- ============================================================
INSERT INTO user_health_profiles (id, user_id, birth_date, gender, height_cm, initial_weight_kg, activity_level, diet_type, food_allergies, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '1990-05-15'::date, 'male', 175.0, 75.0, 'moderate', 'normal', '{"peanuts", "shellfish"}'::text[], NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '1995-08-22'::date, 'female', 162.0, 58.0, 'light', 'vegetarian', '{"dairy"}'::text[], NOW(), NOW());

-- ============================================================
-- STEP 4: INSERT USER GOALS
-- ============================================================
INSERT INTO user_goals (id, user_id, goal_type, target_weight_kg, weekly_rate_kg, daily_calories_goal, protein_g, fat_g, carbs_g, fiber_g, is_active, created_at)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'lose_weight', 70.0, 0.5, 2200, 150.0, 60.0, 250.0, 30.0, true, NOW()),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'maintain', 58.0, 0.0, 1800, 90.0, 50.0, 225.0, 28.0, true, NOW());

-- ============================================================
-- STEP 5: INSERT FOODS
-- ============================================================
INSERT INTO foods (id, name, name_en, category, food_type, serving_size_g, serving_unit, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, is_verified, is_active, created_at, updated_at)
VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Cơm trắng luộc', 'Steamed White Rice', 'grain', 'dish', 150, 'bowl', 130, 2.7, 0.3, 28.2, 0.4, 0.0, 1.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440002', 'Bánh mì', 'Bread', 'grain', 'product', 30, 'slice', 265, 9.0, 3.3, 49.4, 2.7, 4.0, 580.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440003', 'Thịt gà ức', 'Chicken Breast', 'protein', 'ingredient', 100, 'g', 165, 31.0, 3.6, 0.0, 0.0, 0.0, 74.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440004', 'Cá hồi', 'Salmon', 'protein', 'ingredient', 100, 'g', 208, 20.0, 13.0, 0.0, 0.0, 0.0, 75.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440005', 'Trứng gà', 'Chicken Egg', 'protein', 'ingredient', 60, 'piece', 155, 13.0, 11.0, 1.1, 0.0, 1.1, 124.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440006', 'Cà chua', 'Tomato', 'vegetable', 'ingredient', 100, 'g', 18, 0.9, 0.2, 3.9, 1.2, 2.6, 5.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440007', 'Chuối', 'Banana', 'fruit', 'ingredient', 100, 'g', 89, 1.1, 0.3, 23.0, 2.6, 12.0, 1.0, true, true, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440008', 'Sữa tươi', 'Fresh Milk', 'dairy', 'product', 200, 'ml', 42, 3.4, 1.0, 5.0, 0.0, 5.0, 44.0, true, true, NOW(), NOW());

-- ============================================================
-- STEP 6: INSERT EXERCISES
-- ============================================================
INSERT INTO exercises (id, name, name_en, description, muscle_group, equipment, difficulty, calories_per_min_light, calories_per_min_moderate, calories_per_min_heavy, is_active, created_at)
VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 'Chạy bộ', 'Running', 'Chạy trên đường hoặc máy chạy', 'cardio', 'treadmill', 'beginner', 8.5, 12.0, 16.0, true, NOW()),
  ('950e8400-e29b-41d4-a716-446655440002', 'Đi bộ', 'Walking', 'Đi bộ bình thường', 'cardio', NULL, 'beginner', 3.5, 5.0, 7.0, true, NOW()),
  ('950e8400-e29b-41d4-a716-446655440003', 'Đẩy tạ', 'Push Ups', 'Bài tập với trọng lượng cơ thể', 'chest', 'bodyweight', 'beginner', 5.0, 7.0, 10.0, true, NOW()),
  ('950e8400-e29b-41d4-a716-446655440004', 'Squat', 'Squat', 'Bài tập chân', 'legs', 'barbell', 'intermediate', 7.0, 10.0, 14.0, true, NOW());

-- ============================================================
-- STEP 7: INSERT MEAL LOGS
-- ============================================================
INSERT INTO meal_logs (id, user_id, log_date, meal_type, notes, created_at, updated_at)
VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'breakfast', 'Ăn sáng bình thường', NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'lunch', 'Ăn trưa tại công ty', NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 'breakfast', 'Ăn sáng nhẹ', NOW(), NOW());

-- ============================================================
-- STEP 8: INSERT MEAL LOG ITEMS
-- ============================================================
INSERT INTO meal_log_items (id, meal_log_id, food_id, quantity, serving_unit, quantity_in_grams, calories_snapshot, protein_snapshot, fat_snapshot, carbs_snapshot, fiber_snapshot, source, created_at)
VALUES
  ('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 2, 'bowl', 300, 390, 8.1, 0.9, 84.6, 1.2, 'manual', NOW()),
  ('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440003', 1, 'g', 100, 165, 31.0, 3.6, 0.0, 0.0, 'manual', NOW());

-- ============================================================
-- STEP 9: INSERT BODY METRICS
-- ============================================================
INSERT INTO body_metrics (id, user_id, recorded_date, weight_kg, body_fat_pct, bmi, waist_cm, hip_cm, notes, created_at)
VALUES
  ('c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '5 days', 75.5, 22.0, 24.6, 85.0, 95.0, 'Đo lường hàng tuần', NOW()),
  ('c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 75.0, 21.8, 24.4, 84.5, 94.5, 'Đo lường hôm nay', NOW()),
  ('c50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 58.2, 19.5, 22.1, 70.0, 90.0, 'Đo lường sáng nay', NOW());

-- ============================================================
-- STEP 10: INSERT ACTIVITY LOGS
-- ============================================================
INSERT INTO activity_logs (id, user_id, log_date, steps, calories_burned, active_minutes, water_ml, exercise_notes, created_at, updated_at)
VALUES
  ('d50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 8500, 350.0, 45, 2000, 'Chạy bộ 5km sáng, đi bộ chiều', NOW(), NOW()),
  ('d50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 6200, 180.0, 30, 1500, 'Yoga sáng 30 phút', NOW(), NOW());

-- ============================================================
-- STEP 11: INSERT WORKOUT SESSIONS
-- ============================================================
INSERT INTO workout_sessions (id, user_id, exercise_id, session_date, intensity, duration_minutes, calories_burned, notes, created_at, updated_at)
VALUES
  ('e50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'moderate', 30, 300.0, 'Chạy bộ vừa phải', NOW(), NOW()),
  ('e50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'light', 20, 70.0, 'Đi bộ nhẹ', NOW(), NOW());

-- ============================================================
-- STEP 12: INSERT TRAINING GOALS
-- ============================================================
INSERT INTO training_goals (id, user_id, title, description, goal_type, target_value, target_unit, start_date, status, created_at, updated_at)
VALUES
  ('f50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Giảm 5kg trong 3 tháng', 'Kết hợp chạy bộ 3 lần/tuần và kiểm soát chế độ ăn', 'lose_weight', 5.0, 'kg', CURRENT_DATE - INTERVAL '30 days', 'active', NOW(), NOW()),
  ('f50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Tập yoga 4 lần/tuần', 'Cải thiện sức khỏe tinh thần', 'improve_endurance', 4.0, 'sessions_per_week', CURRENT_DATE - INTERVAL '15 days', 'active', NOW(), NOW());

-- ============================================================
-- STEP 13: INSERT STREAKS
-- ============================================================
INSERT INTO streaks (id, user_id, streak_type, current_streak, longest_streak, last_activity_date, updated_at)
VALUES
  ('g50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'meal_log', 5, 7, CURRENT_DATE, NOW()),
  ('g50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'body_check', 2, 3, CURRENT_DATE, NOW()),
  ('g50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'activity', 3, 5, CURRENT_DATE, NOW());

-- ============================================================
-- STEP 14: INSERT BLOG TAGS
-- ============================================================
INSERT INTO blog_tags (id, name, slug)
VALUES
  ('h50e8400-e29b-41d4-a716-446655440001', 'Dinh dưỡng', 'dinh-duong'),
  ('h50e8400-e29b-41d4-a716-446655440002', 'Tập luyện', 'tap-luyen'),
  ('h50e8400-e29b-41d4-a716-446655440003', 'Sức khỏe', 'suc-khoe');

-- ============================================================
-- STEP 15: INSERT BLOG POSTS
-- ============================================================
INSERT INTO blog_posts (id, author_id, title, slug, content, summary, status, published_at, created_at, updated_at)
VALUES
  ('i50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '5 Thực phẩm tốt nhất cho cơ bắp', '5-thuc-pham-tot-nhat-cho-co-bap', '<h2>Giới thiệu</h2><p>Để xây dựng cơ bắp, bạn cần ăn những thực phẩm giàu protein...</p>', 'Tìm hiểu 5 thực phẩm giúp xây dựng cơ bắp', 'published', NOW(), NOW(), NOW()),
  ('i50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Hướng dẫn chạy bộ cho người mới', 'huong-dan-chay-bo', '<h2>Bắt đầu từ đâu?</h2><p>Chạy bộ là cách tuyệt vời để bắt đầu...</p>', 'Hướng dẫn chi tiết cho người mới', 'published', NOW(), NOW(), NOW());

-- ============================================================
-- VERIFICATION - Show data summary
-- ============================================================
SELECT '✅ DATA SEED COMPLETE' as status;

SELECT 'Users' as table_name, COUNT(*) as records FROM users
UNION ALL SELECT 'Health Profiles', COUNT(*) FROM user_health_profiles
UNION ALL SELECT 'User Goals', COUNT(*) FROM user_goals
UNION ALL SELECT 'Foods', COUNT(*) FROM foods
UNION ALL SELECT 'Exercises', COUNT(*) FROM exercises
UNION ALL SELECT 'Meal Logs', COUNT(*) FROM meal_logs
UNION ALL SELECT 'Meal Items', COUNT(*) FROM meal_log_items
UNION ALL SELECT 'Body Metrics', COUNT(*) FROM body_metrics
UNION ALL SELECT 'Activity Logs', COUNT(*) FROM activity_logs
UNION ALL SELECT 'Workout Sessions', COUNT(*) FROM workout_sessions
UNION ALL SELECT 'Training Goals', COUNT(*) FROM training_goals
UNION ALL SELECT 'Streaks', COUNT(*) FROM streaks
UNION ALL SELECT 'Blog Tags', COUNT(*) FROM blog_tags
UNION ALL SELECT 'Blog Posts', COUNT(*) FROM blog_posts
ORDER BY records DESC;
