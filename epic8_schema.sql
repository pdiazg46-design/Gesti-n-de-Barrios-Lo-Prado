-- Epic 8: Vecinos Administradores de Grupo
-- Añadir columna de delegación de poder de moderación a los usuarios de la comunidad.

ALTER TABLE public.profiles ADD COLUMN is_community_admin BOOLEAN DEFAULT false;

-- Opcional: Hacer administrador automáticamente a los 2 primeros usuarios registrados en la base.
-- Esto se puede hacer identificándolos por fecha de creación o dejando que el municipio los designe manualmente.
