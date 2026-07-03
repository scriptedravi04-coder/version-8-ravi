import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ozqdefczzkkfekkjzikp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('ugc_briefs').select('*').limit(1);
  console.log('ugc_briefs error:', error);
  console.log('ugc_briefs keys:', data && data.length > 0 ? Object.keys(data[0]) : 'no data');
  
  const { data: d2, error: e2 } = await supabase.from('ugc_orders').select('*').limit(1);
  console.log('ugc_orders keys:', d2 && d2.length > 0 ? Object.keys(d2[0]) : 'no data');

  const { data: d3, error: e3 } = await supabase.from('chat_threads').select('*').limit(1);
  console.log('chat_threads keys:', d3 && d3.length > 0 ? Object.keys(d3[0]) : 'no data');
}
run();
