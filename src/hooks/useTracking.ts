import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit, trackSessionStart } from '@/lib/tracking';

export const useTracking = () => {
  const location = useLocation();
  const sessionStarted = useRef(false);

  // Track session start ONLY once
  useEffect(() => {
    if (!sessionStarted.current) {
      trackSessionStart();
      sessionStarted.current = true;
    }
  }, []);

  // Track page visits on route change
  useEffect(() => {
    trackPageVisit(location.pathname, document.title);
  }, [location]);
};
