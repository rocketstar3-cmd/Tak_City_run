import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, HeartHandshake, ArrowRight, Clock } from 'lucide-react';

export function Hero({ 
  activeEvent, 
  registrationsCount = 0, 
  onOpenRegister, 
  onOpenCheckBib 
}) {
  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!activeEvent?.eventDate) return;

    const targetDate = new Date(activeEvent.eventDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <section className="hero-section container">
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>ยังไม่มีงานวิ่งที่เปิดรับสมัครในขณะนี้</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>โปรดติดตามการอัปเดตงานวิ่ง EP ถัดไปเร็วๆ นี้</p>
        </div>
      </section>
    );
  }

  const formattedDate = new Date(activeEvent.eventDate).toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(activeEvent.eventDate).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalQuota = activeEvent.distances?.reduce((acc, d) => acc + (d.quota || 0), 0) || 800;

  // Smart title rendering without duplicate text
  const rawTitle = activeEvent.title || 'TAK City Run';
  let titleLine1 = '';
  let titleLine2 = '';

  if (rawTitle.includes('-')) {
    const parts = rawTitle.split('-');
    titleLine1 = parts[0].trim();
    titleLine2 = parts.slice(1).join('-').trim();
  } else {
    titleLine1 = rawTitle;
    titleLine2 = activeEvent.distanceLabel || `${activeEvent.distanceKm || 5.8} KM City Run`;
  }

  return (
    <section className="hero-section" style={{ position: 'relative' }}>
      {/* Ambient Poster Glow in Hero Background */}
      {activeEvent.coverImage && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${activeEvent.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="container hero-grid" style={{ position: 'relative', zIndex: 1 }}>
        {/* Left Column: Event Hero Pitch */}
        <div>
          {/* Status Tag */}
          <div className="hero-ep-badge">
            <span className="pulse-dot"></span>
            <span>เปิดรับสมัครแล้ว • EP.{String(activeEvent.epNumber).padStart(2, '0')}</span>
          </div>

          <h1 className="hero-title">
            {titleLine1}
            <span className="hero-gradient-text">
              {titleLine2}
            </span>
          </h1>

          <p className="hero-desc">
            {activeEvent.subtitle || 'กิจกรรมวิ่งเพื่อชุมชนคนรักสุขภาพ ร่วมสัมผัสบรร营ากาศยามเช้าเมืองตาก ไม่มีค่าใช้จ่ายในการสมัคร'}
          </p>

          <div className="hero-meta-strip">
            <div className="meta-item">
              <Calendar size={18} />
              <span><strong>{formattedDate}</strong> (เวลา {formattedTime} น.)</span>
            </div>
            <div className="meta-item">
              <MapPin size={18} />
              <span>{activeEvent.locationName}</span>
            </div>
          </div>

          <div className="hero-cta-group">
            {activeEvent.status === 'open' ? (
              <button className="btn btn-primary btn-lg" onClick={onOpenRegister}>
                ลงทะเบียนเข้าร่วม (ฟรี) <ArrowRight size={20} />
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg" disabled>
                ปิดรับสมัครแล้ว
              </button>
            )}

            <button className="btn btn-secondary btn-lg" onClick={onOpenCheckBib}>
              🎟️ คูปอง & ใบประกาศ
            </button>
          </div>

          {/* Social Proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '28px', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--primary)" />
              ลงทะเบียนแล้ว <strong style={{ color: '#FFF' }}>{registrationsCount}</strong> / {totalQuota} คน
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartHandshake size={16} color="var(--green)" />
              กิจกรรมฟรี ไม่มีค่าธรรมเนียม
            </span>
          </div>
        </div>

        {/* Right Column: Official Poster Showcase & Countdown Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Official Event Cover Poster Showcase */}
          {activeEvent.coverImage && (
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 85, 0, 0.25)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              background: '#0F172A',
              aspectRatio: '16/9',
              maxHeight: '250px'
            }}>
              <img 
                src={activeEvent.coverImage} 
                alt={`โปสเตอร์งานวิ่ง EP.${activeEvent.epNumber} ${activeEvent.title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(8, 12, 21, 0.88)',
                backdropFilter: 'blur(8px)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                border: '1px solid rgba(255, 85, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>🖼️ โปสเตอร์ทางการ EP.{String(activeEvent.epNumber).padStart(2, '0')}</span>
              </div>
              <a 
                href={activeEvent.coverImage}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFF',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                ดูรูปเต็ม ↗
              </a>
            </div>
          )}

          {/* Countdown Box */}
          <div className="countdown-box" style={{ padding: activeEvent.coverImage ? '24px 22px' : '36px 28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
              <Clock size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                นับถอยหลังสู่วันงาน
              </span>
            </div>
            <h3 className="countdown-title" style={{ marginBottom: activeEvent.coverImage ? '14px' : '20px' }}>
              พร้อมออกวิ่งไปพร้อมกัน
            </h3>

            <div className="countdown-grid" style={{ marginBottom: activeEvent.coverImage ? '18px' : '28px' }}>
              <div className="countdown-segment">
                <span className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="countdown-label">วัน</span>
              </div>
              <div className="countdown-segment">
                <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-label">ชั่วโมง</span>
              </div>
              <div className="countdown-segment">
                <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-label">นาที</span>
              </div>
              <div className="countdown-segment">
                <span className="countdown-number" style={{ color: 'var(--cyan)' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="countdown-label">วินาที</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--dark-border)' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                ระยะทางอย่างเป็นทางการใน EP นี้
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ 
                  padding: '6px 16px', 
                  borderRadius: '999px', 
                  background: 'rgba(255, 85, 0, 0.2)', 
                  border: '1.5px solid var(--primary)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🏃 {activeEvent.distanceKm || 5.8} KM • {activeEvent.distanceLabel || 'City Run'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
