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

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || !isMunicipalAdmin(session.user.email)) {
            return NextResponse.json({ error: 'No autorizado. Se requiere rol de Admin Municipal.' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) throw new Error("Missing ID for deletion");

        // Borrado manual de notificaciones ligadas a este item para evitar bloqueos
        await supabaseAdmin.from('notifications').delete().eq('item_id', id);

        // Borrar el Mega-fono/Alerta oficial
        const { error } = await supabaseAdmin.from('items').delete().eq('id', id).eq('type', 'OFFICIAL_ALERT');

        if (error) {
            console.error("Supabase Admin Delete Alert Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Alerta eliminada definitivamente' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
