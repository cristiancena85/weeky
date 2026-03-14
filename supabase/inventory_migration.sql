-- ============================================================
-- MIGRACIÓN: Módulo de Pedidos y Stock Semanal
-- ============================================================

-- 1. Tabla de PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  sku         TEXT UNIQUE,
  -- Unidad base (ej. "unidad")
  base_unit   TEXT NOT NULL DEFAULT 'unidad',
  -- Factores de conversión (ej. {"caja": 250, "carton": 10})
  conversions JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de CLIENTES
CREATE TABLE IF NOT EXISTS public.customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de CICLOS SEMANALES
CREATE TABLE IF NOT EXISTS public.stock_cycles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date    TIMESTAMPTZ,
  -- 'abierto': cargando stock, 'activo': ventas activas, 'cerrado': semana finalizada
  status      TEXT NOT NULL DEFAULT 'abierto' CHECK (status IN ('abierto', 'activo', 'cerrado')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabla de STOCK POR CICLO (Inventario)
CREATE TABLE IF NOT EXISTS public.product_stock (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id          UUID NOT NULL REFERENCES public.stock_cycles(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  initial_quantity  INTEGER NOT NULL DEFAULT 0, -- En unidad mínima
  final_quantity    INTEGER,                    -- En unidad mínima (al cierre)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cycle_id, product_id)
);

-- 5. Tabla de PEDIDOS
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id          UUID NOT NULL REFERENCES public.stock_cycles(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  salesman_id       UUID NOT NULL REFERENCES public.profiles(id),
  status            TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'picking', 'entregado', 'cancelado')),
  total_amount      DECIMAL(12,2) DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Detalle del PEDIDO
CREATE TABLE IF NOT EXISTS public.order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity          INTEGER NOT NULL, -- Siempre almacenado en la unidad mínima
  display_quantity  DECIMAL(10,2),    -- La cantidad tal cual la escribió el vendedor
  display_unit      TEXT,             -- La unidad elegida (caja, carton, etc)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Select para todos los autenticados)
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Everyone can view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Everyone can view stock" ON public.product_stock FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Everyone can view orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para Admins y Jefes (Manage todo)
-- Nota: Asumimos que ya existe la función public.is_admin() o similar si no la creamos.
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador')
);

-- Habilitar Realtime para pedidos y stock
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_stock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_cycles;
