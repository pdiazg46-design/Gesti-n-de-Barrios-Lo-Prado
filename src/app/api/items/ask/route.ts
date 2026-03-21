import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { checkMessageModeration } from '@/lib/moderation';
import { Resend } from 'resend';
import { MUNICIPAL_ADMINS } from '@/lib/municipal-admins';

const resend = new Resend(process.env.RESEND_API_KEY || 're_something');

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

        const { itemId, text } = await request.json();

        if (!itemId || !text) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        const moderation = checkMessageModeration(text);

        if (!moderation.isValid) {
            console.log(`[Moderación] Usuario ${session.user.email} intentó enviar: "${text}". Bloqueado por: ${moderation.flaggedWords.join(', ')}`);
            
            // 1. Añadir un Strike al perfil
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('warning_count')
                .eq('id', session.user.id)
                .single();

            const currentWarnings = profile?.warning_count || 0;
            const newWarnings = currentWarnings + 1;

            await supabaseAdmin
                .from('profiles')
                .update({ warning_count: newWarnings })
                .eq('id', session.user.id);

            // 2. Notificar al Usuario
            try {
                if (session.user.email) {
                    await resend.emails.send({
                        from: 'Barrio Seguro <admin@barrioloop.cl>',
                        to: session.user.email,
                        subject: '⚠️ Advertencia por Lenguaje Inapropiado',
                        html: `
                            <h2>Hola,</h2>
                            <p>Hemos detectado lenguaje ofensivo en tu reciente intento de mensaje en Barrio Seguro.</p>
                            <p><strong>Mensaje bloqueado:</strong> "${text}"</p>
                            <p>Esta es tu advertencia número <strong>${newWarnings}</strong>.</p>
                            <p>Te recordamos que a la tercera advertencia, tu cuenta podría ser suspendida permanentemente para mantener el respeto vecinal.</p>
                            <p>Atentamente,<br/>Administración Municipal</p>
                        `
                    });
                }
            } catch (e) {
                console.error("Error enviando email al infractor", e);
            }

            // 3. Notificar a Moderadores Vecinales de esa Comunidad
            try {
                // Determine the item's community first
                const { data: itemData } = await supabaseAdmin
                    .from('items')
                    .select('community_id')
                    .eq('id', itemId)
                    .single();

                if (itemData?.community_id) {
                    const { data: admins } = await supabaseAdmin
                        .from('profiles')
                        .select('email')
                        .eq('neighborhood_id', itemData.community_id)
                        .eq('is_community_admin', true)
                        .not('email', 'is', null);

                    const adminEmails = admins?.map(a => a.email).filter(Boolean) as string[] || [];

                    if (adminEmails.length > 0) {
                        await resend.emails.send({
                            from: 'Inteligencia de Barrio <admin@barrioloop.cl>',
                            to: adminEmails,
                            subject: `🚨 ALERTA MODERACIÓN: Usuario Infractor en tu Barrio (${newWarnings} Strikes)`,
                            html: `
                                <h2>Sistema de Moderación Automático</h2>
                                <p>El modelo Edge Network ha bloqueado un mensaje ofensivo del vecino <strong>${session.user.email}</strong> en tu comunidad protegida.</p>
                                <p><strong>Diccionario detectado:</strong> ${moderation.flaggedWords.join(', ')}</p>
                                <p><strong>Contexto Original:</strong> "${text}"</p>
                                <p>Este vecino ha acumulado <strong>${newWarnings}</strong> strikes automáticos por el sistema. Como Administrador Activo del Barrio, puedes ingresar a la App, ir a tu perfil y usar el Martillo de Suspensión si consideras que la interacción amerita la neutralización de la cuenta.</p>
                            `
                        });
                    }
                }
            } catch(e) {
                console.error("Error enviando email al admin vecinal", e);
            }

            return NextResponse.json({ 
                error: 'Mensaje bloqueado por lenguaje ofensivo. Has recibido un Strike.',
                isBanned: newWarnings >= 3
            }, { status: 403 });
        }

        // Si el mensaje es válido, proceder a guardarlo
        const { data: item } = await supabaseAdmin
            .from('items')
            .select('*')
            .eq('id', itemId)
            .single();

        if (!item) {
            return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
        }

        const isCreator = item.creator_id === session.user.id || item.author_email === session.user.email;
        
        const newQuestion = {
            id: crypto.randomUUID(),
            text,
            isCreator,
            time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute:'2-digit' }),
            date: new Date().toISOString()
        };

        const updatedQuestions = [...(item.questions || []), newQuestion];

        const { error: updateError } = await supabaseAdmin
            .from('items')
            .update({ questions: updatedQuestions })
            .eq('id', itemId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, question: newQuestion });

    } catch (error: any) {
        console.error('[API Ask] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
