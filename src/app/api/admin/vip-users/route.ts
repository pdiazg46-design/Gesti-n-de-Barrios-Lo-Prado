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

        return NextResponse.json({ success: true, data: profiles || [] });

    } catch (error) {
        return NextResponse.json({ error: 'Error procesando solicitud.' }, { status: 500 });
    }
}
