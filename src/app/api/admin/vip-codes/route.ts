import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { code, community_id, max_uses, current_uses, is_active } = await req.json();

        if (!code || !community_id) {
            throw new Error("Missing required parameters: code or community_id");
        }

        const { data, error } = await supabaseAdmin.from('vip_codes').insert({
            code,
            community_id,
            max_uses: max_uses || 2,
            current_uses: current_uses || 0,
            is_active: is_active ?? true
        }).select();

        if (error) {
            console.error("Supabase Admin Insert Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) throw new Error("Missing ID for deletion");

        const { error } = await supabaseAdmin.from('vip_codes').delete().eq('id', id).eq('current_uses', 0);

        if (error) {
            console.error("Supabase Admin Delete Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
