
-- Disable RLS momentarily to ensure cleanup
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Delete all items
DELETE FROM items;

-- Re-enable and set permissive policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public logic for items" ON items;
CREATE POLICY "Public logic for items" ON items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir borrado a creadores" ON items;
CREATE POLICY "Permitir borrado a creadores" ON items FOR DELETE USING (true);
