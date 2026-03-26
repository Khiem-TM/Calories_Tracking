-- ============================================================
-- CALORIES TRACKER - PostgreSQL Schema
-- MVP Monolith | NestJS Architecture
-- Generated: 2026-03-21
-- Compatible: PostgreSQL 14+
-- Usage: Run entirely in DataGrip (Ctrl+Shift+F10)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP (nếu cần reset, uncomment block dưới)
-- ============================================================
-- DROP TABLE IF EXISTS training_goals       CASCADE;
-- DROP TABLE IF EXISTS workout_sessions     CASCADE;
-- DROP TABLE IF EXISTS exercises            CASCADE;
-- DROP TABLE IF EXISTS blog_post_tags       CASCADE;
-- DROP TABLE IF EXISTS blog_tags            CASCADE;
-- DROP TABLE IF EXISTS blog_posts           CASCADE;
-- DROP TABLE IF EXISTS food_user_favorites  CASCADE;
-- DROP TABLE IF EXISTS ai_scan_sessions     CASCADE;
-- DROP TABLE IF EXISTS streaks              CASCADE;
-- DROP TABLE IF EXISTS activity_logs        CASCADE;
-- DROP TABLE IF EXISTS body_progress_photos CASCADE;
-- DROP TABLE IF EXISTS body_metrics         CASCADE;
-- DROP TABLE IF EXISTS meal_log_items       CASCADE;
-- DROP TABLE IF EXISTS meal_logs            CASCADE;
-- DROP TABLE IF EXISTS food_barcodes        CASCADE;
-- DROP TABLE IF EXISTS foods                CASCADE;
-- DROP TABLE IF EXISTS refresh_tokens       CASCADE;
-- DROP TABLE IF EXISTS user_goals           CASCADE;
-- DROP TABLE IF EXISTS user_health_profiles CASCADE;
-- DROP TABLE IF EXISTS users                CASCADE;


-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255)  NOT NULL,
    password_hash   VARCHAR(255)  NULL,                          -- NULL nếu OAuth
    display_name    VARCHAR(100)  NOT NULL,
    avatar_url      TEXT          NULL,
    oauth_provider  VARCHAR(20)   NULL,                          -- 'google' | 'facebook'
    oauth_id        VARCHAR(255)  NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'user',       -- 'user' | 'admin'
    is_verified     BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email
        UNIQUE (email),

    CONSTRAINT uq_users_oauth
        UNIQUE (oauth_provider, oauth_id),                       -- partial: chỉ unique khi cả 2 NOT NULL

    CONSTRAINT chk_users_role
        CHECK (role IN ('user', 'admin')),

    CONSTRAINT chk_users_oauth_provider
        CHECK (oauth_provider IN ('google', 'facebook') OR oauth_provider IS NULL),

    -- Phải có password HOẶC oauth (không thể thiếu cả 2)
    CONSTRAINT chk_users_auth_method
        CHECK (password_hash IS NOT NULL OR oauth_provider IS NOT NULL)
);

CREATE INDEX idx_users_email        ON users (email);
CREATE INDEX idx_users_oauth        ON users (oauth_provider, oauth_id)
    WHERE oauth_provider IS NOT NULL;
CREATE INDEX idx_users_role         ON users (role);

COMMENT ON TABLE  users                IS 'Tài khoản người dùng, hỗ trợ cả email/password và OAuth2';
COMMENT ON COLUMN users.oauth_provider IS 'google | facebook | null';
COMMENT ON COLUMN users.role           IS 'user | admin';


-- ============================================================
-- 2. USER HEALTH PROFILES  (1-1 với users)
-- ============================================================
CREATE TABLE user_health_profiles (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL,
    birth_date          DATE            NOT NULL,
    gender              VARCHAR(10)     NOT NULL,
    height_cm           DECIMAL(5,1)    NOT NULL,
    initial_weight_kg   DECIMAL(5,1)    NOT NULL,               -- Cân nặng khi onboarding
    activity_level      VARCHAR(20)     NOT NULL,
    diet_type           VARCHAR(30)     NULL,
    food_allergies      TEXT[]          DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_health_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT uq_health_profiles_user
        UNIQUE (user_id),                                        -- Enforce 1-1

    CONSTRAINT chk_health_gender
        CHECK (gender IN ('male', 'female', 'other')),

    CONSTRAINT chk_health_activity
        CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),

    CONSTRAINT chk_health_diet
        CHECK (diet_type IN ('normal', 'vegetarian', 'vegan', 'keto', 'paleo') OR diet_type IS NULL),

    CONSTRAINT chk_health_height
        CHECK (height_cm BETWEEN 50 AND 300),

    CONSTRAINT chk_health_weight
        CHECK (initial_weight_kg BETWEEN 20 AND 500)
);

