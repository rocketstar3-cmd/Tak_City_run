import React, { useState } from 'react';
import { 
  Footprints, 
  MapPin, 
  Droplet, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Navigation,
  Sparkles
} from 'lucide-react';

export function EventDetails({ activeEvent, onOpenRegister }) {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  if (!activeEvent) return null;

  const routes = activeEvent.routeDetails || [];
  const currentRoute = routes[selectedRouteIndex] || routes[0];

  return (
    <>
      {/* 1. Distances Section */}
      <section id="event-details" className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="badge-tag">
              <Footprints size={14} /> ระยะทาง & รายละเอียดการวิ่ง
            </span>
            <h2 className="section-title">เลือกระยะที่ใช่ แล้วลุยไปด้วยกัน</h2>
            <p className="section-subtitle">
              ออกแบบเส้นทางให้เหมาะสำหรับทั้งนักวิ่งมือใหม่ ครอบครัว และสายเก็บระยะทางสะสม
            </p>
          </div>

          <div className="distances-grid">
            {activeEvent.distances?.map((dist, idx) => (
              <div 
                key={dist.id} 
                className={`glass-card distance-card ${idx === 1 ? 'featured' : ''}`}
              >
                {idx === 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'var(--primary)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase'
                  }}>
                    ยอดนิยม (Popular)
                  </div>
                )}

                <div>
                  <div className="distance-km-badge">
                    {dist.distanceKm} <span style={{ fontSize: '1.4rem' }}>KM</span>
                  </div>
                  <h3 className="distance-name">{dist.label}</h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    {idx === 0 && 'เน้นเดิน-วิ่งชิลล์ สัมผัสวิวเกาะกลางแม่น้ำปิง เหมาะกับทุกวัย'}
                    {idx === 1 && 'วิ่งสัมผัสวิถีชีวิตเมืองเก่า สตรีทอาร์ต และตึกโบราณเมืองตาก'}
                    {idx === 2 && 'วิ่งข้ามสะพานกิตติขจร ท้าทายความฟิต พร้อมรับลมหนาวยามเช้า'}
                  </p>

                  <div className="distance-specs">
                    <div className="spec-row">
                      <span>ค่าสมัคร</span>
                      <strong style={{ color: 'var(--green)', fontSize: '1.05rem' }}>ฟรี (ไม่มีค่าใช้จ่าย)</strong>
                    </div>
                    <div className="spec-row">
                      <span>จุดบริการน้ำดื่ม</span>
                      <span>{idx + 2} จุด</span>
                    </div>
                    <div className="spec-row">
                      <span>การจับเวลา</span>
                      <span>วิ่งกระชับมิตร (Non-chip)</span>
                    </div>
                    <div className="spec-row">
                      <span>โควตาผู้เข้าร่วม</span>
                      <span>{dist.quota} ท่าน</span>
                    </div>
                  </div>
                </div>

                <button 
                  className={`btn ${idx === 1 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', marginTop: '20px' }}
                  onClick={onOpenRegister}
                >
                  ลงทะเบียนระยะนี้
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Routes & Map Section */}
      <section id="routes" className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="badge-tag cyan">
              <Compass size={14} /> แผนที่เส้นทางวิ่ง (Running Route)
            </span>
            <h2 className="section-title">รูทวิ่งเลียบปิง เมืองตาก</h2>
            <p className="section-subtitle">
              จุดปล่อยตัวและเส้นชัย: {activeEvent.locationName}
            </p>
          </div>

          {routes.length > 0 && (
            <div className="glass-card">
              {/* Route Tabs */}
              <div className="route-tabs">
                {routes.map((r, i) => (
                  <button
                    key={r.distanceId || i}
                    className={`route-tab-btn ${selectedRouteIndex === i ? 'active' : ''}`}
                    onClick={() => setSelectedRouteIndex(i)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              <div className="route-grid">
                {/* Left: Route Information */}
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                    {currentRoute?.name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                    {currentRoute?.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', marginBottom: '4px' }}>
                        <Droplet size={18} /> <strong>จุดบริการน้ำดื่ม</strong>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                        {currentRoute?.waterStations} จุด
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', marginBottom: '4px' }}>
                        <Activity size={18} /> <strong>หน่วยปฐมพยาบาล</strong>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                        {currentRoute?.firstAidPoints} จุด
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    ไฮไลต์สถานที่ในเส้นทาง:
                  </h4>
                  <ul className="highlights-list">
                    {currentRoute?.highlights?.map((hl, index) => (
                      <li key={index} className="highlight-item">
                        <CheckCircle2 size={18} />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Graphic Map Card */}
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--dark-border)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Navigation size={14} color="var(--primary)" /> เส้นทางวิ่งจริงเลียบแม่น้ำปิง
                      </span>
                      <span className="badge-tag green" style={{ margin: 0, fontSize: '0.75rem' }}>
                        ทางราบ 95% วิ่งสบาย
                      </span>
                    </div>

                    {/* SVG Graphic Map Visualization */}
                    <div style={{ 
                      height: '240px', 
                      background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(15, 23, 42, 0.95) 80%)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed rgba(255, 255, 255, 0.15)',
                      position: 'relative',
                      padding: '16px'
                    }}>
                      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
                        {/* River path */}
                        <path d="M 20 80 Q 120 40, 200 80 T 380 70" fill="none" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="24" strokeLinecap="round" />
                        <path d="M 20 80 Q 120 40, 200 80 T 380 70" fill="none" stroke="#00F0FF" strokeWidth="3" strokeDasharray="6 4" />
                        
                        {/* Running track loop */}
                        <path d="M 50 110 C 100 130, 220 120, 320 100 C 350 70, 330 30, 270 40 C 190 50, 110 50, 50 110 Z" 
                          fill="none" 
                          stroke="var(--primary)" 
                          strokeWidth="4" 
                          strokeLinecap="round" 
                        />
                        
                        {/* Start/Finish Point */}
                        <circle cx="50" cy="110" r="8" fill="#FF5500" />
                        <circle cx="50" cy="110" r="14" fill="none" stroke="#FF5500" strokeWidth="2" opacity="0.6" />
                        <text x="50" y="140" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">START / FINISH</text>

                        {/* Landmark 1 */}
                        <circle cx="200" cy="80" r="6" fill="#00F0FF" />
                        <text x="200" y="65" fill="#38BDF8" fontSize="10" textAnchor="middle">สะพาน 200 ปี</text>

                        {/* Water point */}
                        <circle cx="280" cy="45" r="5" fill="#10B981" />
                        <text x="280" y="30" fill="#34D399" fontSize="10" textAnchor="middle">จุดให้น้ำ 1</text>
                      </svg>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ระดับความชันเฉลี่ย: <strong>+12 ม. (ทางราบเรียบ)</strong>
                      </span>
                      <a 
                        href={activeEvent.locationMapUrl || 'https://maps.google.com'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <MapPin size={14} /> เปิด Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
