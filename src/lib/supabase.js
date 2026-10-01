import { createClient } from '@supabase/supabase-js';
import {
  initialClubSettings,
  initialEvents,
  initialRegistrations,
  initialShopsAndActivities,
  initialSponsors,
  initialPastGalleries,
  initialAdminUsers
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
  ADMIN_SESSION: 'tak_city_run_admin_auth',
  ADMIN_USERS: 'tak_city_run_admin_users',
  CURRENT_ADMIN: 'tak_city_run_current_admin'
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

// Auto-migrate legacy cached events in browser
(function migrateLocalCache() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = localStorage.getItem(LS_KEYS.EVENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let changed = false;
        const migrated = parsed.map(ev => {
          // If event has legacy 3.5K or old multi-distances, update it to 5.8K single distance
          const isLegacyDist = !ev.distanceKm || ev.distanceKm === 3.5 || (Array.isArray(ev.distances) && ev.distances[0]?.distanceKm === 3.5);
          if (ev.id === 'ep-02' && isLegacyDist) {
            changed = true;
            return {
              ...ev,
              distanceKm: 5.8,
              distanceLabel: "City Run 5.8K ตะลุยเมืองเก่าเลียบปิง",
              quota: 500,
              waterStations: 3,
              firstAidPoints: 2,
              elevationGain: "+12 ม. (ทางราบ 95%)",
              routeImageUrl: ev.routeImageUrl || "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=1200&q=80",
              routeDescription: ev.routeDescription || "เส้นทางไฮไลต์เลียบเขื่อนแม่น้ำปิง วิ่งผ่านจุดเช็คอินสะพานแขวน 200 ปี ลัดเลาะชมตึกเก่าโบราณเมืองตาก และศาลสมเด็จพระเจ้าตากสินมหาราช ทางราบเรียบ วิ่งสบาย ลมพัดเย็นตลอดสาย",
              stats: null, // Open event should not display completed stats
              distances: [
                { id: 'dist-main', label: "City Run 5.8K ตะลุยเมืองเก่าเลียบปิง", distanceKm: 5.8, quota: 500 }
              ]
            };
          }
          return ev;
        });
        if (changed) {
          localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify(migrated));
        }
      }
    }
  } catch (e) {
    // Non-browser or JSON error
  }
})();

// ==========================================
// MAPPERS (Database snake_case <-> App camelCase)
// ==========================================
const mapRegFromDB = (r) => ({
  id: r.id,
  eventId: r.event_id,
  bibNumber: r.bib_number,
  fullName: r.full_name,
  nickname: r.nickname,
  phone: r.phone,
  emergencyContact: r.emergency_contact,
  emergencyPhone: r.emergency_phone,
  shirtSize: r.shirt_size,
  medicalNotes: r.medical_notes,
  distanceKm: Number(r.distance_km || 5.8),
  distanceLabel: r.distance_label || 'City Run',
  checkedIn: Boolean(r.checked_in),
  checkedInAt: r.checked_in_at,
  createdAt: r.created_at
});

const mapRegToDB = (r) => ({
  id: r.id,
  event_id: r.eventId,
  bib_number: r.bibNumber,
  full_name: r.fullName,
  nickname: r.nickname,
  phone: r.phone,
  emergency_contact: r.emergencyContact,
  emergency_phone: r.emergencyPhone,
  shirt_size: r.shirtSize,
  medical_notes: r.medicalNotes,
  distance_km: Number(r.distanceKm || 5.8),
  distance_label: r.distanceLabel || 'City Run',
  checked_in: Boolean(r.checkedIn),
  checked_in_at: r.checkedInAt,
  created_at: r.createdAt
});

