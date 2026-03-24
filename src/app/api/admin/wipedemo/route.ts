import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
    try {
        const adminId = '7e40bd42-f6d9-40b1-b362-15bcfd30f44c'; // Patricio
        
        // 1. Clear VIP code for admin
        await supabaseAdmin.from('profiles').update({ used_vip_code: null }).eq('id', adminId);

        // 2. Fetch all profiles EXCEPT admin
        const { data: profiles } = await supabaseAdmin.from('profiles').select('id').neq('id', adminId);
        
        let deleted = 0;
        if (profiles && profiles.length > 0) {
            for (const p of profiles) {
                // Delete from auth.users (cascade deletes profile usually, but doing both is safer)
                await supabaseAdmin.auth.admin.deleteUser(p.id);
                await supabaseAdmin.from('profiles').delete().eq('id', p.id);
                deleted++;
            }
        }

        // 3. Delete all generated VIP cells
        // In Supabase SDK, deleting all rows requires a filter like not eq a dummy value
        await supabaseAdmin.from('vip_codes').delete().neq('code', 'IMPOSSIBLE_CODE');

        return NextResponse.json({ success: true, deleted_users: deleted, message: 'Wipe complete' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
