import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ozqdefczzkkfekkjzikp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const tables = ['kjfhkjsdjfhkds'];
  for (const table of tables) {
    const { data: records, error: tableErr } = await supabase.from(table).select('count', { count: 'exact', head: true }).limit(1);
    if (tableErr) {
      console.log(`❌ Table '${table}' Error:`, tableErr.message);
    } else {
      console.log(`✅ Table '${table}' EXISTS!`);
    }
  }
}
run();
