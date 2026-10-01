import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Palette, 
  Store, 
  HeartHandshake, 
  Image as ImageIcon,
  Search, 
  Download, 
  Plus, 
  Check, 
  CheckCircle, 
  X, 
  Lock, 
  LogOut, 
  QrCode,
  Edit,
  Trash2,
  ExternalLink,
  History,
  AlertTriangle,
  Award,
  Sparkles,
  MapPin,
  Compass,
  Clock,
  Droplet,
  Activity,
  Mountain,
  Eye,
  Key,
  UserCheck,
  UserPlus,
  Gift,
  RefreshCw,
  Coffee,
  ShoppingBag
} from 'lucide-react';
import { DataService } from '../lib/supabase';

export function AdminPortal({ 
  clubSettings, 
  events = [], 
  activeEvent, 
  onSettingsUpdate, 
  onEventsUpdate,
  onExitAdmin 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin users & Password change state
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', displayName: '', role: 'staff' });
  const [newAdminError, setNewAdminError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('events');
  const [registrations, setRegistrations] = useState([]);
  const [sponsorsList, setSponsorsList] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCheckIn, setFilterCheckIn] = useState('all');

  // Quick Check-in
  const [quickBib, setQuickBib] = useState('');
  const [notice, setNotice] = useState(null);

  // Event Edit/Create Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState('general'); // 'general', 'distance', 'route', 'schedule'
  
  const [eventFormData, setEventFormData] = useState({
    id: '',
    epNumber: 2,
    title: '',
    subtitle: '',
    eventDate: '2026-11-15T05:30',
    locationName: 'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก',
    locationMapUrl: 'https://maps.google.com/?q=Tak+Ping+River',
    coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    status: 'open', // 'open', 'closed', 'completed'
    isActive: false,

    // Single Distance
    distanceKm: 5.8,
    distanceLabel: 'City Run 5.8K ตะลุยเมืองเก่าเลียบปิง',
    quota: 500,

    // Route & Map
    routeImageUrl: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=1200&q=80',
    routeDescription: 'เส้นทางเลียบแม่น้ำปิง ผ่านสะพาน 200 ปี ศาลสมเด็จพระเจ้าตากสิน และตึกโบราณเมืองตาก',
    waterStations: 3,
    firstAidPoints: 2,
    elevationGain: '+12 ม. (ทางราบ 95%)',
    routeHighlightsText: 'จุดชมวิวสะพานสมโภช 200 ปี, ศาลสมเด็จพระเจ้าตากสินมหาราช, สตรีทอาร์ตเมืองตาก, เลียบหาดทรายริมปิง',

    // Schedule Timeline
    schedule: [
      { time: '05:00 น.', title: 'เปิดโต๊ะรายงานตัว & ยืนยันสิทธิ์คูปองหน้างาน' },
      { time: '05:30 น.', title: 'รวมพล Warm-up ยืดเหยียดกล้ามเนื้อโดยโค้ชชมรม' },
      { time: '05:45 น.', title: 'ชี้แจงเส้นทางวิ่ง จุดให้น้ำ และข้อควรระวัง' },
      { time: '06:00 น.', title: 'ปล่อยตัวนักวิ่งอย่างเป็นทางการ' },
      { time: '07:15 น.', title: 'Finish Line! ลิ้มรสอาหารเช้าชุมชน & ถ่ายรูปเช็คอิน' },
      { time: '08:00 น.', title: 'กิจกรรมมอบของที่ระลึก & จับรางวัลจากผู้สนับสนุน' }
    ],

    // Stats for completed events
    stats: {
      runnersJoined: 500,
      totalKilometers: 2900,
      photosTaken: '1,000+'
    }
  });

  // Modal for Sponsor
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [sponsorFormData, setSponsorFormData] = useState({
    name: '',
    tier: 'main',
    role: '',
    logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80',
    websiteUrl: ''
  });

  // Modal for Shop/Activity
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [shopFormData, setShopFormData] = useState({
    name: '',
    type: 'food',
    category: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    badge: ''
  });

  // Modal for Gallery photo
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState({
    epNumber: 1,
    title: '',
    caption: '',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80'
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState(clubSettings || {});

  // Coupon Customizer State
  const defaultCouponConfig = {
    badgeText: '🎟️ LUCKY DRAW PASS',
    headline: 'คูปองลุ้นรางวัล & สิทธิประโยชน์นักวิ่ง',
    subheadline: 'บัตรดิจิทัลประจำตัวสำหรับลุ้นของรางวัลท้ายงาน และรับอาหารเช้าหน้างาน',
    perksTitle: 'สิทธิประโยชน์สำหรับผู้ถือคูปองนี้:',
    perk1Title: 'สิทธิ์ลุ้นรับรางวัล Lucky Draw ท้ายงาน',
    perk1Desc: 'จับสลากแจกของรางวัล & ของที่ระลึกจากผู้สนับสนุนหลังเข้าเส้นชัย',
    perk2Title: 'อาหารเช้าชุมชน & กาแฟดอยฟรี',
    perk2Desc: 'อิ่มอร่อยกับเมนูท้องถิ่นเมืองตาก ณ ซุ้มอาหารบริการนักวิ่ง',
    perk3Title: 'ส่วนลดพิเศษร้านค้าชุมชน',
    perk3Desc: 'แสดงคูปองเพื่อรับส่วนลดและโปรโมชั่นพิเศษจากร้านค้าที่ร่วมรายการ',
    noticeText: 'แสดงคูปองนี้ต่อเจ้าหน้าที่หน้างานเพื่อรับอาหารเช้าและสิทธิ์ร่วมจับสลาก Lucky Draw'
  };

  const [couponConfigForm, setCouponConfigForm] = useState(
    clubSettings?.couponSettings || defaultCouponConfig
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated, activeEvent, activeTab]);

  useEffect(() => {
    if (clubSettings) {
      setSettingsForm(clubSettings);
      if (clubSettings.couponSettings) {
        setCouponConfigForm(clubSettings.couponSettings);
      }
    }
  }, [clubSettings]);

  const checkAuth = async () => {
    const auth = await DataService.checkAdminAuth();
    if (auth.isAuthenticated) {
      setIsAuthenticated(true);
      setCurrentAdmin(auth.user);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await DataService.loginAdmin({ 
      username: adminUsername, 
      password: adminPassword 
    });
    if (res.success) {
      setIsAuthenticated(true);
      setCurrentAdmin(res.user);
      setAdminPassword('');
    } else {
      setLoginError(res.error || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = async () => {
    await DataService.logoutAdmin();
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  const loadAllAdminData = async () => {
    try {
      const [regs, sps, shps, gals, admins] = await Promise.all([
        DataService.getRegistrations(activeEvent?.id),
        DataService.getSponsors(),
        DataService.getShopsAndActivities(),
        DataService.getPastGalleries(),
        DataService.getAdminUsers()
      ]);
      setRegistrations(regs);
      setSponsorsList(sps);
      setShopsList(shps);
      setGalleryList(gals);
      setAdminUsersList(admins);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    if (!changePasswordForm.currentPassword) {
      setChangePasswordError('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }
    if (!changePasswordForm.newPassword) {
      setChangePasswordError('กรุณากรอกรหัสผ่านใหม่');
      return;
    }
    if (changePasswordForm.newPassword.length < 4) {
      setChangePasswordError('รหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const username = currentAdmin?.username || 'admin';
    const res = await DataService.updateAdminPassword({
      username,
      currentPassword: changePasswordForm.currentPassword,
      newPassword: changePasswordForm.newPassword
    });

    if (res.success) {
      showToast('เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว!');
      setChangePasswordModalOpen(false);
      setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      const admins = await DataService.getAdminUsers();
      setAdminUsersList(admins);
    } else {
      setChangePasswordError(res.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }
  };

  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    setNewAdminError('');
    if (!newAdminForm.username.trim()) {
      setNewAdminError('กรุณากรอกชื่อผู้ใช้งาน (Username)');
      return;
    }
    if (!newAdminForm.password.trim()) {
      setNewAdminError('กรุณากำหนดรหัสผ่านเริ่มต้น');
      return;
    }

    const res = await DataService.addAdminUser(newAdminForm);
    if (res.success) {
      showToast(`เพิ่มแอดมิน "${newAdminForm.username}" สำเร็จแล้ว!`);
      setNewAdminModalOpen(false);
      setNewAdminForm({ username: '', password: '', displayName: '', role: 'staff' });
      const admins = await DataService.getAdminUsers();
      setAdminUsersList(admins);
    } else {
      setNewAdminError(res.error || 'ไม่สามารถเพิ่มแอดมินได้');
    }
  };

  const handleDeleteAdminUser = async (id, username) => {
    if (username.toLowerCase() === 'admin') {
      alert('ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้');
      return;
    }
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีแอดมิน "${username}"?`)) return;

    const res = await DataService.deleteAdminUser(id);
    if (res.success) {
      showToast(`ลบบัญชีแอดมิน "${username}" แล้ว`);
      const admins = await DataService.getAdminUsers();
      setAdminUsersList(admins);
    } else {
      showToast(res.error || 'ลบไม่สำเร็จ', false);
    }
  };

  const showToast = (text, isSuccess = true) => {
    setNotice({ success: isSuccess, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // ==========================================
  // EVENT EDIT & CREATE HANDLERS
  // ==========================================
  const handleOpenCreateEvent = (isPast = false) => {
    setIsEditingEvent(false);
    setModalActiveTab('general');
    const nextEp = events.length + 1;
    setEventFormData({
      id: `ep-${Date.now()}`,
      epNumber: nextEp,
      title: isPast 
        ? `TAK City Run EP.${String(nextEp).padStart(2, '0')} - งานวิ่งในอดีต` 
        : `TAK City Run EP.${String(nextEp).padStart(2, '0')} - งานวิ่งใหม่เมืองตาก`,
      subtitle: isPast ? 'บันทึกประวัติความประทับใจงานวิ่งที่ผ่านมา' : 'วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดี',
      eventDate: '2026-12-15T05:30',
      locationName: 'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก',
      locationMapUrl: 'https://maps.google.com/?q=Tak+Ping+River',
      coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
      status: isPast ? 'completed' : 'open',
      isActive: false,

      distanceKm: 5.0,
      distanceLabel: 'City Run 5.0K วิ่งเลียบแม่น้ำปิง',
      quota: 500,

      routeImageUrl: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=1200&q=80',
      routeDescription: 'เส้นทางวิ่งเลียบแม่น้ำปิง ชมวิวสะพาน 200 ปี และจุดประวัติศาสตร์เมืองตาก',
      waterStations: 3,
      firstAidPoints: 2,
      elevationGain: '+10 ม. (ทางราบเรียบ)',
      routeHighlightsText: 'สะพานสมโภช 200 ปี, ศาลสมเด็จพระเจ้าตากสิน, เลียบหาดทรายริมปิง',

      schedule: [
        { time: '05:00 น.', title: 'เปิดโต๊ะรายงานตัว & ยืนยันสิทธิ์คูปองหน้างาน' },
        { time: '05:30 น.', title: 'รวมพล Warm-up ยืดเหยียดกล้ามเนื้อโดยโค้ชชมรม' },
        { time: '06:00 น.', title: 'ปล่อยตัวนักวิ่งอย่างเป็นทางการ' },
        { time: '07:15 น.', title: 'Finish Line! ทานอาหารเช้าชุมชน & ถ่ายรูปเช็คอิน' }
      ],
      stats: {
        runnersJoined: 450,
        totalKilometers: 2250,
        photosTaken: '800+'
      }
    });
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (event) => {
    setIsEditingEvent(true);
    setModalActiveTab('general');
    
    // Parse highlights text
    const highlightsText = Array.isArray(event.routeHighlights) 
      ? event.routeHighlights.join(', ') 
      : (typeof event.routeHighlights === 'string' ? event.routeHighlights : '');

    setEventFormData({
      ...event,
      distanceKm: Number(event.distanceKm ?? 5.8),
      distanceLabel: event.distanceLabel || `City Run ${event.distanceKm || 5.8}K`,
      quota: Number(event.quota ?? 500),
      routeImageUrl: event.routeImageUrl || '',
      routeDescription: event.routeDescription || '',
      waterStations: Number(event.waterStations ?? 3),
      firstAidPoints: Number(event.firstAidPoints ?? 2),
      elevationGain: event.elevationGain || '+12 ม. (ทางราบ 95%)',
      routeHighlightsText: highlightsText,
      schedule: event.schedule && event.schedule.length > 0 ? event.schedule : [
        { time: '05:00 น.', title: 'เปิดโต๊ะรายงานตัว & ยืนยันสิทธิ์คูปอง' },
        { time: '06:00 น.', title: 'ปล่อยตัวนักวิ่ง' },
        { time: '07:15 น.', title: 'เข้าเส้นชัย รับอาหารเช้า' }
      ],
      stats: event.status === 'completed'
        ? (event.stats || { runnersJoined: 500, totalKilometers: 2900, photosTaken: '1,000+' })
        : null
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) {
      showToast('กรุณากรอกชื่องานวิ่ง', false);
      return;
    }

    // Process route highlights array from comma-separated text
    const highlightsArray = eventFormData.routeHighlightsText
      ? eventFormData.routeHighlightsText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...eventFormData,
      distanceKm: Number(eventFormData.distanceKm || 5.8),
      distanceLabel: eventFormData.distanceLabel || `City Run ${eventFormData.distanceKm || 5.8}K`,
      quota: Number(eventFormData.quota || 500),
      routeImageUrl: eventFormData.routeImageUrl || '',
      routeDescription: eventFormData.routeDescription || '',
      waterStations: Number(eventFormData.waterStations || 3),
      firstAidPoints: Number(eventFormData.firstAidPoints || 2),
      elevationGain: eventFormData.elevationGain || '+12 ม. (ทางราบ 95%)',
      routeHighlights: highlightsArray
    };

    try {
      if (isEditingEvent) {
        await DataService.updateEvent(payload.id, payload);
        showToast(`บันทึกการแก้ไข EP.${payload.epNumber} สำเร็จแล้ว!`);
      } else {
        await DataService.createEvent(payload);
        showToast(`สร้างงานวิ่ง EP.${payload.epNumber} สำเร็จแล้ว!`);
      }

      const allEvents = await DataService.getEvents();
      onEventsUpdate(allEvents);
      setEventModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึกงานวิ่ง', false);
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบงานวิ่ง "${title}"?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`)) return;

    try {
      await DataService.deleteEvent(eventId);
      const allEvents = await DataService.getEvents();
      onEventsUpdate(allEvents);
      showToast('ลบงานวิ่งเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถลบงานวิ่งได้', false);
    }
  };

  const handleSetActiveEvent = async (eventId) => {
    const updated = await DataService.setActiveEvent(eventId);
    onEventsUpdate(updated);
    showToast('เปลี่ยนงานวิ่ง EP หน้าแรกสำเร็จแล้ว');
  };

  // Schedule timeline helpers in modal
  const handleAddScheduleRow = () => {
    setEventFormData({
      ...eventFormData,
      schedule: [
        ...eventFormData.schedule,
        { time: '06:00 น.', title: 'กิจกรรมใหม่' }
      ]
    });
  };

  const handleRemoveScheduleRow = (idx) => {
    const updated = [...eventFormData.schedule];
    updated.splice(idx, 1);
    setEventFormData({ ...eventFormData, schedule: updated });
  };

  // ==========================================
  // RUNNER ACTIONS
  // ==========================================
  const handleToggleCheckIn = async (regId) => {
    const updated = await DataService.toggleCheckIn(regId);
    setRegistrations(prev => prev.map(r => r.id === regId || r.bibNumber === regId ? updated : r));
    showToast(`อัปเดต ${updated.bibNumber} (${updated.fullName}) เป็น: ${updated.checkedIn ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน'}`);
  };

  const handleDeleteRunner = async (regId, name) => {
    if (!window.confirm(`ต้องการลบรายชื่อนักวิ่ง "${name}" หรือไม่?`)) return;
    await DataService.deleteRegistration(regId);
    setRegistrations(prev => prev.filter(r => r.id !== regId));
    showToast('ลบรายชื่อนักวิ่งเรียบร้อยแล้ว');
  };

  const handleQuickCheckIn = (e) => {
    e.preventDefault();
    const cleanBib = quickBib.trim().toUpperCase();
    if (!cleanBib) return;

    const runner = registrations.find(r => r.bibNumber.toUpperCase() === cleanBib || r.phone === cleanBib);
    if (!runner) {
      showToast(`ไม่พบข้อมูลนักวิ่งสำหรับ "${cleanBib}"`, false);
      return;
    }

    handleToggleCheckIn(runner.id);
    setQuickBib('');
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('ไม่มีข้อมูลนักวิ่งสำหรับส่งออก');
      return;
    }

    const headers = ['ลำดับ', 'หมายเลขคูปอง', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'เบอร์โทรศัพท์', 'ระยะทาง', 'ไซส์เสื้อ', 'ผู้ติดต่อฉุกเฉิน', 'เบอร์ฉุกเฉิน', 'โรคประจำตัว', 'สถานะเช็คอิน', 'เวลาลงทะเบียน'];
    const rows = filteredRunners.map((r, index) => {
      return [
        index + 1,
        `"${r.bibNumber}"`,
        `"${r.fullName}"`,
        `"${r.nickname || '-'}"`,
        `"${r.phone}"`,
        `"${r.distanceLabel || `${activeEvent?.distanceKm || 5.8}K`}"`,
        `"${r.shirtSize || '-'}"`,
        `"${r.emergencyContact || '-'}"`,
        `"${r.emergencyPhone || '-'}"`,
        `"${r.medicalNotes || '-'}"`,
        `"${r.checkedIn ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน'}"`,
        `"${new Date(r.createdAt).toLocaleString('th-TH')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TAK_City_Run_EP${activeEvent?.epNumber || '02'}_Runners.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // SPONSORS / SHOPS / GALLERY ACTIONS
  // ==========================================
  const handleAddSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorFormData.name) return;
    const added = await DataService.addSponsor(sponsorFormData);
    setSponsorsList([added, ...sponsorsList]);
    setSponsorModalOpen(false);
    showToast('เพิ่มผู้สนับสนุนเรียบร้อย');
  };

  const handleDeleteSponsor = async (id) => {
    if (!window.confirm('ต้องการลบผู้สนับสนุนนี้หรือไม่?')) return;
    await DataService.deleteSponsor(id);
    setSponsorsList(sponsorsList.filter(s => s.id !== id));
    showToast('ลบผู้สนับสนุนเรียบร้อย');
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    if (!shopFormData.name) return;
    const added = await DataService.addShopOrActivity(shopFormData);
    setShopsList([added, ...shopsList]);
    setShopModalOpen(false);
    showToast('เพิ่มร้านค้า/กิจกรรมเรียบร้อย');
  };

  const handleDeleteShop = async (id) => {
    if (!window.confirm('ต้องการลบรายการนี้หรือไม่?')) return;
    await DataService.deleteShopOrActivity(id);
    setShopsList(shopsList.filter(item => item.id !== id));
    showToast('ลบรายการเรียบร้อย');
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!galleryFormData.title || !galleryFormData.image) return;
    const added = await DataService.addGalleryItem(galleryFormData);
    setGalleryList([added, ...galleryList]);
    setGalleryModalOpen(false);
    showToast('เพิ่มรูปภาพแกลเลอรีเรียบร้อย');
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('ต้องการลบรูปภาพนี้หรือไม่?')) return;
    await DataService.deleteGalleryItem(id);
    setGalleryList(galleryList.filter(g => g.id !== id));
    showToast('ลบรูปภาพเรียบร้อย');
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const updated = await DataService.updateSettings(settingsForm);
    onSettingsUpdate(updated);
    showToast('บันทึกการตั้งค่าชมรมเรียบร้อยแล้ว!');
  };

  const handleSaveCouponConfig = async (e) => {
    e.preventDefault();
    const updated = await DataService.updateSettings({
      ...clubSettings,
      couponSettings: couponConfigForm
    });
    onSettingsUpdate(updated);
    showToast('บันทึกการปรับแต่งคูปองเรียบร้อยแล้ว!');
  };

  // Filter Runners
  const filteredRunners = registrations.filter(r => {
    const matchesQuery = !searchQuery || 
      r.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone && r.phone.includes(searchQuery));

    const matchesCheckIn = filterCheckIn === 'all' || 
      (filterCheckIn === 'checked' && r.checkedIn) || 
      (filterCheckIn === 'pending' && !r.checkedIn);

    return matchesQuery && matchesCheckIn;
  });

  const totalRunners = registrations.length;
  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const checkedInPercent = totalRunners > 0 ? Math.round((checkedInCount / totalRunners) * 100) : 0;

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 60px)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(255, 85, 0, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#FFF' }}>เข้าสู่ระบบผู้ดูแลชมรม</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
              TAK City Run Admin & Staff Portal
            </p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">ชื่อผู้ใช้งาน (Username) *</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="เช่น admin, staff_tak"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน (Password) *</label>
              <input 
                type="password" 
                className="form-control"
                placeholder="กรอกรหัสผ่านของคุณ"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              💡 บัญชีเริ่มต้นระบบ: Username: <strong style={{ color: '#FFF' }}>admin</strong> | รหัสผ่าน: <strong style={{ color: '#FFF' }}>1234</strong>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}>
              เข้าสู่ระบบ
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={onExitAdmin}>
              กลับหน้าแรก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 30px)', paddingBottom: '90px' }}>
      {/* Toast Notice */}
      {notice && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '24px',
          zIndex: 3000,
          background: notice.success ? '#065F46' : '#991B1B',
          color: '#FFF',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          {notice.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="admin-header">
        <div>
          <span className="badge-tag cyan" style={{ marginBottom: '6px' }}>
            <ShieldCheck size={14} /> แอดมินชมรม TAK City Run
          </span>
          <h1 style={{ fontSize: '2.1rem' }}>ระบบจัดการงานวิ่ง & คอนเทนต์</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            งานวิ่งที่กำลังเปิดอยู่: <strong>EP.{activeEvent?.epNumber || '02'} - {activeEvent?.title}</strong> ({activeEvent?.distanceKm || 5.8}K)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {currentAdmin && (
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
                👤 {currentAdmin.displayName || currentAdmin.username}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                @{currentAdmin.username} ({currentAdmin.role === 'superadmin' ? 'Superadmin' : 'Staff'})
              </div>
            </div>
          )}
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => {
              setChangePasswordError('');
              setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setChangePasswordModalOpen(true);
            }}
            title="เปลี่ยนรหัสผ่านของฉัน"
          >
            <Key size={14} /> เปลี่ยนรหัสผ่าน
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> ออกจากระบบ
          </button>
          <button className="btn btn-primary btn-sm" onClick={onExitAdmin}>
            ดูหน้าเว็บนักวิ่ง <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--primary)' }}>{totalRunners}</div>
          <div className="stat-label">ยอดนักวิ่ง EP นี้ (คน)</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--green)' }}>{checkedInCount}</div>
          <div className="stat-label">เช็คอินหน้างานแล้ว ({checkedInPercent}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--cyan)' }}>{events.length}</div>
          <div className="stat-label">จำนวน Episode ทั้งหมด</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: '#FBBF24' }}>{adminUsersList.length}</div>
          <div className="stat-label">ผู้ดูแลระบบ (Admins)</div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button 
          className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={18} /> จัดการ EP & แผนที่รูทวิ่ง ({events.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'runners' ? 'active' : ''}`}
          onClick={() => setActiveTab('runners')}
        >
          <Users size={18} /> รายชื่อนักวิ่ง ({registrations.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <QrCode size={18} /> โต๊ะเช็คอินหน้างาน (Check-in)
        </button>

        <button 
          className={`admin-tab ${activeTab === 'sponsors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sponsors')}
        >
          <HeartHandshake size={18} /> ผู้สนับสนุน ({sponsorsList.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          <Store size={18} /> ร้านค้า & กิจกรรม ({shopsList.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <ImageIcon size={18} /> แกลเลอรีภาพ ({galleryList.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <Key size={18} /> จัดการแอดมิน ({adminUsersList.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'coupon' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupon')}
        >
          <Gift size={18} /> 🎟️ ปรับแต่งคูปอง
        </button>

        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Palette size={18} /> ปรับแต่ง Logo & สไตล์
        </button>
      </div>

      {/* ========================================================
          TAB 1: EVENTS & ROUTE MAP MANAGEMENT
         ======================================================== */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', color: '#FFF' }}>จัดการงานวิ่ง Episode & แผนที่เส้นทางวิ่ง</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                แต่ละ EP จะกำหนดระยะทางวิ่งเดียว (Single Distance) พร้อมใส่รูปแผนที่เส้นทาง จุดให้น้ำ และกำหนดการได้อิสระ
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenCreateEvent(true)}>
                <History size={16} /> + เพิ่มประวัติงานเก่า (Past EP)
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenCreateEvent(false)}>
                <Plus size={16} /> + สร้างงานวิ่ง EP ใหม่
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
            {events.map((ev) => (
              <div 
                key={ev.id} 
                className="glass-card" 
                style={{ 
                  border: ev.isActive ? '2px solid var(--primary)' : '1px solid var(--dark-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top Bar of card */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <span className={`badge-tag ${ev.status === 'completed' ? 'cyan' : ev.status === 'open' ? 'green' : ''}`} style={{ marginBottom: '6px' }}>
                        {ev.status === 'open' ? '🟢 เปิดรับสมัคร' : ev.status === 'completed' ? '📜 จัดจบแล้ว (งานเก่า)' : '⚪ ปิดรับสมัคร'}
                      </span>
                      {ev.isActive && (
                        <span className="badge-tag" style={{ marginLeft: '6px' }}>
                          ★ แสดงหน้าแรก
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => handleOpenEditEvent(ev)}
                        title="แก้ไขงานวิ่งและแผนที่รูท"
                      >
                        <Edit size={14} /> แก้ไขงานวิ่ง & แผนที่
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', color: '#F87171' }}
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        title="ลบงานวิ่งนี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', marginBottom: '6px', color: '#FFF' }}>
                    EP.{String(ev.epNumber).padStart(2, '0')} - {ev.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6 }}>
                    {ev.subtitle}
                  </p>

                  {/* Single Distance Badge Box */}
                  <div style={{
                    background: 'rgba(255, 85, 0, 0.1)',
                    border: '1px solid rgba(255, 85, 0, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        ระยะทางวิ่งอย่างเป็นทางการ (ระยะเดียว)
                      </span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>
                        {ev.distanceLabel || `City Run ${ev.distanceKm || 5.8}K`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {ev.distanceKm || 5.8}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFF', marginLeft: '4px' }}>KM</span>
                    </div>
                  </div>

                  {/* Route Map Preview Thumbnail */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Compass size={14} color="var(--cyan)" /> แผนที่เส้นทางวิ่ง:
                      </span>
                      {ev.routeImageUrl ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>✓ มีรูปแผนที่แล้ว</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#F87171' }}>! ยังไม่มีรูปแผนที่</span>
                      )}
                    </div>
                    {ev.routeImageUrl && (
                      <img 
                        src={ev.routeImageUrl} 
                        alt="แผนที่เส้นทาง" 
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <div>💧 จุดให้น้ำ: <strong style={{ color: '#FFF' }}>{ev.waterStations || 3} จุด</strong></div>
                      <div>🏥 จุดพยาบาล: <strong style={{ color: '#FFF' }}>{ev.firstAidPoints || 2} จุด</strong></div>
                      <div>👥 โควตา: <strong style={{ color: '#FFF' }}>{ev.quota || 500} ท่าน</strong></div>
                      <div>⛰️ ความชัน: <strong style={{ color: '#FFF' }}>{ev.elevationGain || '+10 ม.'}</strong></div>
                    </div>
                  </div>

                  {/* Stats for completed past event */}
                  {ev.status === 'completed' && ev.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '10px', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '16px', fontSize: '0.82rem' }}>
                      <div>
                        <strong style={{ color: 'var(--cyan)' }}>{ev.stats.runnersJoined}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>คนร่วมวิ่ง</div>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--cyan)' }}>{ev.stats.totalKilometers}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>กม. รวม</div>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--cyan)' }}>{ev.stats.photosTaken}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ภาพถ่าย</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer of Card */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {!ev.isActive ? (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSetActiveEvent(ev.id)}
                    >
                      ★ ตั้งเป็น EP หน้าแรกของเว็บ
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                      ✓ กำลังแสดงเป็น EP หน้าแรก
                    </span>
                  )}

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📍 {ev.locationName?.split(' ')[0] || 'เมืองตาก'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: RUNNERS DIRECTORY
         ======================================================== */}
      {activeTab === 'runners' && (
        <div className="glass-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="ค้นหาชื่อ, เบอร์โทร, หรือเลขคูปอง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="form-control" 
                style={{ width: '160px' }}
                value={filterCheckIn}
                onChange={(e) => setFilterCheckIn(e.target.value)}
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="checked">เช็คอินแล้ว</option>
                <option value="pending">ยังไม่เช็คอิน</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={loadAllAdminData}
                title="รีเฟรชข้อมูลรายชื่อผู้สมัครล่าสุดทันที"
              >
                <RefreshCw size={16} /> รีเฟรชรายชื่อ
              </button>
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <Download size={16} /> ส่งออก Excel (CSV)
              </button>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>เลขคูปอง</th>
                  <th>ชื่อ-นามสกุล (ชื่อเล่น)</th>
                  <th>เบอร์โทร</th>
                  <th>ระยะทาง</th>
                  <th>ไซส์</th>
                  <th>ติดต่อฉุกเฉิน</th>
                  <th>โรคประจำตัว</th>
                  <th>สถานะเช็คอิน</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRunners.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      ไม่พบรายชื่อนักวิ่งตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredRunners.map((runner) => (
                    <tr key={runner.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1.05rem' }}>
                          {runner.bibNumber}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFF' }}>{runner.fullName}</div>
                        {runner.nickname && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({runner.nickname})</div>}
                      </td>
                      <td>{runner.phone}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 85, 0, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                          {runner.distanceLabel || `${activeEvent?.distanceKm || 5.8}K`}
                        </span>
                      </td>
                      <td>{runner.shirtSize || '-'}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{runner.emergencyContact || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{runner.emergencyPhone || ''}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: runner.medicalNotes && runner.medicalNotes !== '-' ? '#F87171' : 'var(--text-muted)' }}>
                          {runner.medicalNotes || '-'}
                        </span>
                      </td>
                      <td>
                        {runner.checkedIn ? (
                          <span className="badge-tag green" style={{ margin: 0, fontSize: '0.75rem', padding: '3px 8px' }}>
                            <CheckCircle size={12} /> เช็คอินแล้ว
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ยังไม่เช็คอิน
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className={`btn btn-sm ${runner.checkedIn ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleToggleCheckIn(runner.id)}
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            {runner.checkedIn ? 'ยกเลิก' : 'เช็คอิน'}
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteRunner(runner.id, runner.fullName)}
                            style={{ padding: '4px 8px', color: '#F87171' }}
                            title="ลบรายชื่อ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: QUICK CHECK-IN DESK
         ======================================================== */}
      {activeTab === 'scanner' && (
        <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(0, 240, 255, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <QrCode size={36} color="var(--cyan)" />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#FFF', marginBottom: '8px' }}>
            โต๊ะเช็คอิน & ยืนยันสิทธิ์คูปองหน้างาน
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
            พิมพ์หรือสแกนหมายเลขคูปอง (เช่น TK02-001) หรือกรอกเบอร์โทรศัพท์ 10 หลักเพื่อเช็คชื่อรับสิทธิ์และร่วมจับรางวัลทันที
          </p>

          <form onSubmit={handleQuickCheckIn} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input 
              type="text" 
              className="form-control"
              style={{ fontSize: '1.25rem', textAlign: 'center', letterSpacing: '1px' }}
              placeholder="พิมพ์เลขคูปอง หรือ เบอร์โทร..."
              value={quickBib}
              onChange={(e) => setQuickBib(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
              เช็คอิน <Check size={18} />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 4: SPONSORS
         ======================================================== */}
      {activeTab === 'sponsors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>จัดการผู้สนับสนุน (Sponsors)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                เพิ่มหรือลบโลโก้ผู้สนับสนุนประจำแต่ละ Episode
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setSponsorModalOpen(true)}>
              <Plus size={16} /> + เพิ่มผู้สนับสนุนใหม่
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {sponsorsList.map((sp) => (
              <div key={sp.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={sp.logo} alt={sp.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: '#FFF' }}>{sp.name}</h4>
                    <span className="badge-tag" style={{ margin: '4px 0', fontSize: '0.72rem', padding: '2px 8px' }}>
                      {sp.tier === 'main' ? 'ผู้สนับสนุนหลัก' : sp.tier === 'gold' ? 'Gold Sponsor' : 'ผู้สนับสนุนชุมชน'}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sp.role}</div>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#F87171', padding: '8px' }}
                  onClick={() => handleDeleteSponsor(sp.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SHOPS & ACTIVITIES
         ======================================================== */}
      {activeTab === 'market' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>ร้านค้าชุมชน & กิจกรรมในงาน</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                เพิ่มร้านอาหาร บูธสุขภาพ หรือจุดกิจกรรมพิเศษ
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShopModalOpen(true)}>
              <Plus size={16} /> + เพิ่มร้านค้า/กิจกรรมใหม่
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {shopsList.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: '16px' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {item.category || item.type}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', color: '#FFF', margin: '4px 0' }}>{item.name}</h4>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ color: '#F87171', padding: '6px' }}
                    onClick={() => handleDeleteShop(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>{item.description}</p>
                {item.badge && (
                  <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.75rem', background: 'rgba(255, 85, 0, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: GALLERY
         ======================================================== */}
      {activeTab === 'gallery' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>แกลเลอรีภาพประวัติงานเก่า</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                เพิ่มรูปภาพบรรยากาศงานวิ่งแต่ละ EP เพื่อแสดงบนหน้าเว็บ
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setGalleryModalOpen(true)}>
              <Plus size={16} /> + เพิ่มรูปภาพใหม่
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {galleryList.map((g) => (
              <div key={g.id} className="glass-card" style={{ padding: '12px', position: 'relative' }}>
                <img src={g.image} alt={g.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ fontSize: '0.92rem', color: '#FFF' }}>{g.title}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EP.{g.epNumber}</span>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#F87171', padding: '6px' }}
                    onClick={() => handleDeleteGallery(g.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: SETTINGS & STYLES
         ======================================================== */}
      {activeTab === 'settings' && (
        <div className="glass-card" style={{ maxWidth: '680px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>ปรับแต่งข้อมูลชมรม & สไตล์เว็บไซต์</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            เปลี่ยนชื่อชมรม สโลแกน โลโก้ และโทนสีหลักของหน้าเว็บได้ตามต้องการ
          </p>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">ชื่อชมรมวิ่ง (Club Name)</label>
              <input 
                type="text" 
                className="form-control"
                value={settingsForm.clubName || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, clubName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">สโลแกนชมรม (Tagline)</label>
              <input 
                type="text" 
                className="form-control"
                value={settingsForm.tagline || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ที่อยู่รูปภาพ Logo (URL หรือ SVG Path)</label>
              <input 
                type="text" 
                className="form-control"
                value={settingsForm.logoUrl || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
              />
            </div>

            {/* Theme Color Picker */}
            <div className="form-group">
              <label className="form-label">เลือกโทนสีหลัก (Primary Accent Theme)</label>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '6px' }}>
                {[
                  { name: 'Active Orange', color: '#FF5500' },
                  { name: 'Electric Cyan', color: '#00F0FF' },
                  { name: 'Neon Lime', color: '#10B981' },
                  { name: 'Sunset Gold', color: '#F59E0B' },
                  { name: 'Hot Crimson', color: '#E11D48' }
                ].map((preset) => (
                  <div
                    key={preset.color}
                    onClick={() => {
                      setSettingsForm({ ...settingsForm, themeColor: preset.color });
                      document.documentElement.style.setProperty('--primary', preset.color);
                    }}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: preset.color,
                      cursor: 'pointer',
                      border: settingsForm.themeColor === preset.color ? '3px solid #FFF' : '2px solid transparent',
                      boxShadow: settingsForm.themeColor === preset.color ? '0 0 12px ' + preset.color : 'none',
                      transition: 'var(--transition)'
                    }}
                    title={preset.name}
                  />
                ))}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                  สีปัจจุบัน: {settingsForm.themeColor}
                </span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Facebook Fanpage URL</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={settingsForm.facebookUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">รหัส PIN แอดมิน (เปลี่ยนรหัสเข้าห้องนี้)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={settingsForm.adminPin || '1234'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              บันทึกการตั้งค่า
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 7.5: COUPON & PERKS CUSTOMIZER
         ======================================================== */}
      {activeTab === 'coupon' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
          {/* Left Form */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge-tag gold" style={{ margin: 0 }}>
                <Gift size={14} /> ปรับแต่งคูปอง
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                มีผลต่อคูปองของนักวิ่งทุกคนทันที
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#FFF', marginBottom: '8px' }}>
              ตั้งค่ารายละเอียดคูปองลุ้นรางวัล & สิทธิประโยชน์
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
              ปรับแต่งข้อความสิทธิประโยชน์ ของรางวัล Lucky Draw จุดบริการอาหารเช้า และเงื่อนไขที่นักวิ่งจะเห็นบนคูปอง
            </p>

            <form onSubmit={handleSaveCouponConfig}>
              {/* Section 1: Header & Badge */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} /> 1. ข้อความส่วนหัวคูปอง
                </h4>
                <div className="form-group">
                  <label className="form-label">ป้ายมุมบนขวา (Badge Tag)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="เช่น 🎟️ LUCKY DRAW PASS"
                    value={couponConfigForm.badgeText || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, badgeText: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ชื่อหัวข้อคูปอง (Headline)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="เช่น คูปองลุ้นรางวัล & สิทธิประโยชน์นักวิ่ง"
                    value={couponConfigForm.headline || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, headline: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">คำบรรยายใต้หัวข้อ (Subheadline)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="เช่น บัตรดิจิทัลประจำตัวสำหรับลุ้นของรางวัลท้ายงาน และรับอาหารเช้าหน้างาน"
                    value={couponConfigForm.subheadline || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, subheadline: e.target.value })}
                  />
                </div>
              </div>

              {/* Section 2: Perks Breakdown */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#F59E0B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> 2. รายการสิทธิประโยชน์ 3 ข้อ
                </h4>

                <div className="form-group">
                  <label className="form-label">หัวข้อส่วนสิทธิประโยชน์</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={couponConfigForm.perksTitle || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perksTitle: e.target.value })}
                  />
                </div>

                {/* Perk 1 */}
                <div style={{ borderLeft: '3px solid #F59E0B', paddingLeft: '12px', marginBottom: '14px' }}>
                  <label className="form-label" style={{ color: '#F59E0B' }}>สิทธิประโยชน์ที่ 1 (ของรางวัล Lucky Draw)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ marginBottom: '6px' }}
                    placeholder="ชื่อสิทธิประโยชน์ 1"
                    value={couponConfigForm.perk1Title || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perk1Title: e.target.value })}
                  />
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="รายละเอียดเพิ่มเติม"
                    value={couponConfigForm.perk1Desc || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perk1Desc: e.target.value })}
                  />
                </div>

                {/* Perk 2 */}
                <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '12px', marginBottom: '14px' }}>
                  <label className="form-label" style={{ color: '#10B981' }}>สิทธิประโยชน์ที่ 2 (อาหารเช้า & เครื่องดื่ม)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ marginBottom: '6px' }}
                    placeholder="ชื่อสิทธิประโยชน์ 2"
                    value={couponConfigForm.perk2Title || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perk2Title: e.target.value })}
                  />
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="รายละเอียดเพิ่มเติม"
                    value={couponConfigForm.perk2Desc || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perk2Desc: e.target.value })}
                  />
                </div>

                {/* Perk 3 */}
                <div style={{ borderLeft: '3px solid var(--cyan)', paddingLeft: '12px' }}>
                  <label className="form-label" style={{ color: 'var(--cyan)' }}>สิทธิประโยชน์ที่ 3 (ส่วนลดร้านค้าชุมชน)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ marginBottom: '6px' }}
                    placeholder="ชื่อสิทธิประโยชน์ 3"
                    value={couponConfigForm.perk3Title || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perk3Title: e.target.value })}
                  />
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="รายละเอียดเพิ่มเติม"
                    value={couponConfigForm.perk3Desc || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, perk3Desc: e.target.value })}
                  />
                </div>
              </div>

              {/* Section 3: Bottom Notice */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)', marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#FFF', marginBottom: '12px' }}>
                  3. คำแนะนำ / เงื่อนไขท้ายคูปอง
                </h4>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    placeholder="แสดงคูปองนี้ต่อเจ้าหน้าที่หน้างานเพื่อรับอาหารเช้าและสิทธิ์ร่วมจับสลาก Lucky Draw"
                    value={couponConfigForm.noticeText || ''}
                    onChange={(e) => setCouponConfigForm({ ...couponConfigForm, noticeText: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <Check size={18} /> บันทึกการปรับแต่งคูปอง
              </button>
            </form>
          </div>

          {/* Right Live Preview */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              👁️ ตัวอย่างคูปองแบบเรียลไทม์ (Live Preview ที่นักวิ่งจะเห็น)
            </div>
            
            <div className="coupon-ticket" style={{ maxWidth: '420px', margin: '0 auto' }}>
              <div className="coupon-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={clubSettings?.logoUrl || '/tak-city-run-logo.svg'} alt="TAK City Run" style={{ width: '32px', height: '32px' }} />
                  <div>
                    <div className="coupon-header-title" style={{ fontSize: '1rem' }}>{clubSettings?.clubName || 'TAK CITY RUN'}</div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>EP.02 • FREE COMMUNITY RUN</div>
                  </div>
                </div>
                <span className="coupon-pass-badge" style={{ fontSize: '0.7rem' }}>
                  {couponConfigForm.badgeText || '🎟️ LUCKY PASS'}
                </span>
              </div>

              <div className="coupon-body" style={{ padding: '16px' }}>
                <span className="coupon-distance-pill" style={{ fontSize: '0.8rem', padding: '3px 12px' }}>
                  {activeEvent?.distanceKm || 5.8} KM City Run
                </span>

                <div className="coupon-number-label" style={{ fontSize: '0.7rem' }}>หมายเลขคูปองชิงโชค (LUCKY NO.)</div>
                <div className="coupon-number-display" style={{ fontSize: '2.6rem', margin: '2px 0 8px 0' }}>
                  TK02-001
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px 14px', textAlign: 'left', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 800 }}>👤 ผู้สมัครตัวอย่าง</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>นาย ทดสอบ วิ่งสุขใจ (กอล์ฟ)</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>โทร: 081-234-5678 • ไซส์ L</div>
                </div>

                <div className="coupon-perforated-wrap" style={{ margin: '14px -16px' }}>
                  <div className="coupon-notch-left"></div>
                  <div className="coupon-perforated-line">
                    <span style={{ fontSize: '0.65rem' }}>✂️ รอยปรุ • หางบัตรจับรางวัล</span>
                  </div>
                  <div className="coupon-notch-right"></div>
                </div>

                <div className="coupon-stub-section" style={{ fontSize: '0.8rem' }}>
                  <div className="coupon-perks-title" style={{ fontSize: '0.8rem', color: '#F59E0B' }}>
                    <Sparkles size={13} /> {couponConfigForm.perksTitle || 'สิทธิประโยชน์:'}
                  </div>
                  <div className="coupon-perks-list" style={{ gap: '6px' }}>
                    <div className="coupon-perk-item" style={{ padding: '6px 8px' }}>
                      <Gift size={14} color="#F59E0B" />
                      <div>
                        <strong style={{ fontSize: '0.78rem' }}>{couponConfigForm.perk1Title}</strong>
                        <p style={{ fontSize: '0.7rem' }}>{couponConfigForm.perk1Desc}</p>
                      </div>
                    </div>
                    <div className="coupon-perk-item" style={{ padding: '6px 8px' }}>
                      <Coffee size={14} color="#10B981" />
                      <div>
                        <strong style={{ fontSize: '0.78rem' }}>{couponConfigForm.perk2Title}</strong>
                        <p style={{ fontSize: '0.7rem' }}>{couponConfigForm.perk2Desc}</p>
                      </div>
                    </div>
                    <div className="coupon-perk-item" style={{ padding: '6px 8px' }}>
                      <ShoppingBag size={14} color="var(--cyan)" />
                      <div>
                        <strong style={{ fontSize: '0.78rem' }}>{couponConfigForm.perk3Title}</strong>
                        <p style={{ fontSize: '0.7rem' }}>{couponConfigForm.perk3Desc}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <span className="badge-tag gold" style={{ fontSize: '0.74rem', padding: '4px 10px', margin: 0 }}>
                      🎟️ {couponConfigForm.noticeText || 'แสดงคูปองนี้ต่อเจ้าหน้าที่'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 8: ADMIN USERS MANAGEMENT (Username & Password)
         ======================================================== */}
      {activeTab === 'admins' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#FFF' }}>👥 จัดการบัญชีผู้ดูแลระบบ (Admin & Staff)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                สร้างบัญชีผู้ใช้งานและรหัสผ่านให้ทีมงาน โดยไม่ต้องใช้อีเมล และทีมงานสามารถเข้ามาเปลี่ยนรหัสผ่านเองได้
              </p>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setNewAdminError('');
                setNewAdminForm({ username: '', password: '', displayName: '', role: 'staff' });
                setNewAdminModalOpen(true);
              }}
            >
              <Plus size={16} /> + เพิ่มแอดมินใหม่
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {adminUsersList.map(u => (
              <div 
                key={u.id || u.username}
                className="glass-card"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className={`badge-tag ${u.role === 'superadmin' ? '' : 'cyan'}`}>
                      {u.role === 'superadmin' ? '👑 Superadmin' : '🛡️ Staff แอดมิน'}
                    </span>
                    {u.username.toLowerCase() !== 'admin' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#F87171', padding: '4px 8px' }}
                        onClick={() => handleDeleteAdminUser(u.id, u.username)}
                        title="ลบบัญชีนี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '4px' }}>
                    {u.displayName || u.username}
                  </h3>
                  <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
                    @{u.username}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                    <div>🔑 รหัสผ่านปัจจุบัน: <strong style={{ color: '#FFF' }}>{u.password}</strong></div>
                    <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>สร้างเมื่อ: {new Date(u.createdAt || Date.now()).toLocaleDateString('th-TH')}</div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => {
                      const newPass = prompt(`ตั้งรหัสผ่านใหม่สำหรับ @${u.username}:`, '');
                      if (newPass && newPass.trim().length >= 4) {
                        DataService.updateAdminPassword({
                          username: u.username,
                          currentPassword: u.password,
                          newPassword: newPass.trim()
                        }).then(res => {
                          if (res.success) {
                            showToast(`อัปเดตรหัสผ่านของ @${u.username} เรียบร้อยแล้ว`);
                            DataService.getAdminUsers().then(setAdminUsersList);
                          } else {
                            alert(res.error);
                          }
                        });
                      } else if (newPass) {
                        alert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
                      }
                    }}
                  >
                    <Key size={14} /> รีเซ็ตรหัสผ่าน
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: POWERFUL EVENT & ROUTE MAP EDITOR
         ======================================================== */}
      {eventModalOpen && (
        <div className="modal-overlay" onClick={() => setEventModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '780px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge-tag" style={{ marginBottom: '4px' }}>
                  EP.{eventFormData.epNumber}
                </span>
                <h3 style={{ fontSize: '1.45rem', color: '#FFF' }}>
                  {isEditingEvent ? 'แก้ไขงานวิ่ง & อัปเดตแผนที่เส้นทาง' : 'สร้างงานวิ่ง Episode ใหม่'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setEventModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--dark-border)', paddingBottom: '12px', marginBottom: '22px', overflowX: 'auto' }}>
              <button 
                type="button"
                className={`admin-tab ${modalActiveTab === 'general' ? 'active' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                onClick={() => setModalActiveTab('general')}
              >
                1. 📋 ข้อมูลทั่วไป
              </button>
              <button 
                type="button"
                className={`admin-tab ${modalActiveTab === 'distance' ? 'active' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                onClick={() => setModalActiveTab('distance')}
              >
                2. 🏃 ระยะทาง & โควตา
              </button>
              <button 
                type="button"
                className={`admin-tab ${modalActiveTab === 'route' ? 'active' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                onClick={() => setModalActiveTab('route')}
              >
                3. 🗺️ แผนที่ & จุดบริการ
              </button>
              <button 
                type="button"
                className={`admin-tab ${modalActiveTab === 'schedule' ? 'active' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                onClick={() => setModalActiveTab('schedule')}
              >
                4. ⏱️ กำหนดการ
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              {/* TAB 1: General Info */}
              {modalActiveTab === 'general' && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Episode ลำดับที่ *</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={eventFormData.epNumber}
                        onChange={(e) => setEventFormData({ ...eventFormData, epNumber: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">สถานะงานวิ่ง *</label>
                      <select 
                        className="form-control"
                        value={eventFormData.status}
                        onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
                      >
                        <option value="open">🟢 เปิดรับสมัคร (Open)</option>
                        <option value="closed">⚪ ปิดรับสมัคร (Closed)</option>
                        <option value="completed">📜 จัดจบแล้ว (Completed / งานเก่า)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ชื่องานวิ่ง Episode *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="เช่น TAK City Run EP.02 - ปั่นปันรัก วิ่งรับลมหนาว ริมแม่น้ำปิง"
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">คำโปรย / สโลแกนประจำ EP</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="เช่น วิ่งสัมผัสสายหมอกและลมหนาวเลียบสะพาน 200 ปี"
                      value={eventFormData.subtitle}
                      onChange={(e) => setEventFormData({ ...eventFormData, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">วันและเวลาปล่อยตัว *</label>
                      <input 
                        type="datetime-local" 
                        className="form-control"
                        value={eventFormData.eventDate ? eventFormData.eventDate.substring(0, 16) : ''}
                        onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">รูปโปสเตอร์หน้าปก (Cover Image URL)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="https://..."
                        value={eventFormData.coverImage}
                        onChange={(e) => setEventFormData({ ...eventFormData, coverImage: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">สถานที่จัดงาน & จุดปล่อยตัว *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="เช่น ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก"
                      value={eventFormData.locationName}
                      onChange={(e) => setEventFormData({ ...eventFormData, locationName: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalActiveTab('distance')}>
                      ถัดไป: 🏃 ตั้งค่าระยะทาง & โควตา ➔
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Single Distance */}
              {modalActiveTab === 'distance' && (
                <div>
                  <div style={{ background: 'rgba(255, 85, 0, 0.1)', border: '1px solid rgba(255, 85, 0, 0.3)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '20px' }}>
                    <p style={{ color: '#FFA559', fontSize: '0.9rem' }}>
                      💡 <strong>ระยะทางเดียวประจำ EP:</strong> สมาชิกในชมรมจะวิ่งระยะทางเดียวกันในงานนี้ (เช่น 5.8 KM)
                    </p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">ระยะทางวิ่งอย่างเป็นทางการ (กิโลเมตร) *</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-control"
                        style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}
                        placeholder="เช่น 5.8"
                        value={eventFormData.distanceKm}
                        onChange={(e) => setEventFormData({ ...eventFormData, distanceKm: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">โควตาผู้เข้าร่วม (คน) *</label>
                      <input 
                        type="number" 
                        className="form-control"
                        placeholder="เช่น 500"
                        value={eventFormData.quota}
                        onChange={(e) => setEventFormData({ ...eventFormData, quota: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ชื่อเรียกของระยะทางวิ่งนี้ *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="เช่น City Run 5.8K ตะลุยเมืองเก่าเลียบปิง"
                      value={eventFormData.distanceLabel}
                      onChange={(e) => setEventFormData({ ...eventFormData, distanceLabel: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalActiveTab('general')}>
                      ⬅ 1. ข้อมูลทั่วไป
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalActiveTab('route')}>
                      ถัดไป: 🗺️ แผนที่รูท & จุดบริการ ➔
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Route Map & Details */}
              {modalActiveTab === 'route' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">
                      🗺️ URL รูปภาพแผนที่เส้นทางวิ่ง (Route Map Image URL)
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="วางลิงก์รูปภาพแผนที่รูทวิ่ง / แผนที่ GPX (เช่น https://...)"
                      value={eventFormData.routeImageUrl}
                      onChange={(e) => setEventFormData({ ...eventFormData, routeImageUrl: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ตัวอย่างรูป:</span>
                      <button 
                        type="button" 
                        style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setEventFormData({ ...eventFormData, routeImageUrl: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=1200&q=80' })}
                      >
                        [ใช้รูปตัวอย่างแผนที่เมืองตาก]
                      </button>
                    </div>
                  </div>

                  {/* Live Image Preview */}
                  {eventFormData.routeImageUrl && (
                    <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        ตัวอย่างรูปแผนที่ปัจจุบัน (Preview):
                      </span>
                      <img 
                        src={eventFormData.routeImageUrl} 
                        alt="Preview Map" 
                        style={{ maxWidth: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">ลิงก์ Google Maps สำหรับปักหมุดจุดปล่อยตัว</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="https://maps.google.com/?q=..."
                      value={eventFormData.locationMapUrl}
                      onChange={(e) => setEventFormData({ ...eventFormData, locationMapUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">คำอธิบายเส้นทางวิ่ง สภาพถนน และบรรยากาศ</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      placeholder="เช่น เส้นทางไฮไลต์เลียบเขื่อนแม่น้ำปิง ผ่านสะพานแขวน 200 ปี ทางราบเรียบ วิ่งสบายตลอดสาย"
                      value={eventFormData.routeDescription}
                      onChange={(e) => setEventFormData({ ...eventFormData, routeDescription: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">จำนวนจุดบริการน้ำดื่ม (จุด)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={eventFormData.waterStations}
                        onChange={(e) => setEventFormData({ ...eventFormData, waterStations: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">จำนวนหน่วยปฐมพยาบาล (จุด)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={eventFormData.firstAidPoints}
                        onChange={(e) => setEventFormData({ ...eventFormData, firstAidPoints: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ระดับความชัน / สภาพพื้นที่ (Elevation)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="เช่น +12 ม. (ทางราบ 95%)"
                      value={eventFormData.elevationGain}
                      onChange={(e) => setEventFormData({ ...eventFormData, elevationGain: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ไฮไลต์สถานที่ในเส้นทาง (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="เช่น สะพาน 200 ปี, ศาลสมเด็จพระเจ้าตากสิน, ตลาดเก่าริมปิง"
                      value={eventFormData.routeHighlightsText}
                      onChange={(e) => setEventFormData({ ...eventFormData, routeHighlightsText: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalActiveTab('distance')}>
                      ⬅ 2. ระยะทาง & โควตา
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalActiveTab('schedule')}>
                      ถัดไป: ⏱️ ตารางเวลา ➔
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Schedule */}
              {modalActiveTab === 'schedule' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <label className="form-label" style={{ margin: 0 }}>ตารางเวลากิจกรรมเช้าวันงาน</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddScheduleRow}>
                      <Plus size={14} /> เพิ่มเวลา
                    </button>
                  </div>

                  {eventFormData.schedule?.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="05:30 น."
                        value={item.time}
                        onChange={(e) => {
                          const updated = [...eventFormData.schedule];
                          updated[idx].time = e.target.value;
                          setEventFormData({ ...eventFormData, schedule: updated });
                        }}
                      />
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="รายละเอียดกิจกรรม เช่น รวมพล Warm-up"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...eventFormData.schedule];
                          updated[idx].title = e.target.value;
                          setEventFormData({ ...eventFormData, schedule: updated });
                        }}
                      />
                      {eventFormData.schedule.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          style={{ color: '#F87171' }}
                          onClick={() => handleRemoveScheduleRow(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Past Event Stats */}
                  {eventFormData.status === 'completed' && (
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--cyan)', marginBottom: '10px' }}>สถิติความสำเร็จของงาน (สำหรับคลังประวัติ)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>นักวิ่งเข้าร่วม (คน)</label>
                          <input 
                            type="number" 
                            className="form-control"
                            value={eventFormData.stats?.runnersJoined || 500}
                            onChange={(e) => setEventFormData({ ...eventFormData, stats: { ...eventFormData.stats, runnersJoined: Number(e.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>กิโลเมตรรวม</label>
                          <input 
                            type="number" 
                            className="form-control"
                            value={eventFormData.stats?.totalKilometers || 2900}
                            onChange={(e) => setEventFormData({ ...eventFormData, stats: { ...eventFormData.stats, totalKilometers: Number(e.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>จำนวนภาพถ่าย</label>
                          <input 
                            type="text" 
                            className="form-control"
                            value={eventFormData.stats?.photosTaken || '1,000+'}
                            onChange={(e) => setEventFormData({ ...eventFormData, stats: { ...eventFormData.stats, photosTaken: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--dark-border)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1.05rem' }}>
                  {isEditingEvent ? '💾 บันทึกการแก้ไขงานวิ่ง & แผนที่' : '✓ ยืนยันสร้างงานวิ่งใหม่'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEventModalOpen(false)}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SPONSOR */}
      {sponsorModalOpen && (
        <div className="modal-overlay" onClick={() => setSponsorModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>เพิ่มผู้สนับสนุนใหม่</h3>
              <button className="modal-close-btn" onClick={() => setSponsorModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddSponsor}>
              <div className="form-group">
                <label className="form-label">ชื่อผู้สนับสนุน / องค์กร *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={sponsorFormData.name}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">ระดับการสนับสนุน (Tier)</label>
                <select 
                  className="form-control"
                  value={sponsorFormData.tier}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, tier: e.target.value })}
                >
                  <option value="main">ผู้สนับสนุนหลัก (Main Sponsor)</option>
                  <option value="gold">ผู้สนับสนุนระดับทอง (Gold)</option>
                  <option value="supporter">ผู้สนับสนุนชุมชน (Community Supporter)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">บทบาทการสนับสนุน</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น สนับสนุนน้ำดื่มตลอดเส้นทาง"
                  value={sponsorFormData.role}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, role: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL รูปภาพโลโก้</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={sponsorFormData.logo}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, logo: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                บันทึกผู้สนับสนุน
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SHOP/ACTIVITY */}
      {shopModalOpen && (
        <div className="modal-overlay" onClick={() => setShopModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>เพิ่มร้านค้าหรือกิจกรรม</h3>
              <button className="modal-close-btn" onClick={() => setShopModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddShop}>
              <div className="form-group">
                <label className="form-label">ชื่อร้านค้า หรือ ชื่อกิจกรรม *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">หมวดหมู่</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น อาหารพื้นเมือง, เครื่องดื่ม, สุขภาพ"
                  value={shopFormData.category}
                  onChange={(e) => setShopFormData({ ...shopFormData, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">คำอธิบาย</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={shopFormData.description}
                  onChange={(e) => setShopFormData({ ...shopFormData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ป้ายข้อความพิเศษ (Badge)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น ลด 10% เมื่อโชว์คูปองนักวิ่ง"
                  value={shopFormData.badge}
                  onChange={(e) => setShopFormData({ ...shopFormData, badge: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL รูปภาพ</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={shopFormData.image}
                  onChange={(e) => setShopFormData({ ...shopFormData, image: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                บันทึกรายการ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GALLERY PHOTO */}
      {galleryModalOpen && (
        <div className="modal-overlay" onClick={() => setGalleryModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>เพิ่มรูปภาพแกลเลอรี</h3>
              <button className="modal-close-btn" onClick={() => setGalleryModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddGallery}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Episode ลำดับที่</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={galleryFormData.epNumber}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, epNumber: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ชื่อภาพไฮไลต์ *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="เช่น ปล่อยตัวยามเช้า"
                    value={galleryFormData.title}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">คำบรรยายภาพ</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={galleryFormData.caption}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, caption: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL รูปภาพ (Direct Link) *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={galleryFormData.image}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, image: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                บันทึกภาพแกลเลอรี
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {changePasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setChangePasswordModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>🔑 เปลี่ยนรหัสผ่านของฉัน</h3>
              <button className="modal-close-btn" onClick={() => setChangePasswordModalOpen(false)}>&times;</button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              บัญชี: <strong style={{ color: 'var(--primary)' }}>@{currentAdmin?.username || 'admin'}</strong> ({currentAdmin?.displayName})
            </p>

            {changePasswordError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {changePasswordError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">รหัสผ่านปัจจุบัน *</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="กรอกรหัสผ่านเดิม"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร) *</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="กำหนดรหัสผ่านใหม่"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ยืนยันรหัสผ่านใหม่อีกครั้ง *</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  บันทึกรหัสผ่านใหม่
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setChangePasswordModalOpen(false)}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ADMIN / STAFF */}
      {newAdminModalOpen && (
        <div className="modal-overlay" onClick={() => setNewAdminModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>➕ เพิ่มบัญชีผู้ดูแลระบบ / สตาฟใหม่</h3>
              <button className="modal-close-btn" onClick={() => setNewAdminModalOpen(false)}>&times;</button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              กำหนดชื่อผู้ใช้งานและรหัสผ่านเริ่มต้นให้ทีมงาน (ไม่ต้องใช้อีเมล) และทีมงานสามารถเปลี่ยนรหัสผ่านเองได้
            </p>

            {newAdminError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {newAdminError}
              </div>
            )}

            <form onSubmit={handleCreateAdminUser}>
              <div className="form-group">
                <label className="form-label">ชื่อผู้ใช้งาน (Username สำหรับล็อกอิน) *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น staff_tak, somchai, nurse01"
                  value={newAdminForm.username}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อเรียก / หน่วยงาน (Display Name)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น สมชาย (โต๊ะลงทะเบียน), ทีมปฐมพยาบาล"
                  value={newAdminForm.displayName}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, displayName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">รหัสผ่านเริ่มต้น *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น tak2026, 123456"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ระดับสิทธิ์ (Role)</label>
                <select 
                  className="form-control"
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                >
                  <option value="staff">🛡️ สตาฟหน้างาน (Staff Check-in)</option>
                  <option value="admin">👑 แอดมินจัดการงานวิ่ง (Admin)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  ✓ สร้างบัญชีแอดมิน
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setNewAdminModalOpen(false)}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
