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
            .select('id, full_name, avatar_url')
            .neq('id', session.user.id);

        if (error) throw error;
        return NextResponse.json({ neighbors: data || [] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
