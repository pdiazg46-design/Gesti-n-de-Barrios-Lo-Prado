const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
    console.log('🚀 Aplicando fix de RLS y limpieza...');

    // 1. Delete "Prueba 2" with Service Role (Bypass RLS)
    console.log('🗑️ Eliminando items con título "Prueba 2"...');
    const { data: delData, error: delError } = await supabase
        .from('items')
        .delete()
        .ilike('title', '%Prueba 2%');

    if (delError) console.error('❌ Error al eliminar Prueba 2:', delError);
    else console.log('✅ Prueba 2 eliminada (si existía).');

    // 2. Clear all items for a fresh start if user wants (optional, but let's just do Prueba 2 for now as requested)

    // 3. Try to apply SQL via RPC if enabled, or tell the user to run it in Supabase Dashboard
    console.log('📢 Por favor, ejecuta el contenido de "scripts/fix_rls_delete.sql" en el SQL Editor de tu Supabase Dashboard para habilitar la eliminación desde la app.');
}

runFix();
