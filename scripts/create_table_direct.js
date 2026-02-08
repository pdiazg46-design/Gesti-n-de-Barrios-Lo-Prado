const https = require('https');

const supabaseUrl = 'yrelbvgdixjsnltbzsez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const sqlQuery = `
CREATE TABLE IF NOT EXISTS official_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    zone_geometry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);
`;

console.log('🔨 Creando tabla official_alerts usando SQL directo...\n');

const options = {
    hostname: supabaseUrl,
    port: 443,
    path: '/rest/v1/rpc/exec',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
    }
};

const postData = JSON.stringify({ query: sqlQuery });

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);

        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('\n✅ Tabla creada exitosamente');
        } else {
            console.log('\n❌ Error al crear tabla');
            console.log('Respuesta completa:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('💥 Error:', error.message);
});

req.write(postData);
req.end();