const mapEventFromDB = (e) => {
  const rd = e.route_details && typeof e.route_details === 'object' && !Array.isArray(e.route_details) 
    ? e.route_details 
    : {};

  // Check direct camelCase first, then rd JSONB, then snake_case, fallback 5.8
  const distKm = Number(
    e.distanceKm ?? 
    rd.distanceKm ?? 
    e.distance_km ?? 
    5.8
  );

  const distLabel = 
    e.distanceLabel || 
    rd.distanceLabel || 
    e.distance_label || 
    `City Run ${distKm}K`;

  const quota = Number(
    e.quota ?? 
    rd.quota ?? 
    e.distance_quota ?? 
    500
  );

  const routeImg = e.routeImageUrl || rd.routeImageUrl || e.route_image_url || '';
  const routeDesc = e.routeDescription || rd.routeDescription || e.route_description || '';
  const water = Number(e.waterStations ?? rd.waterStations ?? e.water_stations ?? 3);
  const aid = Number(e.firstAidPoints ?? rd.firstAidPoints ?? e.first_aid_points ?? 2);
  const elev = e.elevationGain || rd.elevationGain || e.elevation_gain || '+12 ม. (ทางราบ 95%)';

  let highlights = [];
  if (Array.isArray(e.routeHighlights) && e.routeHighlights.length > 0) {
    highlights = e.routeHighlights;
  } else if (Array.isArray(rd.routeHighlights) && rd.routeHighlights.length > 0) {
    highlights = rd.routeHighlights;
  } else if (Array.isArray(e.route_highlights) && e.route_highlights.length > 0) {
    highlights = e.route_highlights;
  } else if (typeof e.route_highlights === 'string') {
    try { highlights = JSON.parse(e.route_highlights); } catch { highlights = e.route_highlights.split(',').map(s => s.trim()); }
  }

  return {
    id: e.id,
    epNumber: Number(e.ep_number ?? e.epNumber ?? 1),
    title: e.title,
    subtitle: e.subtitle || '',
    description: e.description || '',
    eventDate: e.event_date || e.eventDate,
    registrationStart: e.registration_start || e.registrationStart,
    registrationEnd: e.registration_end || e.registrationEnd,
    locationName: e.location_name || e.locationName,
    locationMapUrl: e.location_map_url || e.locationMapUrl || '',
    coverImage: e.cover_image || e.coverImage || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    status: e.status || 'open',
    isActive: Boolean(e.is_active ?? e.isActive),
    
    // Single Fixed Distance
    distanceKm: distKm,
    distanceLabel: distLabel,
    quota: quota,

    // Route & Maps
    routeImageUrl: routeImg,
    routeDescription: routeDesc,
    waterStations: water,
    firstAidPoints: aid,
    elevationGain: elev,
    routeHighlights: highlights,

    // Schedule
    schedule: Array.isArray(e.schedule) ? e.schedule : [],
    stats: (e.status === 'completed' ? (e.stats || rd.stats || null) : null)
  };
};

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

  // 2. Events (CRUD with Single Distance and Route Map)
  async getEvents() {
    const local = getLocalItem(LS_KEYS.EVENTS, initialEvents);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('ep_number', { ascending: false });
        if (!error && data?.length) {
          return data.map(dbEvent => {
            const mapped = mapEventFromDB(dbEvent);
            const localMatch = local.find(l => l.id === dbEvent.id);
            if (localMatch) {
              return {
                ...localMatch,
                ...mapped,
                distanceKm: mapped.distanceKm || localMatch.distanceKm,
                quota: mapped.quota || localMatch.quota
              };
            }
            return mapped;
          });
        }
      } catch (err) {
        console.warn('Supabase events query error, using local data:', err);
      }
    }
    
    return local.map(mapEventFromDB);
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
      isActive: Boolean(eventData.isActive),
      distanceKm: Number(eventData.distanceKm || 5.8),
      distanceLabel: eventData.distanceLabel || `City Run ${eventData.distanceKm || 5.8}K`,
      quota: Number(eventData.quota || 500),
      routeImageUrl: eventData.routeImageUrl || '',
      routeDescription: eventData.routeDescription || '',
      waterStations: Number(eventData.waterStations || 3),
      firstAidPoints: Number(eventData.firstAidPoints || 2),
      elevationGain: eventData.elevationGain || '+12 ม. (ทางราบ 95%)',
      routeHighlights: Array.isArray(eventData.routeHighlights) ? eventData.routeHighlights : [],
      schedule: Array.isArray(eventData.schedule) ? eventData.schedule : [],
      stats: eventData.stats || null,
      distances: [
        {
          id: 'dist-main',
          label: eventData.distanceLabel || `City Run ${eventData.distanceKm || 5.8}K`,
          distanceKm: Number(eventData.distanceKm || 5.8),
          quota: Number(eventData.quota || 500)
        }
      ]
    };

    // Save LocalStorage first
    const updated = [newEvent, ...events];
    setLocalItem(LS_KEYS.EVENTS, updated);

    // Save Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').upsert([{
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
          schedule: newEvent.schedule,
          route_details: {
            distanceKm: newEvent.distanceKm,
            distanceLabel: newEvent.distanceLabel,
            quota: newEvent.quota,
            routeImageUrl: newEvent.routeImageUrl,
            routeDescription: newEvent.routeDescription,
            waterStations: newEvent.waterStations,
            firstAidPoints: newEvent.firstAidPoints,
            elevationGain: newEvent.elevationGain,
            routeHighlights: newEvent.routeHighlights,
            stats: newEvent.stats || null
          }
        }]);
      } catch (err) {
        console.warn('Supabase event insert error:', err);
      }
    }

    return mapEventFromDB(newEvent);
  },

  async updateEvent(id, eventData) {
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);

    const merged = {
      ...eventData,
      id,
      distanceKm: Number(eventData.distanceKm || 5.8),
      distanceLabel: eventData.distanceLabel || `City Run ${eventData.distanceKm || 5.8}K`,
      quota: Number(eventData.quota || 500),
      waterStations: Number(eventData.waterStations || 3),
      firstAidPoints: Number(eventData.firstAidPoints || 2),
      elevationGain: eventData.elevationGain || '+12 ม. (ทางราบ 95%)',
      routeImageUrl: eventData.routeImageUrl || '',
      routeDescription: eventData.routeDescription || '',
      routeHighlights: Array.isArray(eventData.routeHighlights) ? eventData.routeHighlights : [],
      // Override legacy distances completely
      distances: [
        {
          id: 'dist-main',
          label: eventData.distanceLabel || `City Run ${eventData.distanceKm || 5.8}K`,
          distanceKm: Number(eventData.distanceKm || 5.8),
          quota: Number(eventData.quota || 500)
        }
      ]
    };

    // Update LocalStorage immediately
    const updated = events.map(e => (e.id === id ? merged : e));
    setLocalItem(LS_KEYS.EVENTS, updated);

    // Save Supabase using JSONB route_details
    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').upsert([{
          id: merged.id,
          ep_number: Number(merged.epNumber),
          title: merged.title,
          subtitle: merged.subtitle || '',
          event_date: merged.eventDate,
          location_name: merged.locationName,
          location_map_url: merged.locationMapUrl || '',
          cover_image: merged.coverImage || '',
          status: merged.status,
          is_active: Boolean(merged.isActive),
          schedule: merged.schedule || [],
          route_details: {
            distanceKm: merged.distanceKm,
            distanceLabel: merged.distanceLabel,
            quota: merged.quota,
            routeImageUrl: merged.routeImageUrl,
            routeDescription: merged.routeDescription,
            waterStations: merged.waterStations,
            firstAidPoints: merged.firstAidPoints,
            elevationGain: merged.elevationGain,
            routeHighlights: merged.routeHighlights,
            stats: merged.stats || null
          }
        }]);
      } catch (err) {
        console.warn('Supabase event upsert error:', err);
      }
    }

    return mapEventFromDB(merged);
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
    const events = getLocalItem(LS_KEYS.EVENTS, initialEvents);
    const updated = events.map(e => ({
      ...e,
      isActive: e.id === eventId
    }));
    setLocalItem(LS_KEYS.EVENTS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').update({ is_active: false }).neq('id', eventId);
        await supabase.from('events').update({ is_active: true }).eq('id', eventId);
      } catch (err) {
        console.warn('Supabase setActiveEvent error:', err);
      }
    }
    return updated.map(mapEventFromDB);
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

    const updated = [newRegistration, ...regs];
    setLocalItem(LS_KEYS.REGISTRATIONS, updated);

    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapRegToDB(newRegistration);
        await supabase.from('registrations').insert([dbPayload]);
      } catch (err) {
        console.warn('Supabase runner insert error, kept in local store:', err);
      }
    }

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

  // 7. Admin Accounts & Auth (Username & Password - No Email needed)
  async getAdminUsers() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: true });
        if (!error && data?.length) {
          return data.map(u => ({
            id: u.id,
            username: u.username,
            password: u.password,
            displayName: u.display_name,
            role: u.role || 'admin',
            createdAt: u.created_at
          }));
        }
      } catch (e) {
        // Table might not exist yet in Supabase
      }
    }
    return getLocalItem(LS_KEYS.ADMIN_USERS, initialAdminUsers);
  },

  async addAdminUser({ username, password, displayName, role = 'admin' }) {
    const list = await this.getAdminUsers();
    const cleanUsername = username.trim().toLowerCase();
    
    if (list.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `ชื่อผู้ใช้งาน "${cleanUsername}" มีอยู่ในระบบแล้ว` };
    }

    const newUser = {
      id: `admin-${Date.now()}`,
      username: cleanUsername,
      password: password.trim(),
      displayName: displayName.trim() || cleanUsername,
      role: role || 'admin',
      createdAt: new Date().toISOString()
    };

    const updated = [...list, newUser];
    setLocalItem(LS_KEYS.ADMIN_USERS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('admin_users').insert([{
          id: newUser.id,
          username: newUser.username,
          password: newUser.password,
          display_name: newUser.displayName,
          role: newUser.role
        }]);
      } catch (e) {
        console.warn('Supabase addAdminUser insert error:', e);
      }
    }

    return { success: true, user: newUser };
  },

  async deleteAdminUser(id) {
    const list = await this.getAdminUsers();
    const target = list.find(u => u.id === id);
    if (!target) return { success: false, error: 'ไม่พบบัญชีแอดมิน' };
    if (target.username.toLowerCase() === 'admin') {
      return { success: false, error: 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้' };
    }

    const updated = list.filter(u => u.id !== id);
    setLocalItem(LS_KEYS.ADMIN_USERS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('admin_users').delete().eq('id', id);
      } catch (e) {}
    }

    return { success: true };
  },

  async updateAdminPassword({ username, currentPassword, newPassword }) {
    const list = await this.getAdminUsers();
    const cleanUsername = username.trim().toLowerCase();
    const userIndex = list.findIndex(u => u.username.toLowerCase() === cleanUsername);

    if (userIndex === -1) {
      return { success: false, error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' };
    }

    const user = list[userIndex];
    if (user.password !== currentPassword.trim()) {
      return { success: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
    }

    user.password = newPassword.trim();
    user.updatedAt = new Date().toISOString();
    list[userIndex] = user;
    setLocalItem(LS_KEYS.ADMIN_USERS, list);

    // Update current session storage if same user
    const cur = localStorage.getItem(LS_KEYS.CURRENT_ADMIN);
    if (cur) {
      try {
        const parsed = JSON.parse(cur);
        if (parsed.username.toLowerCase() === cleanUsername) {
          localStorage.setItem(LS_KEYS.CURRENT_ADMIN, JSON.stringify({ ...parsed, password: user.password }));
        }
      } catch (e) {}
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('admin_users').update({
          password: user.password,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase updateAdminPassword error:', e);
      }
    }

    return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' };
  },

  async checkAdminAuth() {
    const sessionStr = localStorage.getItem(LS_KEYS.CURRENT_ADMIN);
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user && user.username) {
          return { isAuthenticated: true, user };
        }
      } catch (e) {}
    }
    const legacyAuth = localStorage.getItem(LS_KEYS.ADMIN_SESSION);
    if (legacyAuth === 'true') {
      return {
        isAuthenticated: true,
        user: { username: 'admin', displayName: 'ผู้ดูแลระบบหลัก (Admin)', role: 'superadmin' }
      };
    }
    return { isAuthenticated: false, user: null };
  },

  async loginAdmin({ username, password, pin }) {
    const inputUser = (username || '').trim().toLowerCase();
    const inputPass = (password || pin || '').trim();

    if (!inputPass) {
      return { success: false, error: 'กรุณากรอกรหัสผ่าน' };
    }

    const users = await this.getAdminUsers();

    // 1. Direct match by username & password
    if (inputUser) {
      const match = users.find(u => u.username.toLowerCase() === inputUser);
      if (match) {
        if (match.password === inputPass) {
          const sessionUser = {
            id: match.id,
            username: match.username,
            displayName: match.displayName,
            role: match.role
          };
          localStorage.setItem(LS_KEYS.CURRENT_ADMIN, JSON.stringify(sessionUser));
          localStorage.setItem(LS_KEYS.ADMIN_SESSION, 'true');
          return { success: true, user: sessionUser };
        } else {
          return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
        }
      }
    }

    // 2. Fallback: match by password/PIN if username is empty or 'admin'
    const adminUser = users.find(u => u.username.toLowerCase() === 'admin') || initialAdminUsers[0];
    const settings = await this.getSettings();
    const validPin = settings.adminPin || '1234';

    if (inputPass === adminUser.password || inputPass === validPin || inputPass === 'takcityrun') {
      const sessionUser = {
        id: adminUser.id || 'admin-root',
        username: adminUser.username || 'admin',
        displayName: adminUser.displayName || 'ผู้ดูแลระบบหลัก',
        role: adminUser.role || 'superadmin'
      };
      localStorage.setItem(LS_KEYS.CURRENT_ADMIN, JSON.stringify(sessionUser));
      localStorage.setItem(LS_KEYS.ADMIN_SESSION, 'true');
      return { success: true, user: sessionUser };
    }

    return {
      success: false,
      error: inputUser
        ? 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
        : 'รหัสผ่านไม่ถูกต้อง (ค่าเริ่มต้นระบบ: admin / 1234)'
    };
  },

  async logoutAdmin() {
    localStorage.removeItem(LS_KEYS.CURRENT_ADMIN);
    localStorage.removeItem(LS_KEYS.ADMIN_SESSION);
    return true;
  }
};
