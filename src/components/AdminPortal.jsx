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
  Sparkles
} from 'lucide-react';
import { DataService, isSupabaseConfigured } from '../lib/supabase';

export function AdminPortal({ 
  clubSettings, 
  events = [], 
  activeEvent, 
  onSettingsUpdate, 
  onEventsUpdate,
  onExitAdmin 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tabs: 'runners', 'scanner', 'events', 'sponsors', 'market', 'gallery', 'settings'
  const [activeTab, setActiveTab] = useState('events');
  const [registrations, setRegistrations] = useState([]);
  const [sponsorsList, setSponsorsList] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistance, setFilterDistance] = useState('all');
  const [filterCheckIn, setFilterCheckIn] = useState('all');

  // Quick Check-in input for race day
  const [quickBib, setQuickBib] = useState('');
  const [notice, setNotice] = useState(null);

  // Event Modal (Create / Edit)
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [eventFormType, setEventFormType] = useState('upcoming'); // 'upcoming' or 'past'
  const [eventFormData, setEventFormData] = useState({
    id: '',
    epNumber: 3,
    title: '',
    subtitle: '',
    eventDate: '2026-12-20T05:30',
    locationName: 'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก',
    locationMapUrl: 'https://maps.google.com/?q=Tak+City',
    coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    status: 'open', // 'open', 'closed', 'completed'
    isActive: false,
    distances: [
      { id: 'dist-1', label: 'Fun Run 3.5K', distanceKm: 3.5, quota: 300 },
      { id: 'dist-2', label: 'City Run 5.8K', distanceKm: 5.8, quota: 400 },
      { id: 'dist-3', label: 'Mini 10.5K', distanceKm: 10.5, quota: 200 }
    ],
    stats: {
      runnersJoined: 500,
      totalKilometers: 3200,
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

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated, activeEvent]);

  useEffect(() => {
    if (clubSettings) {
      setSettingsForm(clubSettings);
    }
  }, [clubSettings]);

  const checkAuth = async () => {
    const auth = await DataService.checkAdminAuth();
    if (auth.isAuthenticated) {
      setIsAuthenticated(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await DataService.loginAdmin({ pin: pinInput });
    if (res.success) {
      setIsAuthenticated(true);
      setPinInput('');
    } else {
      setLoginError(res.error || 'รหัส PIN ไม่ถูกต้อง');
    }
  };

  const handleLogout = async () => {
    await DataService.logoutAdmin();
    setIsAuthenticated(false);
  };

  const loadAllAdminData = async () => {
    try {
      const [regs, sps, shps, gals] = await Promise.all([
        DataService.getRegistrations(activeEvent?.id),
        DataService.getSponsors(),
        DataService.getShopsAndActivities(),
        DataService.getPastGalleries()
      ]);
      setRegistrations(regs);
      setSponsorsList(sps);
      setShopsList(shps);
      setGalleryList(gals);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (text, isSuccess = true) => {
    setNotice({ success: isSuccess, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // ==========================================
  // EVENT ACTIONS (CREATE, EDIT, DELETE, SWITCH)
  // ==========================================
  const handleOpenCreateEvent = (type = 'upcoming') => {
    setIsEditingEvent(false);
    setEventFormType(type);
    const nextEp = events.length + 1;
    setEventFormData({
      id: `ep-${Date.now()}`,
      epNumber: nextEp,
      title: type === 'past' 
        ? `TAK City Run EP.${String(nextEp).padStart(2, '0')} - งานวิ่งในอดีต` 
        : `TAK City Run EP.${String(nextEp).padStart(2, '0')} - ชื่องานวิ่งใหม่`,
      subtitle: type === 'past' ? 'บันทึกประวัติความประทับใจของงานวิ่งที่ผ่านมา' : 'วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดี',
      eventDate: '2026-11-20T05:30',
      locationName: 'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก',
      locationMapUrl: 'https://maps.google.com/?q=Tak+City',
      coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
      status: type === 'past' ? 'completed' : 'open',
      isActive: false,
      distances: [
        { id: `dist-${Date.now()}-1`, label: 'Fun Run 3.5K', distanceKm: 3.5, quota: 300 },
        { id: `dist-${Date.now()}-2`, label: 'City Run 5.8K', distanceKm: 5.8, quota: 400 },
        { id: `dist-${Date.now()}-3`, label: 'Mini 10.5K', distanceKm: 10.5, quota: 200 }
      ],
      stats: {
        runnersJoined: 450,
        totalKilometers: 2800,
        photosTaken: '800+'
      }
    });
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (event) => {
    setIsEditingEvent(true);
    setEventFormType(event.status === 'completed' ? 'past' : 'upcoming');
    setEventFormData({
      ...event,
      distances: event.distances && event.distances.length > 0 ? event.distances : [
        { id: 'dist-1', label: 'Fun Run 3.5K', distanceKm: 3.5, quota: 300 }
      ],
      stats: event.stats || {
        runnersJoined: 500,
        totalKilometers: 3000,
        photosTaken: '1,000+'
      }
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) {
      showToast('กรุณากรอกชื่องานวิ่ง', false);
      return;
    }

    try {
      if (isEditingEvent) {
        await DataService.updateEvent(eventFormData.id, eventFormData);
        showToast(`แก้ไขข้อมูล EP.${eventFormData.epNumber} สำเร็จแล้ว!`);
      } else {
        await DataService.createEvent(eventFormData);
        showToast(`เพิ่มงานวิ่ง EP.${eventFormData.epNumber} สำเร็จแล้ว!`);
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
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบงานวิ่ง "${title}"?`)) return;

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
    showToast('เปลี่ยน EP หน้าเว็บหลักเรียบร้อยแล้ว');
  };

  // Add/remove distance in event modal form
  const handleAddDistanceToForm = () => {
    setEventFormData({
      ...eventFormData,
      distances: [
        ...eventFormData.distances,
        { id: `dist-${Date.now()}`, label: 'ระยะใหม่', distanceKm: 5.0, quota: 200 }
      ]
    });
  };

  const handleRemoveDistance = (index) => {
    const updated = [...eventFormData.distances];
    updated.splice(index, 1);
    setEventFormData({ ...eventFormData, distances: updated });
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

    const headers = ['ลำดับ', 'หมายเลข BIB', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'เบอร์โทรศัพท์', 'ระยะทาง', 'ไซส์เสื้อ', 'ผู้ติดต่อฉุกเฉิน', 'เบอร์ฉุกเฉิน', 'โรคประจำตัว', 'สถานะเช็คอิน', 'เวลาลงทะเบียน'];
    const rows = filteredRunners.map((r, index) => {
      const distLabel = activeEvent?.distances?.find(d => d.id === r.distanceId)?.label || r.distanceId || '-';
      return [
        index + 1,
        `"${r.bibNumber}"`,
        `"${r.fullName}"`,
        `"${r.nickname || '-'}"`,
        `"${r.phone}"`,
        `"${distLabel}"`,
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
    setShopsList(shopsList.filter(s => s.id !== id));
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

  // Filter Runners
  const filteredRunners = registrations.filter(r => {
    const matchesQuery = !searchQuery || 
      r.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone && r.phone.includes(searchQuery));

    const matchesDist = filterDistance === 'all' || r.distanceId === filterDistance;
    const matchesCheckIn = filterCheckIn === 'all' || 
      (filterCheckIn === 'checked' && r.checkedIn) || 
      (filterCheckIn === 'pending' && !r.checkedIn);

    return matchesQuery && matchesDist && matchesCheckIn;
  });

  // Calculate Stats
  const totalRunners = registrations.length;
  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const checkedInPercent = totalRunners > 0 ? Math.round((checkedInCount / totalRunners) * 100) : 0;

  // Unauthenticated screen
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
              TAK City Run Admin Portal
            </p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">รหัส PIN แอดมิน (ค่าเริ่มต้น: 1234)</label>
              <input 
                type="password" 
                className="form-control"
                placeholder="กรอกรหัส PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={8}
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
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

  // Authenticated Admin Dashboard
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
            งานวิ่งที่เปิดอยู่ปัจจุบัน: <strong>EP.{activeEvent?.epNumber || '02'} - {activeEvent?.title}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <LogOut size={16} /> ออกจากระบบ
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
          <div className="stat-val" style={{ color: '#FBBF24' }}>{sponsorsList.length}</div>
          <div className="stat-label">ผู้สนับสนุน</div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button 
          className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={18} /> จัดการ EP งานวิ่ง ({events.length})
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
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Palette size={18} /> ปรับแต่ง Logo & สไตล์
        </button>
      </div>

      {/* ========================================================
          TAB: EVENTS MANAGEMENT (CREATE, EDIT, DELETE, PAST EP)
         ======================================================== */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>จัดการงานวิ่งแต่ละ Episode</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                เพิ่มงานใหม่ที่กำลังจะจัด หรือเพิ่มประวัติงานเก่าที่เคยจัดจบไปแล้วเพื่อเก็บบันทึก
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenCreateEvent('past')}>
                <History size={16} /> + บันทึกประวัติงานเก่า (Past EP)
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenCreateEvent('upcoming')}>
                <Plus size={16} /> + สร้างงานวิ่ง EP ใหม่ (เปิดรับสมัคร)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <span className={`badge-tag ${ev.status === 'completed' ? 'cyan' : ev.status === 'open' ? 'green' : ''}`} style={{ marginBottom: '6px' }}>
                        {ev.status === 'open' ? '🟢 เปิดรับสมัคร' : ev.status === 'completed' ? '📜 จัดจบแล้ว (งานเก่า)' : '⚪ ปิดรับสมัคร'}
                      </span>
                      {ev.isActive && (
                        <span className="badge-tag" style={{ marginLeft: '6px' }}>
                          ★ EP หน้าแรก
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleOpenEditEvent(ev)}
                        title="แก้ไขงานวิ่งนี้"
                      >
                        <Edit size={14} /> แก้ไข
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

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>
                    EP.{String(ev.epNumber).padStart(2, '0')} - {ev.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                    {ev.subtitle}
                  </p>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    <div>📅 วันที่: <strong>{new Date(ev.eventDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}</strong></div>
                    <div style={{ marginTop: '4px' }}>📍 สถานที่: <strong>{ev.locationName}</strong></div>
                  </div>

                  {/* Distances List */}
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ระยะทางที่เปิดรับ:</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {ev.distances?.map(d => (
                        <span key={d.id} style={{ background: 'rgba(255, 85, 0, 0.12)', border: '1px solid rgba(255, 85, 0, 0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#FFF' }}>
                          <strong>{d.label}</strong> ({d.distanceKm}K) • โควตา {d.quota} คน
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats for past event */}
                  {ev.stats && (
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB: RUNNERS LIST & EXPORT
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
                  placeholder="ค้นหาชื่อ, เบอร์โทร, หรือเลข BIB..."
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
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <Download size={16} /> ส่งออก Excel (CSV)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>BIB</th>
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
                  filteredRunners.map((runner) => {
                    const distLabel = activeEvent?.distances?.find(d => d.id === runner.distanceId)?.label || runner.distanceId || '-';
                    return (
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
                          <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', fontSize: '0.85rem' }}>
                            {distLabel}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB: QUICK RACE DAY CHECK-IN
         ======================================================== */}
      {activeTab === 'scanner' && (
        <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(0, 240, 255, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <QrCode size={36} color="var(--cyan)" />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#FFF', marginBottom: '8px' }}>
            โต๊ะเช็คอินรับเบอร์วิ่งหน้างาน
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
            พิมพ์หรือสแกนหมายเลข BIB (เช่น TK02-001) หรือกรอกเบอร์โทรศัพท์ 10 หลักเพื่อเช็คชื่อรับของทันที
          </p>

          <form onSubmit={handleQuickCheckIn} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input 
              type="text" 
              className="form-control"
              style={{ fontSize: '1.25rem', textAlign: 'center', letterSpacing: '1px' }}
              placeholder="พิมพ์เลข BIB หรือ เบอร์โทร..."
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
          TAB: SPONSORS MANAGEMENT
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
          TAB: SHOPS & ACTIVITIES MANAGEMENT
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
          TAB: GALLERY MANAGEMENT
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
          TAB: SETTINGS & STYLES
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
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ค่าเริ่มต้น: /tak-city-run-logo.svg หรือใส่ Direct Link ของรูปภาพ
              </span>
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
          MODAL: CREATE / EDIT EVENT (Supports Past and Upcoming)
         ======================================================== */}
      {eventModalOpen && (
        <div className="modal-overlay" onClick={() => setEventModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge-tag" style={{ marginBottom: '4px' }}>
                  {eventFormType === 'past' ? 'คลังประวัติงานเก่า' : 'งานวิ่งเปิดรับสมัคร'}
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#FFF' }}>
                  {isEditingEvent ? 'แก้ไขข้อมูลงานวิ่ง' : eventFormType === 'past' ? 'บันทึกประวัติงานวิ่งที่จบไปแล้ว (Past EP)' : 'สร้างงานวิ่ง EP ใหม่'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setEventModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
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
                  placeholder="เช่น TAK City Run EP.03 - วิ่งรับลมหนาว ริมปิง"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">คำโปรย / สโลแกนงาน</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น วิ่งสัมผัสบรรยากาศยามเช้าเมืองตาก"
                  value={eventFormData.subtitle}
                  onChange={(e) => setEventFormData({ ...eventFormData, subtitle: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">วันและเวลาจัดกิจกรรม *</label>
                  <input 
                    type="datetime-local" 
                    className="form-control"
                    value={eventFormData.eventDate ? eventFormData.eventDate.substring(0, 16) : ''}
                    onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">รูปภาพหน้าปก / โปสเตอร์ (URL)</label>
                  <input 
                    type="text" 
                    className="form-control"
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
                  value={eventFormData.locationName}
                  onChange={(e) => setEventFormData({ ...eventFormData, locationName: e.target.value })}
                  required
                />
              </div>

              {/* Distances Manager */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>ระยะทางวิ่งใน EP นี้</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddDistanceToForm}>
                    <Plus size={14} /> เพิ่มระยะ
                  </button>
                </div>

                {eventFormData.distances?.map((dist, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="ชื่อระยะ เช่น City Run 5.8K"
                      value={dist.label}
                      onChange={(e) => {
                        const updated = [...eventFormData.distances];
                        updated[idx].label = e.target.value;
                        setEventFormData({ ...eventFormData, distances: updated });
                      }}
                    />
                    <input 
                      type="number" 
                      step="0.1" 
                      className="form-control" 
                      placeholder="กม."
                      value={dist.distanceKm}
                      onChange={(e) => {
                        const updated = [...eventFormData.distances];
                        updated[idx].distanceKm = Number(e.target.value);
                        setEventFormData({ ...eventFormData, distances: updated });
                      }}
                    />
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="โควตา"
                      value={dist.quota}
                      onChange={(e) => {
                        const updated = [...eventFormData.distances];
                        updated[idx].quota = Number(e.target.value);
                        setEventFormData({ ...eventFormData, distances: updated });
                      }}
                    />
                    {eventFormData.distances.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        style={{ color: '#F87171' }}
                        onClick={() => handleRemoveDistance(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats for completed past event */}
              {eventFormData.status === 'completed' && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
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
                        value={eventFormData.stats?.totalKilometers || 3000}
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', marginTop: '24px', fontSize: '1.05rem' }}>
                {isEditingEvent ? 'บันทึกการแก้ไขงานวิ่ง' : 'ยืนยันสร้างงานวิ่ง'}
              </button>
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
                  placeholder="เช่น ลด 10% เมื่อโชว์ E-BIB"
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
    </div>
  );
}
