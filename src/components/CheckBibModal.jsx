import React, { useState } from 'react';
import { Search, X, User, Phone, CheckCircle, ArrowRight, Gift, Sparkles } from 'lucide-react';
import { DataService } from '../lib/supabase';

export function CheckBibModal({ activeEvent, onClose, onSelectRegistration }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const found = await DataService.searchRunner(query.trim());
      setResults(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag gold" style={{ margin: 0, padding: '3px 10px', fontSize: '0.78rem' }}>
                <Gift size={13} /> คูปองของฉัน
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginTop: '6px' }}>
              ค้นหาคูปองลุ้นรางวัล & สิทธิพิเศษ
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              กรอกเบอร์โทรศัพท์ หรือเลขคูปอง เพื่อดูคูปองและบันทึกรูปภาพ
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input 
            type="text" 
            className="form-control"
            placeholder="กรอกเบอร์โทร หรือเลขคูปอง (เช่น 0812345678, TK02-001)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={18} /> {loading ? 'ค้นหา...' : 'ค้นหา'}
          </button>
        </form>

        {/* Results */}
        {hasSearched && (
          <div>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                ไม่พบข้อมูลนักวิ่งที่ตรงกับ "{query}"<br />
                <span style={{ fontSize: '0.85rem' }}>โปรดตรวจสอบเบอร์โทรศัพท์ที่ใช้ลงทะเบียนอีกครั้ง</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  พบข้อมูล {results.length} รายการ:
                </span>
                {results.map((reg) => (
                  <div 
                    key={reg.id}
                    onClick={() => onSelectRegistration(reg)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--dark-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--dark-border)'}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontFamily: 'var(--font-heading)', 
                          fontWeight: 800, 
                          color: '#F59E0B',
                          fontSize: '1.25rem' 
                        }}>
                          {reg.bibNumber}
                        </span>
                        {reg.checkedIn ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> เช็คอินแล้ว
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            รอเช็คอิน
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#FFF', fontWeight: 600 }}>{reg.fullName} {reg.nickname && `(${reg.nickname})`}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>โทร: {reg.phone}</div>
                    </div>

                    <button className="btn btn-outline btn-sm">
                      ดูคูปองของฉัน 🎟️ <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export for compatibility
export { CheckBibModal as CheckCouponModal };
