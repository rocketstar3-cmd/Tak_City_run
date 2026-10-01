import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Download, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  Move,
  Award,
  Flame,
  Layers
} from 'lucide-react';

const FRAME_THEMES = [
  {
    id: 'finisher-gold',
    name: '🏆 Gold Finisher',
    tag: 'ผู้พิชิตเหรียญทอง',
    logoSrc: '/tak-logo-gold.png',
    accentColor: '#F59E0B',
    bgColor: '#0F172A',
    badgeText: 'OFFICIAL FINISHER'
  },
  {
    id: 'sporty-street',
    name: '⚡ Sporty Street',
    tag: 'สตรีทสปอร์ตพลังเทอร์โบ',
    logoSrc: '/tak-logo-white.png',
    accentColor: '#FF5500',
    bgColor: '#0B0F19',
    badgeText: 'CITY RUNNER'
  },
  {
    id: 'ping-river',
    name: '🌊 Ping River Vibe',
    tag: 'ริมแม่น้ำปิงสะพาน 200 ปี',
    logoSrc: '/tak-logo-white.png',
    accentColor: '#00F0FF',
    bgColor: '#081426',
    badgeText: 'SCENIC ROUTE'
  },
  {
    id: 'minimal-calligraphy',
    name: '🖤 Minimal Brush',
    tag: 'มินิมอล ลายพู่กันคลาสสิก',
    logoSrc: '/tak-logo-white.png',
    accentColor: '#FFFFFF',
    bgColor: '#111827',
    badgeText: 'TAK RUNNING'
  }
];

const SAMPLE_PHOTOS = [
  {
    id: 'runner-1',
    label: 'ตัวอย่าง 1 (ริมแม่น้ำ)',
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'runner-2',
    label: 'ตัวอย่าง 2 (ยามเช้า)',
    url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'runner-3',
    label: 'ตัวอย่าง 3 (เข้าเส้นชัย)',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'
  }
];

