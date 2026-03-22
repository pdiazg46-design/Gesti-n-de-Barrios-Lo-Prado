-- Épica 11: Células Fundadoras Finitas (Motor Anti-Fugas VIP)

-- 0. Preparar tabla perfiles para la validación de Administradores
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_community_admin BOOLEAN DEFAULT false;

-- 1. Crear tabla de Códigos VIP
CREATE TABLE IF NOT EXISTS public.vip_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- Ej: "UV19-S1"
    community_id INTEGER NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 2,
    current_uses INTEGER NOT NULL DEFAULT 0,
    created_by_admin UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 2. Habilitar RLS
ALTER TABLE public.vip_codes ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad (RLS)
-- Cualquier usuario (incluso anónimos o en proceso de registro) pueden LEER los códigos para validación inicial en Frontend
CREATE POLICY "Anyone can read active vip codes" 
ON public.vip_codes FOR SELECT 
USING (is_active = true);

-- Las interacciones de inserción y actualización profunda (sumar cupos)
-- se harán directamente vía API Route utilizando Service Role Key para evitar fugas y hacks en PWA.
-- Sin embargo, habilitamos a los Admins a generar códigos vía Frontend.
CREATE POLICY "Admins can insert vip codes" 
ON public.vip_codes FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_community_admin = true
  )
);

CREATE POLICY "Admins can update vip codes" 
ON public.vip_codes FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_community_admin = true
  )
);

-- Indexaciones para velocidad de consulta en el login
CREATE INDEX IF NOT EXISTS idx_vip_codes_code ON public.vip_codes(code);
CREATE INDEX IF NOT EXISTS idx_vip_codes_community ON public.vip_codes(community_id);
