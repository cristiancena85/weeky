-- ============================================================
-- MIGRACIÓN: Añadir campo localidad a Depósitos
-- ============================================================

-- 1. Añadir columna localidad
ALTER TABLE public.depositos 
ADD COLUMN IF NOT EXISTS localidad TEXT;
