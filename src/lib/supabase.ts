/**
 * Supabase Re-export for backwards compatibility
 *
 * CRITICAL ARCHITECTURE RULE:
 * All createClient() calls must go through src/infra/supabase.adapter.ts
 * This file is a compatibility layer only — DO NOT instantiate here
 */

export { supabase, checkAuth, getSession, supabaseAdapter } from '@/infra/supabase.adapter';