COMMENT ON TABLE  user_health_profiles                  IS 'Thông tin sức khỏe cơ bản, dùng để tính TDEE và BMR';
COMMENT ON COLUMN user_health_profiles.initial_weight_kg IS 'Cân nặng tại thời điểm onboarding, không thay đổi. Cân nặng hiện tại lấy từ body_metrics';
COMMENT ON COLUMN user_health_profiles.activity_level   IS 'sedentary|light|moderate|active|very_active';


-- ============================================================
-- 3. USER GOALS
-- ============================================================
CREATE TABLE user_goals (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL,
    goal_type           VARCHAR(20)     NOT NULL,
    target_weight_kg    DECIMAL(5,1)    NOT NULL,
    weekly_rate_kg      DECIMAL(3,2)    NOT NULL,               -- 0.25 ~ 1.0 kg/tuần
    daily_calories_goal INTEGER         NOT NULL,               -- Auto-calc từ TDEE
    protein_g           DECIMAL(6,1)    NOT NULL,
    fat_g               DECIMAL(6,1)    NOT NULL,
    carbs_g             DECIMAL(6,1)    NOT NULL,
    fiber_g             DECIMAL(6,1)    NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT chk_goals_type
        CHECK (goal_type IN ('lose_weight', 'gain_weight', 'maintain')),

    CONSTRAINT chk_goals_weekly_rate
        CHECK (weekly_rate_kg BETWEEN 0.1 AND 2.0),

    CONSTRAINT chk_goals_calories
        CHECK (daily_calories_goal BETWEEN 500 AND 10000)
);

CREATE INDEX idx_goals_user_id ON user_goals (user_id);
CREATE INDEX idx_goals_active  ON user_goals (user_id, is_active) WHERE is_active = TRUE;

-- Chỉ 1 goal active per user
CREATE UNIQUE INDEX uq_goals_one_active_per_user
    ON user_goals (user_id)
    WHERE is_active = TRUE;

COMMENT ON TABLE  user_goals              IS 'Mục tiêu dinh dưỡng. Chỉ 1 goal is_active=true mỗi user tại 1 thời điểm';
COMMENT ON COLUMN user_goals.weekly_rate_kg IS '0.25~1.0 kg/tuần. Nhân với 1100 kcal để ra deficit/surplus';


-- ============================================================
-- 4. REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID          NOT NULL,
    token_hash   VARCHAR(255)  NOT NULL,                        -- bcrypt hash
    device_info  TEXT          NULL,                            -- User-Agent
    expires_at   TIMESTAMPTZ   NOT NULL,                        -- NOW() + 30 days
    revoked_at   TIMESTAMPTZ   NULL,                            -- NULL = còn hiệu lực
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT uq_tokens_hash
        UNIQUE (token_hash)
);

CREATE INDEX idx_tokens_user_id   ON refresh_tokens (user_id);
CREATE INDEX idx_tokens_hash      ON refresh_tokens (token_hash);
CREATE INDEX idx_tokens_active    ON refresh_tokens (user_id, expires_at)
    WHERE revoked_at IS NULL;

COMMENT ON TABLE refresh_tokens IS 'Refresh token để cấp JWT mới. revoked_at IS NULL = còn hiệu lực. TTL 30 ngày';


