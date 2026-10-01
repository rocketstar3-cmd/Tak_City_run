// Initial mock data & local store for TAK City Run
export const initialClubSettings = {
  clubName: "TAK City Run",
  tagline: "วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดีไปด้วยกัน",
  description: "ชมรมวิ่ง TAK City Run จัดตั้งขึ้นเพื่อส่งเสริมสุขภาพและกระตุ้นการท่องเที่ยวในจังหวัดตาก โดยการจัดกิจกรรมวิ่งฟรี ไม่มีค่าใช้จ่ายในแต่ละ Episode พร้อมแนะนำร้านค้าและวิถีชีวิตท้องถิ่น",
  logoUrl: "/tak-city-run-logo.svg",
  themeColor: "#FF5500", // Vibrant Sporty Orange
  facebookUrl: "https://facebook.com",
  lineUrl: "https://line.me",
  adminPin: "1234" // Default quick access PIN for demo/club staff
};

export const initialEvents = [
  {
    id: "ep-02",
    epNumber: 2,
    title: "TAK City Run EP.02 - ปั่นปันรัก วิ่งรับลมหนาว ริมแม่น้ำปิง",
    subtitle: "วิ่งสัมผัสสายหมอกและลมหนาวเลียบสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี",
    eventDate: "2026-11-15T05:30:00",
    registrationStart: "2026-10-01T00:00:00",
    registrationEnd: "2026-11-10T23:59:59",
    locationName: "ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก",
    locationMapUrl: "https://maps.google.com/?q=Tak+Ping+River",
    status: "open", // 'open', 'closed', 'completed'
    isActive: true, // The currently active / promoted event
    coverImage: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80",
    distances: [
      { id: "dist-1", label: "Fun Run ชิลล์ริมปิง", distanceKm: 3.5, quota: 250, startPrice: 0 },
      { id: "dist-2", label: "City Run ตะลุยเมืองเก่า", distanceKm: 5.8, quota: 350, startPrice: 0 },
      { id: "dist-3", label: "Mini Challenge วิ่งข้ามสะพาน", distanceKm: 10.5, quota: 200, startPrice: 0 }
    ],
    schedule: [
      { time: "05:00 น.", title: "ลงทะเบียน & รับสติกเกอร์หมายเลข BIB หน้างาน" },
      { time: "05:30 น.", title: "รวมพล กิจกรรม Warm-up ยืดเหยียดกล้ามเนื้อโดยโค้ชชมรม" },
      { time: "05:45 น.", title: "ชี้แจงเส้นทางวิ่ง จุดให้น้ำ และข้อควรระวัง" },
      { time: "06:00 น.", title: "ปล่อยตัวระยะ 10.5K และตามด้วยระยะ 5.8K / 3.5K" },
      { time: "07:30 น.", title: "Finish Line! ลิ้มรสอาหารเช้าชุมชน & ถ่ายรูปเช็คอิน" },
      { time: "08:15 น.", title: "กิจกรรมมอบของที่ระลึก & จับรางวัลจากผู้สนับสนุน" }
    ],
    routeDetails: [
      {
        distanceId: "dist-1",
        name: "Fun Run 3.5K (ครอบครัว & สายเดินชิลล์)",
        description: "เส้นทางเลียบเขื่อนแม่น้ำปิง ทางราบ วิ่งง่าย เหมาะสำหรับทุกเพศทุกวัย ชมวิวเกาะกลางน้ำปิง",
        waterStations: 2,
        firstAidPoints: 2,
        highlights: ["วิวสะพานแขวน 200 ปี", "จุดชมวิวดอยแม่สอดไกลๆ", "สวนสาธารณะหนองมณีบรรพต"]
      },
      {
        distanceId: "dist-2",
        name: "City Run 5.8K (สายซิตี้ สัมผัสเมืองเก่า)",
        description: "วิ่งลัดเลาะผ่านย่านการค้าเมืองเก่าตาก แวะถ่ายรูปตึกโบราณและศาลสมเด็จพระเจ้าตากสินมหาราช",
        waterStations: 3,
        firstAidPoints: 2,
        highlights: ["ศาลสมเด็จพระเจ้าตากสินมหาราช", "สตรีทอาร์ตเมืองตาก", "ตรอกโบราณริมน้ำ"]
      },
      {
        distanceId: "dist-3",
        name: "Mini Challenge 10.5K (สายฟูลเพซ ข้ามแม่น้ำปิง)",
        description: "เส้นทางไฮไลต์ข้ามสะพานกิตติขจร วิ่งวนรอบสวนหลวงและแนวตลิ่งแม่น้ำปิง สัมผัสอากาศยามเช้าเต็มปอด",
        waterStations: 4,
        firstAidPoints: 3,
        highlights: ["สะพานกิตติขจร", "จุดชมวิวพระอาทิตย์ขึ้นเหนือน้ำปิง", "เส้นทางเลียบหาดทรายแม่น้ำปิง"]
      }
    ]
  },
  {
    id: "ep-01",
    epNumber: 1,
    title: "TAK City Run EP.01 - วิ่งรับอรุณ รำลึกสมเด็จพระเจ้าตากสิน",
    subtitle: "ก้าวแรกของพวกเรา รวมพลังคนรักการวิ่งเมืองตากกว่า 500 ชีวิต",
    eventDate: "2026-08-12T05:45:00",
    registrationStart: "2026-07-01T00:00:00",
    registrationEnd: "2026-08-05T23:59:59",
    locationName: "ลานหน้าศาลสมเด็จพระเจ้าตากสินมหาราช จ.ตาก",
    locationMapUrl: "https://maps.google.com/?q=Tak+King+Taksin+Shrine",
    status: "completed",
    isActive: false,
    coverImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
    distances: [
      { id: "dist-ep1-1", label: "Fun Run 4K", distanceKm: 4.0, quota: 300, startPrice: 0 },
      { id: "dist-ep1-2", label: "Mini Run 8K", distanceKm: 8.0, quota: 300, startPrice: 0 }
    ],
    stats: {
      runnersJoined: 524,
      totalKilometers: 3120,
      photosTaken: "1,200+"
    }
  }
];

