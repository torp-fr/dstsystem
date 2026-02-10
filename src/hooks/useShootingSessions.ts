import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ShootingSession {
  id: string;
  client_id: string | null;
  session_date: string;
  session_time: string | null;
  duration_minutes: number;
  theme: string | null;
  max_participants: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionOperator {
  id: string;
  session_id: string;
  operator_id: string;
  role: string;
  cost_override: number | null;
  created_at: string;
}

// Get all shooting sessions
export const useShootingSessions = (filters?: {
  client_id?: string;
  status?: string;
  month?: string;
}) => {
  return useQuery({
    queryKey: ['shooting_sessions', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('shooting_sessions').select('*');

        if (filters?.client_id) {
          query = query.eq('client_id', filters.client_id);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('session_date', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[ShootingSessions] Error fetching sessions:', error);
        throw error;
      }
    },
  });
};

// Get sessions by month
export const useSessionsByMonth = (year: number, month: number) => {
  return useQuery({
    queryKey: ['shooting_sessions', 'month', year, month],
    queryFn: async () => {
      try {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('shooting_sessions')
          .select('*')
          .gte('session_date', startDate)
          .lte('session_date', endDate)
          .order('session_date', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[ShootingSessions] Error fetching sessions by month:', error);
        throw error;
      }
    },
  });
};

// Get single shooting session
export const useSessionById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['shooting_session', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from('shooting_sessions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[ShootingSessions] Error fetching session:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Get session operators
export const useSessionOperators = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['session_operators', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      try {
        const { data, error } = await supabase
          .from('session_operators')
          .select(`
            *,
            operator:operators(id, first_name, last_name, employment_type)
          `)
          .eq('session_id', sessionId);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[ShootingSessions] Error fetching session operators:', error);
        throw error;
      }
    },
    enabled: !!sessionId,
  });
};

// Create shooting session
export const useCreateShootingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: Omit<ShootingSession, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('shooting_sessions')
          .insert([session])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[ShootingSessions] Error creating session:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shooting_sessions'] });
      const month = new Date(data.session_date).getMonth() + 1;
      const year = new Date(data.session_date).getFullYear();
      queryClient.invalidateQueries({ queryKey: ['shooting_sessions', 'month', year, month] });
    },
  });
};

// Update shooting session
export const useUpdateShootingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...session }: Partial<ShootingSession> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('shooting_sessions')
          .update(session)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[ShootingSessions] Error updating session:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shooting_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['shooting_session', data.id] });
      const month = new Date(data.session_date).getMonth() + 1;
      const year = new Date(data.session_date).getFullYear();
      queryClient.invalidateQueries({ queryKey: ['shooting_sessions', 'month', year, month] });
    },
  });
};

// Delete shooting session
export const useDeleteShootingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Get the session first to know the month
        const { data: session } = await supabase
          .from('shooting_sessions')
          .select('session_date')
          .eq('id', id)
          .single();

        const { error } = await supabase
          .from('shooting_sessions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return session?.session_date;
      } catch (error) {
        console.error('[ShootingSessions] Error deleting session:', error);
        throw error;
      }
    },
    onSuccess: (sessionDate) => {
      queryClient.invalidateQueries({ queryKey: ['shooting_sessions'] });
      if (sessionDate) {
        const month = new Date(sessionDate).getMonth() + 1;
        const year = new Date(sessionDate).getFullYear();
        queryClient.invalidateQueries({ queryKey: ['shooting_sessions', 'month', year, month] });
      }
    },
  });
};

// Add operator to session
export const useAddSessionOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<SessionOperator, 'id' | 'created_at'>) => {
      try {
        const { data: result, error } = await supabase
          .from('session_operators')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        return result;
      } catch (error) {
        console.error('[ShootingSessions] Error adding operator to session:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session_operators', data.session_id] });
    },
  });
};

// Remove operator from session
export const useRemoveSessionOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, session_id }: { id: string; session_id: string }) => {
      try {
        const { error } = await supabase
          .from('session_operators')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('[ShootingSessions] Error removing operator from session:', error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session_operators', variables.session_id] });
    },
  });
};
