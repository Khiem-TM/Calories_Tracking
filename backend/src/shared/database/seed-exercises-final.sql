-- ============================================================
-- SEED DATA FOR EXERCISES TABLE - SIMPLE VERSION
-- Generated: 2026-03-26
-- ============================================================

-- Delete old test data
DELETE FROM exercises WHERE name IN ('Test Exercise', 'Chạy bộ', 'Đi bộ', 'Đẩy tạ (Push-ups)', 'Kéo xà (Pull-ups)', 'Squat', 'Plank', 'Tạ tay (Dumbbell Curls)', 'Burpees', 'Yoga');

-- Insert exercises one by one
INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Chạy bộ', 'Chạy trên đường hoặc máy chạy', 'moderate'::exercises_intensity_enum, 'cardio'::exercises_primary_muscle_group_enum, 10.5, 'Chạy 20-30 phút', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Đi bộ', 'Đi bộ bình thường', 'light'::exercises_intensity_enum, 'cardio'::exercises_primary_muscle_group_enum, 4.0, 'Đi 30-60 phút', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Đẩy tạ', 'Push-ups cơ thể trọng lực', 'moderate'::exercises_intensity_enum, 'chest'::exercises_primary_muscle_group_enum, 6.0, '3 set x 10-15 lần', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Kéo xà', 'Pull-ups bài tập lưng', 'heavy'::exercises_intensity_enum, 'back'::exercises_primary_muscle_group_enum, 7.5, '3 set x 5-8 lần', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Squat', 'Bài tập chân toàn diện', 'heavy'::exercises_intensity_enum, 'legs'::exercises_primary_muscle_group_enum, 8.0, '4 set x 8-10 lần', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Plank', 'Bài tập core cơ bản', 'moderate'::exercises_intensity_enum, 'core'::exercises_primary_muscle_group_enum, 5.5, 'Giữ 30-60 giây, 3 set', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Tạ tay', 'Dumbbell curls bài tập tay', 'moderate'::exercises_intensity_enum, 'arms'::exercises_primary_muscle_group_enum, 6.0, '3 set x 10-12 lần', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Burpees', 'Bài tập toàn thân cường độ cao', 'heavy'::exercises_intensity_enum, 'full_body'::exercises_primary_muscle_group_enum, 12.0, '3 set x 10 lần', NOW(), NOW());

INSERT INTO exercises (name, description, intensity, primary_muscle_group, met_value, instructions, "createdAt", "updatedAt")
VALUES ('Yoga', 'Bài tập linh hoạt cân bằng', 'light'::exercises_intensity_enum, 'full_body'::exercises_primary_muscle_group_enum, 3.5, '30-60 phút', NOW(), NOW());

-- Verification
SELECT '✅ EXERCISES SEEDED' as status, COUNT(*) as total_exercises FROM exercises;
