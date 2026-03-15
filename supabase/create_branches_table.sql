-- Migración: Crear tabla de Sucursales y relacionar con Cuentas

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para sucursales
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.branches
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir gestión a administradores" ON public.branches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'administrador'
        )
    );

-- Agregar relación en la tabla de clientes (cuentas)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

COMMENT ON COLUMN public.customers.branch_id IS 'Relación con la sucursal a la que pertenece esta cuenta.';
