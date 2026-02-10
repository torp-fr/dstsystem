import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const usePageVisits = () => {
  return useQuery({
    queryKey: ['page_visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('visited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
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
