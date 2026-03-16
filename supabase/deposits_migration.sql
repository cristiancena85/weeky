-- ============================================================
-- MIGRACIÓN: Módulo de Depósitos y Cargas ENS
-- ============================================================

-- 1. Tabla de PROVEEDORES
CREATE TABLE IF NOT EXISTS public.proveedores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    cuit        TEXT UNIQUE,
    direccion   TEXT,
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de DEPÓSITOS
-- Almacena depósitos centrales y sub-depósitos (vendedores/camionetas)
CREATE TABLE IF NOT EXISTS public.depositos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    tipo        TEXT NOT NULL CHECK (tipo IN ('central', 'vendedor')),
    sucursal_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    usuario_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Para tipo 'vendedor'
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de STOCK POR DEPÓSITO (Inventario Actual)
CREATE TABLE IF NOT EXISTS public.stock_deposito (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposito_id UUID NOT NULL REFERENCES public.depositos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    cantidad    INTEGER NOT NULL DEFAULT 0, -- Unidad mínima
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(deposito_id, producto_id)
);

-- 4. Tabla de REMITOS DE PROVEEDOR
CREATE TABLE IF NOT EXISTS public.remitos_proveedor (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id    UUID NOT NULL REFERENCES public.proveedores(id),
    numero_remito   TEXT NOT NULL,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
    deposito_id     UUID NOT NULL REFERENCES public.depositos(id), -- Usualmente un depósito central
    creado_por      UUID REFERENCES public.profiles(id),
    observaciones   TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 5. Detalle de REMITOS DE PROVEEDOR
CREATE TABLE IF NOT EXISTS public.items_remito_proveedor (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remito_id       UUID NOT NULL REFERENCES public.remitos_proveedor(id) ON DELETE CASCADE,
    producto_id     UUID NOT NULL REFERENCES public.products(id),
    cantidad        INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de CARGAS ENS (Movimientos Depósito -> Vendedor)
CREATE TABLE IF NOT EXISTS public.cargas_ens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ens          SERIAL, -- Autoincremental para numeración interna
    vendedor_id         UUID NOT NULL REFERENCES public.profiles(id),
    deposito_origen_id  UUID NOT NULL REFERENCES public.depositos(id),
    deposito_destino_id UUID NOT NULL REFERENCES public.depositos(id),
    fecha               TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado              TEXT NOT NULL DEFAULT 'completado' CHECK (estado IN ('borrador', 'completado', 'anulado')),
    creado_por          UUID REFERENCES public.profiles(id),
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- 7. Detalle de CARGAS ENS
CREATE TABLE IF NOT EXISTS public.items_carga_ens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carga_id        UUID NOT NULL REFERENCES public.cargas_ens(id) ON DELETE CASCADE,
    producto_id     UUID NOT NULL REFERENCES public.products(id),
    cantidad        INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_deposito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remitos_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_remito_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargas_ens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_carga_ens ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Select para todos los autenticados)
CREATE POLICY "Select todos autenticados" ON public.proveedores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Select todos autenticados" ON public.depositos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Select todos autenticados" ON public.stock_deposito FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Select todos autenticados" ON public.remitos_proveedor FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Select todos autenticados" ON public.cargas_ens FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para Admins y Jefes de Depósito
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.proveedores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.depositos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.stock_deposito FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.remitos_proveedor FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.items_remito_proveedor FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.cargas_ens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);
CREATE POLICY "Gestión Admins y Jefes Deposito" ON public.items_carga_ens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'jefe de deposito'))
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_deposito;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cargas_ens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.depositos;
