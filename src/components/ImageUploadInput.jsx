import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { uploadImageFile, normalizeImageUrl } from '../lib/supabase';

export function ImageUploadInput({
  label = 'รูปภาพ',
  value = '',
  onChange,
  bucket = 'event-images',
  folder = 'events',
  placeholder = 'https://... หรือลิงก์ Google Drive',
  helpText = '',
  previewHeight = '180px',
  samples = [],
  aspectRatio = '16:9',
  onAspectRatioChange = null,
  fitMode = 'cover',
  onFitModeChange = null,
  showAspectRatioSelector = false
}) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'url'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadWarning, setUploadWarning] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [driveDetected, setDriveDetected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle direct file selection
  const handleFileProcess = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadWarning('');
    setUploadSuccess(false);

    try {
      const result = await uploadImageFile(file, bucket, folder);
      if (result.success && result.url) {
        onChange(result.url);
        setUploadSuccess(true);
        if (result.warning) {
          setUploadWarning(result.warning);
        }
        setTimeout(() => setUploadSuccess(false), 3500);
      }
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileProcess(file);
    }
  };

  // Handle URL change with auto Google Drive normalization
  const handleUrlChange = (e) => {
    const rawVal = e.target.value;
    const isGoogleDrive = rawVal.includes('drive.google.com');
    const normalized = normalizeImageUrl(rawVal);
    
    if (isGoogleDrive && normalized !== rawVal) {
      setDriveDetected(true);
      setTimeout(() => setDriveDetected(false), 4000);
    }
    onChange(normalized);
  };

  return (
    <div className="form-group" style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
          {label}
        </label>
        
        {/* Toggle between Upload File vs Paste URL */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px', borderRadius: '6px', border: '1px solid var(--dark-border)' }}>
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: inputMode === 'upload' ? 'var(--primary)' : 'transparent',
              color: inputMode === 'upload' ? '#FFF' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Upload size={12} /> อัปโหลดไฟล์
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: inputMode === 'url' ? 'var(--primary)' : 'transparent',
              color: inputMode === 'url' ? '#FFF' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <LinkIcon size={12} /> ใส่ลิงก์ URL / Drive
          </button>
        </div>
      </div>

      {/* Mode 1: File Upload */}
      {inputMode === 'upload' && (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{
              border: isDragging 
                ? '2px dashed var(--primary)' 
                : '1px dashed rgba(255, 255, 255, 0.25)',
              background: isDragging 
                ? 'rgba(255, 85, 0, 0.08)' 
                : 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              padding: '18px 16px',
              textAlign: 'center',
              cursor: isUploading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {isUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={26} className="spin-animation" style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 500 }}>
                  กำลังอัปโหลดไฟล์รูปภาพขึ้น Supabase Storage...
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ระบบกำลังสร้างลิงก์สำหรับแสดงผล
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 85, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: '2px'
                }}>
                  <Upload size={20} />
                </div>
                <div style={{ fontSize: '0.92rem', color: '#FFF', fontWeight: 500 }}>
                  คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  รองรับ JPG, PNG, WebP (สูงสุด 10MB) • อัปโหลดตรงเข้า Supabase
                </div>
              </div>
            )}
          </div>

          {/* Upload Success Notice */}
          {uploadSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              padding: '6px 10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: 'var(--green)'
            }}>
              <CheckCircle size={14} /> อัปโหลดรูปภาพสำเร็จแล้ว! ลิงก์ถูกผูกกับงานนี้โดยอัตโนมัติ
            </div>
          )}

          {/* Fallback Warning Notice */}
          {uploadWarning && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              marginTop: '6px',
              padding: '8px 10px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#FBBF24',
              lineHeight: 1.4
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>คำแนะนำ Storage:</strong> {uploadWarning}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Paste URL / Google Drive */}
      {inputMode === 'url' && (
        <div>
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={value}
            onChange={handleUrlChange}
          />

          {driveDetected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              padding: '6px 10px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: 'var(--cyan)'
            }}>
              <CheckCircle size={14} /> ✨ ตรวจพบลิงก์ Google Drive: ระบบแปลงเป็น Direct Image URL ให้โดยอัตโนมัติแล้ว!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>💡 วางลิงก์รูปตรง หรือลิงก์แชร์จาก Google Drive ได้ทันที</span>
            {samples.length > 0 && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <span>ตัวอย่าง:</span>
                {samples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    onClick={() => onChange(s.url)}
                  >
                    [{s.label}]
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {helpText && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
          {helpText}
        </span>
      )}

      {/* Aspect Ratio & Fit Mode Selector Panel */}
      {showAspectRatioSelector && (
        <div style={{
          marginTop: '10px',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--dark-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {/* 3 Aspect Ratio Presets: 16:9, 1:1, 9:16 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                📐 สัดส่วนรูป (Preset):
              </span>
              {[
                { id: '16:9', label: '16:9 แนวนอน', icon: '▬' },
                { id: '1:1', label: '1:1 จัตุรัส', icon: '◼' },
                { id: '9:16', label: '9:16 แนวตั้ง (Story)', icon: '▮' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onAspectRatioChange && onAspectRatioChange(opt.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: aspectRatio === opt.id ? 'var(--primary)' : 'var(--dark-border)',
                    background: aspectRatio === opt.id ? 'rgba(255, 85, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    color: aspectRatio === opt.id ? '#FFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ marginRight: '4px', opacity: 0.8 }}>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>

            {/* Fit Mode Toggle */}
            {onFitModeChange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>การตัดรูป:</span>
                <button
                  type="button"
                  onClick={() => onFitModeChange(fitMode === 'contain' ? 'cover' : 'contain')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    border: '1px solid var(--dark-border)',
                    background: fitMode === 'contain' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: fitMode === 'contain' ? 'var(--cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {fitMode === 'contain' ? '🔍 พอดีภาพ (ไม่ตัดขอบ)' : '🖼️ เต็มกรอบ (Fill)'}
                </button>
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            💡 เลือกให้ตรงกับรูปโปสเตอร์เพื่อไม่ให้ตัวหนังสือและรายละเอียดถูกคร็อปตัด
          </div>
        </div>
      )}

      {/* Live Preview Box */}
      {value ? (
        <div style={{
          marginTop: '12px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--dark-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ImageIcon size={13} color="var(--primary)" /> ตัวอย่างรูปภาพปัจจุบัน ({aspectRatio}):
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--cyan)',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={12} /> ดูรูปเต็ม
              </a>
              <button
                type="button"
                onClick={() => onChange('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: '#F87171',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={12} /> ลบรูป
              </button>
            </div>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: aspectRatio === '1:1' ? '1/1' : aspectRatio === '9:16' ? '9/16' : '16/9',
            maxHeight: aspectRatio === '9:16' ? '420px' : aspectRatio === '1:1' ? '320px' : previewHeight,
            borderRadius: '6px',
            overflow: 'hidden',
            background: fitMode === 'contain' ? 'radial-gradient(circle, #1E293B 0%, #080C15 100%)' : '#080C15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            margin: '0 auto'
          }}>
            <img
              src={value}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: fitMode || 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent && !parent.querySelector('.img-error-msg')) {
                  const msg = document.createElement('div');
                  msg.className = 'img-error-msg';
                  msg.style.color = '#F87171';
                  msg.style.fontSize = '0.82rem';
                  msg.style.textAlign = 'center';
                  msg.style.padding = '12px';
                  msg.innerHTML = '⚠️ ไม่สามารถโหลดรูปภาพจากลิงก์นี้ได้<br/><small style="color: #94A3B8;">(หากใช้ Google Drive กรุณาเปิดสิทธิ์ "ทุกคนที่มีลิงก์ดูได้" หรือลองใช้วิธีอัปโหลดไฟล์ตรง)</small>';
                  parent.appendChild(msg);
                }
              }}
            />
          </div>

          <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            URL: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{value.startsWith('data:') ? 'Local Base64 File (แนบจากเครื่อง)' : value}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
