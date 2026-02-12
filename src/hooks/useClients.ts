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
      // Auto-generate customer number if not provided
      const customerNumber = client.customer_number || generateCustomerNumber();

      // Build client data - only include fields that exist
      const clientData: any = {
        first_name: client.first_name,
        last_name: client.last_name,
        customer_number: customerNumber,
      };

      // Add optional fields only if they have values
      if (client.email) clientData.email = client.email;
      if (client.phone) clientData.phone = client.phone;
      if (client.company_name) clientData.company_name = client.company_name;
      if (client.industry) clientData.industry = client.industry;
      if (client.status) clientData.status = client.status;
      if (client.category) clientData.category = client.category;
      if (client.address) clientData.address = client.address;
      if (client.city) clientData.city = client.city;
      if (client.country) clientData.country = client.country;
      if (client.postal_code) clientData.postal_code = client.postal_code;
      if (client.website) clientData.website = client.website;
      if (client.notes) clientData.notes = client.notes;

      // These fields will be available after migration
      if (client.learner_count !== undefined && client.learner_count !== null) {
        clientData.learner_count = client.learner_count;
      }
      if (client.structure_type) clientData.structure_type = client.structure_type;

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Client create error:', error);
        throw error;
      }
      console.log('Client créé avec le numéro:', customerNumber);
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
      // Remove system fields
      const { created_by, created_at, updated_at, customer_number, ...clientData } = client as any;

      // Build update data - only include fields with values
      const updateData: any = {};
      Object.keys(clientData).forEach(key => {
        if (clientData[key] !== undefined && clientData[key] !== null) {
          updateData[key] = clientData[key];
        }
      });

      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Client update error:', error);
        throw error;
      }
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
