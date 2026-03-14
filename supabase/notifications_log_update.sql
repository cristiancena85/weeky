-- ============================================================
-- ACTUALIZACIÓN: Logs de Presencia en Notifications
-- ============================================================

-- 1. Añadir columna de tipo para distinguir notificaciones personales de logs de sistema
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'private';

-- 2. Actualizar políticas de RLS
-- Permitir que todos vean las notificaciones de tipo 'system' (el log)
DROP POLICY IF EXISTS "Everyone can view system notifications" ON public.notifications;
CREATE POLICY "Everyone can view system notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (type = 'system' OR auth.uid() = user_id);

-- 3. Habilitar inserción de logs por parte de cualquier usuario autenticado (con tipo 'system')
DROP POLICY IF EXISTS "Users can insert system logs" ON public.notifications;
CREATE POLICY "Users can insert system logs" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
