const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyClean() {
    console.log("🧐 Verificando base de datos...");
    const { data, error } = await supabase
        .from('items')
        .select('id, title, type')
        .ilike('title', '%Prueba%');

    if (error) console.error("Error:", error);
    else console.log(`Items encontrados: ${data.length}`);

    const { data: accidents } = await supabase
        .from('items')
        .select('id, title')
        .ilike('title', '%Accidente%');

    console.log(`Accidentes encontrados: ${accidents.length}`);
}

verifyClean();
