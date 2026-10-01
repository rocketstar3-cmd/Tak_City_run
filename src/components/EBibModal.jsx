import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, CheckCircle, Gift, Coffee, ShoppingBag, Award, Sparkles, Phone, AlertCircle, Heart } from 'lucide-react';

export function EBibModal({ registration, activeEvent, clubSettings, onClose }) {
  const ticketRef = useRef(null);

  if (!registration) return null;

  const eventTitle = activeEvent?.title || 'TAK City Run';
  const distance = registration.distanceLabel || activeEvent?.distanceLabel || `${activeEvent?.distanceKm || 5.8} KM City Run`;

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
              คูปองลุ้นรางวัล & สิทธิประโยชน์นักวิ่ง
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              บัตรดิจิทัลประจำตัวสำหรับจับสลาก Lucky Draw และรับอาหารเช้าหน้างาน
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Printable Coupon Ticket */}
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
                  🎟️ LUCKY PASS
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

              <div className="coupon-runner-name">
                {registration.fullName}
                {registration.nickname && (
                  <span style={{ color: 'var(--primary)', marginLeft: '8px', fontWeight: 600 }}>
                    ({registration.nickname})
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                เบอร์โทรศัพท์: {registration.phone}
              </div>

              {/* Perforated Divider with Cutout Notches */}
              <div className="coupon-perforated-wrap">
                <div className="coupon-notch-left"></div>
                <div className="coupon-perforated-line">
                  <span>✂️ รอยปรุ • หางบัตรจับรางวัล & คูปองสิทธิพิเศษ</span>
                </div>
                <div className="coupon-notch-right"></div>
              </div>

              {/* Stub / Perks Section */}
              <div className="coupon-stub-section">
                <div className="coupon-perks-title">
                  <Sparkles size={14} color="var(--primary)" /> สิทธิประโยชน์สำหรับผู้ถือคูปองนี้:
                </div>
                <div className="coupon-perks-list">
                  <div className="coupon-perk-item">
                    <div className="coupon-perk-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                      <Gift size={16} />
                    </div>
                    <div>
                      <strong>สิทธิ์ลุ้นรับรางวัล Lucky Draw ท้ายงาน</strong>
                      <p>จับสลากแจกของรางวัล & ของที่ระลึกจากผู้สนับสนุนหลังเข้าเส้นชัย</p>
                    </div>
                  </div>

                  <div className="coupon-perk-item">
                    <div className="coupon-perk-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                      <Coffee size={16} />
                    </div>
                    <div>
                      <strong>อาหารเช้าชุมชน & กาแฟดอยฟรี</strong>
                      <p>อิ่มอร่อยกับเมนูท้องถิ่นเมืองตาก ณ ซุ้มอาหารบริการนักวิ่ง</p>
                    </div>
                  </div>

                  <div className="coupon-perk-item">
                    <div className="coupon-perk-icon" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}>
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <strong>ส่วนลดพิเศษร้านค้าชุมชน</strong>
                      <p>แสดงคูปองเพื่อรับส่วนลดและโปรโมชั่นพิเศษจากร้านค้าที่ร่วมรายการ</p>
                    </div>
                  </div>
                </div>

                {/* QR Code for Staff Verification */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <div className="coupon-qr-wrap">
                    <QRCodeSVG 
                      value={`TAK-RUN:${registration.bibNumber}:${registration.phone}`} 
                      size={120} 
                      level="H" 
                      fgColor="#0F172A"
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    สแกนเพื่อยืนยันสิทธิ์ & ลงทะเบียนจับรางวัลหน้างานโดยทีมงาน
                  </div>
                </div>

                {/* Runner Meta Details */}
                <div className="coupon-details-grid">
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ไซส์เสื้อที่ระลึก (ถ้ามี)</span>
                    <strong>{registration.shirtSize || 'Free Size'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ผู้ติดต่อฉุกเฉิน</span>
                    <strong>{registration.emergencyContact || '-'} ({registration.emergencyPhone || '-'})</strong>
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
                    <span className="badge-tag" style={{ margin: 0, padding: '6px 14px', fontSize: '0.85rem' }}>
                      ⏳ ลงทะเบียนสำเร็จ (รอยืนยันสิทธิ์หน้างาน)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={18} /> พิมพ์ / บันทึกเป็น PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            ปิด
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '14px', lineHeight: 1.5 }}>
          💡 <strong>คำแนะนำ:</strong> บันทึกภาพหน้าจอ (Screenshot) คูปองนี้เก็บไว้ในโทรศัพท์ เพื่อความสะดวกรวดเร็วในการแสดงต่อเจ้าหน้าที่รับของและร้านค้าในเช้าวันงาน
        </p>
      </div>
    </div>
  );
}

// Re-export for compatibility
export { EBibModal as CouponModal };
