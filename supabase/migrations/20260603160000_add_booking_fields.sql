-- Añadir nuevas columnas a landing_leads para capturar email y fecha/hora de la cita
ALTER TABLE public.landing_leads 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS appointment_date TEXT,
ADD COLUMN IF NOT EXISTS appointment_time TEXT;
