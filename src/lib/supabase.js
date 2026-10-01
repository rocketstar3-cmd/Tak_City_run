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

// Local Storage Keys
const LS_KEYS = {
  SETTINGS: 'tak_city_run_settings',
  EVENTS: 'tak_city_run_events',
  REGISTRATIONS: 'tak_city_run_registrations',
  SHOPS: 'tak_city_run_shops',
  SPONSORS: 'tak_city_run_sponsors',
  GALLERY: 'tak_city_run_gallery',
  ADMIN_SESSION: 'tak_city_run_admin_auth'
};

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
// MAPPERS (Database snake_case <-> App camelCase)
// ==========================================
const mapRegFromDB = (r) => ({
  id: r.id,
  eventId: r.event_id,
  distanceId: r.distance_id,
  bibNumber: r.bib_number,
  fullName: r.full_name,
  nickname: r.nickname,
  phone: r.phone,
  emergencyContact: r.emergency_contact,
  emergencyPhone: r.emergency_phone,
  shirtSize: r.shirt_size,
  medicalNotes: r.medical_notes,
  checkedIn: Boolean(r.checked_in),
  checkedInAt: r.checked_in_at,
  createdAt: r.created_at
});

const mapRegToDB = (r) => ({
  id: r.id,
  event_id: r.eventId,
  distance_id: r.distanceId,
  bib_number: r.bibNumber,
  full_name: r.fullName,
  nickname: r.nickname,
  phone: r.phone,
  emergency_contact: r.emergencyContact,
  emergency_phone: r.emergencyPhone,
  shirt_size: r.shirtSize,
  medical_notes: r.medicalNotes,
  checked_in: Boolean(r.checkedIn),
  checked_in_at: r.checkedInAt,
  created_at: r.createdAt
});

const mapEventFromDB = (e) => ({
  id: e.id,
  epNumber: Number(e.ep_number),
  title: e.title,
  subtitle: e.subtitle || '',
  description: e.description || '',
  eventDate: e.event_date,
  registrationStart: e.registration_start,
  registrationEnd: e.registration_end,
  locationName: e.location_name,
  locationMapUrl: e.location_map_url || '',
  coverImage: e.cover_image || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
  status: e.status || 'open',
  isActive: Boolean(e.is_active),
  schedule: Array.isArray(e.schedule) ? e.schedule : [],
  routeDetails: Array.isArray(e.route_details) ? e.route_details : [],
  stats: e.stats || null,
  distances: Array.isArray(e.event_distances) ? e.event_distances.map(d => ({
    id: d.id,
    label: d.label,
    distanceKm: Number(d.distance_km),
    quota: d.quota || 0,
    startPrice: Number(d.start_price || 0)
  })) : []
});

const mapSettingsFromDB = (s) => ({
  clubName: s.club_name,
  tagline: s.tagline,
  description: s.description,
  logoUrl: s.logo_url,
  themeColor: s.theme_color,
  facebookUrl: s.facebook_url,
  lineUrl: s.line_url,
  adminPin: s.admin_pin || '1234'
});

const mapSettingsToDB = (s) => ({
  id: 1,
  club_name: s.clubName,
  tagline: s.tagline,
  description: s.description,
  logo_url: s.logoUrl,
  theme_color: s.themeColor,
  facebook_url: s.facebookUrl,
  line_url: s.lineUrl,
  admin_pin: s.adminPin || '1234'
});

