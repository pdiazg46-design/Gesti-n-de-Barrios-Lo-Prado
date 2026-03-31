import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { isMunicipalAdmin } from '@/lib/municipal-admins';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || !isMunicipalAdmin(session.user.email)) {
            return NextResponse.json({ error: 'No autorizado. Se requiere rol de Admin Municipal.' }, { status: 403 });
        }

        // Fetch all profiles
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Recuperar directamente los Auth Users para inyectar su email que no está en la tabla profiles
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        let finalProfiles = profiles || [];
        if (!authError && authData?.users) {
            const emailMap: Record<string, string> = {};
            authData.users.forEach(u => {
                if (u.email) emailMap[u.id] = u.email;
            });
            
            finalProfiles = finalProfiles.map(p => ({
                ...p,
                email: emailMap[p.id] || p.email
            }));
        }

        // --- Exclusión Estricta de la Alcaldía / Administradores ---
        finalProfiles = finalProfiles.filter(p => {
            const isMega = p.id === 'f72ce626-e47a-4a8b-8bc0-28a9e33e6c80' || p.email === 'municipalidad@loprado.cl';
            const isAdmin = p.email && isMunicipalAdmin(p.email);
            return !isMega && !isAdmin;
        });

        // --- Lógica de Asignación de Asiento (Vecino 1 al N) ---
        // Agrupamos por vip code para darles un orden de llegada cronológico
        const groupMap: Record<string, any[]> = {};
        finalProfiles.forEach(p => {
            if (p.used_vip_code) {
                if (!groupMap[p.used_vip_code]) groupMap[p.used_vip_code] = [];
                groupMap[p.used_vip_code].push(p);
            }
        });

        // Ordenamos cada grupo ascendentemente por fecha para dar número de vecino
        Object.values(groupMap).forEach(group => {
            group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            group.forEach((p, idx) => {
                p.seat_number = idx + 1; // Vecino 1, Vecino 2, etc.
            });
        });

        // Retornamos sin incluir a la alcaldía
        return NextResponse.json({ success: true, profiles: finalProfiles });

    } catch (error: any) {
        console.error('[API Admin Users] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
