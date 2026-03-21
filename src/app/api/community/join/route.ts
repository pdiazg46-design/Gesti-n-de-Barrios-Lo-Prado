import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { communityId } = await request.json();

        if (!communityId) {
            return NextResponse.json({ error: 'ID Grupo inválido' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ neighborhood_id: communityId, is_community_admin: false })
            .eq('email', session.user.email);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Unido con éxito" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
