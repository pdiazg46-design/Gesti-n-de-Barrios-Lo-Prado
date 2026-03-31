const fs = require('fs');
const env = fs.readFileSync('c:/Users/pdiaz/Desarrollos/Comunidad Segura/.env.local', 'utf8').split('\n');
for (const line of env) {
  const parts = line.split('=');
  if (parts.length >= 2) process.env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');
  const megafonos = profiles.filter(p => p.full_name && p.full_name.toLowerCase().includes('meg'));
  console.log('Megafonos en BD:', megafonos);

  const { data: authData } = await supabase.auth.admin.listUsers();
  const authMegas = authData.users.filter(u => u.email && u.email.toLowerCase().includes('meg'));
  console.log('Megafonos en Auth:', authMegas);
}
run();
