-- RUN THIS SCRIPT TO FIX CURRENT TEMPLATES IN THE DB
DO $$
DECLARE
  cig_template_id UUID;
  pap_template_id UUID;
BEGIN
  -- Borrar las unidades de plantilla viejas
  DELETE FROM public.template_units;
  DELETE FROM public.unit_templates;

  -- Re-insertar con los nuevos valores base
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
END $$;
