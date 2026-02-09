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

async function checkRLS() {
    console.log('🔍 Checking RLS Policies on "items"...');

    // Supabase JS client cannot directly query pg_policies easily without a custom function,
    // but we can try to "probe" it.

    // Instead, let's look at the items one more time and check for EXACT data.
    const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${items.length} items.`);
    items.forEach(item => {
        console.log(`[${item.id}] [${item.type}] "${item.title}" | Creator: ${item.creator_id} | Email: ${item.author_email} | Created: ${item.created_at}`);
    });
}

checkRLS();
