require('dotenv').config({ path: 'c:\\Projetos\\da-silva-dashboard\\.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: goals } = await supabase.from('goals').select('vendor_id').limit(1);
  if (goals && goals.length > 0) {
    const vid = goals[0].vendor_id;
    await supabase.from('profiles').update({ vendor_id: vid }).eq('id', 'mock-user-id');
    console.log('Linked mock user to vendor_id:', vid);
  } else {
    // just put a dummy vendor
    await supabase.from('profiles').update({ vendor_id: 'VENDEDOR_MOCK_123' }).eq('id', 'mock-user-id');
    console.log('Linked to dummy vendor VENDEDOR_MOCK_123');
  }
}

run();
