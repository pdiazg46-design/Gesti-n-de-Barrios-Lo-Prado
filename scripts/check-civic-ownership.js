const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.replace(/"/g, '').trim();
        return acc;
    }, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCivicReports() {
    console.log('🔍 Listing recent CIVIC_REPORT items...');

    const { data: reports, error } = await supabase
        .from('items')
        .select('id, title, creator_id, author_email, type, created_at')
        .eq('type', 'CIVIC_REPORT')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('❌ Error fetching reports:', error.message);
        return;
    }

    console.log(`Found ${reports.length} recent civic reports:`);
    reports.forEach(r => {
        console.log(`- [${r.id}] "${r.title}"`);
        console.log(`  Creator: ${r.creator_id}`);
        console.log(`  Email:   ${r.author_email}`);
        console.log(`  Date:    ${r.created_at}`);
    });
}

checkCivicReports();
