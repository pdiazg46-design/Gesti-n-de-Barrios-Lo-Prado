const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://yrelbvgdixjsnltbzsez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0OTQ1OCwiZXhwIjoyMDg1NzI1NDU4fQ.6z8gOZrwhxDX7M5V7NWldsY0bgsztY75qNJnEfaowFw';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clean() {
    console.log("Starting DB Clean...");

    // Find the admin user
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const users = userData.users;
    const adminEmail = 'pdiazg46@gmail.com';
    let adminUserId = null;

    for (const u of users) {
        if (u.email === adminEmail) {
            adminUserId = u.id;
            console.log("Found admin user:", adminEmail, u.id);
        }
    }

    if (!adminUserId) {
         console.warn("Could not find admin user! Aborting to prevent full wipe.");
         return;
    }

    // 1. Delete all messages
    console.log("Deleting messages...");
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Delete all conversations
    console.log("Deleting conversations...");
    await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Delete all questions
    console.log("Deleting questions...");
    try {
        await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch(e) { console.log("No questions table or error:", e.message) }

    // 4. Delete all items
    console.log("Deleting all items...");
    await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 5. Delete all users EXCEPT the admin
    let deletedCount = 0;
    for (const u of users) {
        if (u.id !== adminUserId) {
            console.log("Deleting auth user:", u.email);
            const { error } = await supabase.auth.admin.deleteUser(u.id);
            if (error) {
                console.error("Failed to delete user", u.email, error.message);
            } else {
                deletedCount++;
            }
        }
    }
    
    // 6. Delete all profiles EXCEPT admin
    console.log("Deleting all profiles EXCEPT admin...");
    await supabase.from('profiles').delete().neq('id', adminUserId);

    console.log(`Clean complete. Deleted ${deletedCount} users. Admin remains.`);
}

clean().catch(console.error);
