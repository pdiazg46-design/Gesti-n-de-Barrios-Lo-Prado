import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos Service Role Key para saltarnos el RLS y hacer operaciones administrativas atómicas (Muto Bóveda)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const { code, userId } = await request.json();

        if (!code || !userId) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // 1. Verificar existencia y validez del código VIP
        const { data: vipData, error: vipError } = await supabaseAdmin
            .from('vip_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (vipError || !vipData) {
            return NextResponse.json({ error: 'Código inválido.' }, { status: 404 });
        }

        // 1.5 Calculamos ocupantes en TIEMPO REAL para auto-sanar desincronizaciones
        const { data: activeProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('used_vip_code', code);

        // Omitimos a los administradores puros y al sistema que pudieron haber probado el código
        const systemIds = ['f72ce626-e47a-4a8b-8bc0-28a9e33e6c80'];
        const adminEmails = ['pdiazg46@gmail.com', 'pdiazg@gmail.com', 'municipalidad@loprado.cl'];
        
        const realUsers = (activeProfiles || []).filter(p => {
            const isMega = systemIds.includes(p.id);
            const isAdmin = p.email && adminEmails.includes(p.email.toLowerCase());
            return !isMega && !isAdmin;
        });

        const actualUses = realUsers.length;

        if (actualUses >= vipData.max_uses) {
            // Cierre preventivo
            await supabaseAdmin.from('vip_codes').update({ is_active: false, current_uses: actualUses }).eq('id', vipData.id);
            return NextResponse.json({ error: 'Los cupos de esta célula fundadora se han agotado.' }, { status: 403 });
        }

        const newUses = actualUses + 1;
        const isNowExhausted = newUses >= vipData.max_uses;

        // 2. Transacción paralela: Quemar el código y verificar al usuario
        const burnCodePromise = supabaseAdmin
            .from('vip_codes')
            .update({ 
                current_uses: newUses,
                is_active: !isNowExhausted
            })
            .eq('id', vipData.id);

        const verifyUserPromise = supabaseAdmin
            .from('profiles')
            .upsert({ id: userId, used_vip_code: code, is_community_admin: true }, { onConflict: 'id' });

        const notificationPromise = supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'SYSTEM',
                title: '¡Acceso Fundador Concedido!',
                message: `Has ingresado con éxito mediante el Enlace Oficial ${code}. Tu cuenta ciudadana ya está verificada y lista para participar.`,
                is_read: false
            });

        const [burnRes, verifyRes, notifRes] = await Promise.all([burnCodePromise, verifyUserPromise, notificationPromise]);

        if (burnRes.error || verifyRes.error) {
            console.error(burnRes.error, verifyRes.error);
            return NextResponse.json({ error: 'Error interno asignando la célula.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Acceso Pionero concedido mágicamente.',
            exhausted: isNowExhausted
        });

    } catch (error) {
        console.error('Error in consume-vip:', error);
        return NextResponse.json({ error: 'Error procesando solicitud.' }, { status: 500 });
    }
}
