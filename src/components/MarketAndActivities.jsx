import React from 'react';
import { Store, Utensils, Sparkles, Camera, HeartPulse, Tag } from 'lucide-react';

export function MarketAndActivities({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section id="market" className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
      <div className="container">
        <div className="section-title-wrap">
          <span className="badge-tag">
            <Store size={14} /> ชุมชน & วิถีชีวิตเมืองตาก
          </span>
          <h2 className="section-title">ร้านค้าชุมชน & กิจกรรมในงาน</h2>
          <p className="section-subtitle">
            รวมร้านอาหารท้องถิ่นรสเด็ด บูธสุขภาพ และจุดกิจกรรมพิเศษสำหรับนักวิ่งทุกคน
          </p>
        </div>

        <div className="cards-grid">
          {items.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '20px' }}>
              <img 
                src={item.image} 
                alt={item.name} 
                className="item-card-img" 
                loading="lazy"
              />

              <div className="item-category-tag">
                {item.category || (item.type === 'food' ? 'อาหาร & เครื่องดื่ม' : 'กิจกรรมพิเศษ')}
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{item.name}</h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
                {item.description}
              </p>

              {item.badge && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 85, 0, 0.1)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(255, 85, 0, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <Tag size={12} /> {item.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
