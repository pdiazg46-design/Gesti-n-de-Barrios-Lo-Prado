const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepSearch() {
    console.log("🕵️ Deep Search in progress...");

    // List of tables from our schema exploration
    const tables = ['items', 'official_alerts', 'government_admins', 'municipal_subscriptions', 'activity_heatmap', 'communities'];

    for (const table of tables) {
        console.log(`Checking table: ${table}`);
        const { data, error } = await supabase.from(table).select('*').limit(10);

        if (error) {
            console.error(`- Error in ${table}: ${error.message}`);
            continue;
        }

        if (data && data.length > 0) {
            console.log(`- Data found in ${table}:`, JSON.stringify(data).substring(0, 500));
            const found = data.some(row => JSON.stringify(row).includes("Prueba") || JSON.stringify(row).includes("Accidente"));
            if (found) {
                console.log(`🚀 FOUND IT IN TABLE: ${table}`);
            }
        } else {
            console.log(`- Table ${table} is empty.`);
        }
    }
}

deepSearch();