export function RunnerPhotoModal({ 
  activeEvent, 
  initialRunnerName = '', 
  initialBibNumber = '', 
  onClose 
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedTheme, setSelectedTheme] = useState(FRAME_THEMES[0]);
  const [runnerName, setRunnerName] = useState(initialRunnerName || 'นักวิ่งเมืองตาก');
  const [bibNumber, setBibNumber] = useState(initialBibNumber || 'TAK-001');
  const [distance, setDistance] = useState(activeEvent?.distanceLabel || `${activeEvent?.distanceKm || 5.8} KM`);
  
  // Image transformation state
  const [userImageSrc, setUserImageSrc] = useState(SAMPLE_PHOTOS[0].url);
  const [userImageObj, setUserImageObj] = useState(null);
  const [logoImageObj, setLogoImageObj] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Load Logo image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTheme.logoSrc;
    img.onload = () => {
      setLogoImageObj(img);
    };
  }, [selectedTheme]);

  // Load User Photo
  useEffect(() => {
    if (!userImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = userImageSrc;
    img.onload = () => {
      setUserImageObj(img);
      setPan({ x: 0, y: 0 });
    };
  }, [userImageSrc]);

  // Render on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !userImageObj) return;

    const ctx = canvas.getContext('2d');
    const size = 1080; // High quality 1:1 export
    canvas.width = size;
    canvas.height = size;

    // 1. Draw User Photo with Transform (Scale, Rotate, Pan)
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, size, size);

    ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect ratio covering
    const imgAspect = userImageObj.width / userImageObj.height;
    let drawW, drawH;
    if (imgAspect > 1) {
      drawH = size;
      drawW = size * imgAspect;
    } else {
      drawW = size;
      drawH = size / imgAspect;
    }

    ctx.drawImage(userImageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 2. Draw Frame & Overlays Based on Selected Theme
    drawFrameOverlay(ctx, size);

  }, [userImageObj, logoImageObj, selectedTheme, runnerName, bibNumber, distance, zoom, rotation, pan]);

  const drawFrameOverlay = (ctx, size) => {
    const epNumber = activeEvent?.epNumber ? `EP.${String(activeEvent.epNumber).padStart(2, '0')}` : 'EP.02';
    const location = activeEvent?.locationName || 'เมืองตาก • สะพานสมโภชกรุงรัตนโกสินทร์ 200 ปี';
    const dateStr = activeEvent?.eventDate ? new Date(activeEvent.eventDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : '15 พ.ย. 2569';

    if (selectedTheme.id === 'finisher-gold') {
      // 🏆 Gold Finisher Theme
      // Outer Gold Border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, size - 40, size - 40);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(34, 34, size - 68, size - 68);

      // Top Header Gradient
      const topGrad = ctx.createLinearGradient(0, 0, 0, 260);
      topGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      topGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, size, 260);

      // Bottom Footer Gradient
      const botGrad = ctx.createLinearGradient(0, size - 320, 0, size);
      botGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
      botGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.85)');
      botGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, size - 320, size, 320);

      // Draw Official Logo
      if (logoImageObj) {
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 15;
        ctx.drawImage(logoImageObj, 50, 45, 160, 160);
        ctx.shadowBlur = 0;
      }

      // Top Right Badge
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(size - 300, 50, 250, 54, 27);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🏆 ${selectedTheme.badgeText}`, size - 175, 85);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '600 20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${epNumber} • FREE COMMUNITY RUN`, size - 55, 135);

      // Bottom Runner Stats Card
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.roundRect(50, size - 240, size - 100, 180, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Runner Name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(runnerName, 80, size - 170);

      // Distance & Bib
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`⚡ ${distance}`, 80, size - 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`BIB: ${bibNumber}`, size - 80, size - 170);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '22px sans-serif';
      ctx.fillText(`${dateStr} • ${location}`, size - 80, size - 110);

    } else if (selectedTheme.id === 'sporty-street') {
      // ⚡ Sporty Street Theme (Neon Orange & Sharp Angles)
      // Top Dark Banner
      const topGrad = ctx.createLinearGradient(0, 0, 0, 220);
      topGrad.addColorStop(0, 'rgba(11, 15, 25, 0.95)');
      topGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, size, 220);

      // Bottom Dark Banner
      const botGrad = ctx.createLinearGradient(0, size - 320, 0, size);
      botGrad.addColorStop(0, 'rgba(11, 15, 25, 0)');
      botGrad.addColorStop(0.3, 'rgba(11, 15, 25, 0.85)');
      botGrad.addColorStop(1, 'rgba(11, 15, 25, 0.98)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, size - 320, size, 320);

      // Draw Official Logo
      if (logoImageObj) {
        ctx.shadowColor = 'rgba(255, 85, 0, 0.8)';
        ctx.shadowBlur = 18;
        ctx.drawImage(logoImageObj, 45, 45, 170, 170);
        ctx.shadowBlur = 0;
      }

      // Angled Orange Accent Bar at Bottom
      ctx.fillStyle = '#FF5500';
      ctx.beginPath();
      ctx.moveTo(0, size - 80);
      ctx.lineTo(size, size - 80);
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.fill();

      // Distance Slash Pill
      ctx.fillStyle = '#FF5500';
      ctx.beginPath();
      ctx.roundRect(size - 280, 55, 230, 60, 12);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ ${distance}`, size - 165, 96);

      // Runner Name & BIB
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText(runnerName, 50, size - 150);

      ctx.fillStyle = '#FFB03A';
      ctx.font = 'bold 32px monospace';
      ctx.fillText(`BIB ${bibNumber}`, 50, size - 100);

      // Bottom Orange Bar Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0B0F19';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`TAK CITY RUN ${epNumber}`, 40, size - 30);

      ctx.textAlign = 'right';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${dateStr} • ${location}`, size - 40, size - 30);

    } else if (selectedTheme.id === 'ping-river') {
      // 🌊 Ping River Vibe (Cyan & Deep Blue Glow)
      const topGrad = ctx.createLinearGradient(0, 0, 0, 240);
      topGrad.addColorStop(0, 'rgba(8, 20, 38, 0.95)');
      topGrad.addColorStop(1, 'rgba(8, 20, 38, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, size, 240);

      const botGrad = ctx.createLinearGradient(0, size - 300, 0, size);
      botGrad.addColorStop(0, 'rgba(8, 20, 38, 0)');
      botGrad.addColorStop(0.3, 'rgba(8, 20, 38, 0.88)');
      botGrad.addColorStop(1, 'rgba(8, 20, 38, 0.98)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, size - 300, size, 300);

      // Cyan Border Accent
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, size - 40, size - 40);

      // Draw Logo
      if (logoImageObj) {
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 16;
        ctx.drawImage(logoImageObj, 50, 45, 160, 160);
        ctx.shadowBlur = 0;
      }

      // Cyan Pill
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.roundRect(size - 310, 55, 260, 54, 27);
      ctx.fill();
      ctx.fillStyle = '#081426';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🌊 ริมแม่น้ำปิง จ.ตาก`, size - 180, 90);

      // Bottom Texts
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(runnerName, 60, size - 150);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`🏃‍♂️ ${distance} FINISHER`, 60, size - 95);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(`BIB: ${bibNumber}`, size - 60, size - 150);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '22px sans-serif';
      ctx.fillText(dateStr, size - 60, size - 95);

    } else {
      // 🖤 Minimalist Brush Theme
      // Large faint watermark in background
      if (logoImageObj) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.drawImage(logoImageObj, size - 420, size - 420, 400, 400);
        ctx.restore();
      }

      // Top Left White Logo
      if (logoImageObj) {
        ctx.drawImage(logoImageObj, 45, 45, 140, 140);
      }

      // Clean Sleek Bottom Glass Card
      ctx.fillStyle = 'rgba(17, 24, 39, 0.85)';
      ctx.beginPath();
      ctx.roundRect(40, size - 160, size - 80, 110, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(runnerName, 70, size - 95);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FF5500';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(`${distance} • BIB: ${bibNumber}`, size - 70, size - 95);
    }
  };

  // Upload Photo Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dragging / Panning handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Save / Download 1080x1080 Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || isDownloading) return;

    try {
      setIsDownloading(true);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `tak-city-run-${bibNumber || 'photo'}-${Date.now()}.png`;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
      alert('ไม่สามารถดาวน์โหลดได้ กรุณาใช้วิธีกดค้างที่รูปภาพแล้วเลือก "บันทึกรูปภาพ"');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '960px', width: '95%', padding: '24px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag gold" style={{ margin: 0, padding: '3px 10px', fontSize: '0.78rem' }}>
                <Camera size={13} /> Photo Booth & Finisher Stamp
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', color: '#FFF', marginTop: '6px' }}>
              📸 ทำกรอบรูปนักวิ่ง TAK City Run
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              แต่งรูปถ่ายของคุณพร้อมตราประทับ Logo งานวิ่งอย่างเป็นทางการ และดาวน์โหลดแชร์ลง Social Media ได้ทันที!
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 460px) 1fr',
          gap: '24px',
          alignItems: 'start'
        }} className="photobooth-grid">
          
          {/* Left Column: Interactive Canvas Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{
                width: '100%',
                maxWidth: '420px',
                aspectRatio: '1 / 1',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 85, 0, 0.2)',
                position: 'relative',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                background: '#0B0F19'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              title="ลากเพื่อเลื่อนตำแหน่งรูปภาพ"
            >
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />

              {/* Drag indicator overlay hint */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                pointerEvents: 'none'
              }}>
                <Move size={12} /> ลากเลื่อนรูปได้
              </div>
            </div>

            {/* Quick Canvas Controls: Zoom & Rotate */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '12px',
              width: '100%',
              maxWidth: '420px'
            }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
                title="ซูมออก"
              >
                <ZoomOut size={16} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ขนาด:</span>
                <input 
                  type="range" 
                  min="0.6" 
                  max="2.5" 
                  step="0.05"
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
                title="ซูมเข้า"
              >
                <ZoomIn size={16} />
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                title="หมุนรูปภาพ 90°"
              >
                <RotateCw size={16} /> หมุน
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 1. Upload Photo / Choose Sample */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} color="var(--primary)" /> 1. เลือกรูปภาพของคุณ
                </strong>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '6px 14px' }}
                >
                  <Camera size={14} /> อัปโหลดรูปภาพ / ถ่ายรูป
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>

              {/* Sample Photos Quick Bar */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>หรือใช้รูปตัวอย่าง:</span>
                {SAMPLE_PHOTOS.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setUserImageSrc(sp.url)}
                    style={{
                      border: userImageSrc === sp.url ? '2px solid var(--primary)' : '1px solid var(--dark-border)',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: userImageSrc === sp.url ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Choose Frame Theme */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Layers size={16} color="var(--cyan)" /> 2. ลวดลายกรอบรูป (Frame Themes)
              </strong>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {FRAME_THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: isSelected ? `2px solid ${theme.accentColor}` : '1px solid var(--dark-border)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isSelected ? `0 0 12px ${theme.accentColor}33` : 'none'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: theme.accentColor }}>
                        {theme.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {theme.tag}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: theme.accentColor,
                          color: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 900
                        }}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Runner Info Inputs */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Sparkles size={16} color="#F59E0B" /> 3. ข้อมูลที่พิมพ์ลงบนรูปภาพ
              </strong>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>ชื่อนักวิ่ง</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={runnerName}
                    onChange={(e) => setRunnerName(e.target.value)}
                    placeholder="เช่น สมชาย วิ่งไว"
                    style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>หมายเลข BIB</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={bibNumber}
                    onChange={(e) => setBibNumber(e.target.value)}
                    placeholder="เช่น TAK-0128"
                    style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>ระยะทางที่วิ่ง</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="เช่น 5.8 KM City Run หรือ 10 KM"
                    style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Download Button */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1, padding: '14px 20px', fontSize: '1rem', fontWeight: 800 }}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  '⏳ กำลังสร้างรูปภาพความคมชัดสูง...'
                ) : downloadSuccess ? (
                  <>
                    <Check size={20} /> บันทึกรูปภาพเรียบร้อยแล้ว!
                  </>
                ) : (
                  <>
                    <Download size={20} /> 💾 บันทึกรูปภาพ HD (1080x1080)
                  </>
                )}
              </button>

              <button className="btn btn-secondary" onClick={onClose}>
                ปิด
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'center', margin: 0 }}>
              💡 รูปภาพจะถูกบันทึกในขนาดสี่เหลี่ยมจัตุรัสความละเอียดสูง 1080x1080 px เหมาะสำหรับโพสต์ลง Instagram, Facebook, หรือสตอรี่ได้ทันที!
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
