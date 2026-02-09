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

        const { userId, amount, email } = await request.json();
        const userEmail = email || session.user.email;
        const targetUserId = userId || session.user.id;

        if (amount === undefined) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // 1. Try to fetch profile by ID (validate UUID format first)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let profile = null;

        if (uuidRegex.test(targetUserId)) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select('karma_pts')
                .eq('id', targetUserId)
                .single();
            profile = data;
        }

        // 2. If no profile found by ID, try by full_name or other fields if we had them
        // For now, let's look for a profile that has the email in the name or just create it
        if (!profile) {
            // Find ANY profile that might match this email (stored in full_name as a hack if needed)
            const { data: searchData } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .ilike('full_name', `%${userEmail}%`)
                .limit(1);

            if (searchData && searchData.length > 0) {
                profile = searchData[0];
            }
        }

        // 3. If still no profile, we MUST create one to store the karma
        // If the ID is not a UUID, we can't insert it into the 'id' column of profiles if it references auth.users
        // So we'll try to insert using a random UUID but keeping the email in the full_name
        if (!profile) {
            console.log("Creating new profile for karma storage...");

            // Generate a placeholder UUID if the provided one is invalid
            const finalId = uuidRegex.test(targetUserId) ? targetUserId : undefined;

            const { data: newProfile, error: insertError } = await supabaseAdmin
                .from('profiles')
                .insert([{
                    id: finalId, // If undefined, Supabase might generate one or fail (if PK is required)
                    full_name: `${session.user.name || 'Vecino'} (${userEmail})`,
                    avatar_url: session.user.image,
                    karma_pts: 100 + amount // Initial gift + current award
                }])
                .select()
                .single();

            if (insertError) {
                console.error("Profile creation error:", insertError);
                // Last resort: If we can't create a profile record due to FK constraints, 
                // we'll have to wait until the user has a real auth.users record or similar.
                return NextResponse.json({ error: 'Fallo al vincular perfil de puntos' }, { status: 500 });
            }
            profile = newProfile;
        } else {
            // Update existing profile
            const currentKarma = profile.karma_pts || 0;
            const newKarma = currentKarma + amount;

            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ karma_pts: newKarma })
                .eq('id', profile.id);

            if (updateError) throw updateError;
            profile.karma_pts = newKarma;
        }

        return NextResponse.json({ success: true, newKarma: profile.karma_pts });

    } catch (error: any) {
        console.error('Critical Karma API Failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
