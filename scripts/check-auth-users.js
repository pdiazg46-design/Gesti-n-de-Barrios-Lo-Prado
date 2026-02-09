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

async function checkAuthUsers() {
    console.log('👤 Checking auth.users via Admin API...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('❌ Error listing users:', error.message);
        return;
    }

    console.log(`Found ${users.length} users.`);
    const systemUser = users.find(u => u.id === '00000000-0000-0000-0000-000000000000');
    if (systemUser) {
        console.log('✅ System user EXISTS in auth.users');
    } else {
        console.log('❌ System user MISSING in auth.users');
        console.log('Sample users:', users.slice(0, 3).map(u => ({ id: u.id, email: u.email })));
    }
}

checkAuthUsers();
