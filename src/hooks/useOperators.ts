import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Operator {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  employment_type: 'salary' | 'freelance';
  status: 'active' | 'inactive';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperatorRate {
  id: string;
  operator_id: string;
  rate_type: string;
  rate_amount: number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
}

// Get all operators
export const useOperators = (filters?: { status?: string; employment_type?: string }) => {
  return useQuery({
    queryKey: ['operators', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('operators').select('*');

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.employment_type) {
          query = query.eq('employment_type', filters.employment_type);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[Operators] Error fetching operators:', error);
        throw error;
      }
    },
  });
};

// Get single operator with rates
export const useOperatorById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['operator', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from('operators')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Operators] Error fetching operator:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Get operator rates
export const useOperatorRates = (operatorId: string | undefined) => {
  return useQuery({
    queryKey: ['operator_rates', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];

      try {
        const { data, error } = await supabase
          .from('operator_rates')
          .select('*')
          .eq('operator_id', operatorId)
          .order('effective_from', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[Operators] Error fetching rates:', error);
        throw error;
      }
    },
    enabled: !!operatorId,
  });
};

// Create operator
export const useCreateOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operator: Omit<Operator, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('operators')
          .insert([operator])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Operators] Error creating operator:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
    },
  });
};

// Update operator
export const useUpdateOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...operator }: Partial<Operator> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('operators')
          .update(operator)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Operators] Error updating operator:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      queryClient.invalidateQueries({ queryKey: ['operator', data.id] });
    },
  });
};

// Delete operator
export const useDeleteOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('operators')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('[Operators] Error deleting operator:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
    },
  });
};

// Create operator rate
export const useCreateOperatorRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rate: Omit<OperatorRate, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('operator_rates')
          .insert([rate])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Operators] Error creating rate:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operator_rates', data.operator_id] });
    },
  });
};

// Update operator rate
export const useUpdateOperatorRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, operator_id, ...rate }: Partial<OperatorRate> & { id: string; operator_id: string }) => {
      try {
        const { data, error } = await supabase
          .from('operator_rates')
          .update(rate)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { ...data, operator_id };
      } catch (error) {
        console.error('[Operators] Error updating rate:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operator_rates', data.operator_id] });
    },
  });
};

// Delete operator rate
export const useDeleteOperatorRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, operator_id }: { id: string; operator_id: string }) => {
      try {
        const { error } = await supabase
          .from('operator_rates')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('[Operators] Error deleting rate:', error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operator_rates', variables.operator_id] });
    },
  });
};
