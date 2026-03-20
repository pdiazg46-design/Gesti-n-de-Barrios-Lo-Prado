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

        const { subscription } = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Payload de suscripción inválido' }, { status: 400 });
        }

        // Descargar arreglo actual de credenciales PUSH
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('push_subscriptions')
            .eq('id', session.user.id)
            .single();

        if (fetchError) {
            // Si el perfil es corrupto o falta
            console.error('Fetch error:', fetchError);
            throw fetchError;
        }

        let subs = profile?.push_subscriptions || [];
        if (!Array.isArray(subs)) subs = [];

        // Filtrar duplicados (Si reconecta desde el mismo navegador)
        const exists = subs.find((s: any) => s.endpoint === subscription.endpoint);
        if (!exists) {
            subs.push(subscription);
            // Guardar el JSONB actualizado con bypassing de ServiceRole RLS
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ push_subscriptions: subs })
                .eq('id', session.user.id);
            
            if (updateError) throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Push Subscribe Failure:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
