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
        if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        // Bypass RLS para obtener la lista maestra de vecinos de la comuna
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .neq('id', session.user.id);

        if (error) throw error;

        // Ocultar a los administradores del sistema (Alcaldía, Megáfono, super usuarios)
        const sysIds = ['f72ce626-e47a-4a8b-8bc0-28a9e33e6c80'];
        const validNeighbors = (data || []).filter(p => {
            if (sysIds.includes(p.id)) return false;
            if (p.email && ['pdiazg46@gmail.com', 'pdiazg@gmail.com', 'municipalidad@loprado.cl'].includes(p.email.toLowerCase())) return false;
            return true;
        });

        return NextResponse.json({ neighbors: validNeighbors });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
