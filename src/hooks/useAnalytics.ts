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
          .order('visited_at', { ascending: false });

        if (error) {
          console.warn('[Analytics] Error fetching page_visits from Supabase:', error.message);
          // Fallback to localStorage
          const localData = localStorage.getItem('dst-page-visits');
          if (localData) {
            console.log('[Analytics] Using localStorage page visits');
            return JSON.parse(localData);
          }
          throw error;
        }
        console.log('[Analytics] Page visits loaded from Supabase:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('[Analytics] Failed to fetch page_visits, trying localStorage:', error);
        const localData = localStorage.getItem('dst-page-visits');
        return localData ? JSON.parse(localData) : [];
      }
    },
    retry: 1,
    staleTime: 1000 * 30,
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        console.log('[Analytics] Fetching sessions...');
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('started_at', { ascending: false });

        if (error) {
          console.warn('[Analytics] Error fetching sessions from Supabase:', error.message);
          // Fallback to localStorage
          const localData = localStorage.getItem('dst-sessions');
          if (localData) {
            console.log('[Analytics] Using localStorage sessions');
            return JSON.parse(localData);
          }
          throw error;
        }
        console.log('[Analytics] Sessions loaded from Supabase:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('[Analytics] Failed to fetch sessions, trying localStorage:', error);
        const localData = localStorage.getItem('dst-sessions');
        return localData ? JSON.parse(localData) : [];
      }
    },
    retry: 1,
    staleTime: 1000 * 30,
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