-- ============================================================
-- 5. FOODS
-- ============================================================
CREATE TABLE foods (
    id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(255)    NOT NULL,
    name_en              VARCHAR(255)    NULL,
    brand                VARCHAR(100)    NULL,
    category             VARCHAR(50)     NULL,
    food_type            VARCHAR(20)     NOT NULL DEFAULT 'ingredient',
    serving_size_g       DECIMAL(7,2)    NOT NULL,              -- Khẩu phần mặc định (g)
    serving_unit         VARCHAR(50)     NOT NULL DEFAULT 'g',
    -- Nutrition chuẩn hóa về /100g
    calories_per_100g    DECIMAL(7,2)    NOT NULL,
    protein_per_100g     DECIMAL(7,2)    NOT NULL DEFAULT 0,
    fat_per_100g         DECIMAL(7,2)    NOT NULL DEFAULT 0,
    carbs_per_100g       DECIMAL(7,2)    NOT NULL DEFAULT 0,
    fiber_per_100g       DECIMAL(7,2)    NULL,
    sugar_per_100g       DECIMAL(7,2)    NULL,
    sodium_per_100g      DECIMAL(7,2)    NULL,                  -- mg/100g
    cholesterol_per_100g DECIMAL(7,2)    NULL,                  -- mg/100g
    image_urls           TEXT[]          NULL,
    -- Custom food
    is_custom            BOOLEAN         NOT NULL DEFAULT FALSE,
    created_by_user_id   UUID            NULL,
    is_verified          BOOLEAN         NOT NULL DEFAULT FALSE, -- Admin duyệt
    is_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_foods_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,

    CONSTRAINT chk_foods_type
        CHECK (food_type IN ('ingredient', 'dish', 'product')),

    CONSTRAINT chk_foods_calories
        CHECK (calories_per_100g >= 0),

    CONSTRAINT chk_foods_macros
        CHECK (protein_per_100g >= 0 AND fat_per_100g >= 0 AND carbs_per_100g >= 0),

    CONSTRAINT chk_foods_serving
        CHECK (serving_size_g > 0)
);

CREATE INDEX idx_foods_name        ON foods (name);
CREATE INDEX idx_foods_category    ON foods (category)  WHERE is_active = TRUE;
CREATE INDEX idx_foods_is_custom   ON foods (is_custom, created_by_user_id);
CREATE INDEX idx_foods_is_active   ON foods (is_active);

-- Full-text search index (tiếng Việt + tiếng Anh)
CREATE INDEX idx_foods_fts ON foods
    USING GIN (to_tsvector('simple', name || ' ' || COALESCE(name_en, '') || ' ' || COALESCE(brand, '')));

COMMENT ON TABLE  foods                IS 'Cơ sở dữ liệu thực phẩm. Nutrition chuẩn hóa về /100g để tính linh hoạt';
COMMENT ON COLUMN foods.serving_size_g IS 'Khẩu phần mặc định hiển thị cho user, không ảnh hưởng nutrition (đã /100g)';
COMMENT ON COLUMN foods.is_custom      IS 'TRUE = do user tạo, cần admin duyệt (is_verified) trước khi public';


-- ============================================================
-- 6. FOOD BARCODES
-- ============================================================
CREATE TABLE food_barcodes (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id      UUID          NOT NULL,
    barcode      VARCHAR(50)   NOT NULL,
    barcode_type VARCHAR(20)   NOT NULL DEFAULT 'EAN13',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_barcodes_food
        FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE CASCADE,

    CONSTRAINT uq_barcodes_barcode
        UNIQUE (barcode),

    CONSTRAINT chk_barcodes_type
        CHECK (barcode_type IN ('EAN13', 'UPC', 'QR', 'CODE128', 'CODE39'))
);

CREATE INDEX idx_barcodes_food_id ON food_barcodes (food_id);

COMMENT ON TABLE food_barcodes IS 'Mapping barcode/QR → food. 1 food có thể có nhiều barcode (repack, variants)';


-- ============================================================
-- 7. FOOD USER FAVORITES  (N-M: users × foods)
-- ============================================================
CREATE TABLE food_user_favorites (
    user_id    UUID          NOT NULL,
    food_id    UUID          NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_food_favorites
        PRIMARY KEY (user_id, food_id),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT fk_favorites_food
        FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE CASCADE
);

CREATE INDEX idx_favorites_user_id ON food_user_favorites (user_id);

COMMENT ON TABLE food_user_favorites IS 'Food bookmark/yêu thích của user. Dùng để gợi ý nhanh';


