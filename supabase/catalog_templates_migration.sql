-- ============================================================
-- MIGRACIÓN 2: Plantillas Estrictas de Unidades Comerciales
-- ============================================================

-- 1. Crear tabla de Plantillas
CREATE TABLE IF NOT EXISTS public.unit_templates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE, -- Ej: 'Cigarrillos (Box 20)', 'Papeles (Caja 100)'
  base_unit   TEXT        NOT NULL,        -- Ej: 'cigarrillo', 'hoja'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear tabla de Unidades de la Plantilla
CREATE TABLE IF NOT EXISTS public.template_units (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id       UUID        NOT NULL REFERENCES public.unit_templates(id) ON DELETE CASCADE,
  unit_name         TEXT        NOT NULL, -- Ej: 'Caja', 'Cartón', 'Pallet'
  conversion_factor NUMERIC     NOT NULL, -- Cantidad de la 'base_unit'
  hierarchy_level   INT         NOT NULL DEFAULT 0, -- 0 = unidad más grande (Pallet), n = unidad más chica
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Actualizar la tabla de Productos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_template_id UUID REFERENCES public.unit_templates(id);

-- Opcional: Eliminar la tabla anterior si no la usamos
DROP TABLE IF EXISTS public.product_units;

-- 4. RLS y Seguridad
ALTER TABLE public.unit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view templates" ON public.unit_templates FOR SELECT USING (true);
CREATE POLICY "Everyone can view template units" ON public.template_units FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.unit_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador'));

CREATE POLICY "Admins can manage template units" ON public.template_units
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador'));

-- 5. Insertar plantillas de ejemplo basadas en tu pedido (Opcional, pero ayuda a empezar rápido)
DO $$
DECLARE
  cig_template_id UUID;
  pap_template_id UUID;
BEGIN
  -- Plantilla Cigarrillos
  INSERT INTO public.unit_templates (name, base_unit) VALUES ('Cigarrillos Tradicional', 'atado') RETURNING id INTO cig_template_id;
  
  INSERT INTO public.template_units (template_id, unit_name, conversion_factor, hierarchy_level) VALUES
    (cig_template_id, 'Pallet', 15000, 0), -- 60 cajas * 25 cartones * 10 atados
    (cig_template_id, 'Caja', 250, 1),     -- 25 cartones * 10 atados
    (cig_template_id, 'Cartón', 10, 2);    -- 10 atados
    
  -- Plantilla Papeles
  INSERT INTO public.unit_templates (name, base_unit) VALUES ('Papeles Estándar', 'blister') RETURNING id INTO pap_template_id;
  
  INSERT INTO public.template_units (template_id, unit_name, conversion_factor, hierarchy_level) VALUES
    (pap_template_id, 'Caja', 100, 0);     -- 100 blisters

    
EXCEPTION WHEN unique_violation THEN
  -- Muted si ya existen
END $$;
