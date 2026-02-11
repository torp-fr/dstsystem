import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CostStructure {
  id: string;
  category: string;
  name: string;
  description: string | null;
  monthly_amount: number;
  annual_amount: number;
  expense_account: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Get all cost structures
export const useCostStructures = (filters?: { category?: string; is_active?: boolean }) => {
  return useQuery({
    queryKey: ['cost_structures', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('cost_structures').select('*');

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }

        const { data, error } = await query.order('category', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[CostStructures] Error fetching cost structures:', error);
        throw error;
      }
    },
  });
};

// Get single cost structure
export const useCostStructureById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['cost_structure', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from('cost_structures')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[CostStructures] Error fetching cost structure:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Calculate total monthly costs
export const useMonthlyCostTotal = (costStructures?: CostStructure[]) => {
  return (costStructures || [])
    .filter((c) => c.is_active)
    .reduce((sum, cost) => sum + (cost.monthly_amount || 0), 0);
};

// Calculate total annual costs
export const useAnnualCostTotal = (costStructures?: CostStructure[]) => {
  return (costStructures || [])
    .filter((c) => c.is_active)
    .reduce((sum, cost) => sum + (cost.annual_amount || 0), 0);
};

// Get costs by category
export const useCostsByCategory = (costStructures?: CostStructure[]) => {
  const costs = costStructures || [];
  const categories = ['fixed_cost', 'amortization', 'operating_expense'];

  return Object.fromEntries(
    categories.map((category) => {
      const total = costs
        .filter((c) => c.category === category && c.is_active)
        .reduce((sum, cost) => sum + (cost.monthly_amount || 0), 0);
      return [category, total];
    })
  );
};

// Create cost structure
export const useCreateCostStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cost: Omit<CostStructure, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('cost_structures')
          .insert([cost])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[CostStructures] Error creating cost structure:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_structures'] });
    },
  });
};

// Update cost structure
export const useUpdateCostStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...cost }: Partial<CostStructure> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('cost_structures')
          .update(cost)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[CostStructures] Error updating cost structure:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost_structures'] });
      queryClient.invalidateQueries({ queryKey: ['cost_structure', data.id] });
    },
  });
};

// Delete cost structure
export const useDeleteCostStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('cost_structures')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('[CostStructures] Error deleting cost structure:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_structures'] });
    },
  });
};
