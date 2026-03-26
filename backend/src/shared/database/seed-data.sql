-- ============================================================
-- SEED DATA - TAILORED TO ACTUAL SCHEMA
-- Generated: 2026-03-26
-- ============================================================

-- ============================================================
-- 1. INSERT SAMPLE FOODS
-- ============================================================
INSERT INTO foods (name, name_en, category, food_type, serving_size_g, serving_unit, 
                   calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, 
                   fiber_per_100g, is_verified, is_active, created_at, updated_at)
SELECT 
  'Cơm trắng', 'White Rice', 'grain', 'ingredient', 150, 'bowl',
  130, 2.7, 0.3, 28.2, 0.4, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Cơm trắng')
UNION ALL
SELECT 
  'Thịt gà ức', 'Chicken Breast', 'protein', 'ingredient', 100, 'g',
  165, 31.0, 3.6, 0.0, 0.0, true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Thịt gà ức')
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
-- 2. INSERT SAMPLE EXERCISES (with actual schema)
-- ============================================================
INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions)
SELECT 
  'Chạy bộ', 'Chạy trên đường hoặc máy chạy', 'moderate'::exercises_intensity_enum, 'CARDIO'::exercises_primary_muscle_group_enum, 10.5, 
  'Chạy với tốc độ vừa phải trong 20-30 phút'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Chạy bộ')
UNION ALL
SELECT 
  'Đi bộ', 'Đi bộ bình thường', 'light'::exercises_intensity_enum, 'CARDIO'::exercises_primary_muscle_group_enum, 4.0,
  'Đi bộ bình thường, mục tiêu 10,000 bước mỗi ngày'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Đi bộ')
UNION ALL
SELECT 
  'Đẩy tạ', 'Bài tập với trọng lượng cơ thể', 'moderate'::exercises_intensity_enum, 'CHEST'::exercises_primary_muscle_group_enum, 6.0,
  'Làm 3 set, mỗi set 10-15 lần'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Đẩy tạ')
UNION ALL
SELECT 
  'Kéo xà', 'Bài tập lưng cơ bản', 'heavy'::exercises_intensity_enum, 'BACK'::exercises_primary_muscle_group_enum, 7.5,
  'Làm 3 set, mỗi set 5-8 lần'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Kéo xà')
UNION ALL
SELECT 
  'Squat', 'Bài tập chân', 'heavy'::exercises_intensity_enum, 'LEGS'::exercises_primary_muscle_group_enum, 8.0,
  'Làm 4 set, mỗi set 8-10 lần'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Squat');

-- ============================================================
-- SUMMARY - Show data counts
-- ============================================================
SELECT '========== SEED DATA SUMMARY ==========' as info;
SELECT 'Foods in database' as item, COUNT(*) as count FROM foods
UNION ALL
SELECT 'Exercises in database', COUNT(*) FROM exercises;
