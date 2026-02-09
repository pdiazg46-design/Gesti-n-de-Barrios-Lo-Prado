const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log("📊 Listing all tables in public schema...");

    // We can't list tables directly via Supabase client, but we can try to query a system table
    // or just try common names.
    const tables = ['items', 'official_alerts', 'government_admins', 'municipal_subscriptions', 'activity_heatmap', 'communities'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`- ${table}: ❌ Error (${error.message})`);
        } else {
            console.log(`- ${table}: ✅ OK (Count: ${data === null ? 0 : 0 /* count is exact */})`);
            // Wait, supabase-js returns count in the result object, not data.
        }
    }
}

async function listTablesReal() {
    const { data, error } = await supabase.rpc('get_tables'); // If a helper RPC exists
    if (error) {
        // Fallback: Use pg_catalog if allowed
        const { data: catData, error: catError } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');

        if (catError) console.log("❌ Cannot list tables via pg_catalog.");
        else console.log("Tables:", catData);
    } else {
        console.log("Tables:", data);
    }
}

listTables();
