import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { isMunicipalAdmin } from '@/lib/municipal-admins';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || !isMunicipalAdmin(session.user.email)) {
            return NextResponse.json({ error: 'No autorizado. Se requiere rol de Admin Municipal.' }, { status: 403 });
        }

        // Fetch all profiles
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, profiles });

    } catch (error: any) {
        console.error('[API Admin Users] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
