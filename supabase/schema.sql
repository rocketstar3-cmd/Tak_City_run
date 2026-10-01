-- ====================================================================
-- TAK CITY RUN - SUPABASE DATABASE SCHEMA (FREE TIER)
-- Copy and run this script in your Supabase project's SQL Editor
-- ====================================================================

-- 1. Create Club Settings Table
CREATE TABLE IF NOT EXISTS club_settings (
  id INT PRIMARY KEY DEFAULT 1,
  club_name TEXT NOT NULL DEFAULT 'TAK City Run',
  tagline TEXT DEFAULT 'วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดีไปด้วยกัน',
  description TEXT,
  logo_url TEXT DEFAULT '/tak-city-run-logo.svg',
  theme_color TEXT DEFAULT '#FF5500',
  facebook_url TEXT,
  line_url TEXT,
  admin_pin TEXT DEFAULT '1234',
  coupon_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE club_settings ADD COLUMN IF NOT EXISTS coupon_settings JSONB DEFAULT '{}'::jsonb;

-- Insert default settings row
INSERT INTO club_settings (id, club_name, tagline, theme_color)
VALUES (1, 'TAK City Run', 'วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดีไปด้วยกัน', '#FF5500')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Events Table (งานวิ่งแต่ละ Episode - Fix ระยะทางเดียวต่อ EP + แผนที่รูทวิ่ง)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  ep_number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  location_name TEXT,
  location_map_url TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'closed', 'completed'
  is_active BOOLEAN DEFAULT false,
  -- Single Distance
  distance_km NUMERIC(5, 2) DEFAULT 5.0,
  distance_label TEXT DEFAULT 'City Run 5K',
  quota INT DEFAULT 500,
  -- Route & Map
  route_image_url TEXT,
  route_description TEXT,
  water_stations INT DEFAULT 3,
  first_aid_points INT DEFAULT 2,
  elevation_gain TEXT DEFAULT '+12 ม. (ทางราบ 95%)',
  route_highlights JSONB DEFAULT '[]'::jsonb,
  -- Schedule & Stats
  schedule JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was already created
ALTER TABLE events ADD COLUMN IF NOT EXISTS distance_km NUMERIC(5, 2) DEFAULT 5.0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS distance_label TEXT DEFAULT 'City Run 5K';
ALTER TABLE events ADD COLUMN IF NOT EXISTS quota INT DEFAULT 500;
ALTER TABLE events ADD COLUMN IF NOT EXISTS route_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS route_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS water_stations INT DEFAULT 3;
ALTER TABLE events ADD COLUMN IF NOT EXISTS first_aid_points INT DEFAULT 2;
ALTER TABLE events ADD COLUMN IF NOT EXISTS elevation_gain TEXT DEFAULT '+12 ม. (ทางราบ 95%)';
ALTER TABLE events ADD COLUMN IF NOT EXISTS route_highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS stats JSONB;

-- 3. Create Registrations Table (รายชื่อนักวิ่ง)
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  bib_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT NOT NULL,
  emergency_contact TEXT,
  emergency_phone TEXT,
  shirt_size TEXT,
  medical_notes TEXT,
  distance_km NUMERIC(5, 2),
  distance_label TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for speedy search on race day
CREATE INDEX IF NOT EXISTS idx_reg_phone ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_reg_bib ON registrations(bib_number);
CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(event_id);

-- 4. Create Shops & Activities Table (ร้านค้า & กิจกรรม)
CREATE TABLE IF NOT EXISTS event_attractions (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'shop', 'activity', 'food'
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  image TEXT,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Sponsors Table (ผู้สนับสนุน)
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'general', -- 'main', 'gold', 'supporter'
  role TEXT,
  logo TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Past Galleries Table (ภาพประวัติงานเก่า)
CREATE TABLE IF NOT EXISTS event_gallery (
  id TEXT PRIMARY KEY,
  ep_number INT,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Admin Users Table (ระบบล็อกอินแอดมินแบบ Username & Password ไม่ใช้อีเมล)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- 'superadmin', 'admin', 'staff'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- บัญชีเริ่มต้น Superadmin: Username: admin | Password: 1234
INSERT INTO admin_users (id, username, password, display_name, role)
VALUES ('admin-root', 'admin', '1234', 'ผู้ดูแลระบบหลัก (Superadmin)', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 8. Row Level Security (RLS) Configuration
-- ทางเลือกที่ 1 (แนะนำสำหรับเว็บชมรมฟรี): ปิด RLS เพื่อให้เว็บแอปบันทึกข้อมูลได้ทันที 100% ไม่ติด Permission
ALTER TABLE IF EXISTS club_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_attractions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- ทางเลือกที่ 2 (หากต้องการเปิด RLS แบบ Permissive สำหรับ Anon Key):
-- ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_attractions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Full Access Settings" ON club_settings;
-- DROP POLICY IF EXISTS "Full Access Events" ON events;
-- DROP POLICY IF EXISTS "Full Access Registrations" ON registrations;
-- DROP POLICY IF EXISTS "Full Access Attractions" ON event_attractions;
-- DROP POLICY IF EXISTS "Full Access Sponsors" ON sponsors;
-- DROP POLICY IF EXISTS "Full Access Gallery" ON event_gallery;
-- CREATE POLICY "Full Access Settings" ON club_settings FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Full Access Events" ON events FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Full Access Registrations" ON registrations FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Full Access Attractions" ON event_attractions FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Full Access Sponsors" ON sponsors FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Full Access Gallery" ON event_gallery FOR ALL USING (true) WITH CHECK (true);

-- Insert Initial Active Event (EP.02) if not exists
INSERT INTO events (
  id, ep_number, title, subtitle, event_date, location_name, location_map_url, 
  status, is_active, cover_image, distance_km, distance_label, quota,
  route_image_url, route_description, water_stations, first_aid_points, elevation_gain,
  route_highlights
)
VALUES (
  'ep-02', 
  2, 
  'TAK City Run EP.02 - ปั่นปันรัก วิ่งรับลมหนาว ริมแม่น้ำปิง', 
  'วิ่งสัมผัสสายหมอกและลมหนาวเลียบสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี', 
  '2026-11-15 05:30:00+07', 
  'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก', 
  'https://maps.google.com/?q=Tak+Ping+River', 
  'open', 
  true, 
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
  5.8,
  'City Run 5.8K ตะลุยเมืองเก่าเลียบปิง',
  500,
  'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=1200&q=80',
  'เส้นทางไฮไลต์เลียบเขื่อนแม่น้ำปิง วิ่งผ่านจุดเช็คอินสะพานแขวน 200 ปี ลัดเลาะชมตึกเก่าโบราณเมืองตาก และศาลสมเด็จพระเจ้าตากสินมหาราช ทางราบเรียบ วิ่งสบาย',
  3,
  2,
  '+12 ม. (ทางราบ 95%)',
  '["จุดชมวิวสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี", "ศาลสมเด็จพระเจ้าตากสินมหาราช", "สตรีทอาร์ตและตรอกโบราณเมืองตาก", "ทางเลียบหาดทรายแม่น้ำปิง"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  distance_km = EXCLUDED.distance_km,
  distance_label = EXCLUDED.distance_label,
  quota = EXCLUDED.quota,
  route_image_url = EXCLUDED.route_image_url,
  route_description = EXCLUDED.route_description;
