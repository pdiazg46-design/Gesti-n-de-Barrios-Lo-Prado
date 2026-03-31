const fs = require('fs');
const env = fs.readFileSync('c:/Users/pdiaz/Desarrollos/Comunidad Segura/.env.local', 'utf8').split('\n');
for (const line of env) {
  const parts = line.split('=');
  if (parts.length >= 2) process.env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDelete() {
  const targetId = 'a847d690-1b84-4dfa-aae1-5693ff651f6e';
  
  const { data: userItems } = await supabase.from('items').select('id').eq('creator_id', targetId);
  console.log('Items owned by user:', userItems);
  
  if (userItems && userItems.length > 0) {
    const itemIds = userItems.map(i => i.id);
    const { error: notifErr2 } = await supabase.from('notifications').delete().in('item_id', itemIds);
    console.log('Notifs external err:', notifErr2);
  }
  
  const { error: notifErr } = await supabase.from('notifications').delete().eq('user_id', targetId);
  console.log('Notifs internal err:', notifErr);
  
  const { error: itemErr } = await supabase.from('items').delete().eq('creator_id', targetId);
  console.log('Items delete err:', itemErr);
  
  const { error: msgErr } = await supabase.from('messages').delete().eq('sender_id', targetId);
  console.log('Messages delete err:', msgErr);
  
  const { error: convErr } = await supabase.from('conversations').delete().or(`participant_a.eq.${targetId},participant_b.eq.${targetId}`);
  console.log('Conversations delete err:', convErr);
  
  const { error: profErr } = await supabase.from('profiles').delete().eq('id', targetId);
  console.log('Profiles delete err (CRITICAL):', profErr);
  
  const { error: authErr } = await supabase.auth.admin.deleteUser(targetId);
  console.log('Auth delete err:', authErr);
}

testDelete().catch(console.error);
