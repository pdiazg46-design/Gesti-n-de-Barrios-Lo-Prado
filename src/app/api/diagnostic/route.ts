import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const diagnostics = {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
        googleClientId: !!process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        protocol: request.headers.get('x-forwarded-proto') || 'http',
        host: request.headers.get('host'),
        env: process.env.NODE_ENV,
    };


    let dbConnection = false;
    let dbError = null;

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data, error } = await supabase.from('users').select('count');
        if (!error) dbConnection = true;
        else dbError = error.message;
    } catch (e: any) {
        dbError = e.message;
    }

    return NextResponse.json({
        diagnostics,
        dbConnection,
        dbError
    });
}
