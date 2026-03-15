-- MIGRACIÓN SECUNDARIA: Agregar descripciones y unidades base explícitas

-- 1. Añadir columna descripcion a las unidades
ALTER TABLE public.template_units ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Limpiar y re-insertar data con la unidad base incluida (factor = 1)
DO $$
DECLARE
  cig_template_id UUID;
  pap_template_id UUID;
BEGIN
  -- Borrar las unidades de plantilla actuales
  DELETE FROM public.template_units;

  -- Re-insertar con los nuevos valores base
  -- Buscar IDs de las plantillas existentes
  SELECT id INTO cig_template_id FROM public.unit_templates WHERE name = 'Cigarrillos Tradicional' LIMIT 1;
  SELECT id INTO pap_template_id FROM public.unit_templates WHERE name = 'Papeles Estándar' LIMIT 1;
  
  -- Si encontramos Cigarrillos
  IF cig_template_id IS NOT NULL THEN
    INSERT INTO public.template_units (template_id, unit_name, conversion_factor, hierarchy_level, description) VALUES
      (cig_template_id, 'Pallet', 15000, 0, 'Pallet completo (60 cajas)'),
      (cig_template_id, 'Caja', 250, 1, 'Caja Master (25 cartones)'),
      (cig_template_id, 'Cartón', 10, 2, 'Cartón c/ 10 atados'),
      (cig_template_id, 'Atado', 1, 3, '1 unidad o atado');    -- << NUEVO: Unidad = 1 con descripción
  END IF;
    
  -- Si encontramos Papeles
  IF pap_template_id IS NOT NULL THEN
    INSERT INTO public.template_units (template_id, unit_name, conversion_factor, hierarchy_level, description) VALUES
      (pap_template_id, 'Caja', 100, 0, 'Caja (100 blisters)'),
      (pap_template_id, 'Blister', 1, 1, '1 unidad o blister');    -- << NUEVO: Unidad = 1 con descripción
  END IF;
END $$;
