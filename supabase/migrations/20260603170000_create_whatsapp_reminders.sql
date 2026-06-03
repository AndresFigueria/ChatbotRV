-- Creación de la tabla de recordatorios de WhatsApp programados
CREATE TABLE IF NOT EXISTS public.whatsapp_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexar para agilizar la consulta de recordatorios pendientes
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_status_time 
ON public.whatsapp_reminders(sent, scheduled_for);

-- Habilitar RLS
ALTER TABLE public.whatsapp_reminders ENABLE ROW LEVEL SECURITY;

-- Política de acceso total para desarrollo y automatizaciones
CREATE POLICY "Acceso total público en whatsapp_reminders" 
ON public.whatsapp_reminders FOR ALL USING (true) WITH CHECK (true);
