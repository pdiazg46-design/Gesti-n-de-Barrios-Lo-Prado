const fs = require('fs');

function getEnv(key) {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].replace(/['"]/g, '').trim() : null;
}

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!url || !key) {
  console.error("Missing env vars", { url, key });
  process.exit(1);
}

fetch(url + '/rest/v1/profiles?select=*&limit=1', {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.error('Supabase REST Error:', data);
    return;
  }
  if (!Array.isArray(data)) {
    console.error('Supabase returned non-array:', data);
    return;
  }
  console.log('Sample profile:', data[0]);
})
.catch(console.error);
