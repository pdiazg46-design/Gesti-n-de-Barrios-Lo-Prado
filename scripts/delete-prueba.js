const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePrueba() {
    console.log('🗑️ Eliminando "Prueba 2" de la base de datos...');
    const { data, error } = await supabase
        .from('items')
        .delete()
        .ilike('title', '%Prueba 2%');

    if (error) {
        console.error('❌ Error deleting:', error);
    } else {
        console.log('✅ Eliminación completada.');
    }
}

deletePrueba();
