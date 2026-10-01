import React from 'react';
import { HeartHandshake, ShieldCheck, Mail } from 'lucide-react';

export function SponsorsSection({ sponsors = [] }) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section id="sponsors" className="section" style={{ background: 'rgba(8, 12, 21, 0.6)' }}>
      <div className="container">
        <div className="section-title-wrap">
          <span className="badge-tag green">
            <HeartHandshake size={14} /> พันธมิตร & ผู้สนับสนุน
          </span>
          <h2 className="section-title">ขอขอบคุณผู้สนับสนุนใจดี</h2>
          <p className="section-subtitle">
            กิจกรรมวิ่งฟรีนี้เกิดขึ้นได้ด้วยความอนุเคราะห์และพลังน้ำใจจากหน่วยงานและร้านค้าในท้องถิ่น
          </p>
        </div>

        <div className="sponsors-shelf">
          {sponsors.map((sp) => (
            <div key={sp.id} className="sponsor-badge">
              <img 
                src={sp.logo} 
                alt={sp.name} 
                className="sponsor-avatar"
                loading="lazy"
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{sp.name}</strong>
                  {sp.tier === 'main' && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>
                      ผู้สนับสนุนหลัก
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {sp.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px dashed var(--dark-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '24px' 
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            🤝 <strong>ต้องการร่วมเป็นผู้สนับสนุนน้ำดื่ม อาหาร หรือของรางวัลสำหรับงานวิ่ง EP ถัดไป?</strong>
          </p>
          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ติดต่อทีมงานชมรม TAK City Run ผ่าน LINE หรือข้อความ Facebook ของชมรมได้ตลอดเวลา
          </div>
        </div>
      </div>
    </section>
  );
}
