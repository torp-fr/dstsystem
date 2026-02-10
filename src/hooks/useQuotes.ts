import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  session_id: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  valid_from: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted_to_invoice';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Amendment {
  id: string;
  amendment_number: string;
  quote_id: string | null;
  invoice_id: string | null;
  client_id: string;
  changes_description: string;
  amount_change: number;
  new_total: number | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  deposit_number: string;
  quote_id: string | null;
  invoice_id: string | null;
  client_id: string;
  amount: number;
  percentage_of_total: number | null;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
}

// ============= QUOTES =============

// Get all quotes
export const useQuotes = (filters?: { client_id?: string; status?: string }) => {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('quotes').select(`
          *,
          client:clients(id, first_name, last_name, company_name)
        `);

        if (filters?.client_id) {
          query = query.eq('client_id', filters.client_id);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[Quotes] Error fetching quotes:', error);
        throw error;
      }
    },
  });
};

// Get single quote
export const useQuoteById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            *,
            client:clients(id, first_name, last_name, company_name, email, phone, address, city, postal_code),
            session:shooting_sessions(id, session_date, theme)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Quotes] Error fetching quote:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Generate next quote number
const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from('quotes')
    .select('quote_number')
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].quote_number.split('-')[1] || '0');
    nextNumber = lastNumber + 1;
  }

  return `DEVIS-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Create quote
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at' | 'quote_number'> & { quote_number?: string }) => {
      try {
        const quoteNumber = quote.quote_number || (await generateQuoteNumber());

        const { data, error } = await supabase
          .from('quotes')
          .insert([{ ...quote, quote_number: quoteNumber }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Quotes] Error creating quote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
};

// Update quote
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...quote }: Partial<Quote> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .update(quote)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Quotes] Error updating quote:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] });
    },
  });
};

// Convert quote to invoice
export const useConvertQuoteToInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      try {
        // Get the quote
        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .select('*')
          .eq('id', quoteId)
          .single();

        if (quoteError) throw quoteError;

        // Generate invoice number
        const year = new Date().getFullYear();
        const { data: invoices } = await supabase
          .from('invoices')
          .select('invoice_number')
          .order('created_at', { ascending: false })
          .limit(1);

        let nextNumber = 1;
        if (invoices && invoices.length > 0) {
          const lastNumber = parseInt(invoices[0].invoice_number.split('-')[1] || '0');
          nextNumber = lastNumber + 1;
        }
        const invoiceNumber = `FACTURE-${year}-${String(nextNumber).padStart(4, '0')}`;

        // Create invoice from quote
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([
            {
              invoice_number: invoiceNumber,
              client_id: quote.client_id,
              session_id: quote.session_id,
              quote_id: quoteId,
              amount: quote.subtotal,
              tax_amount: quote.tax_amount,
              total_amount: quote.total_amount,
              outstanding_balance: quote.total_amount,
              status: 'pending',
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            },
          ])
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Update quote status
        await supabase
          .from('quotes')
          .update({ status: 'converted_to_invoice' })
          .eq('id', quoteId);

        return invoice;
      } catch (error) {
        console.error('[Quotes] Error converting quote to invoice:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// ============= AMENDMENTS =============

// Get amendments for a quote or invoice
export const useAmendments = (filters?: { quote_id?: string; invoice_id?: string; client_id?: string }) => {
  return useQuery({
    queryKey: ['amendments', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('amendments').select('*');

        if (filters?.quote_id) {
          query = query.eq('quote_id', filters.quote_id);
        }
        if (filters?.invoice_id) {
          query = query.eq('invoice_id', filters.invoice_id);
        }
        if (filters?.client_id) {
          query = query.eq('client_id', filters.client_id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[Amendments] Error fetching amendments:', error);
        throw error;
      }
    },
  });
};

// Generate next amendment number
const generateAmendmentNumber = async () => {
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from('amendments')
    .select('amendment_number')
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].amendment_number.split('-')[1] || '0');
    nextNumber = lastNumber + 1;
  }

  return `AVENANT-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Create amendment
export const useCreateAmendment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amendment: Omit<Amendment, 'id' | 'created_at' | 'updated_at' | 'amendment_number'> & { amendment_number?: string }) => {
      try {
        const amendmentNumber = amendment.amendment_number || (await generateAmendmentNumber());

        const { data, error } = await supabase
          .from('amendments')
          .insert([{ ...amendment, amendment_number: amendmentNumber }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Amendments] Error creating amendment:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['amendments'] });
      if (data.quote_id) {
        queryClient.invalidateQueries({ queryKey: ['amendments', { quote_id: data.quote_id }] });
      }
      if (data.invoice_id) {
        queryClient.invalidateQueries({ queryKey: ['amendments', { invoice_id: data.invoice_id }] });
      }
    },
  });
};

// Update amendment
export const useUpdateAmendment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...amendment }: Partial<Amendment> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('amendments')
          .update(amendment)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Amendments] Error updating amendment:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['amendments'] });
    },
  });
};

// ============= DEPOSITS =============

// Get deposits
export const useDeposits = (filters?: { quote_id?: string; invoice_id?: string; client_id?: string }) => {
  return useQuery({
    queryKey: ['deposits', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('deposits').select('*');

        if (filters?.quote_id) {
          query = query.eq('quote_id', filters.quote_id);
        }
        if (filters?.invoice_id) {
          query = query.eq('invoice_id', filters.invoice_id);
        }
        if (filters?.client_id) {
          query = query.eq('client_id', filters.client_id);
        }

        const { data, error } = await query.order('due_date', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('[Deposits] Error fetching deposits:', error);
        throw error;
      }
    },
  });
};

// Generate next deposit number
const generateDepositNumber = async () => {
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from('deposits')
    .select('deposit_number')
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].deposit_number.split('-')[1] || '0');
    nextNumber = lastNumber + 1;
  }

  return `ACOMPTE-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Create deposit
export const useCreateDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deposit: Omit<Deposit, 'id' | 'created_at' | 'updated_at' | 'deposit_number'> & { deposit_number?: string }) => {
      try {
        const depositNumber = deposit.deposit_number || (await generateDepositNumber());

        const { data, error } = await supabase
          .from('deposits')
          .insert([{ ...deposit, deposit_number: depositNumber }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Deposits] Error creating deposit:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      if (data.quote_id) {
        queryClient.invalidateQueries({ queryKey: ['deposits', { quote_id: data.quote_id }] });
      }
      if (data.invoice_id) {
        queryClient.invalidateQueries({ queryKey: ['deposits', { invoice_id: data.invoice_id }] });
      }
    },
  });
};

// Update deposit (mark as paid, etc)
export const useUpdateDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...deposit }: Partial<Deposit> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('deposits')
          .update(deposit)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[Deposits] Error updating deposit:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
    },
  });
};
