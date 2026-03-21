-- Script de Migración para Módulo de Chat Privado 1-a-1
-- Pégalo y ejecútalo en el SQL Editor de tu Dashboard de Supabase.

-- 1. Tabla: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_a UUID NOT NULL, 
    participant_b UUID NOT NULL,
    item_id UUID, -- Opcional, referencia al producto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversations
CREATE POLICY "Vecinos pueden ver sus propias conversaciones" ON public.conversations
    FOR SELECT
    USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Solo los propios vecinos pueden iniciar un chat" ON public.conversations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND (auth.uid() = participant_a OR auth.uid() = participant_b));

-- 2. Tabla: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para messages
CREATE POLICY "Participantes pueden leer mensajes de sus chats" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
        )
    );

CREATE POLICY "Participantes pueden enviar mensajes en sus chats" ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id 
            AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
        )
    );

-- 3. IMPORTANTE: Habilitar Realtime en la tabla messages para "Mensajería en Vivo"
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
