import React, { useState } from 'react';
import { History, Users, Award, Image as ImageIcon, X, ArrowUpRight } from 'lucide-react';

export function PastEventsArchive({ pastEvents = [], galleries = [] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <section id="past-events" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <span className="badge-tag cyan">
            <History size={14} /> คลังประวัติงานวิ่ง (Hall of Fame)
          </span>
          <h2 className="section-title">ความทรงจำ & ก้าวที่ผ่านมา</h2>
          <p className="section-subtitle">
            รวมภาพความประทับใจและสถิติจากแต่ละ Episode ที่พวกเราได้ร่วมวิ่งด้วยกัน
          </p>
        </div>

        {/* Past Episodes Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {pastEvents.map((ep) => (
            <div key={ep.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '220px' }}>
                <img 
                  src={ep.coverImage} 
                  alt={ep.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 70%)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--cyan)'
                }}>
                  EP.{String(ep.epNumber).padStart(2, '0')} • จัดสำเร็จแล้ว
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{ep.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {ep.subtitle}
                </p>

                {ep.stats && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '12px', 
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {ep.stats.runnersJoined}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>นักวิ่งเข้าร่วม</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan)' }}>
                        {ep.stats.totalKilometers}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>กม. รวม</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--green)' }}>
                        {ep.stats.photosTaken}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ภาพถ่าย</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={20} color="var(--primary)" /> แกลเลอรีภาพบรรยากาศ
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คลิกที่รูปเพื่อขยายใหญ่</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {galleries.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                style={{
                  position: 'relative',
                  height: '200px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--dark-border)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 60%)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFF' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EP.{item.epNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div 
            className="modal-content"
            style={{ maxWidth: '780px', padding: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button className="modal-close-btn" onClick={() => setSelectedPhoto(null)}>
                <X size={20} />
              </button>
            </div>
            <img 
              src={selectedPhoto.image} 
              alt={selectedPhoto.title} 
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
            />
            <div style={{ padding: '16px 8px 8px' }}>
              <h4 style={{ fontSize: '1.2rem', color: '#FFF' }}>{selectedPhoto.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
