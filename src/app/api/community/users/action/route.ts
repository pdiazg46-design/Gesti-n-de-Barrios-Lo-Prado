import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_something');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Contraseña requerida' }, { status: 401 });
        }

        // 1. Validate Admin
        const { data: currentUser } = await supabaseAdmin
            .from('profiles')
            .select('neighborhood_id, is_community_admin, full_name')
            .eq('email', session.user.email)
            .single();

        if (!currentUser?.is_community_admin) {
            return NextResponse.json({ error: 'Denegado. Solo el Admin Vecinal puede moderar.' }, { status: 403 });
        }

        const { targetUserId, targetEmail, action } = await request.json();

        if (!targetUserId || !action) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // Verify target user is in the same community
        const { data: targetProfile } = await supabaseAdmin
            .from('profiles')
            .select('neighborhood_id, warning_count')
            .eq('id', targetUserId)
            .single();

        if (targetProfile?.neighborhood_id !== currentUser.neighborhood_id) {
            return NextResponse.json({ error: 'El objetivo no pertenece a tu comunidad.' }, { status: 403 });
        }

        const adminName = currentUser.full_name || 'El Administrador';

        if (action === 'BAN') {
            await supabaseAdmin.from('profiles').update({ is_banned: true }).eq('id', targetUserId);
            
            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: 'Comité Vecinal <admin@barrioloop.cl>',
                        to: targetEmail,
                        subject: '🚫 Suspensión en tu Barrio',
                        html: `<h2>Cuenta Bloqueada</h2><p>${adminName} ha suspendido tu participación en la comunidad por inconductas reiteradas.</p>`
                    });
                } catch(e) {}
            }
        } 
        else if (action === 'UNBAN') {
            await supabaseAdmin.from('profiles').update({ is_banned: false, warning_count: 0 }).eq('id', targetUserId);
        }
        else if (action === 'WARN') {
            const newWarnings = (targetProfile?.warning_count || 0) + 1;
            await supabaseAdmin.from('profiles').update({ warning_count: newWarnings }).eq('id', targetUserId);

            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: 'Comité Vecinal <admin@barrioloop.cl>',
                        to: targetEmail,
                        subject: '⚠️ Advertencia de Convivencia',
                        html: `<h2>Amonestación de Barrio</h2><p>El administrador ${adminName} te ha aplicado un "Strike" por mala práctica. Tienes ${newWarnings} advertencias. Al tercer strike arriesgas expulsión.</p>`
                    });
                } catch(e) {}
            }
        }
        else if (action === 'DELETE') {
            if ((targetProfile?.warning_count || 0) < 3) {
                return NextResponse.json({ error: 'No se puede eliminar la cuenta hasta no tener al menos 3 Strikes.' }, { status: 403 });
            }
            // Logic Deletion / Exilio
            await supabaseAdmin.from('profiles').update({
                 is_banned: true, 
                 full_name: 'Vecino Expulsado', 
                 avatar_url: null, 
                 warning_count: 99 
            }).eq('id', targetUserId);

            // Optional: Hide all their items
            await supabaseAdmin.from('items').update({ status: 'ARCHIVED' }).eq('creator_id', targetUserId);

            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: 'Comité Vecinal <admin@barrioloop.cl>',
                        to: targetEmail,
                        subject: '⚖️ Expulsión Definitiva de la Red',
                        html: `<h2>Exilio Decretado</h2><p>${adminName} ha ejecutado tu inhabilitación total al llegar al límite de faltas graves de respeto. Tu cuenta y publicaciones han sido revocados permanentemente.</p>`
                    });
                } catch(e) {}
            }
        }

        return NextResponse.json({ success: true, message: `Acción ${action} aplicada.` });

    } catch (error: any) {
        console.error('[API Community Action] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
