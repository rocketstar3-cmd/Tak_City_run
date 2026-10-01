import { createClient } from '@supabase/supabase-js';
import {
  initialClubSettings,
  initialEvents,
  initialRegistrations,
  initialShopsAndActivities,
  initialSponsors,
  initialPastGalleries
} from './initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Storage Keys for offline / demo mode
const LS_KEYS = {
  SETTINGS: 'tak_city_run_settings',
  EVENTS: 'tak_city_run_events',
  REGISTRATIONS: 'tak_city_run_registrations',
  SHOPS: 'tak_city_run_shops',
  SPONSORS: 'tak_city_run_sponsors',
  GALLERY: 'tak_city_run_gallery',
  ADMIN_SESSION: 'tak_city_run_admin_auth'
};

// Helper to initialize local storage with mock data if empty
function getLocalItem(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(saved);
  } catch (e) {
    console.warn('LocalStorage error:', e);
    return fallback;
  }
}

function setLocalItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ==========================================
// UNIFIED DATA SERVICE (Supabase + LocalStorage Fallback)
// ==========================================

export const DataService = {
  // 1. Club Settings
  async getSettings() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('club_settings').select('*').single();
      if (!error && data) return data;
    }
    return getLocalItem(LS_KEYS.SETTINGS, initialClubSettings);
  },

  async updateSettings(newSettings) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('club_settings').upsert({ id: 1, ...newSettings }).select();
      if (!error) return data;
    }
    const current = getLocalItem(LS_KEYS.SETTINGS, initialClubSettings);
    const updated = { ...current, ...newSettings };
    setLocalItem(LS_KEYS.SETTINGS, updated);
    return updated;
  },

  // 2. Events
  async getEvents() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('events').select('*, event_distances(*)').order('ep_number', { ascending: false });
      if (!error && data?.length) return data;
    }
    return getLocalItem(LS_KEYS.EVENTS, initialEvents);
  },

  async getActiveEvent() {
    const events = await this.getEvents();
    return events.find(e => e.isActive) || events[0];
  },

  async createEvent(eventData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('events').insert([eventData]).select();
      if (!error) return data[0];
    }
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const newEvent = {
      ...eventData,
      id: `ep-${Date.now()}`,
      epNumber: events.length + 1,
      status: 'open',
      isActive: false
    };
    const updated = [newEvent, ...events];
    setLocalItem(LS_KEYS.EVENTS, updated);
    return newEvent;
  },

  async updateEvent(id, eventData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('events').update(eventData).eq('id', id).select();
      if (!error) return data[0];
    }
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const updated = events.map(e => e.id === id ? { ...e, ...eventData } : e);
    setLocalItem(LS_KEYS.EVENTS, updated);
    return updated.find(e => e.id === id);
  },

  async setActiveEvent(eventId) {
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const updated = events.map(e => ({
      ...e,
      isActive: e.id === eventId
    }));
    setLocalItem(LS_KEYS.EVENTS, updated);
    return updated;
  },

  // 3. Registrations
  async getRegistrations(eventId = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (eventId) query = query.eq('event_id', eventId);
      const { data, error } = await query;
      if (!error && data) return data;
    }
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    if (eventId) return regs.filter(r => r.eventId === eventId);
    return regs;
  },

  async registerRunner(runnerData) {
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    
    // Check if phone already registered for this event
    const existing = regs.find(r => r.eventId === runnerData.eventId && r.phone === runnerData.phone.replace(/[^0-9]/g, ''));
    if (existing) {
      return { success: false, error: 'เบอร์โทรศัพท์นี้ได้ลงทะเบียนใน EP นี้แล้ว สามารถค้นหาบัตร E-BIB ได้ที่เมนู "ค้นหาบัตร BIB"', data: existing };
    }

    // Auto-generate BIB Number: e.g. TK02-004
    const eventRegs = regs.filter(r => r.eventId === runnerData.eventId);
    const nextBibSeq = (eventRegs.length + 1).toString().padStart(3, '0');
    const epNum = runnerData.epNumber || '02';
    const bibNumber = `TK${String(epNum).padStart(2, '0')}-${nextBibSeq}`;

    const newRegistration = {
      id: `reg-${Date.now()}`,
      bibNumber,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString(),
      ...runnerData
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('registrations').insert([newRegistration]).select();
      if (!error) return { success: true, data: data[0] };
    }

    const updated = [newRegistration, ...regs];
    setLocalItem(LS_KEYS.REGISTRATIONS, updated);
    return { success: true, data: newRegistration };
  },

  async toggleCheckIn(registrationId) {
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    const updated = regs.map(r => {
      if (r.id === registrationId || r.bibNumber === registrationId) {
        const nextState = !r.checkedIn;
        return {
          ...r,
          checkedIn: nextState,
          checkedInAt: nextState ? new Date().toISOString() : null
        };
      }
      return r;
    });
    setLocalItem(LS_KEYS.REGISTRATIONS, updated);
    return updated.find(r => r.id === registrationId || r.bibNumber === registrationId);
  },

  async searchRunner(query) {
    const q = query.trim().toLowerCase();
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    return regs.filter(r => 
      (r.phone && r.phone.includes(q)) || 
      (r.bibNumber && r.bibNumber.toLowerCase().includes(q)) ||
      (r.fullName && r.fullName.toLowerCase().includes(q)) ||
      (r.nickname && r.nickname.toLowerCase().includes(q))
    );
  },

  // 4. Shops and Activities
  async getShopsAndActivities(eventId = null) {
    const list = getLocalItem(LS_KEYS.SHOPS, initialShopsAndActivities);
    if (eventId) return list.filter(item => !item.eventId || item.eventId === eventId);
    return list;
  },

  async addShopOrActivity(item) {
    const list = getLocalItem(LS_KEYS.SHOPS, initialShopsAndActivities);
    const newItem = { id: `item-${Date.now()}`, ...item };
    const updated = [...list, newItem];
    setLocalItem(LS_KEYS.SHOPS, updated);
    return newItem;
  },

  async deleteShopOrActivity(id) {
    const list = getLocalItem(LS_KEYS.SHOPS, initialShopsAndActivities);
    const updated = list.filter(item => item.id !== id);
    setLocalItem(LS_KEYS.SHOPS, updated);
    return true;
  },

  // 5. Sponsors
  async getSponsors() {
    return getLocalItem(LS_KEYS.SPONSORS, initialSponsors);
  },

  async addSponsor(sponsor) {
    const list = getLocalItem(LS_KEYS.SPONSORS, initialSponsors);
    const newItem = { id: `sp-${Date.now()}`, ...sponsor };
    const updated = [...list, newItem];
    setLocalItem(LS_KEYS.SPONSORS, updated);
    return newItem;
  },

  async deleteSponsor(id) {
    const list = getLocalItem(LS_KEYS.SPONSORS, initialSponsors);
    const updated = list.filter(s => s.id !== id);
    setLocalItem(LS_KEYS.SPONSORS, updated);
    return true;
  },

  // 6. Past Galleries
  async getPastGalleries() {
    return getLocalItem(LS_KEYS.GALLERY, initialPastGalleries);
  },

  async addGalleryItem(item) {
    const list = getLocalItem(LS_KEYS.GALLERY, initialPastGalleries);
    const newItem = { id: `gal-${Date.now()}`, ...item };
    const updated = [newItem, ...list];
    setLocalItem(LS_KEYS.GALLERY, updated);
    return newItem;
  },

  // 7. Admin Auth
  async checkAdminAuth() {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return { isAuthenticated: true, user: session.user };
    }
    const localAuth = localStorage.getItem(LS_KEYS.ADMIN_SESSION);
    if (localAuth === 'true') {
      return { isAuthenticated: true, user: { email: 'admin@takcityrun.org' } };
    }
    return { isAuthenticated: false };
  },

  async loginAdmin(credentials) {
    if (isSupabaseConfigured && credentials.email && credentials.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      if (!error && data?.session) {
        localStorage.setItem(LS_KEYS.ADMIN_SESSION, 'true');
        return { success: true, user: data.user };
      }
    }

    // PIN Login fallback (PIN 1234 or configured adminPin)
    const settings = await this.getSettings();
    if (credentials.pin === (settings.adminPin || '1234') || credentials.password === 'takcityrun') {
      localStorage.setItem(LS_KEYS.ADMIN_SESSION, 'true');
      return { success: true, user: { email: 'admin@takcityrun.club' } };
    }

    return { success: false, error: 'รหัสผ่านหรือ PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ 1234)' };
  },

  async logoutAdmin() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LS_KEYS.ADMIN_SESSION);
    return true;
  }
};
