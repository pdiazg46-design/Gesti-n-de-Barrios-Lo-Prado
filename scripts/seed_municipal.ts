import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMunicipal() {
    console.log('🏛️ Iniciando seed de datos municipales...\n');

    try {
        // 1. Crear suscripción municipal de Lo Prado
        console.log('📋 Creando suscripción municipal...');
        const { data: muniSub, error: muniError } = await supabase
            .from('municipal_subscriptions')
            .upsert({
                muni_name: 'Ilustre Municipalidad de Lo Prado',
                slug: 'lo-prado',
                license_tier: 'PRO',
                active_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 año
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (muniError) {
            console.error('❌ Error creando suscripción municipal:', muniError);
            return;
        }

        console.log('✅ Suscripción municipal creada:', muniSub.muni_name);

        // 2. Crear datos de actividad para el mapa de calor
        console.log('\n🗺️ Creando datos de actividad para mapa de calor...');

        const { data: community } = await supabase
            .from('communities')
            .select('id')
            .eq('slug', 'lo-prado')
            .single();

        if (!community) {
            console.error('❌ Comunidad Lo Prado no encontrada. Ejecuta seed_demo.ts primero.');
            return;
        }

        // Generar puntos de actividad distribuidos por Lo Prado
        const activityPoints = [];
        const activityTypes = ['TRANS', 'ALRT', 'MSG'];

        // Coordenadas base de Lo Prado
        const baseLat = -33.4489;
        const baseLng = -70.7256;

        // Generar 50 puntos de actividad aleatorios pero realistas
        for (let i = 0; i < 50; i++) {
            activityPoints.push({
                community_id: community.id,
                activity_type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                lat: baseLat + (Math.random() - 0.5) * 0.02, // ~1km de dispersión
                lng: baseLng + (Math.random() - 0.5) * 0.02
            });
        }

        const { data: activity, error: activityError } = await supabase
            .from('activity_heatmap')
            .insert(activityPoints)
            .select();

        if (activityError) {
            console.error('❌ Error creando datos de actividad:', activityError);
        } else {
            console.log(`✅ ${activity.length} puntos de actividad creados para mapa de calor`);
        }

        console.log('\n✨ ¡Seed municipal completado exitosamente!\n');
        console.log('📊 Resumen:');
        console.log(`   - Suscripción: ${muniSub.muni_name}`);
        console.log(`   - Tier: ${muniSub.license_tier}`);
        console.log(`   - Puntos de actividad: ${activity?.length || 0}`);

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

// Ejecutar seed
seedMunicipal();
