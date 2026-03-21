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

        const { uvNumber } = await request.json();

        if (!uvNumber) {
            return NextResponse.json({ error: 'Falta Número UV' }, { status: 400 });
        }

        // Count how many groups exist in this UV
        const { count, error: countErr } = await supabaseAdmin
            .from('communities')
            .select('*', { count: 'exact', head: true })
            .eq('uv_number', uvNumber);

        const groupCount = count || 0;
        const newGroupNumber = groupCount + 1;

        const commName = `UV ${uvNumber} (Grupo ${newGroupNumber})`;
        const commSlug = `uv-${uvNumber}-grupo-${newGroupNumber}`;

        // Create new community
        const { data: commData, error: insertError } = await supabaseAdmin
            .from('communities')
            .insert({
                name: commName,
                slug: commSlug,
                uv_number: uvNumber
            })
            .select('*')
            .single();

        if (insertError) throw insertError;

        // Upgrade profile to neighborhood_id AND is_community_admin
        const { error: profError } = await supabaseAdmin
            .from('profiles')
            .update({ 
                neighborhood_id: commData.id, 
                is_community_admin: true 
            })
            .eq('id', session.user.id);

        if (profError) throw profError;

        return NextResponse.json({ success: true, slug: commSlug, name: commName });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
