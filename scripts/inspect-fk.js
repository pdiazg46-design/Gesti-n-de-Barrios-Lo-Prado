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

async function inspectFK() {
    console.log('🔍 Inspecting FK constraint "items_creator_id_fkey"...');

    // We can query information_schema or pg_constraint
    const { data, error } = await supabase.rpc('inspect_fk', { constraint_name: 'items_creator_id_fkey' });

    if (error) {
        // Fallback: use an SQL query via a simple SELECT if RPC doesn't exist
        console.log('RPC inspect_fk not found, trying raw query via pg_catalog (if accessible)...');
        const query = `
            SELECT
                tc.table_schema, 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.constraint_name = 'items_creator_id_fkey';
        `;

        // Unfortunately, standard Supabase JS client doesn't allow raw SQL unless there's an RPC.
        // I'll try to use a different approach: verify if the profile is truly there with a count.
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', '00000000-0000-0000-0000-000000000000');

        console.log(`Presence of system profile: ${count !== null ? 'FOUND (count: ' + count + ')' : 'NOT FOUND'}`);
        if (countError) console.error('Count Error:', countError.message);
    } else {
        console.log('FK Definition:', data);
    }
}

inspectFK();
