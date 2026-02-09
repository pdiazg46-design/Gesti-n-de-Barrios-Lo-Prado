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

async function sanityCheck() {
    const systemId = 'f72ce626-e47a-4cfb-8133-c8d484725350';
    console.log(`🧪 Attempting live insert with creator_id: ${systemId}...`);

    // Get a valid community_id first
    const { data: community } = await supabase.from('communities').select('id').eq('slug', 'lo-prado').single();

    if (!community) {
        console.error('❌ Community "lo-prado" not found');
        return;
    }

    const { data, error } = await supabase
        .from('items')
        .insert({
            community_id: community.id,
            creator_id: systemId,
            title: 'SANITY CHECK ALERT',
            description: 'This is a test to verify the FK constraint is fixed.',
            type: 'OFFICIAL_ALERT',
            status: 'ACTIVE'
        })
        .select();

    if (error) {
        console.error('❌ FK CONSTRAINT STILL VIOLATED:', error.message);
    } else {
        console.log('✅ INSERT SUCCESSFUL! The FK constraint is satisfied.');
        // Clean up
        await supabase.from('items').delete().eq('id', data[0].id);
    }
}

sanityCheck();
