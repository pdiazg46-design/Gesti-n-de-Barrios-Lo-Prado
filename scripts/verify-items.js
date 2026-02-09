
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://vscpxvovzsqtahkxtqic.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzY3B4dm92enNxdGFoa3h0cWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYwOTY2MSwiZXhwIjoyMDU0MTg1NjYxfQ.p_HwD9-98XbCkARLE6XBKft751VBCJjXvV44I6MvH6s";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking database items...");
    const { data, error } = await supabase.from('items').select('id, title, author_email, type');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${data.length} items total.`);
        data.forEach(item => {
            console.log(`[${item.type}] ID: ${item.id} | Title: ${item.title} | Author: ${item.author_email}`);
        });
    }
}
check();
