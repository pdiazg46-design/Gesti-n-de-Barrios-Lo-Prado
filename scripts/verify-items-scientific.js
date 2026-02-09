
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("🔍 Checking items on CORRECT database...");
    const { data, error } = await supabase.from('items').select('id, title, author_email, type');
    if (error) {
        console.error("❌ Error:", error.message);
    } else {
        console.log(`✅ Found ${data.length} items total.`);
        data.forEach(item => {
            console.log(`[${item.type}] ID: ${item.id} | Title: ${item.title} | Author: ${item.author_email}`);
        });
        if (data.length === 0) {
            console.log("✨ Database is CLEAN.");
        }
    }
}
check();
