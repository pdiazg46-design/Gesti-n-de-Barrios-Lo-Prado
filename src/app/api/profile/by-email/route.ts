import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Falta parámetro email' }, { status: 400 });
        }

        // No podemos buscar por email en profiles porque la columna no existe.
        // Simulamos un 404 seguro para que el UI muestre la versión sin teléfono.
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

    } catch (error: any) {
        console.error('[API Profile By Email] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
