const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
    console.log('Starting migration to add email column to profiles...');
    const { data, error } = await supabase.rpc('exec_sql', {
        sql_string: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;'
    });

    if (error) {
        if (error.message.includes('rpc') || error.message.includes('not found')) {
            console.log('RPC exec_sql not found, trying raw query if possible or alternative...');
            // If RPC fails, we'll try to just perform a dummy query to see if the column is there
            const { error: selectError } = await supabase.from('profiles').select('email').limit(1);
            if (selectError && selectError.message.includes('column "email" does not exist')) {
                console.error('CRITICAL: Cannot add "email" column via client. Please add it manually or provide a different way.');
            } else {
                console.log('Column "email" already exists or was added via other means.');
            }
        } else {
            console.error('Migration error:', error);
        }
    } else {
        console.log('Migration successful or column already present.');
    }

    // Backup: Update existing profiles with emails if we have them linked (metadata etc)
    // This is hard without a direct link, so we'll just rely on new logins to populate it.
}

migrate();
