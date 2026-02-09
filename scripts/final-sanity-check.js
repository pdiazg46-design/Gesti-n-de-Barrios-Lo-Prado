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

async function finalSanityCheck() {
    const systemId = 'f72ce626-e47a-4a8b-8bc0-28a9e33e6c80';
    console.log(`🧪 FINAL SANITY CHECK with creator_id: ${systemId}...`);

    const { data: community } = await supabase.from('communities').select('id').eq('slug', 'lo-prado').single();

    const { data, error } = await supabase
        .from('items')
        .insert({
            community_id: community.id,
            creator_id: systemId,
            title: 'FINAL SUCCESSFUL TEST',
            description: 'The FK constraint is now officially solved.',
            type: 'OFFICIAL_ALERT',
            status: 'ACTIVE'
        })
        .select();

    if (error) {
        console.error('❌ STILL FAILING (This should not happen):', error.message);
    } else {
        console.log('✅ DATABASE ACCEPTED INSERTION! The fix is 100% verified.');
        await supabase.from('items').delete().eq('id', data[0].id);
    }
}

finalSanityCheck();
