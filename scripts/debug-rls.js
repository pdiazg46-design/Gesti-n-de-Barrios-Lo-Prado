const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRLS() {
    console.log('🔍 Inspecting RLS policies for table "items"...');
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'items' });

    // Note: get_policies is not a standard RPC, I might need to query pg_policies directly
    // Let's try to query pg_policies using a raw SQL if possible, or just try a trial delete with service role vs anon.

    const { data: policies, error: polError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'items');

    if (polError) {
        console.log('⚠️ Could not query pg_policies directly. Trying alternative inspection...');
        // Let's try to see if we can at least see why delete fails from a client perspective
    } else {
        console.log('✅ Current Policies:', policies);
    }
}

async function debugDelete() {
    console.log('🧪 Testing DELETE permission...');
    // We'll try to delete a non-existent item to see the permission error
    const { error, status } = await supabase
        .from('items')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');

    console.log(`Delete attempt status: ${status}`);
    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ No permission error (or item not found with permission).');
    }
}

debugDelete();
