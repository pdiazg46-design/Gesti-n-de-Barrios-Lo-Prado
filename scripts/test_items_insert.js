const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
    console.log('🧪 Probando inserción en tabla items...\n');

    // Primero, ver estructura de la tabla
    const { data: existingData, error: selectError } = await supabase
        .from('items')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error('❌ Error al leer items:', selectError.message);
        return;
    }

    if (existingData && existingData.length > 0) {
        console.log('📋 Columnas existentes en items:');
        console.log(Object.keys(existingData[0]));
        console.log('\n📄 Ejemplo de item:', JSON.stringify(existingData[0], null, 2));
    }

    // Intentar insertar alerta oficial
    console.log('\n📤 Intentando insertar alerta oficial...\n');

    const testAlert = {
        title: 'Choque de camiones',
        description: 'máximo cuidado a los vecinos. liquidos peligroso.',
        type: 'OFFICIAL_ALERT',
        category: 'EMERGENCY',
        lat: -33.4489,
        lng: -70.7256,
        metadata: JSON.stringify({
            alert_type: 'EMERGENCY',
            radius: 100,
            is_official: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }),
        status: 'ACTIVE',
        author_email: 'municipalidad@loprado.cl'
    };

    console.log('Datos a insertar:', JSON.stringify(testAlert, null, 2));

    const { data, error } = await supabase
        .from('items')
        .insert(testAlert)
        .select()
        .single();

    if (error) {
        console.error('\n❌ ERROR al insertar:');
        console.error('   Mensaje:', error.message);
        console.error('   Código:', error.code);
        console.error('   Detalles:', error.details);
        console.error('   Hint:', error.hint);
    } else {
        console.log('\n✅ Alerta creada exitosamente:');
        console.log('   ID:', data.id);
        console.log('   Título:', data.title);
        console.log('\n   Datos completos:', JSON.stringify(data, null, 2));
    }
}

testInsert()
    .then(() => {
        console.log('\n🏁 Prueba completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
