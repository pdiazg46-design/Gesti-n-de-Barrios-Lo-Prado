import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
    try {
        // Try to add the column if it doesn't exist
        const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql_string: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;'
        });

        if (error) {
            // Fallback if RPC is not available
            console.error('Migration error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Column added' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
