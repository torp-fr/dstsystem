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
          console.error('[Analytics] Error fetching page_visits:', error);
          throw error;
        }
        console.log('[Analytics] Page visits loaded:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('[Analytics] Failed to fetch page_visits:', error);
        throw error;
      }
    },
    retry: 2,
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
          console.error('[Analytics] Error fetching sessions:', error);
          throw error;
        }
        console.log('[Analytics] Sessions loaded:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('[Analytics] Failed to fetch sessions:', error);
        throw error;
      }
    },
    retry: 2,
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
