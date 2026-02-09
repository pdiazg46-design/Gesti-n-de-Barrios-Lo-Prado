const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSystemProfile() {
    const systemId = '00000000-0000-0000-0000-000000000000';
    console.log(`🔍 Checking system profile ${systemId}...`);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', systemId)
        .single();

    if (error) {
        console.error('❌ Profile not found or error:', error.message);
    } else {
        console.log('✅ System profile exists:', data);
    }
}

checkSystemProfile();
