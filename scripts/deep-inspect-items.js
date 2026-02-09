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

async function inspectDeep() {
    console.log('--- DB POLICIES ---');
    // We can query the pg_policies table using the service role check
    const { data: policies, error: polError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'items' });

    // If RPC doesn't exist (likely), we try a raw query if we have an endpoint, 
    // but usually we don't. Let's try to query pg_policies via a regular select if possible 
    // (unlikely to be exposed via postgrest).

    // Let's stick to checking the items and their emails meticulously.
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('Recent Items Deep Check:');
    items?.forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Title: ${item.title}`);
        console.log(`Creator ID: ${item.creator_id}`);
        console.log(`Author Email: "${item.author_email}"`);
        console.log('---');
    });
}

inspectDeep();
