-- Crear la tabla de bitácora del sistema
CREATE TABLE public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL,
    type TEXT NOT NULL, -- 'bot', 'admin', 'system', 'alert'
    user_email TEXT NOT NULL,
    details JSONB
);

-- Habilitar RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Crear política pública (temporal/desarrollo) para insertar y leer
CREATE POLICY "Permitir lectura publica" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica" ON public.system_logs FOR INSERT WITH CHECK (true);

-- Insertar logs iniciales
INSERT INTO public.system_logs (action, type, user_email)
VALUES 
  ('Inicialización del módulo de Auditoría Contable', 'system', 'system@robotina.local'),
  ('Actualización de configuración de Robotina (Prompts)', 'admin', 'admin@robotina.local');
