import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ClientSubscription {
  id: string;
  client_id: string;
  offer_id: string;
  subscription_date: string;
  end_date: string | null;
  status: 'active' | 'paused' | 'cancelled';
  quantity: number;
  created_at: string;
  updated_at: string;
  offer?: any;
}

// Get subscriptions for a client
export const useClientSubscriptions = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client_subscriptions', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      try {
        const { data, error } = await supabase
          .from('client_subscriptions')
          .select(`
            *,
            offer:offers(*)
          `)
          .eq('client_id', clientId)
          .order('subscription_date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[ClientSubscriptions] Error fetching subscriptions:', error);
        throw error;
      }
    },
    enabled: !!clientId,
  });
};

// Create client subscription
export const useCreateClientSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ClientSubscription, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data: result, error } = await supabase
          .from('client_subscriptions')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        return result;
      } catch (error) {
        console.error('[ClientSubscriptions] Error creating subscription:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client_subscriptions', data.client_id] });
    },
  });
};

// Update client subscription
export const useUpdateClientSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ClientSubscription> & { id: string }) => {
      try {
        const { data: result, error } = await supabase
          .from('client_subscriptions')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } catch (error) {
        console.error('[ClientSubscriptions] Error updating subscription:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client_subscriptions', data.client_id] });
    },
  });
};

// Delete client subscription
export const useDeleteClientSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      try {
        const { error } = await supabase
          .from('client_subscriptions')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('[ClientSubscriptions] Error deleting subscription:', error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client_subscriptions', variables.clientId] });
    },
  });
};
