import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { USE_SUPABASE, assertSupabaseEnabled } from '@/config/runtime';

export const usePageVisits = () => {
  return useQuery({
    queryKey: ['page_visits'],
    queryFn: async () => {
      if (USE_SUPABASE) {
        assertSupabaseEnabled();
      }

      try {
        console.log('[Analytics] Fetching page_visits from Supabase...');
        const { data, error } = await supabase
          .from('page_visits')
          .select('*')
          .order('visited_at', { ascending: false })
          .limit(1000);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        if (data && data.length > 0) {
          console.log('[Analytics] Page visits loaded from Supabase:', data.length);
          return data;
        }

        console.log('[Analytics] No page visits data found in Supabase');
        return [];
      } catch (error) {
        console.error('[Analytics] Failed to fetch page_visits from Supabase:', error);

        // In production mode, fail explicitly (no localStorage fallback)
        if (USE_SUPABASE) {
          throw error;
        }

        // Fallback only in development mode
        console.warn('[Analytics] Falling back to localStorage...');
        const localData = localStorage.getItem('dst-page-visits');
        if (localData) {
          try {
            return JSON.parse(localData);
          } catch (parseError) {
            console.error('[Analytics] Failed to parse localStorage:', parseError);
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
      if (USE_SUPABASE) {
        assertSupabaseEnabled();
      }

      try {
        console.log('[Analytics] Fetching visitor sessions from Supabase...');
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(1000);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        if (data && data.length > 0) {
          console.log('[Analytics] Sessions loaded from Supabase:', data.length);
          return data;
        }

        console.log('[Analytics] No sessions data found in Supabase');
        return [];
      } catch (error) {
        console.error('[Analytics] Failed to fetch sessions from Supabase:', error);

        // In production mode, fail explicitly (no localStorage fallback)
        if (USE_SUPABASE) {
          throw error;
        }

        // Fallback only in development mode
        console.warn('[Analytics] Falling back to localStorage...');
        const localData = localStorage.getItem('dst-sessions');
        if (localData) {
          try {
            return JSON.parse(localData);
          } catch (parseError) {
            console.error('[Analytics] Failed to parse localStorage:', parseError);
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
