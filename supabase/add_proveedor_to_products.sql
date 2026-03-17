-- Añadir relación de proveedor a los productos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL;

-- Crear índice para optimizar filtrado por proveedor
CREATE INDEX IF NOT EXISTS idx_products_proveedor_id ON public.products(proveedor_id);
