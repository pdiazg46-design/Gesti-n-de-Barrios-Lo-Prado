import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Coordenadas reales de Lo Prado, Santiago
const LO_PRADO_COORDS = {
    center: { lat: -33.4489, lng: -70.7256 },
    // Puntos de referencia reales en Lo Prado
    locations: [
        { name: 'Plaza Lo Prado', lat: -33.4489, lng: -70.7256 },
        { name: 'Av. San Pablo 5000', lat: -33.4456, lng: -70.7289 },
        { name: 'Calle Las Torres', lat: -33.4512, lng: -70.7234 },
        { name: 'Dinamarca esquina Las Torres', lat: -33.4571, lng: -70.7106 },
        { name: 'Pasaje Los Aromos', lat: -33.4423, lng: -70.7198 },
        { name: 'Calle Los Plátanos', lat: -33.4501, lng: -70.7287 },
        { name: 'Sector Norte Lo Prado', lat: -33.4389, lng: -70.7312 },
        { name: 'Parque Lo Prado', lat: -33.4534, lng: -70.7245 },
        { name: 'Av. Portales', lat: -33.4467, lng: -70.7201 },
        { name: 'Calle Blanqueado', lat: -33.4445, lng: -70.7278 }
    ]
};

async function seedDemo() {
    console.log('🌱 Iniciando seed de datos de demo para Lo Prado...\n');

    try {
        // 1. Crear comunidad Lo Prado
        console.log('📍 Creando comunidad Lo Prado...');
        const { data: community, error: communityError } = await supabase
            .from('communities')
            .upsert({
                slug: 'lo-prado',
                name: 'Lo Prado',
                description: 'Comuna de Lo Prado, Santiago de Chile',
                lat: LO_PRADO_COORDS.center.lat,
                lng: LO_PRADO_COORDS.center.lng
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (communityError) {
            console.error('❌ Error creando comunidad:', communityError);
            return;
        }

        console.log('✅ Comunidad creada:', community.name);
        const communityId = community.id;

        // 2. Crear Reportes Cívicos
        console.log('\n🚨 Creando reportes cívicos...');
        const civicReports = [
            {
                community_id: communityId,
                title: 'Luminaria apagada',
                description: 'Poste de luz sin funcionamiento desde hace 3 días. Zona muy oscura en la noche.',
                type: 'REPORT',
                category: 'Alumbrado Público',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[3].lat, // Dinamarca esquina Las Torres
                lng: LO_PRADO_COORDS.locations[3].lng
            },
            {
                community_id: communityId,
                title: 'Bache peligroso',
                description: 'Hoyo grande en la calzada que puede dañar vehículos. Urgente reparación.',
                type: 'REPORT',
                category: 'Vías y Calles',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[1].lat, // Av. San Pablo
                lng: LO_PRADO_COORDS.locations[1].lng
            },
            {
                community_id: communityId,
                title: 'Basural ilegal',
                description: 'Acumulación de escombros y basura en pasaje. Necesita retiro urgente.',
                type: 'REPORT',
                category: 'Aseo y Ornato',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[4].lat, // Pasaje Los Aromos
                lng: LO_PRADO_COORDS.locations[4].lng
            },
            {
                community_id: communityId,
                title: 'Fuga de agua',
                description: 'Pérdida de agua en la vereda. Se está desperdiciando mucha agua potable.',
                type: 'REPORT',
                category: 'Agua Potable',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[5].lat, // Calle Los Plátanos
                lng: LO_PRADO_COORDS.locations[5].lng
            },
            {
                community_id: communityId,
                title: 'Árbol caído',
                description: 'Árbol cayó con el viento y está bloqueando parcialmente la vereda.',
                type: 'REPORT',
                category: 'Áreas Verdes',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[0].lat, // Plaza Lo Prado
                lng: LO_PRADO_COORDS.locations[0].lng
            }
        ];

        const { data: reports, error: reportsError } = await supabase
            .from('items')
            .insert(civicReports)
            .select();

        if (reportsError) {
            console.error('❌ Error creando reportes:', reportsError);
        } else {
            console.log(`✅ ${reports.length} reportes cívicos creados`);
        }

        // 3. Crear Items de Economía Circular
        console.log('\n💰 Creando items de economía circular...');
        const circularItems = [
            {
                community_id: communityId,
                title: 'Bicicleta infantil',
                description: 'Bicicleta rodado 16 en buen estado. Mi hijo ya creció. ¡Gratis para quien la necesite!',
                type: 'GIFT',
                category: 'Deportes',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[7].lat, // Parque Lo Prado
                lng: LO_PRADO_COORDS.locations[7].lng
            },
            {
                community_id: communityId,
                title: 'Muebles de cocina',
                description: 'Mueble bajo mesón con lavaplatos. Buen estado, solo cambio de cocina.',
                type: 'SALE',
                category: 'Hogar',
                status: 'AVAILABLE',
                price: 50000,
                lat: LO_PRADO_COORDS.locations[8].lat, // Av. Portales
                lng: LO_PRADO_COORDS.locations[8].lng
            },
            {
                community_id: communityId,
                title: 'Gasfitería a domicilio',
                description: 'Gasfiter profesional. Reparaciones, instalaciones, destapes. Presupuesto sin compromiso.',
                type: 'SERVICE',
                category: 'Servicios',
                status: 'AVAILABLE',
                price: 15000,
                lat: LO_PRADO_COORDS.locations[2].lat, // Calle Las Torres
                lng: LO_PRADO_COORDS.locations[2].lng
            },
            {
                community_id: communityId,
                title: 'Ropa de niño talla 4-6',
                description: 'Lote de ropa de niño en excelente estado. Pantalones, poleras, chaquetas.',
                type: 'GIFT',
                category: 'Ropa',
                status: 'AVAILABLE',
                price: 0,
                lat: LO_PRADO_COORDS.locations[9].lat, // Calle Blanqueado
                lng: LO_PRADO_COORDS.locations[9].lng
            },
            {
                community_id: communityId,
                title: 'Refrigerador usado',
                description: 'Refrigerador Fensa 250 litros. Funciona perfecto, 5 años de uso.',
                type: 'SALE',
                category: 'Electrodomésticos',
                status: 'AVAILABLE',
                price: 80000,
                lat: LO_PRADO_COORDS.locations[6].lat, // Sector Norte
                lng: LO_PRADO_COORDS.locations[6].lng
            },
            {
                community_id: communityId,
                title: 'Clases de guitarra',
                description: 'Profesor de guitarra ofrece clases particulares. Todos los niveles. Primera clase gratis.',
                type: 'SERVICE',
                category: 'Educación',
                status: 'AVAILABLE',
                price: 10000,
                lat: LO_PRADO_COORDS.locations[0].lat, // Plaza Lo Prado
                lng: LO_PRADO_COORDS.locations[0].lng
            }
        ];

        const { data: circular, error: circularError } = await supabase
            .from('items')
            .insert(circularItems)
            .select();

        if (circularError) {
            console.error('❌ Error creando items circulares:', circularError);
        } else {
            console.log(`✅ ${circular.length} items de economía circular creados`);
        }

        // 4. Crear Alertas Oficiales
        console.log('\n📢 Creando alertas oficiales...');
        const officialAlerts = [
            {
                title: 'Operativo Retiro de Escombros',
                message: 'Este sábado desde las 08:00 hrs pasará el camión recolector por calle Las Torres y sectores aledaños. Por favor dejar escombros en la vereda.',
                alert_type: 'PUBLIC_SERVICE',
                zone_geometry: JSON.stringify({
                    type: 'Point',
                    coordinates: [LO_PRADO_COORDS.locations[2].lng, LO_PRADO_COORDS.locations[2].lat],
                    radius: 500
                }),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
            },
            {
                title: 'Feria de Emprendedores',
                message: 'Este domingo en Plaza Lo Prado se realizará la Feria de Emprendedores Locales de 10:00 a 18:00 hrs. ¡Los esperamos!',
                alert_type: 'EVENT',
                zone_geometry: JSON.stringify({
                    type: 'Point',
                    coordinates: [LO_PRADO_COORDS.locations[0].lng, LO_PRADO_COORDS.locations[0].lat],
                    radius: 800
                }),
                expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 días
            },
            {
                title: 'Corte de Agua Programado',
                message: 'Mañana entre 09:00 y 14:00 hrs habrá corte de agua en sector norte de Lo Prado por trabajos de mantención. Aguas Andinas.',
                alert_type: 'EMERGENCY',
                zone_geometry: JSON.stringify({
                    type: 'Point',
                    coordinates: [LO_PRADO_COORDS.locations[6].lng, LO_PRADO_COORDS.locations[6].lat],
                    radius: 1000
                }),
                expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 días
            }
        ];

        const { data: alerts, error: alertsError } = await supabase
            .from('official_alerts')
            .insert(officialAlerts)
            .select();

        if (alertsError) {
            console.error('❌ Error creando alertas:', alertsError);
        } else {
            console.log(`✅ ${alerts.length} alertas oficiales creadas`);
        }

        console.log('\n✨ ¡Seed completado exitosamente!\n');
        console.log('📊 Resumen:');
        console.log(`   - Comunidad: Lo Prado`);
        console.log(`   - Reportes cívicos: ${reports?.length || 0}`);
        console.log(`   - Economía circular: ${circular?.length || 0}`);
        console.log(`   - Alertas oficiales: ${alerts?.length || 0}`);
        console.log(`   - Total items: ${(reports?.length || 0) + (circular?.length || 0)}`);

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

// Ejecutar seed
seedDemo();
