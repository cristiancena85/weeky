-- ============================================================
-- MIGRACIÓN: Catálogo de Productos y Unidades Comerciales
-- ============================================================

-- 1. Tabla de Categorías (Tipos de Producto)
CREATE TABLE IF NOT EXISTS public.product_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE, -- 'Cigarrillos', 'Papeles de fumar', etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar categorías iniciales solicitadas
INSERT INTO public.product_categories (name) 
VALUES ('Cigarrillos'), ('Papeles de fumar')
ON CONFLICT (name) DO NOTHING;

-- 2. Modificar tabla de Productos existente
-- Añadimos las columnas solicitadas
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;    -- Marca
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant TEXT;  -- Variante
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shield TEXT;   -- Escudo
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS type TEXT;     -- Tipo (ej: Box, Soft)

-- 3. Tabla de Unidades de Producto (Jerarquía Comercial)
-- Esto reemplaza el campo JSON 'conversions' actual para permitir consultas relacionales
CREATE TABLE IF NOT EXISTS public.product_units (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  unit_name         TEXT        NOT NULL, -- Ej: 'Pallet', 'Caja', 'Cartón', 'Blister'
  conversion_factor NUMERIC     NOT NULL, -- A cuántas sub-unidades equivale (ej: 1 caja = 25 cartones -> factor = 25)
  is_base_unit      BOOLEAN     NOT NULL DEFAULT FALSE, -- Identifica la unidad más pequeña (cigarrillo, hoja)
  hierarchy_level   INT         NOT NULL DEFAULT 0, -- Para ordenar la jerarquía (0 = más grande, n = más pequeña)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Seguridad a Nivel de Fila (RLS) para las nuevas tablas
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (todos los usuarios autenticados pueden ver el catálogo)
CREATE POLICY "Everyone can view categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Everyone can view product units" ON public.product_units FOR SELECT USING (true);

-- Políticas de escritura (solo administradores)
CREATE POLICY "Admins can manage categories" ON public.product_categories
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador'));

CREATE POLICY "Admins can manage product units" ON public.product_units
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador'));