-- ============================================================
-- 8. MEAL LOGS  (header bữa ăn)
-- ============================================================
CREATE TABLE meal_logs (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID          NOT NULL,
    log_date   DATE          NOT NULL,
    meal_type  VARCHAR(20)   NOT NULL,
    notes      TEXT          NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_meal_logs_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT uq_meal_logs_one_per_meal
        UNIQUE (user_id, log_date, meal_type),

    CONSTRAINT chk_meal_logs_type
        CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

CREATE INDEX idx_meal_logs_user_date ON meal_logs (user_id, log_date DESC);
CREATE INDEX idx_meal_logs_date      ON meal_logs (log_date);

COMMENT ON TABLE  meal_logs           IS 'Header bữa ăn. 1 record = 1 bữa (breakfast/lunch/dinner/snack) mỗi ngày';
COMMENT ON COLUMN meal_logs.meal_type IS 'breakfast | lunch | dinner | snack';


-- ============================================================
-- 9. MEAL LOG ITEMS  (line items - nutrition snapshot)
-- ============================================================
CREATE TABLE meal_log_items (
    id                 UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_log_id        UUID            NOT NULL,
    food_id            UUID            NOT NULL,
    quantity           DECIMAL(7,2)    NOT NULL,                -- Số lượng theo serving_unit
    serving_unit       VARCHAR(50)     NOT NULL,
    quantity_in_grams  DECIMAL(8,2)    NOT NULL,                -- Quy đổi sang gram
    -- SNAPSHOT nutrition tại thời điểm log (tránh thay đổi khi food DB update)
    calories_snapshot  DECIMAL(8,2)    NOT NULL,
    protein_snapshot   DECIMAL(7,2)    NOT NULL,
    fat_snapshot       DECIMAL(7,2)    NOT NULL,
    carbs_snapshot     DECIMAL(7,2)    NOT NULL,
    fiber_snapshot     DECIMAL(7,2)    NULL,
    sugar_snapshot     DECIMAL(7,2)    NULL,
    sodium_snapshot    DECIMAL(7,2)    NULL,
    source             VARCHAR(20)     NOT NULL DEFAULT 'manual',
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_items_meal_log
        FOREIGN KEY (meal_log_id) REFERENCES meal_logs (id) ON DELETE CASCADE,

    CONSTRAINT fk_items_food
        FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE RESTRICT,

    CONSTRAINT chk_items_quantity
        CHECK (quantity > 0 AND quantity_in_grams > 0),

    CONSTRAINT chk_items_calories
        CHECK (calories_snapshot >= 0),

    CONSTRAINT chk_items_source
        CHECK (source IN ('manual', 'ai_scan', 'barcode', 'history', 'favorite'))
);

CREATE INDEX idx_items_meal_log_id ON meal_log_items (meal_log_id);
CREATE INDEX idx_items_food_id     ON meal_log_items (food_id);

COMMENT ON TABLE  meal_log_items               IS 'Chi tiết từng food trong bữa. Nutrition được SNAPSHOT tại thời điểm log';
COMMENT ON COLUMN meal_log_items.source        IS 'manual | ai_scan | barcode | history | favorite';
COMMENT ON COLUMN meal_log_items.quantity_in_grams IS 'Đã quy đổi về gram. calories = quantity_in_grams / 100 × calories_per_100g';


-- ============================================================
-- 10. BODY METRICS
-- ============================================================
CREATE TABLE body_metrics (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    recorded_date   DATE            NOT NULL,
    weight_kg       DECIMAL(5,1)    NULL,
    body_fat_pct    DECIMAL(4,1)    NULL,
    bmi             DECIMAL(4,1)    NULL,                       -- Auto-calc: weight / (height/100)^2
    waist_cm        DECIMAL(5,1)    NULL,
    hip_cm          DECIMAL(5,1)    NULL,
    chest_cm        DECIMAL(5,1)    NULL,
    neck_cm         DECIMAL(5,1)    NULL,
    notes           TEXT            NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_metrics_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT uq_metrics_one_per_day
        UNIQUE (user_id, recorded_date),

    CONSTRAINT chk_metrics_weight
        CHECK (weight_kg IS NULL OR weight_kg BETWEEN 20 AND 500),

    CONSTRAINT chk_metrics_body_fat
        CHECK (body_fat_pct IS NULL OR body_fat_pct BETWEEN 1 AND 70),

    CONSTRAINT chk_metrics_bmi
        CHECK (bmi IS NULL OR bmi BETWEEN 10 AND 80)
);

CREATE INDEX idx_metrics_user_date ON body_metrics (user_id, recorded_date DESC);

COMMENT ON TABLE  body_metrics              IS '1 record/user/ngày. Tất cả field nullable để user chỉ cần nhập những gì có';
COMMENT ON COLUMN body_metrics.bmi         IS 'Tự tính ở application layer: weight_kg / (height_cm/100)^2';
COMMENT ON COLUMN body_metrics.recorded_date IS 'UNIQUE per user. Upsert nếu nhập lại trong ngày';


-- ============================================================
-- 11. BODY PROGRESS PHOTOS
-- ============================================================
CREATE TABLE body_progress_photos (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL,
    body_metric_id  UUID          NULL,                         -- Link đến metrics hôm đó (optional)
    photo_url       TEXT          NOT NULL,                     -- S3 URL
    photo_type      VARCHAR(20)   NOT NULL DEFAULT 'front',
    taken_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_photos_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT fk_photos_metric
        FOREIGN KEY (body_metric_id) REFERENCES body_metrics (id) ON DELETE SET NULL,

    CONSTRAINT chk_photos_type
        CHECK (photo_type IN ('front', 'side', 'back'))
);

CREATE INDEX idx_photos_user_id  ON body_progress_photos (user_id, taken_at DESC);

COMMENT ON TABLE body_progress_photos IS 'Ảnh body progress lưu trên S3. Link optional đến body_metrics cùng ngày';


-- ============================================================
-- 12. ACTIVITY LOGS  (1 record/user/ngày - upsert)
-- ============================================================
CREATE TABLE activity_logs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    log_date        DATE            NOT NULL,
    steps           INTEGER         NOT NULL DEFAULT 0,
    calories_burned DECIMAL(7,2)    NOT NULL DEFAULT 0,
    active_minutes  INTEGER         NOT NULL DEFAULT 0,
    water_ml        INTEGER         NOT NULL DEFAULT 0,
    exercise_notes  TEXT            NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT uq_activity_one_per_day
        UNIQUE (user_id, log_date),

    CONSTRAINT chk_activity_steps
        CHECK (steps >= 0),

    CONSTRAINT chk_activity_calories
        CHECK (calories_burned >= 0),

    CONSTRAINT chk_activity_water
        CHECK (water_ml >= 0)
);

