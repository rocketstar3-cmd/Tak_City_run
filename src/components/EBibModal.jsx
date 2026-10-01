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
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!registration) return null;

  const eventTitle = activeEvent?.title || 'TAK City Run';
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
    if (!ticketRef.current || downloading) return;
    try {
      setDownloading(true);
      setDownloadSuccess(false);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // High resolution retina display
        backgroundColor: '#0d1322',
        useCORS: true,
        logging: false
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `tak-city-run-coupon-${registration.bibNumber || 'ticket'}.png`;
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
        style={{ maxWidth: '540px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag gold" style={{ margin: 0, padding: '3px 10px', fontSize: '0.78rem' }}>
                <Gift size={13} /> คูปองกิจกรรม & ชิงโชค
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginTop: '6px' }}>
              {couponConfig.headline}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {couponConfig.subheadline}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Printable & Downloadable Coupon Ticket */}
        <div className="coupon-container" ref={ticketRef} id="printable-ticket">
          <div className="coupon-ticket">
            {/* Ticket Header */}
            <div className="coupon-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={clubSettings?.logoUrl || '/tak-city-run-logo.svg'} 
                  alt="TAK City Run" 
                  style={{ width: '36px', height: '36px' }}
                />
                <div>
                  <div className="coupon-header-title">{clubSettings?.clubName || 'TAK CITY RUN'}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9, letterSpacing: '0.04em' }}>
                    EP.{String(activeEvent?.epNumber || '02').padStart(2, '0')} • FREE COMMUNITY RUN
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
            <div className="coupon-body">
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
                  {registration.medicalNotes && registration.medicalNotes !== '-' && (
                    <div style={{ gridColumn: 'span 2', color: '#F87171' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem' }}>หมายเหตุสุขภาพ/แพ้ยา</span>
                      <strong>{registration.medicalNotes}</strong>
                    </div>
                  )}
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

        {/* Action Buttons: 1-Click Save Image & Print */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, minWidth: '180px', padding: '12px 18px', fontSize: '0.98rem' }} 
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
                <Download size={18} /> 📸 บันทึกเป็นรูปภาพ
              </>
            )}
          </button>

          <button className="btn btn-secondary" onClick={handlePrint} title="พิมพ์เอกสารหรือบันทึกเป็น PDF">
            <Printer size={18} /> พิมพ์
          </button>

          <button className="btn btn-secondary" onClick={onClose}>
            ปิด
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '14px', lineHeight: 1.5 }}>
          💡 <strong>บันทึกง่าย:</strong> กดปุ่ม <em>"📸 บันทึกเป็นรูปภาพ"</em> หรือแคปหน้าจอ (Screenshot) หน้านี้เก็บไว้ในมือถือ เพื่อแสดงต่อเจ้าหน้าที่รับของและร้านค้าในเช้าวันงาน
        </p>
      </div>
    </div>
  );
}

// Re-export for compatibility
export { EBibModal as CouponModal };
