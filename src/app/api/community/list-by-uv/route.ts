import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const uv = parseInt(url.searchParams.get('uv') || '0');

        if (!uv) {
            return NextResponse.json({ error: 'Falta parametro UV' }, { status: 400 });
        }

        const { data: communities, error } = await supabaseAdmin
            .from('communities')
            .select('id, name, slug')
            .eq('uv_number', uv)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Optionally, count users per community for UI
        const groupsWithCounts = await Promise.all((communities || []).map(async (comm) => {
            const { count } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('neighborhood_id', comm.id);
            return {
                ...comm,
                members_count: count || 0
            };
        }));

        return NextResponse.json({ success: true, groups: groupsWithCounts });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
