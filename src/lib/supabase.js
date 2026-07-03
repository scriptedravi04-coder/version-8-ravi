import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || "https://ozqdefczzkkfekkjzikp.supabase.co";
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