CREATE INDEX idx_activity_user_date ON activity_logs (user_id, log_date DESC);

COMMENT ON TABLE  activity_logs          IS '1 record/user/ngày. Upsert mỗi khi cập nhật trong ngày';
COMMENT ON COLUMN activity_logs.water_ml IS 'Tổng lượng nước uống trong ngày (ml)';


-- ============================================================
-- 13. AI SCAN SESSIONS
-- ============================================================
CREATE TABLE ai_scan_sessions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL,
    image_url       TEXT          NOT NULL,                     -- S3 URL ảnh đã upload
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending',
    meal_log_id     UUID          NULL,                         -- Link sau khi user confirm
    detected_items  JSONB         NOT NULL DEFAULT '[]',
    confirmed_items JSONB         NULL,
    model_version   VARCHAR(50)   NULL,
    processing_ms   INTEGER       NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ai_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT fk_ai_sessions_meal_log
        FOREIGN KEY (meal_log_id) REFERENCES meal_logs (id) ON DELETE SET NULL,

    CONSTRAINT chk_ai_status
        CHECK (status IN ('pending', 'processing', 'confirmed', 'rejected', 'partial'))
);

CREATE INDEX idx_ai_sessions_user_id ON ai_scan_sessions (user_id, created_at DESC);
CREATE INDEX idx_ai_sessions_status  ON ai_scan_sessions (status);

COMMENT ON TABLE  ai_scan_sessions               IS 'Kết quả AI food detection. User review rồi confirm → tạo meal_log';
COMMENT ON COLUMN ai_scan_sessions.detected_items IS 'JSONB: [{food_name, food_id, quantity_g, calories, confidence_score}]';
COMMENT ON COLUMN ai_scan_sessions.confirmed_items IS 'JSONB: items sau khi user chỉnh sửa và xác nhận';


-- ============================================================
-- 14. STREAKS
-- ============================================================
CREATE TABLE streaks (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID          NOT NULL,
    streak_type         VARCHAR(30)   NOT NULL,
    current_streak      INTEGER       NOT NULL DEFAULT 0,
    longest_streak      INTEGER       NOT NULL DEFAULT 0,
    last_activity_date  DATE          NULL,
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_streaks_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT uq_streaks_user_type
        UNIQUE (user_id, streak_type),

    CONSTRAINT chk_streaks_type
        CHECK (streak_type IN ('meal_log', 'body_check', 'activity')),

    CONSTRAINT chk_streaks_counts
        CHECK (current_streak >= 0 AND longest_streak >= 0)
);

