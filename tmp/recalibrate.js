const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function syncVipUses() {
    console.log("Iniciando sincronización de VIP Codes...");
    
    // Traer todos los códigos VIP
    const { data: codes, error: codesError } = await supabaseAdmin.from('vip_codes').select('*');
    if (codesError) return console.error("Error trayendo códigos:", codesError);
    
    console.log(`Encontrados ${codes.length} códigos VIP.`);

    // Traer perfiles
    const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('id, used_vip_code');
    if (pError) return console.error("Error trayendo perfiles:", pError);

    let updated = 0;
    for (const code of codes) {
        // Contar cuantos perfiles tienen este exacto código
        const usersInCode = profiles.filter(p => p.used_vip_code === code.code);
        const actualUses = usersInCode.length;

        if (code.current_uses !== actualUses) {
            console.log(`- Recalibrando ${code.code}: Tenía ${code.current_uses}, pero realmente tiene ${actualUses} usuarios.`);
            
            await supabaseAdmin.from('vip_codes').update({
                current_uses: actualUses,
                is_active: actualUses < code.max_uses
            }).eq('id', code.id);
            updated++;
        } else if (code.is_active !== (actualUses < code.max_uses)) {
            // Arreglar casos donde está agotado pero is_active false (o viceversa)
            console.log(`- Arreglando ${code.code}: is_active estaba en ${code.is_active} pero usos son ${actualUses}/${code.max_uses}.`);
            await supabaseAdmin.from('vip_codes').update({
                is_active: actualUses < code.max_uses
            }).eq('id', code.id);
        }
    }

    console.log(`Sincronización terminada. ${updated} códigos corregidos.`);
}

syncVipUses();
