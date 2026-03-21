import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
        }

        // 1. Get current user's community admin status
        const { data: currentUser } = await supabaseAdmin
            .from('profiles')
            .select('neighborhood_id, is_community_admin')
            .eq('id', session.user.id)
            .single();

        if (!currentUser?.is_community_admin) {
            return NextResponse.json({ error: 'No autorizado. Se requiere rol de Administrador Vecinal.' }, { status: 403 });
        }

        // 2. Fetch all profiles from the same neighborhood
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('neighborhood_id', currentUser.neighborhood_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, profiles });

    } catch (error: any) {
        console.error('[API Community Users] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
