
import { createClient } from '@supabase/supabase-js';

/**
 * DEPROCAST OS - CLOUD PROTOCOL
 * 
 * Las variables se extraen de process.env.
 * En Vercel: Configurar en Dashboard > Settings > Environment Variables.
 * En Local: Configurar en un archivo .env en la raíz.
 */
const SUPABASE_URL = process.env.SUPABASE_URL || (process.env as any).NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isCloudEnabled = () => {
  const enabled = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
  if (!enabled && typeof window !== 'undefined') {
    console.warn("DEPROCAST OS: Cloud keys missing. Defaulting to Local IndexedDB Storage.");
  }
  return enabled;
};

export const supabase = isCloudEnabled() 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;