CREATE INDEX idx_streaks_user_id ON streaks (user_id);

COMMENT ON TABLE streaks IS 'Streak tracking. Cập nhật qua cron job hàng đêm (00:05). 1 record/user/type';


-- ============================================================
-- 15. BLOG POSTS
-- ============================================================
CREATE TABLE blog_posts (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID          NOT NULL,
    title           VARCHAR(255)  NOT NULL,
    slug            VARCHAR(255)  NOT NULL,
    content         TEXT          NOT NULL,
    cover_image_url TEXT          NULL,
    summary         TEXT          NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMPTZ   NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_posts_author
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,

    CONSTRAINT uq_posts_slug
        UNIQUE (slug),

    CONSTRAINT chk_posts_status
        CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX idx_posts_status     ON blog_posts (status, published_at DESC);
CREATE INDEX idx_posts_author_id  ON blog_posts (author_id);
CREATE INDEX idx_posts_slug       ON blog_posts (slug);

COMMENT ON TABLE blog_posts IS 'Bài viết Blog do Admin quản lý';


-- ============================================================
-- 16. BLOG TAGS
-- ============================================================
CREATE TABLE blog_tags (
    id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50)  NOT NULL,
    slug VARCHAR(50)  NOT NULL,

    CONSTRAINT uq_tags_name UNIQUE (name),
    CONSTRAINT uq_tags_slug UNIQUE (slug)
);

COMMENT ON TABLE blog_tags IS 'Tags cho bài viết Blog';


-- ============================================================
-- 17. BLOG POST TAGS  (N-M pivot)
-- ============================================================
CREATE TABLE blog_post_tags (
    post_id UUID NOT NULL,
    tag_id  UUID NOT NULL,

    CONSTRAINT pk_post_tags
        PRIMARY KEY (post_id, tag_id),

    CONSTRAINT fk_post_tags_post
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,

    CONSTRAINT fk_post_tags_tag
        FOREIGN KEY (tag_id) REFERENCES blog_tags (id) ON DELETE CASCADE
);

CREATE INDEX idx_post_tags_tag_id ON blog_post_tags (tag_id);

COMMENT ON TABLE blog_post_tags IS 'Pivot table: blog_posts × blog_tags (N-M)';


-- ============================================================
-- 18. EXERCISES
-- ============================================================
CREATE TABLE exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255),
  description   TEXT,
  muscle_group  VARCHAR(50) NOT NULL,  -- 'chest'|'back'|'legs'|'shoulders'|'arms'|'core'|'cardio'|'full_body'
  equipment     VARCHAR(50),           -- 'barbell'|'dumbbell'|'machine'|'bodyweight'|'cable'|'kettlebell'|null
  difficulty    VARCHAR(20) NOT NULL,  -- 'beginner'|'intermediate'|'advanced'
  calories_per_min_light    DECIMAL(5,2),  -- kcal/min at light intensity
  calories_per_min_moderate DECIMAL(5,2),  -- kcal/min at moderate intensity
  calories_per_min_heavy    DECIMAL(5,2),  -- kcal/min at heavy intensity
  image_url     TEXT,
  video_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 19. WORKOUT SESSIONS
-- ============================================================
CREATE TABLE workout_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  session_date    DATE NOT NULL,
  intensity       VARCHAR(20) NOT NULL,   -- 'light'|'moderate'|'heavy'  (enum)
  duration_minutes INTEGER NOT NULL,       -- total minutes
  calories_burned DECIMAL(7,2),           -- auto-calculated from intensity + duration + user weight
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, session_date DESC);

-- ============================================================
-- 20. TRAINING GOALS
-- ============================================================
CREATE TABLE training_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,       -- e.g. "Lose 5kg in 3 months"
  description     TEXT,
  goal_type       VARCHAR(30) NOT NULL,         -- 'lose_weight'|'gain_muscle'|'improve_endurance'|'maintain'
  target_value    DECIMAL(7,2),                 -- e.g. target weight 65.0kg, or target sessions/week = 4
  target_unit     VARCHAR(20),                  -- 'kg'|'sessions_per_week'|'km'|'minutes'
  start_date      DATE NOT NULL,
  end_date        DATE,                          -- nullable = open-ended
  status          VARCHAR(20) DEFAULT 'active', -- 'active'|'completed'|'abandoned'
  completed_at    TIMESTAMPTZ,
  abandoned_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_training_goals_user_status ON training_goals(user_id, status);

