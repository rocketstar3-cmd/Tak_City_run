import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle, 
  Gift, 
  Coffee, 
  ShoppingBag, 
  Award, 
  Sparkles, 
  Phone, 
  User, 
  Calendar, 
  MapPin, 
  HeartHandshake, 
  ShieldCheck,
  Check
} from 'lucide-react';

export function EBibModal({ registration, activeEvent, clubSettings, onClose }) {
  const cardRef = useRef(null);
  const [activeTab, setActiveTab] = useState('coupon'); // 'coupon' | 'certificate'
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!registration) return null;

  const eventTitle = activeEvent?.title || 'TAK City Run';
  const epNumber = activeEvent?.epNumber ? `EP.${String(activeEvent.epNumber).padStart(2, '0')}` : 'EP.02';
  const distance = registration.distanceLabel || activeEvent?.distanceLabel || `${activeEvent?.distanceKm || 5.8} KM City Run`;
  const location = activeEvent?.locationName || 'ริมแม่น้ำปิง หน้าสะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี จ.ตาก';
  const eventDateFormatted = activeEvent?.eventDate ? new Date(activeEvent.eventDate).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '15 พฤศจิกายน 2569';

  // Customizable settings from admin with smart fallbacks
  const couponConfig = {
    badgeText: clubSettings?.couponSettings?.badgeText || '🎟️ LUCKY DRAW PASS',
    headline: clubSettings?.couponSettings?.headline || 'คูปองลุ้นรางวัล & สิทธิประโยชน์นักวิ่ง',
    subheadline: clubSettings?.couponSettings?.subheadline || 'บัตรดิจิทัลประจำตัวสำหรับลุ้นของรางวัลท้ายงาน และรับอาหารเช้าหน้างาน',
    perksTitle: clubSettings?.couponSettings?.perksTitle || 'สิทธิประโยชน์สำหรับผู้ถือคูปองนี้:',
    perk1Title: clubSettings?.couponSettings?.perk1Title || 'สิทธิ์ลุ้นรับรางวัล Lucky Draw ท้ายงาน',
    perk1Desc: clubSettings?.couponSettings?.perk1Desc || 'จับสลากแจกของรางวัล & ของที่ระลึกจากผู้สนับสนุนหลังเข้าเส้นชัย',
    perk2Title: clubSettings?.couponSettings?.perk2Title || 'อาหารเช้าชุมชน & กาแฟดอยฟรี',
    perk2Desc: clubSettings?.couponSettings?.perk2Desc || 'อิ่มอร่อยกับเมนูท้องถิ่นเมืองตาก ณ ซุ้มอาหารบริการนักวิ่ง',
    perk3Title: clubSettings?.couponSettings?.perk3Title || 'ส่วนลดพิเศษร้านค้าชุมชน',
    perk3Desc: clubSettings?.couponSettings?.perk3Desc || 'แสดงคูปองเพื่อรับส่วนลดและโปรโมชั่นพิเศษจากร้านค้าที่ร่วมรายการ',
    noticeText: clubSettings?.couponSettings?.noticeText || 'แสดงคูปองนี้ต่อเจ้าหน้าที่หน้างานเพื่อรับอาหารเช้าและสิทธิ์ร่วมจับสลาก Lucky Draw'
  };

  // 1-Click Save as Image
  const handleSaveAsImage = async () => {
    if (!cardRef.current || downloading) return;
    try {
      setDownloading(true);
      setDownloadSuccess(false);

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution retina display
        backgroundColor: '#0d1322',
        useCORS: true,
        logging: false
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      const filePrefix = activeTab === 'coupon' ? 'tak-city-run-coupon' : 'tak-city-run-finisher-cert';
      link.download = `${filePrefix}-${registration.bibNumber || 'ticket'}.png`;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Save image error:', err);
      alert('ไม่สามารถดาวน์โหลดรูปภาพได้ กรุณาใช้วิธีแคปหน้าจอ (Screenshot) แทน');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag gold" style={{ margin: 0, padding: '3px 10px', fontSize: '0.78rem' }}>
                {activeTab === 'coupon' ? <Gift size={13} /> : <Award size={13} />} 
                {activeTab === 'coupon' ? ' คูปองกิจกรรม & ชิงโชค' : ' ใบประกาศนียบัตรออนไลน์'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginTop: '6px' }}>
              {activeTab === 'coupon' ? couponConfig.headline : '🏅 Finisher E-Certificate'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {activeTab === 'coupon' ? couponConfig.subheadline : 'ใบประกาศนียบัตรผู้พิชิตเส้นทาง ประทับตราสัญลักษณ์งานวิ่งอย่างเป็นทางการ'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Coupon vs Certificate */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'coupon' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('coupon')}
          >
            <Gift size={15} /> 🎟️ คูปองชิงรางวัล
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'certificate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('certificate')}
          >
            <Award size={15} /> 🏅 ใบประกาศ Finisher
          </button>
        </div>

        {/* Tab 1: Printable & Downloadable Coupon Ticket */}
        {activeTab === 'coupon' && (
          <div className="coupon-container" ref={cardRef} id="printable-ticket">
            <div className="coupon-ticket" style={{ position: 'relative', overflow: 'hidden' }}>
              
              {/* Subtle Official Logo Watermark inside Ticket */}
              <img 
                src="/tak-logo-white.png" 
                alt="" 
                style={{
                  position: 'absolute',
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-12deg)',
                  width: '280px',
                  opacity: 0.06,
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />

              {/* Ticket Header */}
              <div className="coupon-header" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src="/tak-logo-white.png" 
                    alt="TAK City Run" 
                    style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                  />
                  <div>
                    <div className="coupon-header-title">{clubSettings?.clubName || 'TAK CITY RUN'}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.9, letterSpacing: '0.04em' }}>
                      {epNumber} • FREE COMMUNITY RUN
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="coupon-pass-badge">
                    {couponConfig.badgeText}
                  </span>
                </div>
              </div>

              {/* Main Ticket Body */}
              <div className="coupon-body" style={{ position: 'relative', zIndex: 1 }}>
                <span className="coupon-distance-pill">{distance}</span>

                <div className="coupon-number-label">
                  หมายเลขคูปองชิงโชค (LUCKY NO.)
                </div>
                <div className="coupon-number-display">
                  {registration.bibNumber}
                </div>

                {/* Verified Runner Identity */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1.5px solid rgba(245, 158, 11, 0.35)', 
                  borderRadius: '14px', 
                  padding: '14px 18px', 
                  margin: '12px 0 16px 0',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} /> ผู้สมัครที่ได้รับการยืนยัน
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'ยืนยันแล้ว'}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', lineHeight: 1.2 }}>
                    {registration.fullName}
                    {registration.nickname && (
                      <span style={{ color: '#F59E0B', marginLeft: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
                        ({registration.nickname})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={14} color="var(--primary)" /> <strong>{registration.phone}</strong>
                    </span>
                    <span>•</span>
                    <span>ไซส์เสื้อ: <strong style={{ color: '#FFF' }}>{registration.shirtSize || 'Free Size'}</strong></span>
                  </div>
                </div>

                {/* Perforated Divider with Cutout Notches */}
                <div className="coupon-perforated-wrap">
                  <div className="coupon-notch-left"></div>
                  <div className="coupon-perforated-line">
                    <span>✂️ รอยปรุ • หางบัตรจับรางวัล & สิทธิประโยชน์</span>
                  </div>
                  <div className="coupon-notch-right"></div>
                </div>

                {/* Stub / Perks Section */}
                <div className="coupon-stub-section">
                  <div className="coupon-perks-title">
                    <Sparkles size={14} color="#F59E0B" /> {couponConfig.perksTitle}
                  </div>
                  <div className="coupon-perks-list">
                    <div className="coupon-perk-item">
                      <div className="coupon-perk-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        <Gift size={16} />
                      </div>
                      <div>
                        <strong>{couponConfig.perk1Title}</strong>
                        <p>{couponConfig.perk1Desc}</p>
                      </div>
                    </div>

                    <div className="coupon-perk-item">
                      <div className="coupon-perk-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                        <Coffee size={16} />
                      </div>
                      <div>
                        <strong>{couponConfig.perk2Title}</strong>
                        <p>{couponConfig.perk2Desc}</p>
                      </div>
                    </div>

                    <div className="coupon-perk-item">
                      <div className="coupon-perk-icon" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}>
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <strong>{couponConfig.perk3Title}</strong>
                        <p>{couponConfig.perk3Desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Event & Runner Details */}
                  <div className="coupon-details-grid">
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>วันจัดงาน</span>
                      <strong style={{ color: '#FFF' }}>{eventDateFormatted}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ผู้ติดต่อฉุกเฉิน</span>
                      <strong>{registration.emergencyContact || '-'} ({registration.emergencyPhone || '-'})</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>สถานที่นัดพบ</span>
                      <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{location}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    {registration.checkedIn ? (
                      <span className="badge-tag green" style={{ margin: 0, padding: '6px 14px', fontSize: '0.85rem' }}>
                        <CheckCircle size={15} /> ยืนยันสิทธิ์ & เช็คอินหน้างานแล้ว
                      </span>
                    ) : (
                      <span className="badge-tag gold" style={{ margin: 0, padding: '6px 14px', fontSize: '0.85rem' }}>
                        🎟️ แสดงคูปองนี้ให้เจ้าหน้าที่หน้างานเพื่อรับอาหารเช้า & สิทธิ์ลุ้นรางวัล
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Finisher E-Certificate */}
        {activeTab === 'certificate' && (
          <div ref={cardRef} id="printable-certificate" style={{
            background: 'linear-gradient(135deg, #090D16 0%, #151C2C 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '28px 24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.2)'
          }}>
            {/* Inner Border Frame */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              pointerEvents: 'none'
            }} />

            {/* Background Watermark */}
            <img 
              src="/tak-logo-white.png" 
              alt="" 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                opacity: 0.05,
                pointerEvents: 'none'
              }}
            />

            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Official Gold Logo Stamp */}
              <img 
                src="/tak-logo-gold.png" 
                alt="TAK City Run" 
                style={{ 
                  width: '84px', 
                  height: '84px', 
                  objectFit: 'contain',
                  margin: '0 auto 8px auto',
                  filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.5))'
                }} 
              />

              <div style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem', 
                letterSpacing: '0.18em', 
                color: '#F59E0B',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                CERTIFICATE OF PARTICIPATION
              </div>

              <h2 style={{ 
                fontSize: '1.45rem', 
                color: '#FFF', 
                fontWeight: 800, 
                margin: '4px 0 14px 0' 
              }}>
                ใบประกาศนียบัตรผู้พิชิตเส้นทาง
              </h2>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า
              </p>

              {/* Runner Name */}
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#FFF',
                padding: '6px 0',
                textShadow: '0 0 15px rgba(245, 158, 11, 0.35)',
                borderBottom: '2px solid rgba(245, 158, 11, 0.5)',
                display: 'inline-block',
                minWidth: '260px',
                marginBottom: '10px'
              }}>
                {registration.fullName}
                {registration.nickname && (
                  <span style={{ fontSize: '1.15rem', color: '#F59E0B', marginLeft: '6px', fontWeight: 600 }}>
                    ({registration.nickname})
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6, margin: '8px 0 18px 0' }}>
                ได้เข้าร่วมและพิชิตระยะทาง <strong style={{ color: '#F59E0B' }}>{distance}</strong><br />
                ในกิจกรรม <strong style={{ color: '#FFF' }}>{eventTitle} ({epNumber})</strong>
              </p>

              {/* Meta strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--dark-border)',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '0.8rem',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>หมายเลข BIB</span>
                  <strong style={{ color: '#F59E0B', fontFamily: 'monospace', fontSize: '0.95rem' }}>{registration.bibNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>วันที่จัดงาน</span>
                  <strong style={{ color: '#FFF' }}>{eventDateFormatted}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>สถานะ</span>
                  <strong style={{ color: '#10B981' }}>✓ FINISHER</strong>
                </div>
              </div>

              {/* Location Tag */}
              <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                📍 {location}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: 1-Click Save Image & Print */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, minWidth: '180px', padding: '12px 18px', fontSize: '0.95rem', fontWeight: 800 }} 
            onClick={handleSaveAsImage}
            disabled={downloading}
          >
            {downloading ? (
              '⏳ กำลังสร้างรูปภาพ...'
            ) : downloadSuccess ? (
              <>
                <Check size={18} /> บันทึกรูปภาพเรียบร้อย!
              </>
            ) : (
              <>
                <Download size={18} /> {activeTab === 'coupon' ? '📸 บันทึกรูปคูปอง' : '🏅 บันทึกใบประกาศ HD'}
              </>
            )}
          </button>

          <button className="btn btn-secondary" onClick={handlePrint} title="พิมพ์เอกสาร">
            <Printer size={16} /> พิมพ์
          </button>

          <button className="btn btn-secondary" onClick={onClose}>
            ปิด
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5 }}>
          💡 สลับแถบด้านบนเพื่อดู <strong>"🎟️ คูปองชิงรางวัล"</strong> หรือ <strong>"🏅 ใบประกาศ Finisher"</strong> แล้วกดบันทึกเป็นรูปภาพเก็บไว้ในมือถือได้ทันที
        </p>
      </div>
    </div>
  );
}

// Re-export for compatibility
export { EBibModal as CouponModal };
