const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySetup() {
    console.log('🔍 Verificando configuración de base de datos...\n');

    let allGood = true;

    // 1. Verificar tabla communities
    console.log('📋 Verificando tabla communities...');
    const { data: communities, error: commError } = await supabase
        .from('communities')
        .select('*')
        .limit(1);

    if (commError) {
        console.error('   ❌ Error:', commError.message);
        allGood = false;
    } else {
        console.log('   ✅ Tabla communities existe');
        if (communities && communities.length > 0) {
            console.log('   ✅ Comunidad encontrada:', communities[0].name);
        }
    }

    // 2. Verificar tabla profiles
    console.log('\n📋 Verificando tabla profiles...');
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profError) {
        console.error('   ❌ Error:', profError.message);
        allGood = false;
    } else {
        console.log('   ✅ Tabla profiles existe');
    }

    // 3. Verificar tabla items
    console.log('\n📋 Verificando tabla items...');
    const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .limit(1);

    if (itemsError) {
        console.error('   ❌ Error:', itemsError.message);
        allGood = false;
    } else {
        console.log('   ✅ Tabla items existe');
        if (items && items.length > 0) {
            console.log('   📊 Columnas:', Object.keys(items[0]).join(', '));
        }
    }

    // 4. Probar inserción de alerta oficial
    console.log('\n🧪 Probando inserción de alerta oficial...');
    const { data: testAlert, error: alertError } = await supabase
        .from('items')
        .insert({
            title: 'TEST - Verificación del Sistema',
            description: 'Esta es una alerta de prueba para verificar que todo funciona',
            type: 'OFFICIAL_ALERT',
            category: 'INFO',
            lat: -33.4489,
            lng: -70.7256,
            metadata: JSON.stringify({
                alert_type: 'INFO',
                radius: 500,
                is_official: true,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }),
            status: 'ACTIVE',
            author_email: 'municipalidad@loprado.cl'
        })
        .select()
        .single();

    if (alertError) {
        console.error('   ❌ Error al insertar:', alertError.message);
        allGood = false;
    } else {
        console.log('   ✅ Alerta de prueba creada exitosamente');
        console.log('   📝 ID:', testAlert.id);

        // Limpiar alerta de prueba
        await supabase.from('items').delete().eq('id', testAlert.id);
        console.log('   🧹 Alerta de prueba eliminada');
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    if (allGood) {
        console.log('✅ ¡TODO ESTÁ CORRECTO!');
        console.log('   La base de datos está lista para la demo.');
        console.log('   Puedes enviar alertas oficiales desde El Megáfono.');
    } else {
        console.log('❌ HAY PROBLEMAS');
        console.log('   Revisa los errores arriba.');
        console.log('   Asegúrate de haber ejecutado SETUP_COMPLETE.sql en Supabase.');
    }
    console.log('='.repeat(50) + '\n');
}

verifySetup()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