-- ============================================================
-- SEED DATA MẪU (optional - bỏ comment để chạy)
-- ============================================================

-- Admin account (password: Admin@123 - thay bằng bcrypt hash thật)
-- INSERT INTO users (email, password_hash, display_name, role, is_verified)
-- VALUES ('admin@caloriestracker.vn', '$2b$12$placeholder_hash', 'Admin', 'admin', TRUE);

-- Một số food mẫu
-- INSERT INTO foods (name, name_en, category, food_type, serving_size_g, serving_unit,
--                    calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g,
--                    fiber_per_100g, sugar_per_100g, sodium_per_100g, is_verified)
-- VALUES
--   ('Cơm trắng', 'Steamed White Rice', 'grain', 'dish', 150, 'bowl', 130, 2.7, 0.3, 28.2, 0.4, 0, 1, TRUE),
--   ('Thịt gà ức', 'Chicken Breast', 'protein', 'ingredient', 100, 'g', 165, 31, 3.6, 0, 0, 0, 74, TRUE),
--   ('Trứng gà', 'Chicken Egg', 'protein', 'ingredient', 60, 'piece', 155, 13, 11, 1.1, 0, 1.1, 124, TRUE),
--   ('Rau muống', 'Water Spinach', 'vegetable', 'ingredient', 100, 'g', 19, 2.6, 0.2, 2.7, 2.1, 0, 113, TRUE),
--   ('Chuối', 'Banana', 'fruit', 'ingredient', 100, 'g', 89, 1.1, 0.3, 23, 2.6, 12, 1, TRUE),
--   ('Sữa tươi không đường', 'Fresh Milk Unsweetened', 'dairy', 'product', 200, 'ml', 42, 3.4, 1, 5, 0, 5, 44, TRUE),
--   ('Yến mạch', 'Oatmeal', 'grain', 'ingredient', 40, 'g', 389, 17, 7, 66, 10, 1, 2, TRUE),
--   ('Dầu ô liu', 'Olive Oil', 'fat', 'ingredient', 15, 'tbsp', 884, 0, 100, 0, 0, 0, 2, TRUE);


-- ============================================================
-- USEFUL VIEWS (optional - hỗ trợ query Dashboard)
-- ============================================================

-- View: tổng calories tiêu thụ theo ngày
CREATE OR REPLACE VIEW v_daily_calories_summary AS
SELECT
    ml.user_id,
    ml.log_date,
    ml.meal_type,
    COUNT(mli.id)                           AS item_count,
    COALESCE(SUM(mli.calories_snapshot), 0) AS total_calories,
    COALESCE(SUM(mli.protein_snapshot),  0) AS total_protein,
    COALESCE(SUM(mli.fat_snapshot),      0) AS total_fat,
    COALESCE(SUM(mli.carbs_snapshot),    0) AS total_carbs,
    COALESCE(SUM(mli.fiber_snapshot),    0) AS total_fiber,
    COALESCE(SUM(mli.sugar_snapshot),    0) AS total_sugar,
    COALESCE(SUM(mli.sodium_snapshot),   0) AS total_sodium
FROM meal_logs ml
LEFT JOIN meal_log_items mli ON mli.meal_log_id = ml.id
GROUP BY ml.user_id, ml.log_date, ml.meal_type;

COMMENT ON VIEW v_daily_calories_summary IS 'Tổng nutrition per bữa per ngày. Dùng cho Dashboard và Daily Summary API';


-- View: chỉ số cơ thể mới nhất của mỗi user
CREATE OR REPLACE VIEW v_latest_body_metrics AS
SELECT DISTINCT ON (user_id)
    user_id,
    recorded_date,
    weight_kg,
    body_fat_pct,
    bmi,
    waist_cm,
    hip_cm,
    chest_cm
FROM body_metrics
ORDER BY user_id, recorded_date DESC;

COMMENT ON VIEW v_latest_body_metrics IS 'Chỉ số cơ thể mới nhất per user. Dùng cho Dashboard Component 4';


-- ============================================================
-- VERIFY: Kiểm tra tất cả bảng đã tạo thành công
-- ============================================================
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name
       AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;