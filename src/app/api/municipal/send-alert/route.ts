import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, message, type, lat, lng, radius, targetUv } = body;

        // Validación básica
        if (!title || !message || !type) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Obtener community_id de Lo Prado
        const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('id')
            .eq('slug', 'lo-prado')
            .single();

        if (communityError || !community) {
            console.error('Error obteniendo comunidad:', communityError);
            return NextResponse.json(
                { error: 'No se pudo identificar la comunidad' },
                { status: 500 }
            );
        }

        // Crear alerta oficial usando la tabla items existente
        // Usamos type='OFFICIAL_ALERT' para diferenciarlas de reportes normales
        const { data, error } = await supabase
            .from('items')
            .insert({
                community_id: community.id, // ← Campo requerido
                creator_id: 'f72ce626-e47a-4a8b-8bc0-28a9e33e6c80', // ← ID de sistema para alertas oficiales
                title,
                description: message,
                type: 'OFFICIAL_ALERT',
                category: type, // INFO, WARNING, EMERGENCY, MAINTENANCE
                lat: lat || -33.4489,
                lng: lng || -70.7256,
                metadata: JSON.stringify({
                    alert_type: type,
                    radius: radius || 100,
                    is_official: true,
                    targetUv: targetUv || '',
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }),
                status: 'ACTIVE',
                author_email: 'municipalidad@loprado.cl' // Email oficial de la municipalidad
            })
            .select()
            .single();

        if (error) {
            console.error('Error creando alerta:', error);
            return NextResponse.json(
                { error: `Error al crear la alerta: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, alert: data }, { status: 201 });

    } catch (error) {
        console.error('Error en API send-alert:', error);
        return NextResponse.json(
            { error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
            { status: 500 }
        );
    }
}
