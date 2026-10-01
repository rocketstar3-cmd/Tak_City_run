import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { DataService } from '../lib/supabase';

export function RegistrationModal({ activeEvent, onClose, onSuccessRegistration }) {
  const [formData, setFormData] = useState({
    distanceId: activeEvent?.distances?.[0]?.id || '',
    fullName: '',
    nickname: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    shirtSize: 'L',
    medicalNotes: '',
    acceptWaiver: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!activeEvent) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 9) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 9-10 หลัก)');
      return;
    }

    if (!formData.acceptWaiver) {
      setErrorMessage('กรุณาทำเครื่องหมายยินยอมข้อตกลงและเงื่อนไขความปลอดภัย');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        eventId: activeEvent.id,
        epNumber: activeEvent.epNumber,
        distanceKm: activeEvent.distanceKm || 5.8,
        distanceLabel: activeEvent.distanceLabel || 'City Run',
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim(),
        phone: formData.phone.replace(/[^0-9]/g, ''),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.replace(/[^0-9]/g, ''),
        shirtSize: formData.shirtSize,
        medicalNotes: formData.medicalNotes.trim() || '-'
      };

      const res = await DataService.registerRunner(payload);

      if (!res.success) {
        setErrorMessage(res.error || 'ไม่สามารถลงทะเบียนได้');
        setLoading(false);
        return;
      }

      // Fire festive celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccessRegistration(res.data);
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="badge-tag" style={{ marginBottom: '6px' }}>
              ลงทะเบียนฟรี ไม่มีค่าใช้จ่าย
            </span>
            <h2 style={{ fontSize: '1.45rem', color: '#FFF' }}>
              สมัครเข้าร่วม EP.{String(activeEvent.epNumber).padStart(2, '0')}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {activeEvent.title}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#FCA5A5',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <AlertTriangle size={18} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Single Fixed Distance Banner */}
          <div style={{
            background: 'rgba(255, 85, 0, 0.12)',
            border: '1.5px solid rgba(255, 85, 0, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                ระยะทางประจำ EP.{String(activeEvent.epNumber).padStart(2, '0')} (วิ่งระยะเดียวร่วมกัน)
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                {activeEvent.distanceLabel || `City Run ${activeEvent.distanceKm || 5.8}K`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                {activeEvent.distanceKm || 5.8}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF', marginLeft: '4px' }}>KM</span>
            </div>
          </div>

          {/* Personal Info */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ชื่อ - นามสกุล *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="เช่น นายรักวิ่ง เมืองตาก" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ชื่อเล่น (ถ้ามี)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="เช่น ป๊อป, ต้อม, ฝน" 
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">เบอร์โทรศัพท์มือถือ *</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="0812345678" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ขนาดเสื้อที่ใส่ประจำ (สำหรับจัดทำสถิติ)</label>
              <select 
                className="form-control"
                value={formData.shirtSize}
                onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value })}
              >
                <option value="XS">XS (รอบอก 34")</option>
                <option value="S">S (รอบอก 36")</option>
                <option value="M">M (รอบอก 38")</option>
                <option value="L">L (รอบอก 40")</option>
                <option value="XL">XL (รอบอก 42")</option>
                <option value="2XL">2XL (รอบอก 44")</option>
                <option value="3XL">3XL (รอบอก 46"+)</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ชื่อผู้ติดต่อฉุกเฉิน</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="เช่น สมศรี (ภรรยา / พี่สาว)" 
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="0898765432" 
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Medical Notes */}
          <div className="form-group">
            <label className="form-label">โรคประจำตัว / การแพ้อาหารหรือยา (ถ้ามี)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="เช่น โรคหอบหืด, ความดัน, แพ้อาหารทะเล (ถ้าไม่มีใส่ -)" 
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            />
          </div>

          {/* Waiver Checkbox */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            padding: '14px', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--dark-border)',
            marginBottom: '24px'
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
                checked={formData.acceptWaiver}
                onChange={(e) => setFormData({ ...formData, acceptWaiver: e.target.checked })}
              />
              <span>
                ข้าพเจ้าเข้าใจและยินยอมเข้าร่วมกิจกรรมวิ่ง TAK City Run ด้วยความสมัครใจ โดยมีสุขภาพร่างกายที่พร้อม และปฏิบัติตามคำแนะนำของเจ้าหน้าที่ฝ่ายจัดงานเพื่อความปลอดภัยร่วมกัน
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            disabled={loading}
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันลงทะเบียน & รับบัตร E-BIB ทันที'}
          </button>
        </form>
      </div>
    </div>
  );
}
