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

async function syncSystemUser() {
    console.log('🚀 Synchronizing System User...');

    // 1. Create a user in auth.users if it doesn't look like we have a system user
    console.log('Creating auth user for municipal system...');
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email: 'sistema@loprado.cl',
        password: 'system-password-2026-safe',
        email_confirm: true,
        user_metadata: { full_name: 'Sistema Municipal Lo Prado' }
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('✅ Auth user already exists. Fetching its ID...');
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existing = users.find(u => u.email === 'sistema@loprado.cl');
            if (existing) {
                await updateProfile(existing.id);
            }
        } else {
            console.error('❌ Error creating auth user:', authError.message);
        }
        return;
    }

    if (user) {
        console.log(`✅ Auth user created with ID: ${user.id}`);
        await updateProfile(user.id);
    }
}

async function updateProfile(newId) {
    console.log(`🔧 Updating profile to match Auth ID: ${newId}...`);

    // First, let's see if we have an old profile to delete or update
    const oldId = '00000000-0000-0000-0000-000000000000';

    // upsert is best
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: newId,
            full_name: 'Sistema Municipal Lo Prado',
            avatar_url: 'https://via.placeholder.com/150?text=Municipalidad',
            karma_pts: 0
        });

    if (profileError) {
        console.error('❌ Error updating profile:', profileError.message);
    } else {
        console.log('✅ Profile synchronized!');
        console.log('----------------------------------------------------');
        console.log('NEW SYSTEM ID:', newId);
        console.log('----------------------------------------------------');
        console.log('Please update the following files with this ID:');
        console.log('- src/app/api/municipal/send-alert/route.ts');
        console.log('----------------------------------------------------');
    }
}

syncSystemUser();
