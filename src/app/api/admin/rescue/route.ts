import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const { data: codes, error: codesError } = await supabaseAdmin.from('vip_codes').select('*');
        if (codesError) throw codesError;
        
        const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('id, email, used_vip_code');
        if (pError) throw pError;

        // Limpiar huellas físicas del super admin/sistema en la BD
        const systemIds = ['f72ce626-e47a-4a8b-8bc0-28a9e33e6c80'];
        const adminEmails = ['pdiazg46@gmail.com', 'pdiazg@gmail.com', 'municipalidad@loprado.cl'];

        for (const p of profiles) {
            if ((p.email && adminEmails.includes(p.email.toLowerCase())) || systemIds.includes(p.id)) {
                if (p.used_vip_code) {
                    await supabaseAdmin.from('profiles').update({ used_vip_code: null }).eq('id', p.id);
                    p.used_vip_code = null;
                }
            }
        }

        let updated = 0;
        let logs: string[] = [];

        for (const code of codes) {
            const usersInCode = profiles.filter(p => p.used_vip_code === code.code);
            const actualUses = usersInCode.length;

            if (code.current_uses !== actualUses) {
                logs.push(`CORREGIDO ${code.code}: DB decía ${code.current_uses}, pero hay ${actualUses} reales.`);
                await supabaseAdmin.from('vip_codes').update({
                    current_uses: actualUses,
                    is_active: actualUses < code.max_uses
                }).eq('id', code.id);
                updated++;
            } else if (code.is_active !== (actualUses < code.max_uses)) {
                logs.push(`ARREGLADO ESTADO ${code.code}`);
                await supabaseAdmin.from('vip_codes').update({
                    is_active: actualUses < code.max_uses
                }).eq('id', code.id);
            }
        }

        return NextResponse.json({ success: true, updated, logs });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
