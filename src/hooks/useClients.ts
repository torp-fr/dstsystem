import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateCustomerNumber } from '@/utils/customerNumber';

interface Client {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  industry?: string;
  status?: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  notes?: string;
  learner_count?: number;
  structure_type?: string;
  customer_number?: string;
}

export const useClients = (filters?: any) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      let query = supabase.from('clients').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useClientById = (id: string | null) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Client) => {
      // Remove fields that might not exist in the schema or cause FK issues
      const { learner_count, structure_type, ...clientData } = client as any;

      // Auto-generate customer number if not provided
      const customerNumber = clientData.customer_number || generateCustomerNumber();

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, customer_number: customerNumber }])
        .select()
        .single();

      if (error) {
        console.error('Client create error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...client }: Client & { id: string }) => {
      // Remove created_by from update to avoid issues
      const { created_by, created_at, updated_at, ...clientData } = client as any;

      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
