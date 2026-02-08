import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanUserData() {
    console.log('🧹 Limpiando datos de usuario...\n');

    try {
        // Obtener comunidad Lo Prado
        const { data: community } = await supabase
            .from('communities')
            .select('id')
            .eq('slug', 'lo-prado')
            .single();

        if (!community) {
            console.log('❌ Comunidad Lo Prado no encontrada');
            return;
        }

        // Eliminar todos los items de la comunidad
        const { data: deletedItems, error: itemsError } = await supabase
            .from('items')
            .delete()
            .eq('community_id', community.id)
            .select();

        if (itemsError) {
            console.error('❌ Error eliminando items:', itemsError);
        } else {
            console.log(`✅ ${deletedItems?.length || 0} items eliminados`);
        }

        // Eliminar todas las alertas oficiales
        const { data: deletedAlerts, error: alertsError } = await supabase
            .from('official_alerts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todos
            .select();

        if (alertsError) {
            console.error('❌ Error eliminando alertas:', alertsError);
        } else {
            console.log(`✅ ${deletedAlerts?.length || 0} alertas oficiales eliminadas`);
        }

        // Eliminar datos del mapa de calor
        const { data: deletedActivity, error: activityError } = await supabase
            .from('activity_heatmap')
            .delete()
            .eq('community_id', community.id)
            .select();

        if (activityError) {
            console.error('❌ Error eliminando actividad:', activityError);
        } else {
            console.log(`✅ ${deletedActivity?.length || 0} puntos de actividad eliminados`);
        }

        console.log('\n✨ ¡Limpieza completada!\n');
        console.log('📊 Resumen:');
        console.log(`   - Items eliminados: ${deletedItems?.length || 0}`);
        console.log(`   - Alertas eliminadas: ${deletedAlerts?.length || 0}`);
        console.log(`   - Actividad eliminada: ${deletedActivity?.length || 0}`);

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

// Ejecutar limpieza
cleanUserData();
