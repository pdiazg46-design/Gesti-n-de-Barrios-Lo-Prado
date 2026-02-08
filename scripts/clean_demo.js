const { createClient } = require('@supabase/supabase-js');

// Configuración directa de Supabase
const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
    console.log('🧹 Iniciando limpieza COMPLETA de base de datos...\n');
    console.log('⚠️  Esto eliminará TODOS los datos de prueba\n');

    try {
        // 1. Limpiar items (reportes cívicos, clasificados, etc.)
        console.log('📦 Eliminando items (reportes cívicos, clasificados)...');
        const { error: itemsError, data: itemsData } = await supabase
            .from('items')
            .delete()
            .gte('created_at', '1900-01-01');

        if (itemsError) {
            console.error('❌ Error al eliminar items:', itemsError.message);
        } else {
            console.log(`✅ Items eliminados\n`);
        }

        // 2. Limpiar alertas oficiales (El Megáfono + datos del mapa de calor)
        console.log('📢 Eliminando alertas oficiales (El Megáfono)...');
        const { error: alertsError, data: alertsData } = await supabase
            .from('official_alerts')
            .delete()
            .gte('created_at', '1900-01-01');

        if (alertsError) {
            console.error('❌ Error al eliminar alertas:', alertsError.message);
        } else {
            console.log(`✅ Alertas oficiales eliminadas\n`);
        }

        // 3. Verificar limpieza
        console.log('🔍 Verificando limpieza...\n');

        const { count: remainingItems } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true });

        const { count: remainingAlerts } = await supabase
            .from('official_alerts')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Estado final:`);
        console.log(`   Items (reportes cívicos): ${remainingItems || 0}`);
        console.log(`   Alertas oficiales: ${remainingAlerts || 0}`);

        const totalRemaining = (remainingItems || 0) + (remainingAlerts || 0);

        if (totalRemaining === 0) {
            console.log('\n✅ ¡Base de datos LIMPIA! Lista para la demo en vivo.\n');
            console.log('🎯 Ahora puedes:');
            console.log('   1. Crear alertas oficiales en tiempo real desde El Megáfono');
            console.log('   2. Recibir reportes cívicos de vecinos desde Buzón Ciudadano');
            console.log('   3. Ver el Mapa de Calor actualizarse en vivo con los reportes\n');
        } else {
            console.log(`\n⚠️  Aún quedan ${totalRemaining} registros.\n`);
        }

    } catch (error) {
        console.error('❌ Error general:', error.message || error);
        process.exit(1);
    }
}

// Ejecutar limpieza
cleanDatabase()
    .then(() => {
        console.log('🎉 Limpieza completada exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error.message || error);
        process.exit(1);
    });
