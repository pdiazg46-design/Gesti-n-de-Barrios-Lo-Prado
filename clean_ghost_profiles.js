const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanGhosts() {
    console.log("🕵️ Buscando perfiles fantasmas en la base de datos...");
    
    // 1. Obtener todos los usuarios reales de Auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const validIds = users.map(u => u.id);
    console.log(`✅ Se encontraron ${validIds.length} usuarios reales autenticados en auth.users.`);

    // 2. Obtener todos los perfiles de la tabla pública (sin la columna email que no existe)
    const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('id, full_name');
    if (profError) throw profError;

    console.log(`🔍 Se encontraron ${profiles.length} perfiles en la tabla public.profiles.`);

    let ghostsDeleted = 0;

    // 3. Cruzar y eliminar los que no existen en Auth
    for (const profile of profiles) {
        if (!validIds.includes(profile.id)) {
            console.log(`👻 GHOST DETECTADO: ${profile.full_name || 'Desconocido'} - ID: ${profile.id}. ELIMINANDO...`);
            
            // Delete profile
            const { error: delError } = await supabaseAdmin.from('profiles').delete().eq('id', profile.id);
            if (delError) {
                console.error(`❌ Error borrando al fantasma ${profile.id}:`, delError.message);
            } else {
                ghostsDeleted++;
            }
        }
    }

    console.log(`\n🎉 Limpieza de fantasmas completa. Se eliminaron ${ghostsDeleted} perfiles huérfanos.`);
    
    console.log(`\n🔄 Reseteando Célula UV19-S1 a cero...`);
    // 4. Resetear la célula S1 a 0
    const { error: resetError } = await supabaseAdmin.from('vip_codes').update({
        current_uses: 0,
        is_active: true
    }).eq('code', 'UV19-S1');
    
    if (resetError) {
        console.error("❌ Error reseteando célula:", resetError.message);
    } else {
        console.log("✅ Célula UV19-S1 reseteada con éxito a 0/2 usos.");
    }
}

cleanGhosts().catch(console.error);
