import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit, trackSessionStart } from '@/lib/tracking';

export const useTracking = () => {
  const location = useLocation();

  // Track session start on mount
  useEffect(() => {
    trackSessionStart();
  }, []);

  // Track page visits on route change
  useEffect(() => {
    trackPageVisit(location.pathname, document.title);
  }, [location]);
};
