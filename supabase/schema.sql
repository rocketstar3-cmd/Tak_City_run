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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO club_settings (id, club_name, tagline, theme_color)
VALUES (1, 'TAK City Run', 'วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดีไปด้วยกัน', '#FF5500')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Events Table (งานวิ่งแต่ละ Episode)
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
  schedule JSONB DEFAULT '[]'::jsonb,
  route_details JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Event Distances Table (ระยะทางแต่ละงาน)
CREATE TABLE IF NOT EXISTS event_distances (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  distance_km NUMERIC(5, 2) NOT NULL,
  quota INT DEFAULT 0,
  start_price NUMERIC(6, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Registrations Table (รายชื่อนักวิ่ง)
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  distance_id TEXT,
  bib_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT NOT NULL,
  emergency_contact TEXT,
  emergency_phone TEXT,
  shirt_size TEXT,
  medical_notes TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for speedy search on race day
CREATE INDEX IF NOT EXISTS idx_reg_phone ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_reg_bib ON registrations(bib_number);
CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(event_id);

-- 5. Create Shops & Activities Table (ร้านค้า & กิจกรรม)
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

-- 6. Create Sponsors Table (ผู้สนับสนุน)
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'general', -- 'main', 'gold', 'supporter'
  role TEXT,
  logo TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Past Galleries Table (ภาพประวัติงานเก่า)
CREATE TABLE IF NOT EXISTS event_gallery (
  id TEXT PRIMARY KEY,
  ep_number INT,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS) & Set Policies
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

-- Allow full access for community running club (works seamlessly with PIN & Supabase Auth)
CREATE POLICY "Full Access Settings" ON club_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Distances" ON event_distances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Registrations" ON registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Attractions" ON event_attractions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Sponsors" ON sponsors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Gallery" ON event_gallery FOR ALL USING (true) WITH CHECK (true);

-- Insert Initial Active Event (EP.02) if not already exists
INSERT INTO events (id, ep_number, title, subtitle, event_date, location_name, location_map_url, status, is_active, cover_image)
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
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_distances (id, event_id, label, distance_km, quota, start_price)
VALUES 
  ('dist-1', 'ep-02', 'Fun Run ชิลล์ริมปิง', 3.5, 250, 0),
  ('dist-2', 'ep-02', 'City Run ตะลุยเมืองเก่า', 5.8, 350, 0),
  ('dist-3', 'ep-02', 'Mini Challenge วิ่งข้ามสะพาน', 10.5, 200, 0)
ON CONFLICT (id) DO NOTHING;
