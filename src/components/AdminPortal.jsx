import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Palette, 
  Store, 
  HeartHandshake, 
  Search, 
  Download, 
  Plus, 
  Check, 
  CheckCircle, 
  XCircle, 
  Lock, 
  LogOut, 
  QrCode,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink
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

  const [activeTab, setActiveTab] = useState('runners'); // 'runners', 'events', 'scanner', 'settings', 'sponsors', 'market'
  const [registrations, setRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistance, setFilterDistance] = useState('all');
  const [filterCheckIn, setFilterCheckIn] = useState('all');

  // Quick Check-in input for race day
  const [quickBib, setQuickBib] = useState('');
  const [checkInNotice, setCheckInNotice] = useState(null);

  // New Event Form State
  const [newEventModal, setNewEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    epNumber: events.length + 1,
    title: '',
    subtitle: '',
    eventDate: '2026-12-20T05:30:00',
    locationName: 'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก',
    locationMapUrl: 'https://maps.google.com/?q=Tak+City',
    coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    distances: [
      { id: `dist-new-1`, label: 'Fun Run 3.5K', distanceKm: 3.5, quota: 300, startPrice: 0 },
      { id: `dist-new-2`, label: 'City Run 5.5K', distanceKm: 5.5, quota: 400, startPrice: 0 },
      { id: `dist-new-3`, label: 'Mini 10.5K', distanceKm: 10.5, quota: 200, startPrice: 0 }
    ]
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState(clubSettings || {});
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadRegistrations();
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

  const loadRegistrations = async () => {
    const regs = await DataService.getRegistrations(activeEvent?.id);
    setRegistrations(regs);
  };

  // Toggle Check-in
  const handleToggleCheckIn = async (regId) => {
    const updated = await DataService.toggleCheckIn(regId);
    setRegistrations(prev => prev.map(r => r.id === regId || r.bibNumber === regId ? updated : r));
    setCheckInNotice({
      success: true,
      text: `อัปเดตสถานะ ${updated.bibNumber} (${updated.fullName}) เป็น: ${updated.checkedIn ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน'}`
    });
    setTimeout(() => setCheckInNotice(null), 4000);
  };

  // Quick race-day check-in by BIB number
  const handleQuickCheckIn = (e) => {
    e.preventDefault();
    const cleanBib = quickBib.trim().toUpperCase();
    if (!cleanBib) return;

    const runner = registrations.find(r => r.bibNumber.toUpperCase() === cleanBib || r.phone === cleanBib);
    if (!runner) {
      setCheckInNotice({ success: false, text: `ไม่พบข้อมูลนักวิ่งสำหรับหมายเลข "${cleanBib}"` });
      setTimeout(() => setCheckInNotice(null), 4000);
      return;
    }

    handleToggleCheckIn(runner.id);
    setQuickBib('');
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('ไม่มีข้อมูลนักวิ่งสำหรับส่งออก');
      return;
    }

    const headers = ['ลำดับ', 'หมายเลข BIB', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'เบอร์โทรศัพท์', 'ระยะทาง', 'ไซส์เสื้อ', 'ผู้ติดต่อฉุกเฉิน', 'เบอร์ฉุกเฉิน', 'สถานะเช็คอิน', 'เวลาลงทะเบียน'];
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

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const updated = await DataService.updateSettings(settingsForm);
    onSettingsUpdate(updated);
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
  };

  // Create New EP
  const handleCreateNewEvent = async (e) => {
    e.preventDefault();
    if (!newEventData.title) return;

    const created = await DataService.createEvent(newEventData);
    const allEvents = await DataService.getEvents();
    onEventsUpdate(allEvents);
    setNewEventModal(false);
    alert(`สร้างงานวิ่ง EP.${created.epNumber} สำเร็จแล้ว!`);
  };

  // Switch Active Event
  const handleSetActiveEvent = async (eventId) => {
    const updated = await DataService.setActiveEvent(eventId);
    onEventsUpdate(updated);
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

  // Render Login screen if not authenticated
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
              <label className="form-label">รหัส PIN แอดมิน (ค่าเริ่มต้นคือ 1234)</label>
              <input 
                type="password" 
                className="form-control"
                placeholder="กรอกรหัส PIN 4 หลัก"
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

  // Render Admin Dashboard
  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 30px)', paddingBottom: '80px' }}>
      {/* Admin Header */}
      <div className="admin-header">
        <div>
          <span className="badge-tag cyan" style={{ marginBottom: '6px' }}>
            <ShieldCheck size={14} /> Club Management System
          </span>
          <h1 style={{ fontSize: '2rem' }}>ศูนย์ควบคุมแอดมิน TAK City Run</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            จัดการงานวิ่ง EP.{activeEvent?.epNumber || '02'} ({activeEvent?.title})
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

      {/* Backend Status indicator */}
      <div style={{ 
        background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 85, 0, 0.12)', 
        border: `1px solid ${isSupabaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 85, 0, 0.3)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.88rem'
      }}>
        <span>
          <strong>สถานะระบบ Backend:</strong> {isSupabaseConfigured 
            ? '🟢 เชื่อมต่อ Supabase Live Database สำเร็จ' 
            : '🟠 โหมด Local Offline Store พร้อมใช้ (ใส่ VITE_SUPABASE_URL และ KEY ใน .env เมื่อต้องการต่อ Cloud)'}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Cloudflare Pages Ready
        </span>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--primary)' }}>{totalRunners}</div>
          <div className="stat-label">ยอดผู้ลงทะเบียนทั้งหมด (คน)</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--green)' }}>{checkedInCount}</div>
          <div className="stat-label">เช็คอินหน้างานแล้ว ({checkedInPercent}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--cyan)' }}>{totalRunners - checkedInCount}</div>
          <div className="stat-label">รอเช็คอิน (คน)</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: '#FFF' }}>{events.length}</div>
          <div className="stat-label">จำนวน EP ที่บันทึกในระบบ</div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="admin-nav-tabs">
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
          <QrCode size={18} /> เช็คอินด่วนหน้างาน (Check-in Desk)
        </button>

        <button 
          className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={18} /> จัดการ EP งานวิ่ง ({events.length})
        </button>

        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Palette size={18} /> ปรับแต่ง Logo & ธีมสีสไตล์
        </button>
      </div>

      {/* TAB 1: RUNNERS LIST */}
      {activeTab === 'runners' && (
        <div className="glass-card">
          {checkInNotice && (
            <div style={{
              background: checkInNotice.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${checkInNotice.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: checkInNotice.success ? '#6EE7B7' : '#FCA5A5',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontWeight: 600
            }}>
              {checkInNotice.text}
            </div>
          )}

          {/* Filters & Actions */}
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

          {/* Data Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>BIB</th>
                  <th>ชื่อ-นามสกุล (ชื่อเล่น)</th>
                  <th>เบอร์โทร</th>
                  <th>ระยะทาง</th>
                  <th>ไซส์เสื้อ</th>
                  <th>ผู้ติดต่อฉุกเฉิน</th>
                  <th>สถานะเช็คอิน</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRunners.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
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
                          <button 
                            className={`btn btn-sm ${runner.checkedIn ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleToggleCheckIn(runner.id)}
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            {runner.checkedIn ? 'ยกเลิก' : 'เช็คอิน'}
                          </button>
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

      {/* TAB 2: RACE DAY QUICK CHECK-IN */}
      {activeTab === 'scanner' && (
        <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(0, 240, 255, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <QrCode size={36} color="var(--cyan)" />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#FFF', marginBottom: '8px' }}>
            จุดเช็คอินรับของหน้างาน (Race Day Desk)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
            พิมพ์หรือสแกนหมายเลข BIB (เช่น TK02-001) หรือเบอร์โทรศัพท์ เพื่อเช็คชื่อรับของได้ทันที
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

          {checkInNotice && (
            <div style={{
              background: checkInNotice.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${checkInNotice.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: checkInNotice.success ? '#6EE7B7' : '#FCA5A5',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '1.05rem'
            }}>
              {checkInNotice.text}
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>💡 คำแนะนำสำหรับทีมงานหน้างาน:</h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>นักวิ่งสามารถเปิดหน้าจอ E-BIB ที่มี QR Code ให้ทีมงานสแกนผ่านกล้อง หรือดูรหัส BIB ได้</li>
              <li>หากหา BIB ไม่เจอ สามารถพิมพ์เบอร์โทร 10 หลักของนักวิ่งในช่องนี้ได้ทันที</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: EVENTS MANAGEMENT */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem' }}>รายการงานวิ่งทั้งหมด (Episodes)</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setNewEventModal(true)}>
              <Plus size={16} /> เพิ่มงานวิ่ง EP ใหม่
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {events.map((ev) => (
              <div key={ev.id} className="glass-card" style={{ border: ev.isActive ? '2px solid var(--primary)' : '1px solid var(--dark-border)' }}>
                {ev.isActive && (
                  <span className="badge-tag" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    EP ปัจจุบัน (Active)
                  </span>
                )}

                <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
                  EP.{String(ev.epNumber).padStart(2, '0')} - {ev.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                  {new Date(ev.eventDate).toLocaleDateString('th-TH', { dateStyle: 'long' })} • {ev.locationName}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {ev.distances?.map(d => (
                    <span key={d.id} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {d.label}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {!ev.isActive && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSetActiveEvent(ev.id)}
                    >
                      ตั้งเป็น EP หน้าเว็บหลัก
                    </button>
                  )}
                  <span style={{ fontSize: '0.85rem', color: ev.status === 'open' ? 'var(--green)' : 'var(--text-muted)', alignSelf: 'center' }}>
                    สถานะ: {ev.status === 'open' ? '🟢 เปิดรับสมัคร' : '⚪ ปิดรับสมัคร / จบงานแล้ว'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & STYLES */}
      {activeTab === 'settings' && (
        <div className="glass-card" style={{ maxWidth: '680px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>ปรับแต่งข้อมูลชมรม & สไตล์เว็บไซต์</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            คุณสามารถเปลี่ยนชื่อชมรม สโลแกน โลโก้ และโทนสีหลักของหน้าเว็บได้ตามต้องการ
          </p>

          {settingsSavedNotice && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6EE7B7', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              บันทึกการตั้งค่าเรียบร้อยแล้ว!
            </div>
          )}

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
              <label className="form-label">สโลแกน (Tagline)</label>
              <input 
                type="text" 
                className="form-control"
                value={settingsForm.tagline || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ที่อยู่รูปภาพ Logo (URL หรือ Relative Path)</label>
              <input 
                type="text" 
                className="form-control"
                value={settingsForm.logoUrl || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ค่าเริ่มต้น: /tak-city-run-logo.svg หรือใส่ Link รูปภาพจาก Supabase Storage ได้
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
                <label className="form-label">รหัส PIN แอดมิน</label>
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

      {/* Modal for Creating New EP */}
      {newEventModal && (
        <div className="modal-overlay" onClick={() => setNewEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.3rem', color: '#FFF' }}>เพิ่มงานวิ่ง Episode ใหม่</h3>
              <button className="modal-close-btn" onClick={() => setNewEventModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewEvent}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Episode ลำดับที่</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={newEventData.epNumber}
                    onChange={(e) => setNewEventData({ ...newEventData, epNumber: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">วันและเวลาจัดงาน</label>
                  <input 
                    type="datetime-local" 
                    className="form-control"
                    value={newEventData.eventDate}
                    onChange={(e) => setNewEventData({ ...newEventData, eventDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่องานวิ่ง EP</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น TAK City Run EP.03 - วิ่งขึ้นดอย สอยมาลัย"
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">คำโปรย / สโลแกนงาน</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="เช่น สัมผัสธรรมชาติเส้นทางวิ่งร่มรื่นยามเช้า"
                  value={newEventData.subtitle}
                  onChange={(e) => setNewEventData({ ...newEventData, subtitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">สถานที่จัดงาน & จุดปล่อยตัว</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newEventData.locationName}
                  onChange={(e) => setNewEventData({ ...newEventData, locationName: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '16px' }}>
                สร้างและบันทึก EP ใหม่
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
