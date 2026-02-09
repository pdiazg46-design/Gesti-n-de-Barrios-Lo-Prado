import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with SERVICE_ROLE_KEY for administrative bypass of RLS
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

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID de item requerido' }, { status: 400 });
        }

        // 1. Verify ownership BEFORE deleting
        const { data: item, error: fetchError } = await supabaseAdmin
            .from('items')
            .select('author_email, creator_id')
            .eq('id', id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
        }

        // Security check: Only the author can delete
        if (item.author_email !== session.user.email) {
            return NextResponse.json({ error: 'No tienes permiso para borrar este item' }, { status: 403 });
        }

        // 2. Perform administrative deletion (bypassing Client RLS)
        const { error: deleteError } = await supabaseAdmin
            .from('items')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting item from server:', deleteError);
            return NextResponse.json({ error: 'Error al borrar en base de datos' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Item borrado permanentemente' });

    } catch (error: any) {
        console.error('Critical API Failure:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
