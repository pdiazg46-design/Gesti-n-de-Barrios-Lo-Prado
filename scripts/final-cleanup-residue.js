const { createClient } = require('@supabase/supabase-js');

// Using confirmed working credentials for Lo Prado Demo
const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanResidue() {
    console.log("🧹 Limpiando registros de prueba persistentes...");

    const words = ['Prueba', 'Accidente', 'chocaron'];

    for (const word of words) {
        console.log(`- Buscando "${word}"...`);
        const { error } = await supabase
            .from('items')
            .delete()
            .ilike('title', `%${word}%`);

        if (error) console.error(`  ❌ Error: ${error.message}`);
        else console.log(`  ✅ Items con "${word}" eliminados.`);
    }

    // Also delete any with empty address to enforce the rule on old items
    const { error: addrError } = await supabase
        .from('items')
        .delete()
        .or('address.eq.,address.is.null')
        .eq('type', 'CIVIC_REPORT');

    if (addrError) console.error(`  ❌ Error limpiando sin dirección: ${addrError.message}`);
    else console.log(`  ✅ Items sin dirección eliminados.`);

    console.log("\n✨ Limpieza terminada.");
}

cleanResidue();
