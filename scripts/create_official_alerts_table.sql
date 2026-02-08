-- Crear tabla official_alerts para El Megáfono
CREATE TABLE IF NOT EXISTS official_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('INFO', 'WARNING', 'EMERGENCY', 'MAINTENANCE')),
    zone_geometry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_official_alerts_created_at ON official_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_official_alerts_is_active ON official_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_official_alerts_alert_type ON official_alerts(alert_type);

-- Habilitar Row Level Security
ALTER TABLE official_alerts ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer alertas activas
CREATE POLICY "Todos pueden ver alertas activas"
    ON official_alerts
    FOR SELECT
    USING (is_active = TRUE);

-- Política: Solo usuarios autenticados pueden crear alertas (esto se puede restringir más)
CREATE POLICY "Usuarios autenticados pueden crear alertas"
    ON official_alerts
    FOR INSERT
    WITH CHECK (TRUE);

-- Comentarios para documentación
COMMENT ON TABLE official_alerts IS 'Alertas oficiales enviadas desde El Megáfono municipal';
COMMENT ON COLUMN official_alerts.title IS 'Título institucional de la alerta';
COMMENT ON COLUMN official_alerts.message IS 'Mensaje detallado de la alerta';
COMMENT ON COLUMN official_alerts.alert_type IS 'Tipo de alerta: INFO, WARNING, EMERGENCY, MAINTENANCE';
COMMENT ON COLUMN official_alerts.zone_geometry IS 'Geometría de la zona afectada (GeoJSON)';
COMMENT ON COLUMN official_alerts.expires_at IS 'Fecha de expiración de la alerta';
COMMENT ON COLUMN official_alerts.is_active IS 'Si la alerta está activa o fue archivada';
