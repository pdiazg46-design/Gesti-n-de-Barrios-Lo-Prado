-- ============================================
-- ESQUEMA COMPLETO PARA COMUNIDAD SEGURA
-- ============================================
-- Ejecutar este script completo en Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/yrelbvgdixjsnltbzsez

-- 1. TABLA COMMUNITIES
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location_geom GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  neighborhood_id UUID REFERENCES communities(id),
  karma_pts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA ITEMS (con soporte para OFFICIAL_ALERT)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  community_id UUID REFERENCES communities(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 0,
  category TEXT,
  type TEXT CHECK (type IN ('GIFT', 'SALE', 'SWAP', 'SERVICE', 'CIVIC_REPORT', 'OFFICIAL_ALERT')),
  images TEXT[],
  status TEXT DEFAULT 'AVAILABLE',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  metadata JSONB,
  author_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  initiator_id UUID REFERENCES profiles(id),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_items_community ON items(community_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(lat, lng);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS

-- Communities: Todos pueden leer
DROP POLICY IF EXISTS "Todos pueden ver comunidades" ON communities;
CREATE POLICY "Todos pueden ver comunidades"
  ON communities FOR SELECT
  USING (TRUE);

-- Profiles: Todos pueden leer
DROP POLICY IF EXISTS "Todos pueden ver perfiles" ON profiles;
CREATE POLICY "Todos pueden ver perfiles"
  ON profiles FOR SELECT
  USING (TRUE);

-- Items: Todos pueden leer items activos
DROP POLICY IF EXISTS "Todos pueden ver items activos" ON items;
CREATE POLICY "Todos pueden ver items activos"
  ON items FOR SELECT
  USING (status = 'AVAILABLE' OR status = 'ACTIVE');

-- Items: Cualquiera puede crear items (incluyendo alertas oficiales)
DROP POLICY IF EXISTS "Cualquiera puede crear items" ON items;
CREATE POLICY "Cualquiera puede crear items"
  ON items FOR INSERT
  WITH CHECK (TRUE);

-- 8. INSERTAR COMUNIDAD DE LO PRADO
INSERT INTO communities (name, slug, location_geom)
VALUES (
  'Lo Prado',
  'lo-prado',
  ST_GeogFromText('POINT(-70.7256 -33.4489)')
)
ON CONFLICT (slug) DO NOTHING;

-- 9. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE items IS 'Items de la comunidad: regalos, ventas, intercambios, servicios, reportes cívicos y alertas oficiales';
COMMENT ON COLUMN items.type IS 'Tipo de item: GIFT, SALE, SWAP, SERVICE, CIVIC_REPORT, OFFICIAL_ALERT';
COMMENT ON COLUMN items.metadata IS 'Metadata adicional en formato JSON (ej. radio de alerta, tipo de emergencia)';
COMMENT ON COLUMN items.author_email IS 'Email del autor (usado para alertas oficiales municipales)';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Después de ejecutar este script, la aplicación debería funcionar correctamente
