-- Script para crear perfil de sistema para alertas oficiales
-- Este perfil será usado como creator_id para todas las alertas municipales

-- Insertar perfil de sistema si no existe
INSERT INTO profiles (id, full_name, avatar_url, karma_pts)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Sistema Municipal Lo Prado',
    'https://via.placeholder.com/150?text=Municipalidad',
    0
)
ON CONFLICT (id) DO NOTHING;

-- Verificar que se creó correctamente
SELECT * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';
