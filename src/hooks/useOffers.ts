import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Offer {
  id: string;
  name: string;
  description: string | null;
  price: number;
  offer_type: 'single_session' | 'subscription' | 'package';
  is_active: boolean;
  is_subscription?: boolean;
  subscription_duration_months?: number | null;
  price_per_session?: number | null;
  sessions_included?: number | null;
  discount_percentage?: number | null;
  min_participants?: number | null;
  created_at: string;
  updated_at: string;
}

// Get all offers
export const useOffers = (filters?: { offer_type?: string; is_active?: boolean }) => {
  return useQuery({
    queryKey: ['offers', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('offers').select('*');

        if (filters?.offer_type) {
          query = query.eq('offer_type', filters.offer_type);
        }
        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[Offers] Error fetching offers:', error);
        throw error;
      }
    },
  });
};

// Get single offer
export const useOfferById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Offers] Error fetching offer:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Create offer
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .insert([offer])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Offers] Error creating offer:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

// Update offer
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...offer }: Partial<Offer> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .update(offer)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Offers] Error updating offer:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', data.id] });
    },
  });
};

// Delete offer
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from('offers').delete().eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('[Offers] Error deleting offer:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};
