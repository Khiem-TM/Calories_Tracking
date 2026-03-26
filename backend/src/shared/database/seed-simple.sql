-- ============================================================
-- SIMPLE SEED DATA - ADD TO EXISTING TABLES
-- Generated: 2026-03-26
-- ============================================================

-- ============================================================
-- 1. INSERT SAMPLE FOODS (skip if exists)
-- ============================================================
INSERT INTO foods (name, name_en, category, food_type, serving_size_g, serving_unit, 
                   calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, 
                   fiber_per_100g, is_verified, is_active, created_at, updated_at)
SELECT 
  'Cơm trắng', 'White Rice', 'grain', 'dish', 150, 'bowl',
  130, 2.7, 0.3, 28.2, 0.4, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Cơm trắng')
UNION ALL
SELECT 
  'Thịt gà', 'Chicken Breast', 'protein', 'ingredient', 100, 'g',
  165, 31.0, 3.6, 0.0, 0.0, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Thịt gà')
UNION ALL
SELECT 
  'Cá hồi', 'Salmon', 'protein', 'ingredient', 100, 'g',
  208, 20.0, 13.0, 0.0, 0.0, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Cá hồi')
UNION ALL
SELECT 
  'Trứng gà', 'Egg', 'protein', 'ingredient', 60, 'piece',
  155, 13.0, 11.0, 1.1, 0.0, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Trứng gà')
UNION ALL
SELECT 
  'Chuối', 'Banana', 'fruit', 'ingredient', 100, 'g',
  89, 1.1, 0.3, 23.0, 2.6, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Chuối')
UNION ALL
SELECT 
  'Cà chua', 'Tomato', 'vegetable', 'ingredient', 100, 'g',
  18, 0.9, 0.2, 3.9, 1.2, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Cà chua')
UNION ALL
SELECT 
  'Sữa tươi', 'Milk', 'dairy', 'product', 200, 'ml',
  42, 3.4, 1.0, 5.0, 0.0, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Sữa tươi')
UNION ALL
SELECT 
  'Bánh mì', 'Bread', 'grain', 'product', 30, 'slice',
  265, 9.0, 3.3, 49.4, 2.7, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Bánh mì');

-- ============================================================
-- 2. INSERT SAMPLE EXERCISES
-- ============================================================
INSERT INTO exercises (name, name_en, description, muscle_group, equipment, difficulty, 
                       calories_per_min_light, calories_per_min_moderate, calories_per_min_heavy, is_active, created_at)
SELECT 
  'Chạy bộ', 'Running', 'Chạy trên đường hoặc máy chạy', 'cardio', 'treadmill', 'beginner',
  8.5, 12.0, 16.0, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Chạy bộ')
UNION ALL
SELECT 
  'Đi bộ', 'Walking', 'Đi bộ bình thường', 'cardio', NULL, 'beginner',
  3.5, 5.0, 7.0, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Đi bộ')
UNION ALL
SELECT 
  'Đẩy tạ', 'Push Ups', 'Bài tập với trọng lượng cơ thể', 'chest', 'bodyweight', 'beginner',
  5.0, 7.0, 10.0, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Đẩy tạ')
UNION ALL
SELECT 
  'Kéo xà', 'Pull Ups', 'Bài tập lưng cơ bản', 'back', 'bodyweight', 'intermediate',
  6.0, 9.0, 12.0, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Kéo xà')
UNION ALL
SELECT 
  'Squat', 'Squat', 'Bài tập chân', 'legs', 'barbell', 'intermediate',
  7.0, 10.0, 14.0, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Squat');

-- ============================================================
-- 3. INSERT SAMPLE BLOG TAGS
-- ============================================================
INSERT INTO blog_tags (name, slug)
SELECT 'Dinh dưỡng', 'dinh-duong'
WHERE NOT EXISTS (SELECT 1 FROM blog_tags WHERE slug = 'dinh-duong')
UNION ALL
SELECT 'Tập luyện', 'tap-luyen'
WHERE NOT EXISTS (SELECT 1 FROM blog_tags WHERE slug = 'tap-luyen')
UNION ALL
SELECT 'Sức khỏe', 'suc-khoe'
WHERE NOT EXISTS (SELECT 1 FROM blog_tags WHERE slug = 'suc-khoe')
UNION ALL
SELECT 'Mẹo giảm cân', 'meo-giam-can'
WHERE NOT EXISTS (SELECT 1 FROM blog_tags WHERE slug = 'meo-giam-can');

-- ============================================================
-- SUMMARY - Show data counts
-- ============================================================
SELECT '========== SEED DATA SUMMARY ==========' as info;
SELECT 'Foods added' as item, COUNT(*) as count FROM foods WHERE is_active = true
UNION ALL
SELECT 'Exercises added', COUNT(*) FROM exercises WHERE is_active = true
UNION ALL
SELECT 'Blog Tags added', COUNT(*) FROM blog_tags
UNION ALL
SELECT 'Total Users', COUNT(*) FROM users;
