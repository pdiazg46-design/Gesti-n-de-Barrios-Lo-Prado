import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
    try {
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            console.warn("Faltan VAPID keys en las variables de entorno de Vercel");
            return NextResponse.json({ error: "Faltan Setup VAPID en servidor" }, { status: 500 });
        }

        // Inicializar motor criptográfico en tiempo de ejecución (RunTime), no BuildTime
        webpush.setVapidDetails(
            'mailto:contacto@barrioseguro.cl',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        const payloadStr = await request.text();
        const payload = payloadStr ? JSON.parse(payloadStr) : {};
        const { title = "Alerta de Barrio Seguro", body = "Hay novedades en tu comuna", url = "/", targetUserId } = payload;

        // Recuperar usuarios que tienen permisos PUSH activos en BD
        let query = supabaseAdmin
            .from('profiles')
            .select('push_subscriptions')
            .not('push_subscriptions', 'is', null);
            
        // Filtro opcional para mensajes directos a 1 vecino
        if (targetUserId) {
            query = query.eq('id', targetUserId);
        }

        const { data: profiles, error } = await query;
        if (error) throw error;

        const stringifiedPayload = JSON.stringify({ title, body, url });
        
        let sentCount = 0;
        let errorsCount = 0;

        for (const profile of profiles || []) {
            const subs = profile.push_subscriptions;
            if (Array.isArray(subs)) {
                for (const sub of subs) {
                    try {
                        await webpush.sendNotification(sub, stringifiedPayload);
                        sentCount++;
                    } catch (err: any) {
                        // Idealmente, si err.statusCode === 410, se debe borrar el token muerto de BD.
                        console.error("Punto Final Inalcanzable (El usuario pudo revocar permiso):", err.statusCode || err);
                        errorsCount++;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, sent: sentCount, errors: errorsCount });
    } catch (e: any) {
        console.error("Fallo general en PUSH Engine:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
