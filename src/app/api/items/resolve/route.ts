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

        if (!session?.user?.id && !session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { itemId } = await request.json();

        if (!itemId) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // Validate Ownership
        const { data: item } = await supabaseAdmin
            .from('items')
            .select('creator_id, author_email')
            .eq('id', itemId)
            .single();

        if (!item) {
            return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
        }

        const isOwner = (item.author_email?.toLowerCase() === session.user.email?.toLowerCase()) || 
                        (item.creator_id === session.user.id);

        if (!isOwner) {
            return NextResponse.json({ error: 'No tienes permiso para finalizar esta publicación' }, { status: 403 });
        }

        const { error: updateError } = await supabaseAdmin
            .from('items')
            .update({ status: 'COMPLETED' })
            .eq('id', itemId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API Resolve] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
