const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yrelbvgdixjsnltbzsez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeRPC() {
    const rpcs = ['exec_sql', 'execute_sql', 'query', 'sql'];
    const sql = "SELECT 1;";

    for (const rpcName of rpcs) {
        console.log(`Probing RPC: ${rpcName}...`);
        try {
            const { data, error } = await supabase.rpc(rpcName, { sql });
            if (!error) {
                console.log(`🚀 SUCCESS! Found working RPC: ${rpcName}`);
                process.exit(0);
            } else {
                console.log(`- ${rpcName} failed: ${error.message}`);
            }
        } catch (e) {
            console.log(`- ${rpcName} throw: ${e.message}`);
        }
    }
    console.log("❌ No common SQL RPCs found.");
}

probeRPC();
