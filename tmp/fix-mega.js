const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let url = '';
let key = '';

for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        url = line.split('=')[1].replace(/"/g, '').trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        key = line.split('=')[1].replace(/"/g, '').trim();
    }
}

const supabase = createClient(url, key);

async function main() {
    const sysId = 'f72ce626-e47a-4a8b-8bc0-28a9e33e6c80';
    console.log('Inserting system user for Megafono:', sysId);
    
    const { data, error } = await supabase.from('profiles').upsert([{
        id: sysId,
        full_name: 'Megáfono Lo Prado (Alcaldía)',
        is_community_admin: true,
        is_verified: true,
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3233/3233887.png'
    }], { onConflict: 'id' });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success!', data);
    }
}

main();
