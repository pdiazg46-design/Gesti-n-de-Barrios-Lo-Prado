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

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const data = await request.json();
        
        const updateData: any = {};
        if (data.avatar_url) updateData.avatar_url = data.avatar_url;
        if (data.full_name) updateData.full_name = data.full_name;

        // Bypassing RLS using Service Role Key
        const { error } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', session.user.id);

        if (error) {
            console.error('[UpdateProfile API] Supabase Error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Critical Profile Update Failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
