const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.replace(/"/g, '').trim();
        return acc;
    }, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function listProfiles() {
    console.log('👥 Listing profiles...');
    const { data, error } = await supabase.from('profiles').select('id, full_name, neighborhood_id').limit(10);

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('Profiles found:', data);
    }
}

listProfiles();
