const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase URL or Service Role Key missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrueba() {
    console.log('🔍 Buscando "Prueba 2" en la base de datos...');
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .ilike('title', '%Prueba 2%');

    if (error) {
        console.error('❌ Error fetching:', error);
    } else {
        console.log(`✅ Resultado: Encontrados ${data.length} items.`);
        data.forEach(item => {
            console.log(`- ID: ${item.id} | Título: ${item.title} | Status: ${item.status} | Creado: ${item.created_at}`);
        });
    }
}

checkPrueba();
