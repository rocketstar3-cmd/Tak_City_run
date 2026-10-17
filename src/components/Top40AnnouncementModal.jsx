import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Award,
  Sparkles,
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Share2,
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * Format runner's name with PDPA masking matching reference image:
 * e.g., "คุณภัทร XX (เบิ้ล)" or "Thanyarat XX (Ton)" or "ดนัย XX"
 */
export function formatMaskedRunnerName(fullName = '', nickname = '', maskLastname = true) {
  if (!fullName) return '';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);

  let displayName = '';
  if (maskLastname) {
    if (parts.length > 1) {
      displayName = `${parts[0]} XX`;
    } else {
      displayName = `${clean} XX`;
    }
  } else {
    displayName = clean;
  }

  if (nickname && nickname.trim()) {
    displayName += ` (${nickname.trim()})`;
  }

  return displayName;
}

export function Top40AnnouncementModal({
  isOpen,
  onClose,
  events = [],
  activeEvent,
  registrations = [],
  clubSettings,
  isAdmin = false
}) {
  const [selectedEventId, setSelectedEventId] = useState(activeEvent?.id || 'ep-02');
  const [quota, setQuota] = useState(40);
  const [maskLastname, setMaskLastname] = useState(true);
  const [showShirtSize, setShowShirtSize] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('รายชื่อผู้ได้รับสิทธิ์ เสื้อที่ระลึก 40 คนแรก');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('poster'); // 'poster' | 'list'

  const posterRef = useRef(null);

  // Sync event info
  const currentEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || activeEvent || events[0] || {};
  }, [events, selectedEventId, activeEvent]);

  useEffect(() => {
    if (currentEvent) {
      const epNum = currentEvent.epNumber || '02';
      setTitle(`TAK CITY RUN EP.${String(epNum).padStart(2, '0')}`);
    }
  }, [currentEvent]);

  // Filter registrations for the selected event and sort chronologically (earliest first)
  const sortedRegistrants = useMemo(() => {
    const list = registrations.filter(r => {
      if (!selectedEventId || selectedEventId === 'all') return true;
      return r.eventId === selectedEventId;
    });

    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.bibNumber || '').localeCompare(b.bibNumber || '');
    });
  }, [registrations, selectedEventId]);

  // The top N lucky runners
  const topRunners = useMemo(() => {
    return sortedRegistrants.slice(0, quota);
  }, [sortedRegistrants, quota]);

  // Quick search result for runner verification
  const searchMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    const cleanPhone = q.replace(/[^0-9]/g, '');

    const index = sortedRegistrants.findIndex(r => {
      const p = (r.phone || '').replace(/[^0-9]/g, '');
      const n = (r.fullName || '').toLowerCase();
      const nick = (r.nickname || '').toLowerCase();
      const bib = (r.bibNumber || '').toLowerCase();
      return (cleanPhone && p && p === cleanPhone) ||
        n.includes(q) ||
        nick.includes(q) ||
        bib.includes(q);
    });

    if (index === -1) {
      return { found: false, query: searchQuery };
    }

    const rank = index + 1;
    const runner = sortedRegistrants[index];
    return {
      found: true,
      rank,
      isTop40: rank <= quota,
      runner
    };
  }, [searchQuery, sortedRegistrants, quota]);

  if (!isOpen) return null;

  // Split into 2 columns (e.g. 1-20 and 21-40)
  const halfQuota = Math.ceil(quota / 2);
  const col1 = [];
  const col2 = [];

  for (let i = 0; i < quota; i++) {
    const runner = topRunners[i] || null;
    const item = {
      rank: i + 1,
      runner
    };
    if (i < halfQuota) {
      col1.push(item);
    } else {
      col2.push(item);
    }
  }

  // Handle Download Poster as PNG
  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      // Temporarily ensure smooth background capture
      const canvas = await html2canvas(posterRef.current, {
        scale: 2.5, // Crisp HD rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0A1128',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure cloned poster is fully visible during render
          const el = clonedDoc.getElementById('tak-poster-export-card');
          if (el) {
            el.style.transform = 'none';
          }
        }
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      const epLabel = currentEvent?.epNumber ? `EP${String(currentEvent.epNumber).padStart(2, '0')}` : 'EP02';
      link.download = `TAK_City_Run_${epLabel}_Top${quota}_Shirt_Announcement.png`;
      link.click();
    } catch (err) {
      console.error('Download poster error:', err);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ กรุณาใช้วิธีจับภาพหน้าจอ (Screenshot) แทน');
    } finally {
      setDownloading(false);
    }
  };

  // Handle Copy text for Facebook / Social Media
  const handleCopyFacebookText = () => {
    const epNum = currentEvent?.epNumber || '02';
    const lines = [
      `📢 ประกาศรายชื่อผู้ได้รับสิทธิ์ "เสื้อที่ระลึก ${quota} คนแรก" 🎽🔥`,
      `กิจกรรม: TAK City Run EP.${String(epNum).padStart(2, '0')} - ${currentEvent?.title || ''}`,
      `---------------------------------`,
      `ขอแสดงความยินดีกับนักวิ่งทั้ง ${topRunners.length} ท่าน ที่ลงทะเบียนไวที่สุด ดังนี้:`,
      ''
    ];

    topRunners.forEach((r, idx) => {
      const name = formatMaskedRunnerName(r.fullName, r.nickname, maskLastname);
      const size = showShirtSize && r.shirtSize ? ` [ไซส์ ${r.shirtSize}]` : '';
      lines.push(`${idx + 1}. ${name}${size}`);
    });

    if (topRunners.length < quota) {
      lines.push('');
      lines.push(`(ปัจจุบันมีผู้ได้รับสิทธิ์แล้ว ${topRunners.length} / ${quota} คน - สิทธิ์ยังเหลือสำหรับผู้ลงทะเบียนต่อไป!)`);
    }

    lines.push('');
    lines.push('📌 วิธีการรับเสื้อ:');
    lines.push('ผู้มีรายชื่อสามารถแสดงบัตรประจำตัว E-BIB / บัตรประชาชน เพื่อรับเสื้อที่ระลึกได้ที่จุดลงทะเบียนในวันงาน');
    lines.push('');
    lines.push('🔎 ตรวจสอบหมายเลข E-BIB และสถานะสิทธิ์ของคุณได้ที่:');
    lines.push(window.location.origin || 'https://takcityrun.com');
    lines.push('');
    lines.push('#TAKCityRun #เมืองตาก #วิ่งฟรี #ปั่นปันรักวิ่งรับลมหนาว');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000, overflowY: 'auto', padding: '16px' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '960px',
          width: '100%',
          padding: '24px',
          background: '#0B1120',
          border: '1.5px solid rgba(255, 85, 0, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag gold" style={{ margin: 0, padding: '3px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} /> ระบบประกาศผลผู้ได้รับเสื้อที่ระลึก {quota} คนแรก
              </span>
              <span className="badge-tag cyan" style={{ margin: 0, padding: '3px 10px', fontSize: '0.8rem' }}>
                EP.{String(currentEvent?.epNumber || '02').padStart(2, '0')}
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#FFF', marginTop: '6px', fontWeight: 800 }}>
              📢 โปสเตอร์ประกาศผลรายชื่อผู้ได้รับเสื้อที่ระลึก (Official Poster)
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              ระบบคัดเลือกตามเวลาลงทะเบียนไวที่สุดอัตโนมัติ (First-Come, First-Served) พร้อมเซ็นเซอร์ชื่อตามมาตรฐาน PDPA
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Runner Search Box (Super helpful for runners to check instantly!) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Search size={16} color="var(--primary)" />
            <strong style={{ fontSize: '0.92rem', color: '#FFF' }}>🔎 ค้นหาสิทธิ์ของฉันในกิจกรรมนี้:</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, minWidth: '220px', padding: '10px 14px' }}
              placeholder="พิมพ์ชื่อ, ชื่อเล่น, เบอร์โทร หรือเลข BIB เพื่อเช็คสิทธิ์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSearchQuery('')}
              >
                ล้างคำค้นหา
              </button>
            )}
          </div>

          {searchMatch && (
            <div style={{
              marginTop: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: searchMatch.found
                ? (searchMatch.isTop40 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)')
                : 'rgba(239, 68, 68, 0.15)',
              border: searchMatch.found
                ? (searchMatch.isTop40 ? '1.5px solid #10B981' : '1.5px solid #F59E0B')
                : '1.5px solid #EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.6rem' }}>
                {searchMatch.found ? (searchMatch.isTop40 ? '🎉' : '🏃') : '❓'}
              </span>
              <div>
                {searchMatch.found ? (
                  searchMatch.isTop40 ? (
                    <div>
                      <strong style={{ color: '#34D399', fontSize: '1.05rem' }}>
                        ยินดีด้วย! คุณ {searchMatch.runner.fullName} ได้รับสิทธิ์เสื้อที่ระลึก (ลำดับที่ #{searchMatch.rank})
                      </strong>
                      <div style={{ color: '#E2E8F0', fontSize: '0.85rem', marginTop: '2px' }}>
                        หมายเลข E-BIB: <strong>{searchMatch.runner.bibNumber}</strong> | ไซส์เสื้อ: <strong>{searchMatch.runner.shirtSize || 'Free Size'}</strong>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong style={{ color: '#FBBF24', fontSize: '1rem' }}>
                        คุณ {searchMatch.runner.fullName} อยู่ในลำดับที่ #{searchMatch.rank}
                      </strong>
                      <div style={{ color: '#E2E8F0', fontSize: '0.82rem', marginTop: '2px' }}>
                        (ขออภัย สิทธิ์เสื้อครบ {quota} ท่านแรกแล้ว แต่ท่านยังสามารถมาร่วมวิ่งและรับของรางวัลหน้างานได้ตามปกติ!)
                      </div>
                    </div>
                  )
                ) : (
                  <div>
                    <strong style={{ color: '#F87171', fontSize: '0.95rem' }}>
                      ไม่พบข้อมูลผู้สมัครที่ตรงกับ "{searchMatch.query}" ในรอบนี้
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      กรุณาตรวจสอบเบอร์โทรหรือชื่อให้ถูกต้อง หรือลงทะเบียนเข้าร่วมใหม่ได้ที่หน้าแรก
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Controls Panel */}
        {isAdmin && (
          <div style={{
            background: 'rgba(255, 85, 0, 0.08)',
            border: '1px solid rgba(255, 85, 0, 0.25)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: '#FFA559', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚙️ แผงควบคุมและปรับแต่งโปสเตอร์ (Admin Controls)
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ผู้สมัครในรอบนี้ทั้งหมด: <strong style={{ color: '#FFF' }}>{sortedRegistrants.length}</strong> คน
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  เลือกรอบกิจกรรม (Episode)
                </label>
                <select
                  className="form-control"
                  style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      EP.{String(ev.epNumber).padStart(2, '0')} - {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  จำนวนโควตาเสื้อ (คน)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  className="form-control"
                  style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                  value={quota}
                  onChange={(e) => setQuota(Math.max(1, Number(e.target.value) || 40))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  หัวข้อโปสเตอร์
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น TAK CITY RUN EP.02"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  คำบรรยายสิทธิ์
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="เช่น รายชื่อผู้ได้รับสิทธิ์ เสื้อที่ระลึก 40 คนแรก"
                />
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '14px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#FFF' }}>
                <input
                  type="checkbox"
                  checked={maskLastname}
                  onChange={(e) => setMaskLastname(e.target.checked)}
                />
                <span>🔒 เซ็นเซอร์นามสกุลตาม PDPA (เช่น คุณภัทร XX (เบิ้ล))</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#FFF' }}>
                <input
                  type="checkbox"
                  checked={showShirtSize}
                  onChange={(e) => setShowShirtSize(e.target.checked)}
                />
                <span>👕 แสดงไซส์เสื้อในรูปโปสเตอร์</span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons: Download PNG & Copy Facebook Post */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={handleCopyFacebookText}
          >
            {copied ? <Check size={18} color="#10B981" /> : <Copy size={18} />}
            {copied ? 'คัดลอกรายชื่อเรียบร้อย!' : 'คัดลอกข้อความโพสต์ Facebook'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #FF5500, #F59E0B)',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              boxShadow: '0 4px 15px rgba(255, 85, 0, 0.4)'
            }}
            onClick={handleDownloadPoster}
            disabled={downloading}
          >
            <Download size={18} />
            {downloading ? 'กำลังสร้างรูปภาพ HD...' : 'ดาวน์โหลดรูปโปสเตอร์ประกาศผล (PNG)'}
          </button>
        </div>

        {/* ============================================================== */}
        {/* POSTER CANVAS PREVIEW (Matches reference image style) */}
        {/* ============================================================== */}
        <div style={{
          overflowX: 'auto',
          padding: '10px 0',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div
            id="tak-poster-export-card"
            ref={posterRef}
            style={{
              width: '840px',
              minWidth: '840px',
              background: 'linear-gradient(180deg, #0284C7 0%, #0369A1 18%, #0C4A6E 45%, #082F49 75%, #0B192C 100%)',
              borderRadius: '24px',
              padding: '28px 32px 24px 32px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Prompt', 'Kanit', sans-serif",
              color: '#FFF'
            }}
          >
            {/* Ambient Background Graphics */}
            <div style={{
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(2, 132, 199, 0) 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-80px',
              left: '-60px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 85, 0, 0.25) 0%, rgba(255, 85, 0, 0) 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} />

            {/* Poster Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 2
            }}>
              {/* Brand Emblem */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.4rem' }}>🏃</span>
                  <div>
                    <div style={{ color: '#0369A1', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1, letterSpacing: '0.04em' }}>
                      {clubSettings?.clubName || 'TAK CITY RUN'}
                    </div>
                    <div style={{ color: '#FF5500', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                      COMMUNITY RUN CLUB
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  {currentEvent?.epNumber ? `EPISODE ${String(currentEvent.epNumber).padStart(2, '0')}` : 'EPISODE 02'}
                </div>
              </div>

              {/* Verified Badge */}
              <div style={{
                background: 'linear-gradient(135deg, #FF5500, #F59E0B)',
                color: '#FFF',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(255, 85, 0, 0.4)',
                letterSpacing: '0.04em'
              }}>
                ⭐ OFFICIAL SELECTION
              </div>
            </div>

            {/* Poster Main Title & Subtitle Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 2
            }}>
              <div>
                <div style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontStyle: 'italic',
                  letterSpacing: '0.05em'
                }}>
                  {currentEvent?.subtitle || 'ปั่นปันรัก วิ่งรับลมหนาว ริมแม่น้ำปิง'}
                </div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: '2px 0 0 0',
                  lineHeight: 1.05,
                  textShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
                  letterSpacing: '-0.01em'
                }}>
                  {title || 'TAK CITY RUN EP.02'}
                </h1>
              </div>

              {/* Right Subtitle Stamp Banner (Styled like Lactasoy reference) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                color: '#0369A1',
                padding: '10px 20px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                textAlign: 'right',
                maxWidth: '340px'
              }}>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '6px'
                }}>
                  <span>{subtitle}</span>
                  <span style={{ fontSize: '1.4rem' }}>🎽</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                  (คัดเลือกตามลำดับเวลาการลงทะเบียนถูกต้อง)
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* WHITE ROUNDED MAIN CARD (Like the reference image) */}
            {/* ======================================================== */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '22px',
              padding: '24px 28px',
              boxShadow: '0 18px 40px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              zIndex: 2,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '28px'
            }}>
              {/* Column 1 (Items 1 to halfQuota) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
                borderRight: '1.5px solid #E2E8F0',
                paddingRight: '20px'
              }}>
                {col1.map(({ rank, runner }) => {
                  const formattedName = runner
                    ? formatMaskedRunnerName(runner.fullName, runner.nickname, maskLastname)
                    : null;

                  return (
                    <div
                      key={`col1-${rank}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '4px 6px',
                        borderRadius: '8px',
                        background: runner ? 'transparent' : 'rgba(241, 245, 249, 0.6)'
                      }}
                    >
                      {/* Number Badge */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: rank <= 3 ? '#FF5500' : '#2563EB',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                      }}>
                        {rank}
                      </div>

                      {/* Runner Name */}
                      <div style={{
                        flex: 1,
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: runner ? '#0F172A' : '#94A3B8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {runner ? formattedName : `(รอผู้ลงทะเบียนลำดับที่ ${rank})`}
                      </div>

                      {/* Shirt Size Badge (Optional) */}
                      {showShirtSize && runner && runner.shirtSize && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE'
                        }}>
                          {runner.shirtSize}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Column 2 (Items halfQuota+1 to quota) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
                paddingLeft: '6px'
              }}>
                {col2.map(({ rank, runner }) => {
                  const formattedName = runner
                    ? formatMaskedRunnerName(runner.fullName, runner.nickname, maskLastname)
                    : null;

                  return (
                    <div
                      key={`col2-${rank}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '4px 6px',
                        borderRadius: '8px',
                        background: runner ? 'transparent' : 'rgba(241, 245, 249, 0.6)'
                      }}
                    >
                      {/* Number Badge */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                      }}>
                        {rank}
                      </div>

                      {/* Runner Name */}
                      <div style={{
                        flex: 1,
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: runner ? '#0F172A' : '#94A3B8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {runner ? formattedName : `(รอผู้ลงทะเบียนลำดับที่ ${rank})`}
                      </div>

                      {/* Shirt Size Badge (Optional) */}
                      {showShirtSize && runner && runner.shirtSize && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE'
                        }}>
                          {runner.shirtSize}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Poster Bottom Bar (Matches reference footer) */}
            <div style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.3
              }}>
                GOOD RUNS. GOOD PEOPLE. GOOD HEALTH.
                <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500, letterSpacing: 'normal' }}>
                  สะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี ริมแม่น้ำปิง จ.ตาก
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <span>👟</span>
                  <span>RUN TOGETHER</span>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'right'
                }}>
                  <div>ประกาศ ณ วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            💡 แนะนำ: กด "ดาวน์โหลดรูปโปสเตอร์" เพื่อนำภาพไปโพสต์ประกาศผลบน Facebook Page หรือส่งใน LINE OpenChat
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
