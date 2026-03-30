import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el Service Role para poder auto-confirmar los emails en el registro 
// y evitar correos de verificación para una adopción más rápida.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        // 1. Crear usuario en la bóveda segura de Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email.toLowerCase().trim(),
            password,
            email_confirm: true, // Evita mandar correos obligatorios de confirmación al inicio
            user_metadata: { name }
        });

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            let errorMessage = authError.message;
            if (errorMessage.includes("already been registered")) {
                errorMessage = "Ya existe un usuario registrado con este correo electrónico.";
            }
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        if (authData?.user) {
            // 2. Insertarlo silenciosamente en la tabla de perfiles para emparejar
            await supabaseAdmin.from('profiles').upsert({
                id: authData.user.id,
                full_name: name,
                is_verified: true
            });
        }

        return NextResponse.json({ success: true, user: authData.user });
    } catch (e: any) {
        console.error("Critical Register Error:", e);
        return NextResponse.json({ error: 'Fallo interno al registrar usuario' }, { status: 500 });
    }
}
