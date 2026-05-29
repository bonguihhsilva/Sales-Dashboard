require('dotenv').config({ path: 'c:\\Projetos\\da-silva-dashboard\\.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  await supabase.from('profiles').update({ role: 'vendedor' }).eq('id', 'mock-user-id');
  console.log('Role reset to vendedor');
}

run();