export const initialRegistrations = [
  {
    id: "reg-001",
    eventId: "ep-02",
    distanceId: "dist-2",
    bibNumber: "TK02-001",
    fullName: "กิตติศักดิ์ พรหมมินทร์",
    nickname: "ต้อม",
    phone: "0812345678",
    emergencyContact: "สมศรี พรหมมินทร์ (ภรรยา)",
    emergencyPhone: "0898765432",
    shirtSize: "L",
    medicalNotes: "ไม่มีโรคประจำตัว",
    checkedIn: true,
    checkedInAt: "2026-10-01T08:00:00",
    createdAt: "2026-10-01T07:15:00"
  },
  {
    id: "reg-002",
    eventId: "ep-02",
    distanceId: "dist-3",
    bibNumber: "TK02-002",
    fullName: "วรรณภา สุขสวัสดิ์",
    nickname: "ฝน",
    phone: "0891112233",
    emergencyContact: "วิชัย สุขสวัสดิ์ (พี่ชาย)",
    emergencyPhone: "0823334455",
    shirtSize: "M",
    medicalNotes: "แพ้อาหารทะเล",
    checkedIn: false,
    checkedInAt: null,
    createdAt: "2026-10-01T07:30:00"
  },
  {
    id: "reg-003",
    eventId: "ep-02",
    distanceId: "dist-1",
    bibNumber: "TK02-003",
    fullName: "ธนากร รุ่งเรืองพัฒนา",
    nickname: "บาส",
    phone: "0867778899",
    emergencyContact: "นารี รุ่งเรืองพัฒนา (มารดา)",
    emergencyPhone: "0861110099",
    shirtSize: "XL",
    medicalNotes: "-",
    checkedIn: false,
    checkedInAt: null,
    createdAt: "2026-10-01T08:20:00"
  }
];

