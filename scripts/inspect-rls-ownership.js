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

async function inspectRLS() {
    console.log('🔍 Inspecting RLS and Item ownership...');

    // 1. Check recent items
    const { data: items, error } = await supabase
        .from('items')
        .select('id, title, creator_id, author_email, type')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Error fetching items:', error.message);
    } else {
        console.log('Recent items:');
        items.forEach(item => {
            console.log(`- [${item.type}] ${item.title} (ID: ${item.id}) | Creator: ${item.creator_id} | Email: ${item.author_email}`);
        });
    }

    // 2. Try to see if there are any items with null fields that should be populated
    const { count: nullCreatorCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .is('creator_id', null);

    console.log(`Items with NULL creator_id: ${nullCreatorCount}`);
}

inspectRLS();
