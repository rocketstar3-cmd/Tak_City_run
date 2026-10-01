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

  return (
    <header className="navbar">
      <div className="container nav-container">
        <a href="#" className="brand-logo-group" onClick={(e) => { if(isAdminActive) { e.preventDefault(); onExitAdmin(); } }}>
          <img 
            src={clubSettings?.logoUrl || '/tak-city-run-logo.svg'} 
            alt={clubSettings?.clubName || 'TAK City Run'} 
            className="brand-icon-img"
          />
          <div>
            <span className="brand-title-accent">{clubSettings?.clubName || 'TAK City Run'}</span>
            {activeEvent && (
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
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
              กลับสู่หน้าเว็บหลัก
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
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onOpenCheckBib}
                title="ค้นหาบัตร BIB หรือตรวจสอบสถานะ"
              >
                <Search size={16} /> ค้นหา E-BIB
              </button>

              {activeEvent?.status === 'open' && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={onOpenRegister}
                >
                  ลงทะเบียนฟรี
                </button>
              )}

              <button 
                className="btn btn-secondary btn-sm"
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
        <div style={{
          background: 'rgba(8, 12, 21, 0.98)',
          borderBottom: '1px solid var(--dark-border)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <a href="#event-details" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ข้อมูลงานวิ่ง</a>
          <a href="#routes" className="nav-link" onClick={() => setMobileMenuOpen(false)}>เส้นทางวิ่ง</a>
          <a href="#schedule" className="nav-link" onClick={() => setMobileMenuOpen(false)}>กำหนดการ</a>
          <a href="#market" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ร้านค้า & กิจกรรม</a>
          <a href="#past-events" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ประวัติงานเก่า</a>
          <a href="#sponsors" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ผู้สนับสนุน</a>
          <hr style={{ borderColor: 'var(--dark-border)', margin: '4px 0' }} />
          <button 
            className="btn btn-secondary" 
            onClick={() => { setMobileMenuOpen(false); onOpenCheckBib(); }}
          >
            <Search size={16} /> ค้นหาบัตร E-BIB
          </button>
          {activeEvent?.status === 'open' && (
            <button 
              className="btn btn-primary"
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
            >
              ลงทะเบียนฟรี EP.{String(activeEvent.epNumber).padStart(2, '0')}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
