import React, { useState, useEffect } from 'react';
import { DataService } from './lib/supabase';
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

export default function App() {
  const [loading, setLoading] = useState(true);
  const [clubSettings, setClubSettings] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [shopsAndActivities, setShopsAndActivities] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [pastGalleries, setPastGalleries] = useState([]);

  // Modals & Navigation Views
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCheckBibOpen, setIsCheckBibOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [settingsData, eventsData, sponsorsData, shopsData, galleryData] = await Promise.all([
        DataService.getSettings(),
        DataService.getEvents(),
        DataService.getSponsors(),
        DataService.getShopsAndActivities(),
        DataService.getPastGalleries()
      ]);

      setClubSettings(settingsData);
      setEvents(eventsData);

      // Set active event
      const currentActive = eventsData.find(e => e.isActive) || eventsData[0];
      setActiveEvent(currentActive);

      setSponsors(sponsorsData);
      setShopsAndActivities(shopsData);
      setPastGalleries(galleryData);

      // Load registrations count
      if (currentActive) {
        const regs = await DataService.getRegistrations(currentActive.id);
        setRegistrationsCount(regs.length);
      }

      // Apply dynamic theme color from settings if specified
      if (settingsData?.themeColor) {
        document.documentElement.style.setProperty('--primary', settingsData.themeColor);
      }
    } catch (err) {
      console.error('Failed to load site data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = (newReg) => {
    setIsRegisterOpen(false);
    setSelectedRegistration(newReg);
    setRegistrationsCount(prev => prev + 1);
  };

  if (loading) {
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
        onExitAdmin={() => setIsAdminView(false)}
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
          onExitAdmin={() => setIsAdminView(false)}
        />
      ) : (
        <main>
          {/* Hero Section */}
          <Hero 
            activeEvent={activeEvent}
            registrationsCount={registrationsCount}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenCheckBib={() => setIsCheckBibOpen(true)}
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
    </div>
  );
}
