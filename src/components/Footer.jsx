import React from 'react';
import { Heart, Globe, MessageCircle } from 'lucide-react';

export function Footer({ clubSettings, onOpenAdmin }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img 
                src={clubSettings?.logoUrl || '/tak-city-run-logo.svg'} 
                alt="TAK City Run" 
                style={{ width: '40px', height: '40px' }}
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#FFF' }}>
                {clubSettings?.clubName || 'TAK City Run'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '400px' }}>
              {clubSettings?.tagline || 'วิ่งเปิดเมืองตาก เชื่อมสัมพันธ์ ชุมชนสุขภาพดีไปด้วยกัน'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>
              กิจกรรมเพื่อชุมชนคนรักสุขภาพจังหวัดตาก จัดขึ้นฟรีโดยความร่วมมือของนักวิ่งและเครือข่ายจิตอาสา
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '16px' }}>เมนูด่วน</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><a href="#event-details">รายละเอียดงานวิ่ง</a></li>
              <li><a href="#routes">แผนที่รูทวิ่ง</a></li>
              <li><a href="#schedule">ตารางเวลากิจกรรม</a></li>
              <li><a href="#market">ร้านค้าชุมชน & กิจกรรม</a></li>
              <li><a href="#past-events">ประวัติงานวิ่ง EP เก่า</a></li>
              <li><a href="#sponsors">ผู้สนับสนุน</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '16px' }}>ช่องทางติดต่อ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a 
                href={clubSettings?.facebookUrl || 'https://facebook.com'} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <Globe size={16} /> Facebook: ชมรม TAK City Run
              </a>
              <a 
                href={clubSettings?.lineUrl || 'https://line.me'} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <MessageCircle size={16} /> LINE Official ชมรม
              </a>
              <button 
                onClick={onOpenAdmin}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', marginTop: '6px', color: 'var(--text-muted)' }}
              >
                🔒 ระบบจัดการแอดมิน (Admin Portal)
              </button>
            </div>
          </div>
        </div>

        <div className="footer-copy">
          <p>© {new Date().getFullYear()} {clubSettings?.clubName || 'TAK City Run'} Club. All Rights Reserved.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-muted)' }}>
            Powered by Cloudflare Pages & Supabase (Free Tier) • Zero Hosting Cost
          </p>
        </div>
      </div>
    </footer>
  );
}
