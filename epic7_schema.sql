-- Migración Epic 7: Economía Circular y Moderación Cívica

-- 1. Añade contador de penalizaciones
ALTER TABLE public.profiles ADD COLUMN warning_count INTEGER DEFAULT 0;

-- 2. Añade bandera de expulsión definitiva
ALTER TABLE public.profiles ADD COLUMN is_banned BOOLEAN DEFAULT false;

-- Opcional: Refrescar caché del API de Supabase
NOTIFY pgrst, 'reload schema';
