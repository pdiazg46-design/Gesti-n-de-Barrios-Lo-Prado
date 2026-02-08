-- ============================================
-- PASO 1: LIMPIAR TABLAS EXISTENTES
-- ============================================

-- Borrar tablas en orden correcto (por las foreign keys)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- ============================================
-- PASO 2: CREAR ESQUEMA COMPLETO
-- ============================================

-- 1. TABLA COMMUNITIES
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  neighborhood_id UUID REFERENCES communities(id),
  karma_pts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA ITEMS (con soporte para OFFICIAL_ALERT)
CREATE TABLE items (
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
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  initiator_id UUID REFERENCES profiles(id),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_items_community ON items(community_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_location ON items(lat, lng);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS

-- Communities: Todos pueden leer
CREATE POLICY "Todos pueden ver comunidades"
  ON communities FOR SELECT
  USING (true);

-- Profiles: Todos pueden leer
CREATE POLICY "Todos pueden ver perfiles"
  ON profiles FOR SELECT
  USING (true);

-- Items: Todos pueden leer items activos
CREATE POLICY "Todos pueden ver items activos"
  ON items FOR SELECT
  USING (status = 'AVAILABLE' OR status = 'ACTIVE');

-- Items: Cualquiera puede crear items (incluyendo alertas oficiales)
CREATE POLICY "Cualquiera puede crear items"
  ON items FOR INSERT
  WITH CHECK (true);

-- 8. INSERTAR COMUNIDAD DE LO PRADO
INSERT INTO communities (name, slug, lat, lng)
VALUES (
  'Lo Prado',
  'lo-prado',
  -33.4489,
  -70.7256
);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- ✅ Base de datos lista para producción
