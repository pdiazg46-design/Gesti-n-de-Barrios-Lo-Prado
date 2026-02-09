-- ============================================
-- FIX DEFINITIVO: PERMISOS DE ELIMINACIÓN (RLS)
-- ============================================

-- 1. Habilitar RLS en la tabla (por si acaso no lo está)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas existentes para evitar errores de duplicado
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.items;

-- 3. Crear la política real
CREATE POLICY "Users can delete their own reports"
ON public.items FOR DELETE
USING (
    auth.uid() = creator_id 
    OR 
    (auth.jwt() ->> 'email') = author_email
);

-- 4. Opcional: Política para actualización (si quieres editar en el futuro)
DROP POLICY IF EXISTS "Users can update their own reports" ON public.items;
CREATE POLICY "Users can update their own reports"
ON public.items FOR UPDATE
USING (
    auth.uid() = creator_id 
    OR 
    (auth.jwt() ->> 'email') = author_email
);

-- Verificación:
-- SELECT * FROM pg_policies WHERE tablename = 'items';
