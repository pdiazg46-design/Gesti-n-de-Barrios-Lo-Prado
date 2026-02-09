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

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { userId, amount } = await request.json();

        if (!userId || amount === undefined) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // 1. Fetch current karma
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('karma_pts')
            .eq('id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching profile:', fetchError);
            return NextResponse.json({ error: 'Error al buscar perfil' }, { status: 500 });
        }

        const currentKarma = profile?.karma_pts || 0;
        const newKarma = currentKarma + amount;

        // 2. Update karma
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ karma_pts: newKarma })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating karma:', updateError);
            return NextResponse.json({ error: 'Error al actualizar puntos' }, { status: 500 });
        }

        return NextResponse.json({ success: true, newKarma });

    } catch (error: any) {
        console.error('Critical Karma API Failure:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
