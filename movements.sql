-- Tablas para Movimientos de Stock entre Depósitos

CREATE TABLE movimientos_deposito (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deposito_origen_id UUID REFERENCES depositos(id) NOT NULL,
  deposito_destino_id UUID REFERENCES depositos(id) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  creado_por UUID REFERENCES profiles(id),
  estado TEXT DEFAULT 'completado', -- 'pendiente', 'en_transito', 'completado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE items_movimiento_deposito (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movimiento_id UUID REFERENCES movimientos_deposito(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES products(id) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0)
);

-- Habilitar RLS (opcional si ya manejas permisos globales)
ALTER TABLE movimientos_deposito ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_movimiento_deposito ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según sea necesario)
CREATE POLICY "Permitir lectura a todos los autenticados" ON movimientos_deposito FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserción a todos los autenticados" ON movimientos_deposito FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir lectura de items a todos los autenticados" ON items_movimiento_deposito FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserción de items a todos los autenticados" ON items_movimiento_deposito FOR INSERT TO authenticated WITH CHECK (true);
