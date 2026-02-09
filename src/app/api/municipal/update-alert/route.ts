import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Initialize Supabase with SERVICE_ROLE_KEY for administrative bypass of RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Security check: Only authenticated users (municipal staff)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, description, category, lat, lng, metadata } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID de item requerido' }, { status: 400 });
        }

        // Perform administrative update
        const { data, error } = await supabaseAdmin
            .from('items')
            .update({
                title,
                description,
                category,
                lat,
                lng,
                metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
                status: body.status || undefined // Allow status update if provided
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating item from server:', error);
            return NextResponse.json({ error: `Error al actualizar: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, alert: data });

    } catch (error: any) {
        console.error('Critical API Failure (update-alert):', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
