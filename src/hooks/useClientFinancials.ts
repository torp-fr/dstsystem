import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ClientFinancials {
  totalRevenue: number;
  totalCosts: number;
  totalMargin: number;
  marginPercentage: number;
  completedSessions: number;
  scheduledSessions: number;
}

// Get financial data for a client
export const useClientFinancials = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client_financials', clientId],
    queryFn: async () => {
      if (!clientId) return null;

      try {
        // Get invoices for this client
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('client_id', clientId)
          .in('status', ['paid', 'pending', 'partial']);

        if (invoicesError) throw invoicesError;

        // Get sessions for this client
        const { data: sessions, error: sessionsError } = await supabase
          .from('shooting_sessions')
          .select(`
            *,
            session_operators(*)
          `)
          .eq('client_id', clientId);

        if (sessionsError) throw sessionsError;

        // Calculate totals
        const totalRevenue = (invoices || []).reduce((sum, inv: any) => sum + (inv.total_amount || 0), 0);

        // Calculate session costs from session_operators
        const totalCosts = (sessions || []).reduce((sum, session: any) => {
          const sessionCost = (session.session_operators || []).reduce(
            (sessionSum: number, op: any) => sessionSum + (op.cost_override || 0),
            0
          );
          return sum + sessionCost;
        }, 0);

        const totalMargin = totalRevenue - totalCosts;
        const marginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

        const completedSessions = (sessions || []).filter((s: any) => s.status === 'completed').length;
        const scheduledSessions = (sessions || []).filter((s: any) => s.status === 'scheduled').length;

        return {
          totalRevenue,
          totalCosts,
          totalMargin,
          marginPercentage,
          completedSessions,
          scheduledSessions,
        };
      } catch (error) {
        console.error('[ClientFinancials] Error fetching financials:', error);
        throw error;
      }
    },
    enabled: !!clientId,
  });
};
