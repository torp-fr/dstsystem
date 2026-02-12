import { supabase } from './supabase';

// Generate or retrieve session ID from localStorage
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get geolocation data from Vercel API (server-side to avoid CORS)
export const getGeoLocation = async () => {
  try {
    const response = await fetch('/api/geolocation', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[Tracking] Geolocation data:', data);

    return {
      ip: data.ip || null,
      country: data.country || null,
      city: data.city || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
  } catch (error) {
    console.warn('[Tracking] Geolocation error:', error);
    return {
      ip: null,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }
};

// Track page visit
export const trackPageVisit = async (pageUrl: string, pageTitle?: string) => {
  try {
    const sessionId = getOrCreateSessionId();
    const geoData = await getGeoLocation();

    const pageVisitData = {
      page_url: pageUrl,
      page_title: pageTitle || document.title,
      session_id: sessionId,
      user_agent: navigator.userAgent,
      ip_address: geoData.ip,
      country: geoData.country,
      city: geoData.city,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      referrer: document.referrer || null,
      visited_at: new Date().toISOString(),
    };

    console.log('[Tracking] Tracking page visit:', pageVisitData);

    // Save to localStorage (always works)
    const localVisits = JSON.parse(localStorage.getItem('dst-page-visits') || '[]');
    localVisits.push(pageVisitData);
    localStorage.setItem('dst-page-visits', JSON.stringify(localVisits));
    console.log('[Tracking] Page visit saved to localStorage');

    // Try to save to Supabase (non-blocking)
    const { error } = await supabase.from('page_visits').insert([pageVisitData]);

    if (error) {
      console.warn('[Tracking] Supabase insert error:', error);
    } else {
      console.log('[Tracking] Page visit tracked to Supabase successfully');
    }
  } catch (error) {
    console.error('[Tracking] Track page visit error:', error);
  }
};

// Track session start
export const trackSessionStart = async () => {
  try {
    const sessionId = getOrCreateSessionId();
    const geoData = await getGeoLocation();

    const sessionData = {
      session_id: sessionId,
      ip_address: geoData.ip,
      country: geoData.country,
      city: geoData.city,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      browser: getBrowserName(),
      os: getOSName(),
      started_at: new Date().toISOString(),
    };

    console.log('[Tracking] Starting session:', sessionData);

    // Save to localStorage (always works)
    const localSessions = JSON.parse(localStorage.getItem('dst-sessions') || '[]');
    const existingSession = localSessions.find((s: any) => s.session_id === sessionId);
    if (!existingSession) {
      localSessions.push(sessionData);
      localStorage.setItem('dst-sessions', JSON.stringify(localSessions));
      console.log('[Tracking] Session saved to localStorage');
    }

    // Try to save to Supabase (non-blocking)
    const { error } = await supabase.from('sessions').insert([sessionData]);

    if (error) {
      // Ignore duplicate key errors (session already exists)
      if (error.code === '23505') {
        console.log('[Tracking] Session already exists, skipping insert');
      } else {
        console.warn('[Tracking] Session insert error:', error);
      }
    } else {
      console.log('[Tracking] Session started successfully in Supabase');
    }
  } catch (error) {
    console.error('[Tracking] Track session error:', error);
  }
};

// Helper functions for device/browser detection
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
};

const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  return 'Unknown';
};

const getOSName = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Windows') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
  return 'Unknown';
};
