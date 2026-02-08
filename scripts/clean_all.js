const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
    console.log('🧹 Iniciando limpieza COMPLETA de base de datos...\n');
    console.log('⚠️  Esto eliminará TODOS los datos de prueba\n');

    try {
        // 1. Limpiar items (reportes cívicos, clasificados, etc.)
        console.log('📦 Eliminando items (reportes, clasificados)...');
        const { error: itemsError } = await supabase
            .from('items')
            .delete()
            .gte('created_at', '1900-01-01'); // Borrar todo

        if (itemsError) {
            console.error('❌ Error al eliminar items:', itemsError.message);
        } else {
            console.log(`✅ Items eliminados\n`);
        }

        // 2. Limpiar alertas oficiales (El Megáfono)
        console.log('📢 Eliminando alertas oficiales (El Megáfono)...');
        const { error: alertsError } = await supabase
            .from('official_alerts')
            .delete()
            .gte('created_at', '1900-01-01'); // Borrar todo

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
        console.log(`   Items (reportes): ${remainingItems || 0}`);
        console.log(`   Alertas oficiales: ${remainingAlerts || 0}`);

        const totalRemaining = (remainingItems || 0) + (remainingAlerts || 0);

        if (totalRemaining === 0) {
            console.log('\n✅ ¡Base de datos LIMPIA! Lista para la demo en vivo.\n');
            console.log('🎯 Ahora puedes:');
            console.log('   1. Crear alertas oficiales en tiempo real');
            console.log('   2. Recibir reportes cívicos de vecinos');
            console.log('   3. Ver el mapa de calor actualizarse en vivo\n');
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
