-- ============================================================
-- MIGRACIÓN: Eliminar entidad independiente de Repartidores
-- ============================================================

-- 1. Asegurar que el rol 'repartidor' existe en las restricciones de profiles (si se usa CHECK)
-- Nota: Si profiles.role usa un ENUM en lugar de CHECK, habría que modificar el ENUM.
-- Basado en schema.sql L18: role CHECK (role IN (...))
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('jefe de deposito', 'jefe de ventas', 'supervisor', 'administrativo', 'tesorero', 'repartidor'));

-- 2. Modificar la relación en cargas_ens
-- Primero eliminamos la FK vieja que apunta a repartidores
ALTER TABLE public.cargas_ens
DROP CONSTRAINT IF EXISTS cargas_ens_repartidor_id_fkey;

-- Luego apuntamos la columna repartidor_id a la tabla profiles
ALTER TABLE public.cargas_ens
ADD CONSTRAINT cargas_ens_repartidor_id_fkey 
FOREIGN KEY (repartidor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Eliminar la tabla de repartidores obsoleta
DROP TABLE IF EXISTS public.repartidores;

-- 4. Opcional: Insertar rol repartidor en la tabla roles (si existe la tabla de catálogos)
-- INSERT INTO roles (name) VALUES ('repartidor') ON CONFLICT DO NOTHING;
