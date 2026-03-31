import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Falta el código VIP param' }, { status: 400 });
        }

        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, avatar_url, created_at, used_vip_code')
            .like('used_vip_code', `${code}-%`);

        if (error) {
            console.error(error);
            return NextResponse.json({ error: 'Error al consultar usuarios' }, { status: 500 });
        }

        // Excluir a la autoridad/megáfonos de estos listados VIP
        const validProfiles = (profiles || []).filter(p => {
            const isMega = p.full_name && (p.full_name.toLowerCase().includes('megáfono') || p.full_name.toLowerCase().includes('megafono'));
            return !isMega && p.id !== 'f72ce626-e47a-4a8b-8bc0-28a9e33e6c80';
        });

        return NextResponse.json({ success: true, data: validProfiles });

    } catch (error) {
        return NextResponse.json({ error: 'Error procesando solicitud.' }, { status: 500 });
    }
}
