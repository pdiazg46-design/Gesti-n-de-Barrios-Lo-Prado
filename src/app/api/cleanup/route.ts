// API Route para limpiar datos de prueba
// Ejecutar: http://localhost:3000/api/cleanup

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        console.log('🧹 Iniciando limpieza...');

        // Eliminar todos los items
        const { error: itemsError } = await supabase
            .from('items')
            .delete()
            .neq('id', 'f72ce626-e47a-4cfb-8133-c8d484725350');

        if (itemsError) {
            console.error('Error eliminando items:', itemsError);
        }

        // Eliminar todas las alertas oficiales
        const { error: alertsError } = await supabase
            .from('official_alerts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (alertsError) {
            console.error('Error eliminando alertas:', alertsError);
        }

        return NextResponse.json({
            success: true,
            message: '✅ Base de datos limpiada exitosamente'
        });

    } catch (error) {
        console.error('Error en limpieza:', error);
        return NextResponse.json({
            success: false,
            error: 'Error al limpiar base de datos'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Usa POST para limpiar la base de datos',
        instructions: 'Ejecuta: fetch("/api/cleanup", { method: "POST" })'
    });
}
