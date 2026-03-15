-- Migración: Agregar tipo a clientes
-- Posibles valores: 'cliente' (default), 'vendedor'

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'cliente' CHECK (type IN ('cliente', 'vendedor'));

-- Actualizar comentarios para claridad
COMMENT ON COLUMN public.customers.type IS 'Define si el registro es un Cliente (preventa) o un Vendedor (distribución/stock).';
