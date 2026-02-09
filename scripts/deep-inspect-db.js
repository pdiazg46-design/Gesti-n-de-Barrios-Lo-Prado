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

async function deepInspect() {
    console.log('🔍 Deep Inspection...');

    // 1. Check the profile again, but get ALL columns.
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'f72ce626-e47a-4cfb-8133-c8d484725350')
        .single();

    if (pError) {
        console.error('❌ Profile missing or error:', pError.message);
    } else {
        console.log('✅ Profile found with ALL columns:', profile);
    }

    // 2. Check ANY existing item in the table to see its structure and a working creator_id.
    const { data: items, error: iError } = await supabase
        .from('items')
        .select('*')
        .limit(5);

    if (iError) {
        console.error('❌ Items error:', iError.message);
    } else {
        console.log('✅ Existing items (max 5):', items);
        if (items.length > 0) {
            console.log('Sample working creator_id:', items[0].creator_id);
        }
    }

    // 3. Try to find the constraint via SQL if it's accessible through the JS client (it's not).
    // Instead, I'll try to insert with the creator_id of an existing user if one exists.
    const { data: otherProfiles } = await supabase.from('profiles').select('id, full_name').limit(5);
    console.log('Other profiles IDs:', otherProfiles.map(p => p.id));
}

deepInspect();
