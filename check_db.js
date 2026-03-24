const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, used_vip_code, is_verified');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("ALL PROFILES:");
  data.forEach(p => console.log(`${p.full_name} | ${p.email} | VIP: ${p.used_vip_code} | Verified: ${p.is_verified}`));
  
  const marcela = data.find(p => p.full_name && p.full_name.toLowerCase().includes('marcela'));
  console.log("\nMARCELA FOUND:", marcela);
}

check();
