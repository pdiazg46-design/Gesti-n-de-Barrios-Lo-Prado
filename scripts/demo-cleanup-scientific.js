
const { createClient } = require('@supabase/supabase-js');

// Scientific Demo Cleanup Script
// Using credentials from .env.local: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
    console.log("🚀 Starting Scientific Demo Cleanup...");
    console.log(`📍 Targeting: ${supabaseUrl}`);

    // 1. Delete all items (Reports, Alerts, etc.)
    console.log("🧹 Clearing 'items' table...");
    const { error: itemsError } = await supabase
        .from('items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (itemsError) {
        console.error("❌ Error clearing items:", itemsError.message);
    } else {
        console.log("✅ Table 'items' cleared.");
    }

    // 2. Optional: Check for other tables if needed
    // For now, only items as per screenshot "REPORTE CÍVICO"

    console.log("\n✨ Cleanup Complete. The demo environment is now clean.");
}

cleanDatabase();
