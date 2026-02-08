const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('Verificando esquema de official_alerts...\n');

    // Intentar obtener una fila para ver la estructura
    const { data, error } = await supabase
        .from('official_alerts')
        .select('*')
        .limit(1);

    if (error) {
        console.error('ERROR:', error.message);
        console.error('Código:', error.code);
        console.error('Detalles:', error.details);
    } else {
        console.log('Estructura de la tabla:');
        if (data && data.length > 0) {
            console.log('Columnas:', Object.keys(data[0]));
        } else {
            console.log('Tabla vacía, intentando insertar...');

            // Intentar con campos mínimos
            const { data: insertData, error: insertError } = await supabase
                .from('official_alerts')
                .insert({
                    title: 'Test',
                    message: 'Test message',
                    alert_type: 'INFO'
                })
                .select();

            if (insertError) {
                console.error('\nERROR AL INSERTAR:');
                console.error('Mensaje:', insertError.message);
                console.error('Código:', insertError.code);
                console.error('Hint:', insertError.hint);
            } else {
                console.log('\nInserción exitosa:', insertData);
            }
        }
    }
}

checkSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
