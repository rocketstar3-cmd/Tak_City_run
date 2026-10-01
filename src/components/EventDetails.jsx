import React from 'react';
import { 
  Footprints, 
  MapPin, 
  Droplet, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Navigation,
  Sparkles,
  Mountain,
  Users,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export function EventDetails({ activeEvent, onOpenRegister }) {
  if (!activeEvent) return null;

  const distanceKm = activeEvent.distanceKm || 5.8;
  const distanceLabel = activeEvent.distanceLabel || 'City Run เลียบแม่น้ำปิง';
  const quota = activeEvent.quota || 500;
  const waterStations = activeEvent.waterStations || 3;
  const firstAidPoints = activeEvent.firstAidPoints || 2;
  const elevation = activeEvent.elevationGain || '+12 ม. (ทางราบ 95%)';
  const highlights = activeEvent.routeHighlights && activeEvent.routeHighlights.length > 0 
    ? activeEvent.routeHighlights 
    : ['จุดชมวิวสะพานสมโภช 200 ปี', 'ศาลสมเด็จพระเจ้าตากสินมหาราช', 'สตรีทอาร์ตเมืองตาก', 'เลียบหาดทรายริมปิง'];

  return (
    <>
      {/* 1. Official Single Distance Section */}
      <section id="event-details" className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="badge-tag">
              <Footprints size={14} /> ระยะทางประจำ EP.{String(activeEvent.epNumber).padStart(2, '0')}
            </span>
            <h2 className="section-title">ระยะทางอย่างเป็นทางการ</h2>
            <p className="section-subtitle">
              กิจกรรม TAK City Run ในแต่ละ Episode จะวิ่งระยะเดียวร่วมกัน เพื่อความเป็นหนึ่งเดียวของคอมมูนิตี้
            </p>
          </div>

          {/* Premium Centered Single Distance Card */}
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div 
              className="glass-card" 
              style={{ 
                border: '2px solid var(--primary)', 
                boxShadow: '0 0 40px var(--primary-glow)',
                padding: '40px 36px',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #FF8533 100%)',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                padding: '6px 14px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ระยะเดียวประจำงาน (Official Distance)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center', background: 'rgba(255, 85, 0, 0.12)', border: '1.5px solid rgba(255, 85, 0, 0.4)', borderRadius: 'var(--radius-lg)', padding: '24px 32px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>
                    {distanceKm}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: '#FFF', letterSpacing: '2px' }}>
                    KILOMETERS
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.8rem', color: '#FFF', marginBottom: '8px' }}>
                    {distanceLabel}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    {activeEvent.subtitle || 'เส้นทางวิ่งเพื่อสุขภาพ ลัดเลาะสัมผัสธรรมชาติและวิถีชุมชนเมืองตาก เหมาะกับนักวิ่งทุกคน'}
                  </p>
                </div>
              </div>

              {/* Specs Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px',
                background: 'rgba(8, 12, 21, 0.6)',
                border: '1px solid var(--dark-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                margin: '24px 0'
              }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>ค่าธรรมเนียมการสมัคร</span>
                  <strong style={{ color: 'var(--green)', fontSize: '1.15rem' }}>ฟรี (0 บาท)</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>จุดบริการน้ำดื่ม</span>
                  <strong style={{ color: 'var(--cyan)', fontSize: '1.15rem' }}>{waterStations} จุด</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>หน่วยพยาบาล/ปฐมพยาบาล</span>
                  <strong style={{ color: '#F87171', fontSize: '1.15rem' }}>{firstAidPoints} จุด</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>ระดับความชัน</span>
                  <strong style={{ color: '#FFF', fontSize: '1.15rem' }}>{elevation}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>โควตาผู้เข้าร่วม</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{quota} ท่าน</strong>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <button 
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', maxWidth: '380px', fontSize: '1.2rem', padding: '16px 36px' }}
                  onClick={onOpenRegister}
                >
                  ลงทะเบียนวิ่งระยะ {distanceKm}K (ฟรี)
                </button>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  ไม่มีค่าใช้จ่ายในการสมัคร ได้รับคูปองลุ้นรางวัล & สิทธิประโยชน์ทันที
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Routes & Map Section */}
      <section id="routes" className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="badge-tag cyan">
              <Compass size={14} /> แผนที่เส้นทางวิ่ง (Running Route & Map)
            </span>
            <h2 className="section-title">แผนที่รูทวิ่ง {distanceKm}K</h2>
            <p className="section-subtitle">
              จุดปล่อยตัวและเส้นชัย: <strong>{activeEvent.locationName}</strong>
            </p>
          </div>

          <div className="glass-card" style={{ padding: '36px' }}>
            <div className="route-grid">
              {/* Left Column: Route description & Highlights */}
              <div>
                <span className="badge-tag green" style={{ marginBottom: '8px' }}>
                  ระยะทางการแข่งขัน {distanceKm} กิโลเมตร
                </span>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '14px', color: '#FFF' }}>
                  {distanceLabel}
                </h3>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '24px' }}>
                  {activeEvent.routeDescription || 'เส้นทางวิ่งเลียบแม่น้ำปิง ทัศนียภาพสวยงาม ทางราบเรียบ เหมาะสำหรับการวิ่งรับอรุณยามเช้า'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', marginBottom: '4px' }}>
                      <Droplet size={18} /> <strong>จุดบริการน้ำดื่ม</strong>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>
                      {waterStations} จุดตลอดเส้นทาง
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', marginBottom: '4px' }}>
                      <Activity size={18} /> <strong>หน่วยปฐมพยาบาล</strong>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>
                      {firstAidPoints} จุดบริการ
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ไฮไลต์และจุดเช็คอินในเส้นทาง:
                </h4>
                <ul className="highlights-list">
                  {highlights.map((hl, index) => (
                    <li key={index} className="highlight-item" style={{ fontSize: '1rem' }}>
                      <CheckCircle2 size={20} />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: '28px' }}>
                  <a 
                    href={activeEvent.locationMapUrl || 'https://maps.google.com'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ gap: '10px' }}
                  >
                    <MapPin size={18} color="var(--primary)" /> เปิดแผนที่จุดปล่อยตัวบน Google Maps <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Right Column: Route Map Image / Visual Map */}
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--dark-border)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {activeEvent.routeImageUrl ? (
                    <div>
                      <img 
                        src={activeEvent.routeImageUrl} 
                        alt={`แผนที่เส้นทางวิ่ง ${distanceLabel}`}
                        style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.75)',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        color: 'var(--cyan)'
                      }}>
                        แผนที่เส้นทางวิ่งจริง EP.{String(activeEvent.epNumber).padStart(2, '0')}
                      </div>
                    </div>
                  ) : (
                    /* Default Dynamic Route Graphics */
                    <div style={{ padding: '24px' }}>
                      <div style={{ 
                        height: '280px', 
                        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(15, 23, 42, 0.95) 80%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        position: 'relative',
                        padding: '16px'
                      }}>
                        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%' }}>
                          <path d="M 20 90 Q 120 40, 200 90 T 380 80" fill="none" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="28" strokeLinecap="round" />
                          <path d="M 20 90 Q 120 40, 200 90 T 380 80" fill="none" stroke="#00F0FF" strokeWidth="3" strokeDasharray="6 4" />
                          
                          <path d="M 50 120 C 100 140, 220 130, 320 110 C 350 80, 330 30, 270 40 C 190 50, 110 50, 50 120 Z" 
                            fill="none" 
                            stroke="var(--primary)" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                          />
                          
                          <circle cx="50" cy="120" r="9" fill="#FF5500" />
                          <circle cx="50" cy="120" r="16" fill="none" stroke="#FF5500" strokeWidth="2" opacity="0.6" />
                          <text x="50" y="152" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">START / FINISH</text>

                          <circle cx="200" cy="90" r="7" fill="#00F0FF" />
                          <text x="200" y="70" fill="#38BDF8" fontSize="11" textAnchor="middle">สะพาน 200 ปี</text>

                          <circle cx="280" cy="50" r="6" fill="#10B981" />
                          <text x="280" y="32" fill="#34D399" fontSize="11" textAnchor="middle">จุดให้น้ำ 1</text>
                        </svg>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          ระดับความชันเฉลี่ย: <strong>{elevation}</strong>
                        </span>
                        <span className="badge-tag green" style={{ margin: 0, fontSize: '0.78rem' }}>
                          เส้นทางวิ่งสบาย ทางเรียบ
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Schedule Section */}
      <section id="schedule" className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="badge-tag">
              <Clock size={14} /> กำหนดการวันจัดกิจกรรม
            </span>
            <h2 className="section-title">ตารางเวลากิจกรรม</h2>
            <p className="section-subtitle">
              ตารางเวลาเช้าวันงาน แนะนำให้นักวิ่งเดินทางมาถึงก่อนเวลาปล่อยตัว 30-45 นาที
            </p>
          </div>

          <div className="timeline-wrap">
            {activeEvent.schedule?.map((item, index) => (
              <div key={index} className="timeline-row">
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div style={{ fontWeight: 600, color: '#FFF', fontSize: '1.05rem' }}>{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
