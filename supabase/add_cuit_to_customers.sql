-- ============================================================
-- MIGRACIÓN: Añadir CUIT y Reforzar Relación con Sucursal
-- ============================================================

-- Añadir columna cuit a la tabla de clientes/vendedores
ALTER TABLE public.customers
ADD COLUMN cuit TEXT;

-- Comentario: Ya existe branch_id, aseguramos que sea una FK (por si acaso)
-- y mantenemos la flexibilidad de nulos si hay datos previos, 
-- pero la UI lo exigirá como obligatorio de ahora en adelante.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_branch_id_fkey') THEN
        ALTER TABLE public.customers
        ADD CONSTRAINT customers_branch_id_fkey 
        FOREIGN KEY (branch_id) REFERENCES public.branches(id);
    END IF;
END $$;
