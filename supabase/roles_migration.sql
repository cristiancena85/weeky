-- ============================================================
-- FASE 5: SCRIPT DE MIGRACIÓN PARA ROLES DINÁMICOS
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Crear tabla de roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS en la nueva tabla
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para roles
-- Todos los usuarios logueados pueden LEER los roles (para que el formulario los vea)
CREATE POLICY "Users can view roles"
  ON public.roles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Solo los administradores pueden CREAR, EDITAR o BORRAR roles
CREATE POLICY "Admins can manage roles"
  ON public.roles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Insertar los oficios por defecto actuales (para no perder el estado que ya tenías)
INSERT INTO public.roles (name)
VALUES 
  ('jefe de deposito'), 
  ('jefe de ventas'), 
  ('supervisor'), 
  ('administrativo'), 
  ('tesorero')
ON CONFLICT (name) DO NOTHING;

-- 5. Eliminar la restricción de checkeo vieja (que forzaba roles estáticos)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Opcional (Recomendado): Forzar que cualquier rol nuevo provenga de esta tabla
-- Esto puede fallar si tenías un usuario con un rol 'loco' no registrado arriba.
-- Si falla, elimina la línea de abajo o agregalo arriba.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_fkey
  FOREIGN KEY (role) REFERENCES public.roles(name) ON UPDATE CASCADE ON DELETE SET NULL;
