const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    if (!line || line.startsWith('#')) return acc;
    const idx = line.indexOf('=');
    if (idx > -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        acc[k] = v.replace(/^"|"$/g, '');
    }
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('vip_codes').select('*').then(x => {
    console.log("VIP CODES:");
    console.log(JSON.stringify(x.data, null, 2));
    if (x.error) console.error(x.error);
});
