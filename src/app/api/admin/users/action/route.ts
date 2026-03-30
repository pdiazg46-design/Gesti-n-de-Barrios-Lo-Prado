import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { isMunicipalAdmin } from '@/lib/municipal-admins';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_something');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || !isMunicipalAdmin(session.user.email)) {
            return NextResponse.json({ error: 'Denegado' }, { status: 403 });
        }

        const { targetUserId, targetEmail, action, vipCode } = await request.json();

        if (!targetUserId || !action) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        if (action === 'BAN') {
            await supabaseAdmin.from('profiles').update({ is_banned: true }).eq('id', targetUserId);
            
            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: 'Sistemas <admin@barrioloop.cl>',
                        to: targetEmail,
                        subject: '🚫 Cuenta Suspendida Permanentemente',
                        html: `<h2>Suspensión de Cuenta</h2><p>Tu acceso a Barrio Seguro ha sido bloqueado por el Administrador debido a la continua violación de nuestras políticas de respeto vecinal.</p>`
                    });
                } catch(e) {}
            }
        } 
        else if (action === 'UNBAN') {
            await supabaseAdmin.from('profiles').update({ is_banned: false, warning_count: 0 }).eq('id', targetUserId);
        }
        else if (action === 'WARN') {
            // Get current warnings
            const { data: profile } = await supabaseAdmin.from('profiles').select('warning_count').eq('id', targetUserId).single();
            const newWarnings = (profile?.warning_count || 0) + 1;
            
            await supabaseAdmin.from('profiles').update({ warning_count: newWarnings }).eq('id', targetUserId);

            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: 'Sistemas <admin@barrioloop.cl>',
                        to: targetEmail,
                        subject: '⚠️ Advertencia Administrativa Oficial',
                        html: `<h2>Advertencia Oficial</h2><p>El administrador te ha aplicado un "Strike" por mala práctica. Ahora tienes ${newWarnings} advertencias.</p>`
                    });
                } catch(e) {}
            }
        }
        else if (action === 'MAKE_ADMIN') {
            await supabaseAdmin.from('profiles').update({ is_community_admin: true }).eq('id', targetUserId);
            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: 'Sistemas <admin@barrioloop.cl>',
                        to: targetEmail,
                        subject: '👑 Eres Administrador Vecinal',
                        html: `<h2>Nombramiento de Administrador</h2><p>Se te han otorgado los poderes de Moderación Vecinal. Ahora puedes resguardar tu barrio bloqueando conductas irrespetuosas.</p>`
                    });
                } catch(e) {}
            }
        }
        else if (action === 'REMOVE_ADMIN') {
            await supabaseAdmin.from('profiles').update({ is_community_admin: false }).eq('id', targetUserId);
        }
        else if (action === 'ASSIGN_VIP') {
            await supabaseAdmin.from('profiles').update({ used_vip_code: vipCode || null }).eq('id', targetUserId);
        }
        else if (action === 'DELETE_USER') {
            // Elimina el usuario desde Supabase Perfiles y Auth a la vez. (Pruebas)
            await supabaseAdmin.from('profiles').delete().eq('id', targetUserId);
            await supabaseAdmin.auth.admin.deleteUser(targetUserId);
        }

        return NextResponse.json({ success: true, message: `Acción ${action} aplicada a ${targetEmail}` });

    } catch (error: any) {
        console.error('[API Admin Action] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
