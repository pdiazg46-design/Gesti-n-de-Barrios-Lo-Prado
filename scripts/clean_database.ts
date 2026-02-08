import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
    console.log('🧹 Iniciando limpieza de base de datos...\n');

    try {
        // 1. Limpiar items (reportes, clasificados, etc.)
        console.log('📦 Eliminando items (reportes, clasificados)...');
        const { error: itemsError, count: itemsCount } = await supabase
            .from('items')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Borrar todo

        if (itemsError) {
            console.error('❌ Error al eliminar items:', itemsError);
        } else {
            console.log(`✅ Items eliminados: ${itemsCount || 'todos'}\n`);
        }

        // 2. Limpiar alertas oficiales
        console.log('📢 Eliminando alertas oficiales...');
        const { error: alertsError, count: alertsCount } = await supabase
            .from('official_alerts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Borrar todo

        if (alertsError) {
            console.error('❌ Error al eliminar alertas:', alertsError);
        } else {
            console.log(`✅ Alertas eliminadas: ${alertsCount || 'todas'}\n`);
        }

        // 3. Verificar limpieza
        console.log('🔍 Verificando limpieza...');

        const { count: remainingItems } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true });

        const { count: remainingAlerts } = await supabase
            .from('official_alerts')
            .select('*', { count: 'exact', head: true });

        console.log(`\n📊 Estado final:`);
        console.log(`   Items restantes: ${remainingItems || 0}`);
        console.log(`   Alertas restantes: ${remainingAlerts || 0}`);

        if ((remainingItems || 0) === 0 && (remainingAlerts || 0) === 0) {
            console.log('\n✅ ¡Base de datos limpia! Lista para la demo en vivo.\n');
        } else {
            console.log('\n⚠️  Aún quedan algunos registros. Verifica manualmente.\n');
        }

    } catch (error) {
        console.error('❌ Error general:', error);
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
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
