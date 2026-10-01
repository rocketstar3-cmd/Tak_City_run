import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, HeartHandshake, ArrowRight, Clock, Award } from 'lucide-react';

export function Hero({ activeEvent, registrationsCount = 0, onOpenRegister, onOpenCheckBib }) {
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

  return (
    <section className="hero-section">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="container hero-grid">
        {/* Left Column: Event Hero Pitch */}
        <div>
          <div className="hero-ep-badge">
            <span className="pulse-dot"></span>
            <span>เปิดรับสมัครแล้ว • EP.{String(activeEvent.epNumber).padStart(2, '0')}</span>
          </div>

          <h1 className="hero-title">
            {activeEvent.title.split('-')[0]}
            <span className="hero-gradient-text">
              {activeEvent.title.split('-')[1] || 'TAK City Run'}
            </span>
          </h1>

          <p className="hero-desc">
            {activeEvent.subtitle || 'กิจกรรมวิ่งเพื่อชุมชนคนรักสุขภาพ ร่วมสัมผัสบรรยากาศยามเช้าเมืองตาก ไม่มีค่าใช้จ่ายในการสมัคร'}
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
              ค้นหาบัตร E-BIB ของฉัน
            </button>
          </div>

          {/* Social Proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '28px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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

        {/* Right Column: Countdown Box & Distances summary */}
        <div>
          <div className="countdown-box">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
              <Clock size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                นับถอยหลังสู่วันงาน
              </span>
            </div>
            <h3 className="countdown-title">พร้อมออกวิ่งไปพร้อมกัน</h3>

            <div className="countdown-grid">
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

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--dark-border)' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                ระยะทางที่เปิดรับใน EP นี้
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {activeEvent.distances?.map(dist => (
                  <span key={dist.id} style={{ 
                    padding: '6px 14px', 
                    borderRadius: '999px', 
                    background: 'rgba(255, 85, 0, 0.15)', 
                    border: '1px solid rgba(255, 85, 0, 0.3)',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {dist.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
