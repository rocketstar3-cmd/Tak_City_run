import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, CheckCircle, ShieldAlert, Heart, Share2 } from 'lucide-react';

export function EBibModal({ registration, activeEvent, clubSettings, onClose }) {
  const bibRef = useRef(null);

  if (!registration) return null;

  const eventTitle = activeEvent?.title || 'TAK City Run';
  const distance = activeEvent?.distances?.find(d => d.id === registration.distanceId)?.label || 'City Run';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '520px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>บัตรนักวิ่งดิจิทัล (E-BIB)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              บันทึกภาพหน้านี้ไว้สำหรับแสดงหน้างานเพื่อรับของที่ระลึกและจุดปล่อยตัว
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable E-BIB Card */}
        <div className="bib-container" ref={bibRef} id="printable-bib">
          <div className="bib-ticket">
            {/* Header */}
            <div className="bib-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={clubSettings?.logoUrl || '/tak-city-run-logo.svg'} 
                  alt="TAK City Run" 
                  style={{ width: '32px', height: '32px' }}
                />
                <div>
                  <div className="bib-header-title">{clubSettings?.clubName || 'TAK CITY RUN'}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                    EP.{String(activeEvent?.epNumber || '02').padStart(2, '0')} • FREE COMMUNITY RUN
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#000', padding: '4px 8px', borderRadius: '4px' }}>
                  OFFICIAL PASS
                </span>
              </div>
            </div>

            {/* Perforated Notches */}
            <div className="bib-notch-left"></div>
            <div className="bib-notch-right"></div>

            {/* Body */}
            <div className="bib-body">
              <span className="bib-distance-pill">{distance}</span>

              <div className="bib-number-display">
                {registration.bibNumber}
              </div>

              <div className="bib-runner-name">
                {registration.fullName}
                {registration.nickname && <span style={{ color: 'var(--primary)', marginLeft: '8px' }}>({registration.nickname})</span>}
              </div>

              {/* QR Code */}
              <div className="bib-qr-wrap">
                <QRCodeSVG 
                  value={`TAK-RUN:${registration.bibNumber}:${registration.phone}`} 
                  size={120} 
                  level="H" 
                  fgColor="#0F172A"
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                สแกนเพื่อเช็คอินหน้างานโดยแอดมิน
              </div>

              {/* Runner Meta Details */}
              <div className="bib-details-grid">
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>เบอร์โทรศัพท์</span>
                  <strong>{registration.phone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ไซส์เสื้อ (ถ้ามี)</span>
                  <strong>{registration.shirtSize || 'Free Size'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ผู้ติดต่อฉุกเฉิน</span>
                  <strong>{registration.emergencyContact || '-'} ({registration.emergencyPhone || '-'})</strong>
                </div>
                {registration.medicalNotes && registration.medicalNotes !== '-' && (
                  <div style={{ gridColumn: 'span 2', color: '#F87171' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem' }}>หมายเหตุสุขภาพ/แพ้ยา</span>
                    <strong>{registration.medicalNotes}</strong>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div style={{ marginTop: '16px' }}>
                {registration.checkedIn ? (
                  <span className="badge-tag green" style={{ margin: 0 }}>
                    <CheckCircle size={14} /> เช็คอินหน้างานแล้ว
                  </span>
                ) : (
                  <span className="badge-tag" style={{ margin: 0 }}>
                    ลงทะเบียนสำเร็จ (รอเช็คอินหน้างาน)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={18} /> พิมพ์ / เซฟเป็น PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            ปิด
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '14px' }}>
          💡 แนะนำ: บันทึกภาพหน้าจอ (Screenshot) บัตรนี้เก็บไว้ในแกลเลอรีมือถือ เพื่อความสะดวกในเช้าวันงาน
        </p>
      </div>
    </div>
  );
}
