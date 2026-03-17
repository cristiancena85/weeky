-- Añadir columna para la URL de la foto del remito
ALTER TABLE public.remitos_proveedor 
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Nota: Recordar crear el bucket 'remitos' en el panel de Supabase Storage
-- con acceso de lectura para todos los autenticados.