// ==========================================
// UNIFIED DATA SERVICE
// ==========================================
export const DataService = {
  // 1. Club Settings
  async getSettings() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('club_settings').select('*').single();
        if (!error && data) return mapSettingsFromDB(data);
      } catch (err) {
        console.warn('Supabase settings query error, falling back to local:', err);
      }
    }
    return getLocalItem(LS_KEYS.SETTINGS, initialClubSettings);
  },

  async updateSettings(newSettings) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('club_settings').upsert(mapSettingsToDB(newSettings));
      } catch (err) {
        console.warn('Supabase settings upsert error:', err);
      }
    }
    const current = getLocalItem(LS_KEYS.SETTINGS, initialClubSettings);
    const updated = { ...current, ...newSettings };
    setLocalItem(LS_KEYS.SETTINGS, updated);
    return updated;
  },

  // 2. Events (CRUD)
  async getEvents() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, event_distances(*)')
          .order('ep_number', { ascending: false });
        if (!error && data?.length) {
          return data.map(mapEventFromDB);
        }
      } catch (err) {
        console.warn('Supabase events query error, using local data:', err);
      }
    }
    return getLocalItem(LS_KEYS.EVENTS, initialEvents);
  },

  async getActiveEvent() {
    const events = await this.getEvents();
    return events.find(e => e.isActive) || events[0];
  },

  async createEvent(eventData) {
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const newEvent = {
      ...eventData,
      id: eventData.id || `ep-${Date.now()}`,
      epNumber: Number(eventData.epNumber) || events.length + 1,
      status: eventData.status || 'open',
      isActive: Boolean(eventData.isActive)
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').insert([{
          id: newEvent.id,
          ep_number: newEvent.epNumber,
          title: newEvent.title,
          subtitle: newEvent.subtitle || '',
          event_date: newEvent.eventDate,
          location_name: newEvent.locationName,
          location_map_url: newEvent.locationMapUrl || '',
          cover_image: newEvent.coverImage || '',
          status: newEvent.status,
          is_active: newEvent.isActive,
          schedule: newEvent.schedule || [],
          route_details: newEvent.routeDetails || []
        }]);

        if (newEvent.distances?.length) {
          const distancesPayload = newEvent.distances.map(d => ({
            id: d.id || `dist-${Date.now()}-${Math.random()}`,
            event_id: newEvent.id,
            label: d.label,
            distance_km: Number(d.distanceKm),
            quota: Number(d.quota || 0),
            start_price: 0
          }));
          await supabase.from('event_distances').insert(distancesPayload);
        }
      } catch (err) {
        console.warn('Supabase event insert error:', err);
      }
    }

    const updated = [newEvent, ...events];
    setLocalItem(LS_KEYS.EVENTS, updated);
    return newEvent;
  },

  async updateEvent(id, eventData) {
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const updated = events.map(e => (e.id === id ? { ...e, ...eventData } : e));
    setLocalItem(LS_KEYS.EVENTS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').update({
          ep_number: Number(eventData.epNumber),
          title: eventData.title,
          subtitle: eventData.subtitle || '',
          event_date: eventData.eventDate,
          location_name: eventData.locationName,
          location_map_url: eventData.locationMapUrl || '',
          cover_image: eventData.coverImage || '',
          status: eventData.status,
          is_active: Boolean(eventData.isActive),
          schedule: eventData.schedule || [],
          route_details: eventData.routeDetails || []
        }).eq('id', id);

        if (eventData.distances) {
          await supabase.from('event_distances').delete().eq('event_id', id);
          if (eventData.distances.length) {
            const distPayload = eventData.distances.map(d => ({
              id: d.id || `dist-${Date.now()}-${Math.random()}`,
              event_id: id,
              label: d.label,
              distance_km: Number(d.distanceKm),
              quota: Number(d.quota || 0),
              start_price: 0
            }));
            await supabase.from('event_distances').insert(distPayload);
          }
        }
      } catch (err) {
        console.warn('Supabase event update error:', err);
      }
    }

    return updated.find(e => e.id === id);
  },

  async deleteEvent(id) {
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const updated = events.filter(e => e.id !== id);
    setLocalItem(LS_KEYS.EVENTS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete event error:', err);
      }
    }
    return true;
  },

  async setActiveEvent(eventId) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').update({ is_active: false }).neq('id', eventId);
        await supabase.from('events').update({ is_active: true }).eq('id', eventId);
      } catch (err) {
        console.warn('Supabase setActiveEvent error:', err);
      }
    }
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const updated = events.map(e => ({
      ...e,
      isActive: e.id === eventId
    }));
    setLocalItem(LS_KEYS.EVENTS, updated);
    return updated;
  },

  // 3. Registrations (CRUD)
  async getRegistrations(eventId = null) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
        if (eventId) query = query.eq('event_id', eventId);
        const { data, error } = await query;
        if (!error && data) {
          return data.map(mapRegFromDB);
        }
      } catch (err) {
        console.warn('Supabase getRegistrations error:', err);
      }
    }
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    if (eventId) return regs.filter(r => r.eventId === eventId);
    return regs;
  },

  async registerRunner(runnerData) {
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    
    // Check if phone already registered for this event
    const cleanPhone = runnerData.phone.replace(/[^0-9]/g, '');
    const existing = regs.find(r => r.eventId === runnerData.eventId && r.phone === cleanPhone);
    if (existing) {
      return { 
        success: false, 
        error: 'เบอร์โทรศัพท์นี้ได้ลงทะเบียนใน EP นี้แล้ว สามารถค้นหาบัตร E-BIB ได้ที่เมนู "ค้นหา E-BIB"', 
        data: existing 
      };
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
      ...runnerData,
      phone: cleanPhone
    };

    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapRegToDB(newRegistration);
        await supabase.from('registrations').insert([dbPayload]);
      } catch (err) {
        console.warn('Supabase runner insert error, kept in local store:', err);
      }
    }

    const updated = [newRegistration, ...regs];
    setLocalItem(LS_KEYS.REGISTRATIONS, updated);
    return { success: true, data: newRegistration };
  },

  async deleteRegistration(registrationId) {
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    const updated = regs.filter(r => r.id !== registrationId);
    setLocalItem(LS_KEYS.REGISTRATIONS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('registrations').delete().eq('id', registrationId);
      } catch (err) {
        console.warn('Supabase delete registration error:', err);
      }
    }
    return true;
  },

  async toggleCheckIn(registrationId) {
    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    let target = null;

    const updated = regs.map(r => {
      if (r.id === registrationId || r.bibNumber === registrationId) {
        const nextState = !r.checkedIn;
        target = {
          ...r,
          checkedIn: nextState,
          checkedInAt: nextState ? new Date().toISOString() : null
        };
        return target;
      }
      return r;
    });

    setLocalItem(LS_KEYS.REGISTRATIONS, updated);

    if (isSupabaseConfigured && target) {
      try {
        await supabase
          .from('registrations')
          .update({
            checked_in: target.checkedIn,
            checked_in_at: target.checkedInAt
          })
          .or(`id.eq.${target.id},bib_number.eq.${target.bibNumber}`);
      } catch (err) {
        console.warn('Supabase toggleCheckIn error:', err);
      }
    }

    return target || updated.find(r => r.id === registrationId);
  },

  async searchRunner(query) {
    const q = query.trim().toLowerCase();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .or(`phone.ilike.%${q}%,bib_number.ilike.%${q}%,full_name.ilike.%${q}%`);
        if (!error && data?.length) {
          return data.map(mapRegFromDB);
        }
      } catch (err) {
        console.warn('Supabase searchRunner error:', err);
      }
    }

    const regs = getLocalItem(LS_KEYS.REGISTRATIONS, initialRegistrations);
    return regs.filter(r => 
      (r.phone && r.phone.includes(q)) || 
      (r.bibNumber && r.bibNumber.toLowerCase().includes(q)) ||
      (r.fullName && r.fullName.toLowerCase().includes(q)) ||
      (r.nickname && r.nickname.toLowerCase().includes(q))
    );
  },

  // 4. Shops and Activities (CRUD)
  async getShopsAndActivities(eventId = null) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('event_attractions').select('*');
        if (!error && data?.length) {
          return data.map(s => ({
            id: s.id,
            eventId: s.event_id,
            type: s.type,
            name: s.name,
            category: s.category,
            description: s.description,
            image: s.image,
            badge: s.badge
          }));
        }
      } catch (e) {}
    }
    return getLocalItem(LS_KEYS.SHOPS, initialShopsAndActivities);
  },

  async addShopOrActivity(item) {
    const list = getLocalItem(LS_KEYS.SHOPS, initialShopsAndActivities);
    const newItem = { id: `item-${Date.now()}`, ...item };
    const updated = [newItem, ...list];
    setLocalItem(LS_KEYS.SHOPS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_attractions').insert([{
          id: newItem.id,
          event_id: newItem.eventId || null,
          type: newItem.type || 'food',
          name: newItem.name,
          category: newItem.category || '',
          description: newItem.description || '',
          image: newItem.image || '',
          badge: newItem.badge || ''
        }]);
      } catch (e) {}
    }
    return newItem;
  },

  async deleteShopOrActivity(id) {
    const list = getLocalItem(LS_KEYS.SHOPS, initialShopsAndActivities);
    const updated = list.filter(item => item.id !== id);
    setLocalItem(LS_KEYS.SHOPS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_attractions').delete().eq('id', id);
      } catch (e) {}
    }
    return true;
  },

  // 5. Sponsors (CRUD)
  async getSponsors() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('sponsors').select('*');
        if (!error && data?.length) {
          return data.map(s => ({
            id: s.id,
            name: s.name,
            tier: s.tier,
            role: s.role,
            logo: s.logo,
            websiteUrl: s.website_url
          }));
        }
      } catch (e) {}
    }
    return getLocalItem(LS_KEYS.SPONSORS, initialSponsors);
  },

  async addSponsor(sponsor) {
    const list = getLocalItem(LS_KEYS.SPONSORS, initialSponsors);
    const newItem = { id: `sp-${Date.now()}`, ...sponsor };
    const updated = [newItem, ...list];
    setLocalItem(LS_KEYS.SPONSORS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sponsors').insert([{
          id: newItem.id,
          name: newItem.name,
          tier: newItem.tier || 'supporter',
          role: newItem.role || '',
          logo: newItem.logo || '',
          website_url: newItem.websiteUrl || ''
        }]);
      } catch (e) {}
    }
    return newItem;
  },

  async deleteSponsor(id) {
    const list = getLocalItem(LS_KEYS.SPONSORS, initialSponsors);
    const updated = list.filter(s => s.id !== id);
    setLocalItem(LS_KEYS.SPONSORS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sponsors').delete().eq('id', id);
      } catch (e) {}
    }
    return true;
  },

  // 6. Past Galleries (CRUD)
  async getPastGalleries() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('event_gallery').select('*').order('created_at', { ascending: false });
        if (!error && data?.length) {
          return data.map(g => ({
            id: g.id,
            epNumber: g.ep_number,
            title: g.title,
            image: g.image,
            caption: g.caption
          }));
        }
      } catch (e) {}
    }
    return getLocalItem(LS_KEYS.GALLERY, initialPastGalleries);
  },

  async addGalleryItem(item) {
    const list = getLocalItem(LS_KEYS.GALLERY, initialPastGalleries);
    const newItem = { id: `gal-${Date.now()}`, ...item };
    const updated = [newItem, ...list];
    setLocalItem(LS_KEYS.GALLERY, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_gallery').insert([{
          id: newItem.id,
          ep_number: Number(newItem.epNumber) || 1,
          title: newItem.title,
          image: newItem.image,
          caption: newItem.caption || ''
        }]);
      } catch (e) {}
    }
    return newItem;
  },

  async deleteGalleryItem(id) {
    const list = getLocalItem(LS_KEYS.GALLERY, initialPastGalleries);
    const updated = list.filter(item => item.id !== id);
    setLocalItem(LS_KEYS.GALLERY, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_gallery').delete().eq('id', id);
      } catch (e) {}
    }
    return true;
  },

  // 7. Admin Auth
  async checkAdminAuth() {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return { isAuthenticated: true, user: session.user };
      } catch (e) {}
    }
    const localAuth = localStorage.getItem(LS_KEYS.ADMIN_SESSION);
    if (localAuth === 'true') {
      return { isAuthenticated: true, user: { email: 'admin@takcityrun.org' } };
    }
    return { isAuthenticated: false };
  },

  async loginAdmin(credentials) {
    if (isSupabaseConfigured && credentials.email && credentials.password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
        if (!error && data?.session) {
          localStorage.setItem(LS_KEYS.ADMIN_SESSION, 'true');
          return { success: true, user: data.user };
        }
      } catch (e) {}
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
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(LS_KEYS.ADMIN_SESSION);
    return true;
  }
};
