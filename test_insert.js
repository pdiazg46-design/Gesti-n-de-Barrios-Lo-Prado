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

supabase.from('vip_codes').insert({
    code: 'UV19-S1',
    community_id: 19,
    max_uses: 2,
    current_uses: 1,
    is_active: true
}).select().then(x => {
    console.log("INSERTED:", JSON.stringify(x.data, null, 2));
    if (x.error) console.error(x.error);
});
