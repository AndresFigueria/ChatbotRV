-- Creación de la tabla de Leads de la Landing (perfilados)
CREATE TABLE IF NOT EXISTS public.landing_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    segment TEXT,
    volume TEXT,
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar características de tiempo real (Realtime)
alter publication supabase_realtime add table public.landing_leads;

-- Políticas de seguridad RLS básicas para que cualquiera pueda insertar leads y el panel pueda leerlos
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activar lectura/escritura pública en leads" ON public.landing_leads FOR ALL USING (true) WITH CHECK (true);
