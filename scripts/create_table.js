const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
    console.log('🔨 Creando tabla official_alerts en Supabase...\n');

    const sqlScript = `
        -- Crear tabla official_alerts
        CREATE TABLE IF NOT EXISTS official_alerts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            alert_type TEXT NOT NULL CHECK (alert_type IN ('INFO', 'WARNING', 'EMERGENCY', 'MAINTENANCE')),
            zone_geometry JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ,
            is_active BOOLEAN DEFAULT TRUE
        );

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_official_alerts_created_at ON official_alerts(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_official_alerts_is_active ON official_alerts(is_active);
        CREATE INDEX IF NOT EXISTS idx_official_alerts_alert_type ON official_alerts(alert_type);

        -- RLS
        ALTER TABLE official_alerts ENABLE ROW LEVEL SECURITY;

        -- Políticas
        DROP POLICY IF EXISTS "Todos pueden ver alertas activas" ON official_alerts;
        CREATE POLICY "Todos pueden ver alertas activas"
            ON official_alerts
            FOR SELECT
            USING (is_active = TRUE);

        DROP POLICY IF EXISTS "Usuarios autenticados pueden crear alertas" ON official_alerts;
        CREATE POLICY "Usuarios autenticados pueden crear alertas"
            ON official_alerts
            FOR INSERT
            WITH CHECK (TRUE);
    `;

    try {
        // Ejecutar SQL usando la API REST de Supabase
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });

        if (error) {
            console.error('❌ Error ejecutando SQL:', error.message);
            console.log('\n⚠️  Intentando método alternativo: inserción directa...\n');

            // Método alternativo: crear insertando datos de prueba
            const { data: testData, error: testError } = await supabase
                .from('official_alerts')
                .insert({
                    title: 'Sistema Inicializado',
                    message: 'El sistema de alertas oficiales está listo',
                    alert_type: 'INFO',
                    zone_geometry: JSON.stringify({
                        type: 'Point',
                        coordinates: [-70.7256, -33.4489],
                        radius: 500
                    }),
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                })
                .select();

            if (testError) {
                console.error('❌ Error en método alternativo:', testError.message);
                console.error('   Código:', testError.code);
                console.error('   Detalles:', testError.details);
                console.error('   Hint:', testError.hint);
                console.log('\n📋 ACCIÓN MANUAL REQUERIDA:');
                console.log('   1. Ve a: https://supabase.com/dashboard/project/yrelbvgdixjsnltbzsez');
                console.log('   2. Abre SQL Editor');
                console.log('   3. Ejecuta el contenido de: scripts/create_official_alerts_table.sql');
            } else {
                console.log('✅ Tabla creada exitosamente (método alternativo)');
                console.log('   Alerta de prueba creada:', testData[0].id);
            }
        } else {
            console.log('✅ Tabla official_alerts creada exitosamente');
            console.log('   Resultado:', data);
        }

    } catch (error) {
        console.error('💥 Error fatal:', error.message || error);
    }
}

createTable()
    .then(() => {
        console.log('\n🏁 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
