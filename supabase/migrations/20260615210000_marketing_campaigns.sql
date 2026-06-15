-- Tabla para el historial de campañas de marketing masivas
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    audience_segment TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    revenue_generated NUMERIC DEFAULT 0.00,
    status TEXT DEFAULT 'En Vivo', -- 'En Vivo', 'Completado', 'Fallido'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS básicas
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read marketing_campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Allow all insert marketing_campaigns" ON public.marketing_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update marketing_campaigns" ON public.marketing_campaigns FOR UPDATE USING (true);
CREATE POLICY "Allow all delete marketing_campaigns" ON public.marketing_campaigns FOR DELETE USING (true);
