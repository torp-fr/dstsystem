import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit, trackSessionStart } from '@/lib/tracking';

export const useTracking = () => {
  const location = useLocation();
  const sessionStarted = useRef(false);

  // Check if current path is a public route (not dashboard)
  const isPublicRoute = !location.pathname.startsWith('/dashboard') &&
                        !location.pathname.startsWith('/login') &&
                        !location.pathname.startsWith('/register');

  // Track session start ONLY once
  useEffect(() => {
    if (!sessionStarted.current) {
      trackSessionStart();
      sessionStarted.current = true;
    }
  }, []);

  // Track page visits on route change (PUBLIC routes only)
  useEffect(() => {
    if (isPublicRoute) {
      trackPageVisit(location.pathname, document.title);
      console.log('[Tracking] Tracked public page visit:', location.pathname);
    } else {
      console.log('[Tracking] Skipped tracking for dashboard/auth route:', location.pathname);
    }
  }, [location, isPublicRoute]);
};
