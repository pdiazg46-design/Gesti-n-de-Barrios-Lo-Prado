const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const env = fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.replace(/"/g, '').trim();
        return acc;
    }, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSystemProfile() {
    const systemId = '00000000-0000-0000-0000-000000000000';
    console.log(`🔧 Creating/Verifying system profile ${systemId}...`);

    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: systemId,
            full_name: 'Sistema Municipal Lo Prado',
            avatar_url: 'https://via.placeholder.com/150?text=Municipalidad',
            karma_pts: 0
        }, { onConflict: 'id' })
        .select();

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ System profile is READY:', data);
    }
}

createSystemProfile();
