-- Epic 9: Divisiones Microscópicas por Unidad Vecinal
-- Esto permite que una comuna tenga múltiples grupos numerados bajo una misma Unidad Vecinal (Ej: UV 19 - Grupo 1, UV 19 - Grupo 2)

-- 1. Añadimos la Unidad Vecinal a la tabla principal
ALTER TABLE public.communities ADD COLUMN uv_number INTEGER;

-- 2. Aseguramos que los nombres de los grupos sigan siendo únicos (por unidad vecinal)
-- Opcional, pero recomendado:
-- ALTER TABLE public.communities ADD CONSTRAINT unique_uv_group UNIQUE (uv_number, name);

-- (Si la base de datos ya está operando en producción, el único paso obligatorio es el ADD COLUMN)
