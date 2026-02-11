import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const usePageVisits = () => {
  return useQuery({
    queryKey: ['page_visits'],
    queryFn: async () => {
      try {
        console.log('[Analytics] Fetching page_visits...');
        const { data, error } = await supabase
          .from('page_visits')
          .select('*')
          .order('visited_at', { ascending: false })
          .limit(1000);

        if (!error && data && data.length > 0) {
          console.log('[Analytics] Page visits loaded from Supabase:', data.length);
          return data;
        }

        // Fallback to localStorage
        console.log('[Analytics] Falling back to localStorage for page visits...');
        const localData = localStorage.getItem('dst-page-visits');
        if (localData) {
          const parsed = JSON.parse(localData);
          console.log('[Analytics] Loaded from localStorage:', parsed.length, 'page visits');
          return parsed;
        }

        console.log('[Analytics] No page visits data found');
        return [];
      } catch (error) {
        console.warn('[Analytics] Error fetching page_visits:', error);
        // Try localStorage as last resort
        const localData = localStorage.getItem('dst-page-visits');
        if (localData) {
          try {
            return JSON.parse(localData);
          } catch (parseError) {
            console.error('[Analytics] Failed to parse localStorage page visits:', parseError);
          }
        }
        return [];
      }
    },
    staleTime: 0,
    refetchInterval: 5000,
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['analytics_sessions'],
    queryFn: async () => {
      try {
        console.log('[Analytics] Fetching visitor sessions...');
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(1000);

        if (!error && data && data.length > 0) {
          console.log('[Analytics] Sessions loaded from Supabase:', data.length);
          return data;
        }

        // Fallback to localStorage
        console.log('[Analytics] Falling back to localStorage for sessions...');
        const localData = localStorage.getItem('dst-sessions');
        if (localData) {
          const parsed = JSON.parse(localData);
          console.log('[Analytics] Loaded from localStorage:', parsed.length, 'sessions');
          return parsed;
        }

        console.log('[Analytics] No sessions data found');
        return [];
      } catch (error) {
        console.warn('[Analytics] Error fetching sessions:', error);
        // Try localStorage as last resort
        const localData = localStorage.getItem('dst-sessions');
        if (localData) {
          try {
            return JSON.parse(localData);
          } catch (parseError) {
            console.error('[Analytics] Failed to parse localStorage sessions:', parseError);
          }
        }
        return [];
      }
    },
    staleTime: 0,
    refetchInterval: 5000,
  });
};

export const useAnalyticsStats = () => {
  const { data: pageVisits = [] } = usePageVisits();
  const { data: sessions = [] } = useSessions();

  return {
    totalPageVisits: pageVisits.length,
    totalSessions: sessions.length,
    uniqueCountries: [...new Set(pageVisits.map((pv: any) => pv.country))].filter(Boolean),
    topPages: Object.entries(
      pageVisits.reduce((acc: any, pv: any) => {
        acc[pv.page_url] = (acc[pv.page_url] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5),
    visitsByCountry: Object.entries(
      pageVisits.reduce((acc: any, pv: any) => {
        if (pv.country) {
          acc[pv.country] = (acc[pv.country] || 0) + 1;
        }
        return acc;
      }, {})
    )
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10),
  };
};
