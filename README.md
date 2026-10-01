# 🏃‍♂️ TAK City Run - เว็บไซต์ชมรมวิ่งเมืองตาก

ระบบเว็บสำหรับชมรมวิ่ง **TAK City Run** เพื่อเปิดรับสมัครนักวิ่งในแต่ละ Episode (ฟรี ไม่มีค่าใช้จ่าย), จัดการรูทวิ่ง, ร้านค้าชุมชน, กิจกรรม, ผู้สนับสนุน, คลังประวัติงานเก่า และระบบแอดมินสำหรับจัดการรายชื่อพร้อมจุดเช็คอินหน้างานด้วย QR Code

พัฒนาด้วยเทคโนโลยี **100% Free Tier**:
- **Frontend Hosting:** Cloudflare Pages (ฟรี ไม่จำกัดแบนด์วิดท์, SSL อัตโนมัติ)
- **Backend & Database:** Supabase (ฟรี PostgreSQL 500MB + Storage 1GB + Auth)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. หน้าบ้านสำหรับนักวิ่ง (Public Front)
- **Hero & Live EP:** แสดงชื่องานวิ่ง EP ปัจจุบัน พร้อมนาฬิกานับถอยหลัง (Countdown Timer)
- **ระบบลงทะเบียนวิ่งฟรี:** กรอกข้อมูล (ชื่อ, เบอร์โทร, ระยะทาง, ผู้ติดต่อฉุกเฉิน, โรคประจำตัว) ตรวจสอบเบอร์ซ้ำ และออกหมายเลข BIB อัตโนมัติ
- **บัตรนักวิ่งดิจิทัล (E-BIB):** แสดงบัตรพร้อม QR Code สแกนเช็คอินหน้างาน พร้อมปุ่มพิมพ์/บันทึกรูปภาพ
- **ค้นหาบัตร E-BIB:** ค้นหาบัตรของตนเองได้ตลอดเวลาด้วยเบอร์โทรศัพท์
- **แผนที่เส้นทางวิ่ง (Running Routes):** เลือกระยะทาง Fun Run 3.5K, City Run 5.8K, Mini 10.5K พร้อมจุดให้น้ำ จุดพยาบาล และไฮไลต์เมืองตาก
- **ตารางกิจกรรม (Schedule Timeline):** กำหนดการเวลาปล่อยตัวและกิจกรรม
- **ร้านค้าชุมชน & จุดบริการ (Local Market & Activities):** อาหารพื้นเมือง, กาแฟดอย, บูธนวดฟื้นฟู, ซุ้มถ่ายภาพ
- **คลังประวัติงานวิ่งเก่า (Past Episodes & Gallery):** สถิติผู้เข้าร่วม และแกลเลอรีภาพถ่ายย้อนหลัง
- **ผู้สนับสนุน (Sponsors):** แสดงโลโก้หน่วยงานและผู้สนับสนุนใจดี

### 2. ระบบจัดการหลังบ้านแอดมิน (Admin Portal)
- เข้าผ่านปุ่ม **"แอดมิน"** (รหัส PIN เริ่มต้น: `1234`)
- **จัดการรายชื่อนักวิ่ง:** ค้นหา, กรองระยะทาง, กรองสถานะเช็คอิน
- **ส่งออกข้อมูล (Export CSV):** รองรับภาษาไทยสมบูรณ์แบบ (UTF-8 BOM) เปิดใน Microsoft Excel ได้ทันทีโดยไม่เพี้ยน
- **จุดเช็คอินหน้างาน (Check-in Desk):** เช็คอินรวดเร็วด้วยการพิมพ์ BIB หรือสแกน QR Code จากบัตรนักวิ่ง
- **จัดการงานวิ่ง (Episodes):** เพิ่ม EP ใหม่, ตั้งวันเวลา, จุดปล่อยตัว, กำหนดโควตา และสลับ EP ที่จะแสดงหน้าเว็บ
- **ปรับแต่งสไตล์ & แบรนด์:** เปลี่ยนชื่อชมรม, สโลแกน, ลิงก์โลโก้, และเปลี่ยนโทนสีหลักของเว็บแบบ Real-time (Active Orange, Electric Cyan, Neon Lime, Sunset Gold, Hot Crimson)

---

## 🚀 วิธีการรันในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มเซิร์ฟเวอร์ทดสอบ
npm run dev
```

เปิดบราวเซอร์ไปที่ `http://localhost:5173`

> **หมายเหตุ:** ระบบมีระบบจำลองข้อมูล (Local Fallback) ทำงานได้ทันทีโดยไม่ต้องต่อฐานข้อมูลจริงสำหรับการทดสอบ

---

## 🗄️ การเชื่อมต่อ Supabase (Backend Free Tier)

1. สมัครบัญชีฟรีที่ [supabase.com](https://supabase.com) และสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase แล้วคัดลอกคำสั่งจากไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ไปวางแล้วกด **Run**
3. ไปที่ **Project Settings -> API** คัดลอก `Project URL` และ `anon public API key`
4. สร้างไฟล์ `.env` ที่โฟลเดอร์หลักของโปรเจกต์:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. รีสตาร์ทเซิร์ฟเวอร์ด้วย `npm run dev`

---

## ☁️ วิธีการ Deploy ขึ้น Cloudflare Pages (ฟรี 100%)

1. อัปโหลดโค้ดขึ้น GitHub Repository: `https://github.com/rocketstar3-cmd/Tak_City_run.git`
2. เข้าสู่ระบบ [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. ไปที่ **Workers & Pages** -> **Create application** -> เลือกแท็บ **Pages** -> **Connect to Git**
4. เลือก Repository `Tak_City_run`
5. กำหนดการ Build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. (ถ้าใช้ Supabase) ในส่วน **Environment variables** ให้เพิ่ม:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. กด **Save and Deploy** เว็บไซต์จะออนไลน์ทันทีภายใน 1 นาที พร้อม URL ฟรี เช่น `tak-city-run.pages.dev`
