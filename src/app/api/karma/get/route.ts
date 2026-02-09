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
            console.log("[Karma GET] No session email found");
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userEmail = session.user.email;
        const userId = session.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        console.log(`[Karma GET] Request for email: ${userEmail}, ID: ${userId}`);

        // 1. Try by email pattern (MORE ROBUST for Google users)
        // We look for any profile that has the email in the full_name
        const { data: searchData, error: searchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${userEmail}%`)
            .limit(1);

        let profile = (searchData && searchData.length > 0) ? searchData[0] : null;

        if (profile) {
            console.log(`[Karma GET] Found profile by email lookup: ${profile.id}`);
        }

        // 2. If no email match, try by ID if it's a UUID
        if (!profile && uuidRegex.test(userId)) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            profile = data;
            if (profile) console.log(`[Karma GET] Found profile by UUID match: ${profile.id}`);
        }

        // 3. Create if still missing (The "Welcome" flow)
        if (!profile) {
            console.log(`[Karma GET] Profile not found. Creating new profile for: ${userEmail}`);
            // If the session ID is not a UUID, we let Supabase generate one
            const insertId = uuidRegex.test(userId) ? userId : undefined;

            const { data: newProfile, error: insertError } = await supabaseAdmin
                .from('profiles')
                .insert([{
                    id: insertId,
                    full_name: `${session.user.name || 'Vecino'} (${userEmail})`,
                    avatar_url: session.user.image,
                    karma_pts: 100 // Welcome gift
                }])
                .select()
                .single();

            if (insertError) {
                console.error('[Karma GET] Insert Error during profile creation:', insertError);
                throw insertError;
            }
            profile = newProfile;
            console.log(`[Karma GET] Created profile: ${profile.id}`);
        }

        return NextResponse.json({
            success: true,
            karma: profile.karma_pts,
            profileId: profile.id
        });

    } catch (error: any) {
        console.error('[Karma GET] Internal Critical Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
