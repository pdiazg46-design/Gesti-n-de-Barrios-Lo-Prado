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
            .eq('is_active', true)
            .single();

        if (vipError || !vipData) {
            return NextResponse.json({ error: 'Código inválido o ya expirado.' }, { status: 404 });
        }

        if (vipData.current_uses >= vipData.max_uses) {
            // Cierre preventivo por si falló el trigger anterior
            await supabaseAdmin.from('vip_codes').update({ is_active: false }).eq('id', vipData.id);
            return NextResponse.json({ error: 'Los cupos de esta célula fundadora se han agotado.' }, { status: 403 });
        }

        const newUses = vipData.current_uses + 1;
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
            .update({ is_verified: true })
            .eq('id', userId);

        const [burnRes, verifyRes] = await Promise.all([burnCodePromise, verifyUserPromise]);

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
