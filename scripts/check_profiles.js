const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Perfiles restantes: ${data.length}`);
    data.forEach(p => console.log(`- ${p.id} | ${p.name} | ${p.email}`));
}

check();
