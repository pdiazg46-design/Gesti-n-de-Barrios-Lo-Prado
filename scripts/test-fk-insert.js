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

async function testInsert() {
    console.log('🧪 Testing insert into "items" with creator_id = null...');

    // 1. Try null creator_id
    const { data: d1, error: e1 } = await supabase
        .from('items')
        .insert({
            title: 'Test Null Creator',
            type: 'OFFICIAL_ALERT',
            creator_id: null
        })
        .select();

    if (e1) {
        console.log('❌ Null creator_id failed:', e1.message);
    } else {
        console.log('✅ Null creator_id worked!');
        // Delete it immediately
        await supabase.from('items').delete().eq('id', d1[0].id);
    }

    // 2. Try with a random UUID that surely doesn't exist
    const randomId = '11111111-1111-1111-1111-111111111111';
    console.log(`🧪 Testing insert with random creator_id: ${randomId}...`);
    const { error: e2 } = await supabase
        .from('items')
        .insert({
            title: 'Test Random Creator',
            type: 'OFFICIAL_ALERT',
            creator_id: randomId
        });

    if (e2) {
        console.log('❌ Random creator_id failed as expected:', e2.message);
        // Compare this error message with the one from the screenshot
    }

    // 3. Try to find any existing item and see its creator_id
    console.log('🧪 Looking for existing items...');
    const { data: items } = await supabase.from('items').select('creator_id').limit(5);
    console.log('Existing item creator_ids:', items);
}

testInsert();
