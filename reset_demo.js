const fs = require('fs');

function getEnv(key) {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].replace(/['"]/g, '').trim() : null;
}

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

async function cleanDemo() {
  console.log('Iniciando limpieza total para la Demo via REST API...');

  const headers = {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  };

  const adminId = '7e40bd42-f6d9-40b1-b362-15bcfd30f44c';

  console.log('Liberando espacios VIP de Patricio...');
  await fetch(url + `/rest/v1/profiles?id=eq.${adminId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ used_vip_code: null })
  });

  console.log('Borrando perfiles de vecinos de prueba (Marcela, etc)...');
  await fetch(url + `/rest/v1/profiles?id=neq.${adminId}`, { method: 'DELETE', headers });

  // 2. Borrar VIP Codes generados
  console.log('Reseteando Células Fundadoras...');
  await fetch(url + '/rest/v1/vip_codes', { method: 'DELETE', headers });

  console.log('¡Base de datos limpia y lista para la demo!');
}

cleanDemo().catch(console.error);
