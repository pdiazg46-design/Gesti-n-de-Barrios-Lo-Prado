const { createClient } = require('@supabase/supabase-js');

// Configuración directa de Supabase
const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAlertCreation() {
    console.log('🧪 Probando creación de alerta en Supabase...\n');

    try {
        // Intentar crear una alerta de prueba
        const testAlert = {
            title: 'TEST - Alerta de Prueba',
            message: 'Esta es una alerta de prueba para diagnosticar el error',
            alert_type: 'INFO',
            zone_geometry: JSON.stringify({
                type: 'Point',
                coordinates: [-70.7256, -33.4489],
                radius: 500
            }),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        console.log('📤 Enviando alerta de prueba:', testAlert);

        const { data, error } = await supabase
            .from('official_alerts')
            .insert(testAlert)
            .select()
            .single();

        if (error) {
            console.error('\n❌ ERROR al crear alerta:');
            console.error('   Código:', error.code);
            console.error('   Mensaje:', error.message);
            console.error('   Detalles:', error.details);
            console.error('   Hint:', error.hint);
            console.error('\n   Error completo:', JSON.stringify(error, null, 2));
        } else {
            console.log('\n✅ Alerta creada exitosamente:');
            console.log('   ID:', data.id);
            console.log('   Título:', data.title);
            console.log('   Tipo:', data.alert_type);
            console.log('\n   Datos completos:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('\n💥 Error fatal:', error.message || error);
        console.error('   Stack:', error.stack);
    }
}

// Ejecutar prueba
testAlertCreation()
    .then(() => {
        console.log('\n🏁 Prueba completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal en prueba:', error);
        process.exit(1);
    });
