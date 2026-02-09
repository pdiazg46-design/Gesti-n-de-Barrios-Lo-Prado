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

        const { id, updates } = await request.json();

        if (!id || !updates) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // 1. Verify ownership (even if we bypass RLS, we check email matching)
        const { data: item, error: fetchError } = await supabaseAdmin
            .from('items')
            .select('author_email, creator_id')
            .eq('id', id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
        }

        if (item.author_email?.toLowerCase() !== session.user.email.toLowerCase() &&
            item.creator_id !== session.user.id) {
            return NextResponse.json({ error: 'No tienes permiso para editar este item' }, { status: 403 });
        }

        // 2. Perform administrative update
        const { error: updateError } = await supabaseAdmin
            .from('items')
            .update(updates)
            .eq('id', id);

        if (updateError) {
            console.error('Error updating item from server:', updateError);
            return NextResponse.json({ error: 'Error al actualizar en base de datos' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Item actualizado con éxito' });

    } catch (error: any) {
        console.error('Critical Update API Failure:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
