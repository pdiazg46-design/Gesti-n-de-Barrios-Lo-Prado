
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://vscpxvovzsqtahkxtqic.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzY3B4dm92enNxdGFoa3h0cWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYwOTY2MSwiZXhwIjoyMDU0MTg1NjYxfQ.p_HwD9-98XbCkARLE6XBKft751VBCJjXvV44I6MvH6s";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('items').select('title, author_email, created_at');
    if (error) console.error(error);
    else {
        console.log(`Found ${data.length} items:`);
        data.forEach(i => console.log(`- ${i.title} (${i.author_email}) [${i.created_at}]`));
    }
}
check();
