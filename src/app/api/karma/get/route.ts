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

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userEmail = session.user.email;
        const userId = session.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // 1. Try by ID
        let profile = null;
        if (uuidRegex.test(userId)) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            profile = data;
        }

        // 2. Try by email pattern in name
        if (!profile) {
            const { data: searchData } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .ilike('full_name', `%${userEmail}%`)
                .limit(1);
            if (searchData && searchData.length > 0) profile = searchData[0];
        }

        // 3. Create if still missing
        if (!profile) {
            const finalId = uuidRegex.test(userId) ? userId : undefined;
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .insert([{
                    id: finalId,
                    full_name: `${session.user.name || 'Vecino'} (${userEmail})`,
                    avatar_url: session.user.image,
                    karma_pts: 100 // Welcome bonus
                }])
                .select()
                .single();

            if (error) throw error;
            profile = data;
        }

        return NextResponse.json({
            success: true,
            karma: profile.karma_pts,
            profileId: profile.id
        });

    } catch (error: any) {
        console.error('Karma Get Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
