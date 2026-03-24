const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Missing env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, used_vip_code, email')
      .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Success! Profiles count:', profiles.length);
    console.log('First 3 profiles:', profiles.slice(0, 3));
  }
}

test();
