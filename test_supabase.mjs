import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozqdefczzkkfekkjzikp.supabase.co';
const supabaseKey = 'sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('ybex_sync').select('id').limit(1);
  console.log("data:", data, "error:", error);
}
run();