export const initialShopsAndActivities = [
  {
    id: "shop-1",
    eventId: "ep-02",
    type: "food",
    name: "ร้านเตี๋ยวตาก โบราณหน้าค่าย",
    category: "อาหารพื้นเมือง",
    description: "ก๋วยเตี๋ยวโบราณรสกลมกล่อม เติมพลังนักวิ่งหลังเข้าเส้นชัย",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    badge: "เมนูเติมพลังฟรี / สิทธิพิเศษนักวิ่ง"
  },
  {
    id: "shop-2",
    eventId: "ep-02",
    type: "shop",
    name: "กาแฟดอยแม่ระมาด ชุมชนเมืองตาก",
    category: "เครื่องดื่ม & กาแฟดริป",
    description: "กาแฟคั่วบดสดใหม่จากเกษตรกรชาวดอย จิบกาแฟอุ่นๆ ริมปิงยามเช้า",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
    badge: "ลด 10% เมื่อโชว์ E-BIB"
  },
  {
    id: "shop-3",
    eventId: "ep-02",
    type: "activity",
    name: "บูธฟื้นฟูกล้ามเนื้อ & นวดแผนไทยตาก",
    category: "สุขภาพ & ฟื้นฟู",
    description: "ทีมนวดผ่อนคลายกล้ามเนื้อขาและน่อง สำหรับนักวิ่งระยะ 5.8K และ 10.5K",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    badge: "บริการฟรีโดยชมรม"
  },
  {
    id: "shop-4",
    eventId: "ep-02",
    type: "activity",
    name: "ซุ้มถ่ายภาพที่ระลึก Finish Line",
    category: "จุดเช็คอินถ่ายภาพ",
    description: "บริการช่างภาพมืออาชีพถ่ายภาพสวยๆ ฟรี พร้อมดาวน์โหลดผ่านหน้าเว็บ",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    badge: "รูปฟรีทุกคน"
  }
];

export const initialSponsors = [
  {
    id: "sp-1",
    name: "เครือข่ายส่งเสริมสุขภาพชุมชนตาก",
    tier: "main",
    role: "ผู้สนับสนุนน้ำดื่มและหน่วยพยาบาลตลอดเส้นทาง",
    logo: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "sp-2",
    name: "Tak Sports & Fitness Hub",
    tier: "gold",
    role: "สนับสนุนของรางวัลและวิทยากรนำวอร์มอัพ",
    logo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "sp-3",
    name: "กลุ่มเกษตรกรกาแฟเมืองตาก",
    tier: "supporter",
    role: "สนับสนุนเครื่องดื่มยามเช้าแก่นักวิ่งและทีมงาน",
    logo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "sp-4",
    name: "วิสาหกิจชุมชนริมปิง",
    tier: "supporter",
    role: "สนับสนุนอาหารว่างผลไม้แตงโมกล้วยน้ำว้า",
    logo: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=200&q=80"
  }
];

export const initialPastGalleries = [
  {
    id: "gal-1",
    epNumber: 1,
    title: "บรรยากาศปล่อยตัวยามเช้า EP.01",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80",
    caption: "นักวิ่งกว่า 500 คนพร้อมใจกันสวมเสื้อชมรมวิ่งรับแสงแรกของวัน"
  },
  {
    id: "gal-2",
    epNumber: 1,
    title: "รอยยิ้ม ณ จุดให้น้ำสะพานแขวน",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
    caption: "มิตรภาพระหว่างทาง เติมน้ำใจและรอยยิ้มให้แก่กัน"
  },
  {
    id: "gal-3",
    epNumber: 1,
    title: "กลุ่ม Fun Run ครอบครัวอบอุ่น",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80",
    caption: "พาลูกหลานและผู้สูงอายุมาออกกำลังกายเดิน-วิ่งชมวิวริมปิง"
  },
  {
    id: "gal-4",
    epNumber: 1,
    title: "อาหารเช้าชุมชนหลังเข้าเส้นชัย",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    caption: "ข้าวต้มร้อนๆ กาแฟหอมกรุ่น และขนมครกโบราณฝีมือคุณป้าชาวตาก"
  }
];
