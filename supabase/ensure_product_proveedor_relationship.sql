-- Asegurar que cada producto tenga un proveedor vinculado
-- Paso 1: Si hay productos sin proveedor, asignar uno temporal o el primero disponible
DO $$ 
DECLARE 
    first_proveedor_id UUID;
BEGIN
    SELECT id INTO first_proveedor_id FROM public.proveedores LIMIT 1;
    
    IF first_proveedor_id IS NOT NULL THEN
        UPDATE public.products 
        SET proveedor_id = first_proveedor_id 
        WHERE proveedor_id IS NULL;
    END IF;
END $$;

-- Paso 2: Hacer que proveedor_id sea NOT NULL
ALTER TABLE public.products 
ALTER COLUMN proveedor_id SET NOT NULL;

-- Paso 3: Asegurar la restricción de llave foránea (por si no existía o para reforzar)
-- Nota: La migración previa ya la añadía, pero esto asegura integridad.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_proveedor_id_fkey'
    ) THEN
        ALTER TABLE public.products
        ADD CONSTRAINT products_proveedor_id_fkey 
        FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON DELETE CASCADE;
    END IF;
END $$;
