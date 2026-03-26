-- ============================================================
-- SEED DATA FOR EXERCISES TABLE
-- Generated: 2026-03-26
-- ============================================================

-- Clear old test data first
DELETE FROM exercises WHERE name IN ('Test Exercise', 'Chạy bộ', 'Đi bộ', 'Đẩy tạ (Push-ups)', 'Kéo xà (Pull-ups)', 'Squat', 'Plank', 'Tạ tay (Dumbbell Curls)', 'Burpees', 'Yoga');

-- Insert exercises
INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Chạy bộ',
    'Chạy trên đường hoặc máy chạy với tốc độ vừa phải',
    'moderate'::exercises_intensity_enum,
    'cardio'::exercises_primary_muscle_group_enum,
    10.5,
    'Chạy với tốc độ vừa phải trong 20-30 phút. Đảm bảo đụng gót chân trước.',
    NULL,
    NOW(),
    NOW()
  );

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Đi bộ',
    'Đi bộ bình thường để cải thiện sức khỏe tim mạch',
    'light'::exercises_intensity_enum,
    'cardio'::exercises_primary_muscle_group_enum,
    4.0,
    'Đi bộ bình thường, mục tiêu 10,000 bước mỗi ngày. Duy trì tốc độ ổn định.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Đẩy tạ (Push-ups)',
    'Bài tập cơ thể trọng lực tăng cường cơ ngực',
    'moderate'::exercises_intensity_enum,
    'chest'::exercises_primary_muscle_group_enum,
    6.0,
    'Nằm sấp, tay cách vai khoảng 60cm. Hạ cơ thể cho đến khi ngực gần chạm đất. Làm 3 set x 10-15 lần.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Kéo xà (Pull-ups)',
    'Bài tập lưng cơ bản sử dụng lực kéo',
    'heavy'::exercises_intensity_enum,
    'back'::exercises_primary_muscle_group_enum,
    7.5,
    'Nắm chắc xà, xoay tay ra ngoài. Kéo cơ thể lên cho đến khi cằm vượt qua xà. Làm 3 set x 5-8 lần.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Squat',
    'Bài tập chân toàn diện',
    'heavy'::exercises_intensity_enum,
    'legs'::exercises_primary_muscle_group_enum,
    8.0,
    'Đứng thẳng, chân cách nhau ngang vai. Hạ hông xuống như đang ngồi trên ghế. Làm 4 set x 8-10 lần.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Plank',
    'Bài tập core cơ bản',
    'moderate'::exercises_intensity_enum,
    'core'::exercises_primary_muscle_group_enum,
    5.5,
    'Nằm sấp, tay cơm chế gần bám lên mặt đất. Giữ cơ thể thẳng hàng từ đầu đến gót chân. Giữ 30-60 giây, 3 set.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Tạ tay (Dumbbell Curls)',
    'Bài tập tay cơ bản',
    'moderate'::exercises_intensity_enum,
    'arms'::exercises_primary_muscle_group_enum,
    6.0,
    'Đứng thẳng, cầm tạ tay ở hai bên. Uốn cánh tay lên mang tạ tới gần vai. Làm 3 set x 10-12 lần.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Burpees',
    'Bài tập toàn thân cường độ cao',
    'heavy'::exercises_intensity_enum,
    'full_body'::exercises_primary_muscle_group_enum,
    12.0,
    'Đứng thẳng, cúi xuống, đặt tay lên sàn. Nhảy chân ra phía sau. Nhảy chân lại phía trước. Nhảy lên cao. Làm 3 set x 10 lần.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

INSERT INTO exercises 
  (name, description, intensity, primary_muscle_group, met_value, instructions, video_url, "createdAt", "updatedAt")
VALUES
  (
    'Yoga',
    'Bài tập linh hoạt và cân bằng',
    'light'::exercises_intensity_enum,
    'full_body'::exercises_primary_muscle_group_enum,
    3.5,
    'Thực hiện các tư thế yoga cơ bản. Tập trung vào nhịp thở sâu. Làm 30-60 phút.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'EXERCISES SEEDED' as status, COUNT(*) as total_exercises FROM exercises;
