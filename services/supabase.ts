
import { createClient } from '@supabase/supabase-js';

/**
 * DEPROCAST OS - CLOUD PROTOCOL
 * 
 * Las variables se extraen de process.env via Vite define plugin.
 */
const getEnv = (key: string) => {
  try {
    return process.env[key] || "";
  } catch {
    return "";
  }
};

const SUPABASE_URL = getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

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
