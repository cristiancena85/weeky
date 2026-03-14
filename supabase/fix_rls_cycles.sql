-- ============================================================
-- CORRECCIÓN: Políticas RLS para Stock y Pedidos
-- ============================================================

-- 1. Políticas para STOCK_CYCLES
CREATE POLICY "Admins can manage stock_cycles" ON public.stock_cycles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador')
);

-- 2. Políticas para PRODUCT_STOCK
CREATE POLICY "Admins can manage product_stock" ON public.product_stock FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'administrador')
);

-- 3. Políticas para ORDERS
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'vendedor'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'vendedor'))
);

-- 4. Políticas para ORDER_ITEMS
CREATE POLICY "Admins can manage order_items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'vendedor'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (user_type = 'administrador' OR role = 'vendedor'))
);

-- 5. Asegurar que los pedidos puedan ser vistos por sus creadores (redundante con Select for everyone pero por seguridad)
DROP POLICY IF EXISTS "Everyone can view orders" ON public.orders;
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
