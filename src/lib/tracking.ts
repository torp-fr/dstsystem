import { supabase } from './supabase';
import { USE_SUPABASE, assertSupabaseEnabled } from '@/config/runtime';
import { logger } from './logger';

// Generate or retrieve session ID
// In production, session ID is managed by Supabase.
// Fallback to localStorage only in development.
const getOrCreateSessionId = (): string => {
  // First try localStorage for browser session persistence
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // In production, this is temporary - Supabase will assign a real session ID
    if (!USE_SUPABASE) {
      localStorage.setItem('session_id', sessionId);
    }
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
    logger.log('[Tracking] Geolocation data:', data);

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
// In production (USE_SUPABASE=true): Primary to Supabase, no fallback
// In development (USE_SUPABASE=false): Supabase first, fallback to localStorage
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

    logger.log('[Tracking] Tracking page visit to Supabase:', pageVisitData);

    // Primary: Save to Supabase (required in production)
    const { error } = await supabase.from('page_visits').insert([pageVisitData]);

    if (error) {
      console.error('[Tracking] Supabase insert error:', error);

      // In production mode, fail explicitly (no localStorage fallback)
      if (USE_SUPABASE) {
        throw new Error(`Failed to track page visit: ${error.message}`);
      }

      // Fallback: In development mode, save to localStorage
      console.warn('[Tracking] Falling back to localStorage...');
      const localVisits = JSON.parse(localStorage.getItem('dst-page-visits') || '[]');
      localVisits.push(pageVisitData);
      localStorage.setItem('dst-page-visits', JSON.stringify(localVisits));
      logger.log('[Tracking] Page visit saved to localStorage as fallback');
    } else {
      logger.log('[Tracking] Page visit tracked to Supabase successfully');
    }
  } catch (error) {
    console.error('[Tracking] Track page visit error:', error);
    throw error; // Re-throw in production mode
  }
};

// Track session start
// In production (USE_SUPABASE=true): Primary to Supabase, no fallback
// In development (USE_SUPABASE=false): Supabase first, fallback to localStorage
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

    logger.log('[Tracking] Starting session in Supabase:', sessionData);

    // Primary: Save to Supabase (required in production)
    const { error } = await supabase.from('sessions').insert([sessionData]);

    if (error) {
      // Ignore duplicate key errors (session already exists)
      if (error.code === '23505') {
        logger.log('[Tracking] Session already exists in Supabase, skipping insert');
      } else {
        console.error('[Tracking] Session insert error:', error);

        // In production mode, fail explicitly (no localStorage fallback)
        if (USE_SUPABASE) {
          throw new Error(`Failed to track session: ${error.message}`);
        }

        // Fallback: In development mode, save to localStorage
        console.warn('[Tracking] Falling back to localStorage...');
        const localSessions = JSON.parse(localStorage.getItem('dst-sessions') || '[]');
        const existingSession = localSessions.find((s: any) => s.session_id === sessionId);
        if (!existingSession) {
          localSessions.push(sessionData);
          localStorage.setItem('dst-sessions', JSON.stringify(localSessions));
          logger.log('[Tracking] Session saved to localStorage as fallback');
        }
      }
    } else {
      logger.log('[Tracking] Session started successfully in Supabase');
    }
  } catch (error) {
    console.error('[Tracking] Track session error:', error);
    throw error; // Re-throw in production mode
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
