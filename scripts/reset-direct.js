
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
    console.log("Starting reset...");
    // Fetch all IDs first to delete them specifically if global delete is blocked
    const { data: items } = await supabase.from('items').select('id');
    if (items && items.length > 0) {
        console.log(`Found ${items.length} items. Deleting...`);
        for (const item of items) {
            const { error } = await supabase.from('items').delete().eq('id', item.id);
            if (error) console.error(`Error deleting ${item.id}:`, error);
        }
        console.log("Cleanup finished.");
    } else {
        console.log("No items found.");
    }
}
run();
