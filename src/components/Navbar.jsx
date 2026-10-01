import React, { useState } from 'react';
import { Trophy, Search, ShieldCheck, Menu, X, Calendar, MapPin } from 'lucide-react';

export function Navbar({ 
  clubSettings, 
  activeEvent, 
  onOpenRegister, 
  onOpenCheckBib, 
  onOpenAdmin,
  isAdminActive,
  onExitAdmin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Normalize legacy logoUrl to the official brush logo
  const logoSrc = (!clubSettings?.logoUrl || clubSettings.logoUrl === '/tak-city-run-logo.svg')
    ? '/tak-logo-white.png'
    : clubSettings.logoUrl;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <a href="#" className="brand-logo-group" onClick={(e) => { if(isAdminActive) { e.preventDefault(); onExitAdmin(); } }}>
          <img 
            src={logoSrc} 
            alt={clubSettings?.clubName || 'TAK City Run'} 
            className="brand-icon-img"
          />
          <div className="brand-text-block">
            <span className="brand-title-accent">{clubSettings?.clubName || 'TAK City Run'}</span>
            {activeEvent && (
              <span className="brand-ep-subtext">
                EP.{String(activeEvent.epNumber).padStart(2, '0')} เมืองตาก
              </span>
            )}
          </div>
        </a>

        {isAdminActive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge-tag cyan" style={{ margin: 0 }}>
              <ShieldCheck size={14} /> แอดมินชมรม
            </span>
            <button className="btn btn-secondary btn-sm" onClick={onExitAdmin}>
              กลับสู่หน้าหลัก
            </button>
          </div>
        ) : (
          <>
            <ul className="nav-menu">
              <li><a href="#event-details" className="nav-link">ข้อมูลงานวิ่ง</a></li>
              <li><a href="#routes" className="nav-link">เส้นทางวิ่ง</a></li>
              <li><a href="#schedule" className="nav-link">กำหนดการ</a></li>
              <li><a href="#market" className="nav-link">ร้านค้า & กิจกรรม</a></li>
              <li><a href="#past-events" className="nav-link">ประวัติงานเก่า</a></li>
              <li><a href="#sponsors" className="nav-link">ผู้สนับสนุน</a></li>
            </ul>

            <div className="nav-actions">
              {/* Hidden on small mobile screens to keep navbar clean and prevent wrapping */}
              <button 
                className="btn btn-secondary btn-sm nav-hide-mobile" 
                onClick={onOpenCheckBib}
                title="ค้นหาคูปองลุ้นรางวัล หรือตรวจสอบสิทธิ์"
              >
                🎟️ คูปองของฉัน
              </button>

              {activeEvent?.status === 'open' && (
                <button 
                  className="btn btn-primary btn-sm nav-reg-btn"
                  onClick={onOpenRegister}
                >
                  ลงทะเบียนฟรี
                </button>
              )}

              <button 
                className="btn btn-secondary btn-sm nav-hide-mobile" 
                onClick={onOpenAdmin}
                style={{ padding: '8px 12px' }}
                title="เข้าสู่ระบบผู้ดูแลชมรม"
              >
                <ShieldCheck size={16} /> แอดมิน
              </button>

              <button 
                className="mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isAdminActive && (
        <div className="mobile-drawer">
          <a href="#event-details" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ข้อมูลงานวิ่ง</a>
          <a href="#routes" className="nav-link" onClick={() => setMobileMenuOpen(false)}>เส้นทางวิ่ง</a>
          <a href="#schedule" className="nav-link" onClick={() => setMobileMenuOpen(false)}>กำหนดการ</a>
          <a href="#market" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ร้านค้า & กิจกรรม</a>
          <a href="#past-events" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ประวัติงานเก่า</a>
          <a href="#sponsors" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ผู้สนับสนุน</a>
          
          <hr style={{ borderColor: 'var(--dark-border)', margin: '8px 0' }} />
          
          {activeEvent?.status === 'open' && (
            <button 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
            >
              🏃 ลงทะเบียนฟรี EP.{String(activeEvent.epNumber).padStart(2, '0')}
            </button>
          )}

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '12px' }}
            onClick={() => { setMobileMenuOpen(false); onOpenCheckBib(); }}
          >
            🎟️ ค้นหาคูปอง / ใบประกาศของฉัน
          </button>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}
            onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
          >
            <ShieldCheck size={16} /> เข้าสู่ระบบผู้ดูแล (Admin Portal)
          </button>
        </div>
      )}
    </header>
  );
}
