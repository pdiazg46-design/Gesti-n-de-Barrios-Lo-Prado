const fs = require('fs');

function getEnv(key) {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].replace(/['"]/g, '').trim() : null;
}

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

async function test() {
  const userId = '13a48025-4519-4e00-884c-be8686b5935b'; // Marcela
  const code = 'UV19-S1';

  console.log('Testing PATCH Upsert...');
  const res = await fetch(url + `/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ used_vip_code: code })
  });
  
  const data = await res.json();
  if (data.error || data.message) {
    console.error('REST ERROR:', data);
  } else {
    console.log('REST SUCCESS:', data);
  }
}

test();
