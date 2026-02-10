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

// Get geolocation data from IP
export const getGeoLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip: data.ip,
      country: data.country_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      ip: 'unknown',
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

    const { error } = await supabase.from('page_visits').insert([
      {
        page_url: pageUrl,
        page_title: pageTitle || document.title,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        ip_address: geoData.ip,
        country: geoData.country,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        referrer: document.referrer,
      },
    ]);

    if (error) {
      console.error('Tracking error:', error);
    }
  } catch (error) {
    console.error('Track page visit error:', error);
  }
};

// Track session start
export const trackSessionStart = async () => {
  try {
    const sessionId = getOrCreateSessionId();
    const geoData = await getGeoLocation();

    const { error } = await supabase.from('sessions').insert([
      {
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
      },
    ]);

    if (error) {
      console.error('Session tracking error:', error);
    }
  } catch (error) {
    console.error('Track session error:', error);
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
