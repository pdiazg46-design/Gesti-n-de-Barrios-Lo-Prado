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

        const userEmail = session.user.email.toLowerCase();

        console.log(`[Karma Audit v2] Calculating for: ${userEmail}`);

        // 1. Fetch all items created by this email
        const { data: userItems, error: itemsError } = await supabaseAdmin
            .from('items')
            .select('type, status')
            .eq('author_email', userEmail);

        if (itemsError) {
            console.error('[Karma Audit] Error fetching items:', itemsError);
            throw itemsError;
        }

        // 2. Calculate Karma via Audit
        // Base Points (Welcome Bonus): ALWAYS +100
        let totalKarma = 100;

        if (userItems) {
            userItems.forEach(item => {
                // Civic Reports: +20 each
                if (item.type === 'CIVIC_REPORT') {
                    totalKarma += 20;
                }

                // Gifts (Circular Economy): +50 each (as per UI badge +50 Karma)
                // We reward the gesture of "posting" a gift.
                if (item.type === 'GIFT') {
                    totalKarma += 50;
                }

                // If a gift is COMPLETED (delivered), we could add an extra bonus,
                // but for now, let's keep it consistent with the user's mental model (+50 per gift).
            });
        }

        console.log(`[Karma Audit] Total Points (100 bonus + ${totalKarma - 100} items): ${totalKarma}`);

        // 3. Sync the profile table in the background
        const userId = session.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (userId && uuidRegex.test(userId)) {
            await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    karma_pts: totalKarma,
                    full_name: session.user.name,
                    avatar_url: session.user.image
                });
        }

        return NextResponse.json({
            success: true,
            karma: totalKarma,
            itemsAnalyzed: userItems?.length || 0
        });

    } catch (error: any) {
        console.error('[Karma Audit] Critical Failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
