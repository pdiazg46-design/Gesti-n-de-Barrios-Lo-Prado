const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSystemProfile() {
    console.log('🔧 Creando perfil de sistema para alertas oficiales...\n');

    try {
        // Insertar perfil de sistema
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: '00000000-0000-0000-0000-000000000000',
                full_name: 'Sistema Municipal Lo Prado',
                avatar_url: 'https://via.placeholder.com/150?text=Municipalidad',
                karma_pts: 0
            }, {
                onConflict: 'id'
            })
            .select();

        if (error) {
            console.error('❌ Error creando perfil de sistema:', error);
            return;
        }

        console.log('✅ Perfil de sistema creado exitosamente:');
        console.log(data);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createSystemProfile();
