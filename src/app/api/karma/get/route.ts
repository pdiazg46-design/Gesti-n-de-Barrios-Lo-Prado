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

        console.log(`[Karma Audit] Starting calculation for: ${userEmail}`);

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
        // Base Points: +100
        let totalKarma = 100;

        if (userItems) {
            userItems.forEach(item => {
                // Civic Reports: +20 each (assuming they are ACTIVE or COMPLETED/VALIDATED)
                if (item.type === 'CIVIC_REPORT') {
                    totalKarma += 20;
                }

                // Completed Gifts: +50 each
                if (item.type === 'GIFT' && item.status === 'COMPLETED') {
                    totalKarma += 50;
                }
            });
        }

        console.log(`[Karma Audit] Result for ${userEmail}: ${totalKarma}`);

        // 3. (Optional but good) Try to sync the profile table in the background
        // but DON'T wait for it to return the total.
        const userId = session.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (userId && uuidRegex.test(userId)) {
            await supabaseAdmin
                .from('profiles')
                .update({ karma_pts: totalKarma })
                .eq('id', userId);
        }

        return NextResponse.json({
            success: true,
            karma: totalKarma,
            auditCount: userItems?.length || 0
        });

    } catch (error: any) {
        console.error('[Karma Audit] Critical Failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
