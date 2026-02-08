import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, message, type, lat, lng, radius } = body;

        // Validación básica
        if (!title || !message || !type) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Crear alerta oficial en Supabase
        const { data, error } = await supabase
            .from('official_alerts')
            .insert({
                title,
                message,
                alert_type: type,
                zone_geometry: JSON.stringify({
                    type: 'Point',
                    coordinates: [lng || -70.7256, lat || -33.4489],
                    radius: radius || 500
                }),
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
            })
            .select()
            .single();

        if (error) {
            console.error('Error creando alerta:', error);
            return NextResponse.json(
                { error: 'Error al crear la alerta' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, alert: data }, { status: 201 });

    } catch (error) {
        console.error('Error en API send-alert:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
