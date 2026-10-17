import React, { useState, useEffect } from 'react';
import { DataService, supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EventDetails } from './components/EventDetails';
import { MarketAndActivities } from './components/MarketAndActivities';
import { PastEventsArchive } from './components/PastEventsArchive';
import { SponsorsSection } from './components/SponsorsSection';
import { RegistrationModal } from './components/RegistrationModal';
import { EBibModal } from './components/EBibModal';
import { CheckBibModal } from './components/CheckBibModal';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';

// Lazy load Top40AnnouncementModal to keep initial JS bundle super lightweight & fast
const Top40AnnouncementModal = React.lazy(() =>
  import('./components/Top40AnnouncementModal').then(m => ({ default: m.Top40AnnouncementModal }))
);

export default function App() {
  // Synchronous cache-first state initialization (loads in 0ms with zero black screen wait!)
  const [clubSettings, setClubSettings] = useState(() => DataService.getLocalSettings());
  const [events, setEvents] = useState(() => DataService.getLocalEvents());
  const [activeEvent, setActiveEvent] = useState(() => {
    const evs = DataService.getLocalEvents();
    return evs.find(e => e.isActive) || evs[0] || null;
  });
  const [registrationsCount, setRegistrationsCount] = useState(() => {
    const evs = DataService.getLocalEvents();
    const act = evs.find(e => e.isActive) || evs[0];
    return DataService.getLocalRegistrations(act?.id).length;
  });
  const [allRegistrations, setAllRegistrations] = useState(() => {
    const evs = DataService.getLocalEvents();
    const act = evs.find(e => e.isActive) || evs[0];
    return DataService.getLocalRegistrations(act?.id);
  });
  const [shopsAndActivities, setShopsAndActivities] = useState(() => DataService.getLocalShops());
  const [sponsors, setSponsors] = useState(() => DataService.getLocalSponsors());
  const [pastGalleries, setPastGalleries] = useState(() => DataService.getLocalGalleries());
  
  // No blocking loading screen — website opens instantly!
  const [loading, setLoading] = useState(false);

  // Modals & Navigation Views
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCheckBibOpen, setIsCheckBibOpen] = useState(false);
  const [isTop40Open, setIsTop40Open] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    loadAllData();

    // Check if opened with #admin or ?admin in URL
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || search.includes('admin=1') || search.includes('admin=true')) {
        setIsAdminView(true);
      }
    };
    checkAdminRoute();

    window.addEventListener('hashchange', checkAdminRoute);

    // Keyboard shortcut for admins: Ctrl + Shift + A or Alt + A
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setIsAdminView(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Realtime subscription to registrations table to keep registrationsCount live
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !activeEvent?.id) return;

    const channel = supabase
      .channel('app_registrations_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        async () => {
          const regs = await DataService.getRegistrations(activeEvent.id);
          setRegistrationsCount(regs.length);
          setAllRegistrations(regs);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeEvent?.id]);

  // Non-blocking background sync with Supabase
  const loadAllData = async () => {
    try {
      const [settingsData, eventsData, sponsorsData, shopsData, galleryData] = await Promise.all([
        DataService.getSettings(),
        DataService.getEvents(),
        DataService.getSponsors(),
        DataService.getShopsAndActivities(),
        DataService.getPastGalleries()
      ]);

      if (settingsData) setClubSettings(settingsData);
      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData);
        const currentActive = eventsData.find(e => e.isActive) || eventsData[0];
        if (currentActive) {
          setActiveEvent(currentActive);
        }
      }

      if (sponsorsData) setSponsors(sponsorsData);
      if (shopsData) setShopsAndActivities(shopsData);
      if (galleryData) setPastGalleries(galleryData);

      // Apply dynamic theme color from settings if specified
      if (settingsData?.themeColor) {
        document.documentElement.style.setProperty('--primary', settingsData.themeColor);
        if (settingsData.themeColor === '#00E676') {
          document.documentElement.style.setProperty('--primary-glow', 'rgba(0, 230, 118, 0.35)');
          document.documentElement.style.setProperty('--primary-hover', '#00FF88');
        }
      }

      // Sync latest registration count in background without blocking
      const curEv = eventsData?.find(e => e.isActive) || eventsData?.[0] || activeEvent;
      if (curEv?.id) {
        DataService.getRegistrations(curEv.id).then(regs => {
          if (Array.isArray(regs)) {
            setRegistrationsCount(regs.length);
            setAllRegistrations(regs);
          }
        }).catch(err => console.warn('Background reg fetch error:', err));
      }
    } catch (err) {
      console.warn('Background data sync error:', err);
    }
  };

  const handleRegistrationSuccess = (newReg) => {
    setIsRegisterOpen(false);
    setSelectedRegistration(newReg);
    setRegistrationsCount(prev => prev + 1);
  };

  const handleExitAdmin = () => {
    setIsAdminView(false);
    if (window.location.hash.toLowerCase() === '#admin') {
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  };

  if (loading && !clubSettings && !activeEvent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/tak-logo-white.png" 
            alt="TAK City Run" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              animation: 'pulse 1.5s infinite',
              filter: 'drop-shadow(0 0 16px rgba(255, 85, 0, 0.6))'
            }} 
          />
          <div style={{ marginTop: '16px', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFF', fontWeight: 800, letterSpacing: '0.04em' }}>
            TAK CITY RUN
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            กำลังโหลดข้อมูลงานวิ่ง...
          </div>
        </div>
      </div>
    );
  }

  const pastEvents = events.filter(e => e.status === 'completed' || (!e.isActive && e.id !== activeEvent?.id));

  return (
    <div className="app-root">
      {/* Top Navigation */}
      <Navbar 
        clubSettings={clubSettings}
        activeEvent={activeEvent}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenCheckBib={() => setIsCheckBibOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        isAdminActive={isAdminView}
        onExitAdmin={handleExitAdmin}
      />

      {/* Main Content Area */}
      {isAdminView ? (
        <AdminPortal 
          clubSettings={clubSettings}
          events={events}
          activeEvent={activeEvent}
          onSettingsUpdate={(newSettings) => {
            setClubSettings(newSettings);
            if (newSettings.themeColor) {
              document.documentElement.style.setProperty('--primary', newSettings.themeColor);
            }
          }}
          onEventsUpdate={(newEvents) => {
            const fresh = newEvents.map(e => ({ ...e }));
            setEvents(fresh);
            const active = fresh.find(e => e.isActive) || fresh[0];
            setActiveEvent(active ? { ...active } : null);
          }}
          onExitAdmin={handleExitAdmin}
        />
      ) : (
        <main>
          {/* Hero Section */}
          <Hero 
            activeEvent={activeEvent}
            clubSettings={clubSettings}
            registrationsCount={registrationsCount}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenCheckBib={() => setIsCheckBibOpen(true)}
            onOpenTop40Modal={async () => {
              if (activeEvent?.id) {
                const regs = await DataService.getRegistrations(activeEvent.id);
                setAllRegistrations(regs);
              }
              setIsTop40Open(true);
            }}
          />

          {/* Event Details: Distances, Routes, Schedule */}
          <EventDetails 
            activeEvent={activeEvent}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />

          {/* Local Market & Side Activities */}
          <MarketAndActivities items={shopsAndActivities} />

          {/* Past Episodes & Gallery */}
          <PastEventsArchive 
            pastEvents={pastEvents}
            galleries={pastGalleries}
          />

          {/* Sponsors Showcase */}
          <SponsorsSection sponsors={sponsors} />
        </main>
      )}

      {/* Footer */}
      <Footer 
        clubSettings={clubSettings}
        onOpenAdmin={() => setIsAdminView(true)}
      />

      {/* Sticky Mobile Registration Bar for Instant Thumb-Access */}
      {!isAdminView && activeEvent?.status === 'open' && !isRegisterOpen && !isCheckBibOpen && !selectedRegistration && (
        <div className="mobile-sticky-register-bar">
          <div className="sticky-bar-info">
            <span className="sticky-ep-badge">EP.{String(activeEvent.epNumber).padStart(2, '0')}</span>
            <span className="sticky-distance-text">{activeEvent.distanceKm || 5.8} KM (ฟรี)</span>
          </div>
          <button 
            className="btn btn-primary btn-sm sticky-register-btn"
            onClick={() => setIsRegisterOpen(true)}
          >
            🏃 ลงทะเบียนด่วน ➔
          </button>
        </div>
      )}

      {/* MODALS */}
      {isRegisterOpen && (
        <RegistrationModal 
          activeEvent={activeEvent}
          onClose={() => setIsRegisterOpen(false)}
          onSuccessRegistration={handleRegistrationSuccess}
        />
      )}

      {isCheckBibOpen && (
        <CheckBibModal 
          activeEvent={activeEvent}
          clubSettings={clubSettings}
          onClose={() => setIsCheckBibOpen(false)}
          onSelectRegistration={(reg) => {
            setIsCheckBibOpen(false);
            setSelectedRegistration(reg);
          }}
        />
      )}

      {selectedRegistration && (
        <EBibModal 
          registration={selectedRegistration}
          activeEvent={activeEvent}
          clubSettings={clubSettings}
          onClose={() => setSelectedRegistration(null)}
        />
      )}

      {/* Public Top 40 Announcement Poster Modal */}
      {isTop40Open && (
        <React.Suspense fallback={null}>
          <Top40AnnouncementModal
            isOpen={isTop40Open}
            onClose={() => setIsTop40Open(false)}
            events={events}
            activeEvent={activeEvent}
            registrations={allRegistrations}
            clubSettings={clubSettings}
            isAdmin={false}
          />
        </React.Suspense>
      )}
    </div>
  );
}
