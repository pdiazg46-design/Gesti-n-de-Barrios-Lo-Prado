
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://vscpxvovzsqtahkxtqic.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzY3B4dm92enNxdGFoa3h0cWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYwOTY2MSwiZXhwIjoyMDU0MTg1NjYxfQ.p_HwD9-98XbCkARLE6XBKft751VBCJjXvV44I6MvH6s";
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log("🚀 Starting Nuclear Reset (Direct SQL Bypass)...");
    const { data: items, error: fetchError } = await supabase.from('items').select('id, title');

    if (fetchError) {
        console.error("❌ Error fetching items:", fetchError);
        return;
    }

    if (!items || items.length === 0) {
        console.log("✅ No items found. Database is already clean.");
        return;
    }

    console.log(`🔍 Found ${items.length} items to delete.`);

    for (const item of items) {
        const { error: deleteError } = await supabase.from('items').delete().eq('id', item.id);
        if (deleteError) {
            console.error(`❌ Failed to delete ${item.id} (${item.title}):`, deleteError);
        } else {
            console.log(`✅ Deleted: ${item.title}`);
        }
    }

    console.log("✨ Reset Finished.");
}
run();
