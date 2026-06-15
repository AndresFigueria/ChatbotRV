-- Migración: Columnas de control para recordatorios de citas
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE public.landing_leads
  ADD COLUMN IF NOT EXISTS reminder_60_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_10_sent boolean DEFAULT false;

-- Índice para acelerar la query del cron de n8n
CREATE INDEX IF NOT EXISTS idx_landing_leads_appointment_date
  ON public.landing_leads (appointment_date)
  WHERE appointment_time IS NOT NULL;

-- Verificar columnas agregadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'landing_leads'
  AND column_name IN ('reminder_60_sent', 'reminder_10_sent');
