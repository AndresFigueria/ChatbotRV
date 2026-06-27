-- ============================================================
-- SCRIPT DE BASE DE DATOS: MOTOR DE COINCIDENCIAS (MATCHES) CON CÉDULA
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Extensión para fuzzy matching

-- 1. Tabla de Reportes Humanitarios
CREATE TABLE IF NOT EXISTS public.humanitarian_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    reporter_phone TEXT NOT NULL,
    person_name TEXT NOT NULL,
    cedula TEXT,
    age TEXT,
    gender TEXT,
    location TEXT,
    status TEXT NOT NULL, -- 'Buscando', 'Encontrado', 'Seguro'
    companion_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (Por si la tabla ya existía pero sin la columna cédula)
ALTER TABLE public.humanitarian_reports ADD COLUMN IF NOT EXISTS cedula TEXT;

-- 2. Tabla de Coincidencias
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_a_id UUID REFERENCES public.humanitarian_reports(id) ON DELETE CASCADE,
    report_b_id UUID REFERENCES public.humanitarian_reports(id) ON DELETE CASCADE,
    similarity_score NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pendiente', -- 'Pendiente', 'Confirmado', 'Descartado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_a_id, report_b_id)
);

-- 3. Función RPC para registrar el reporte y buscar coincidencias automáticamente
CREATE OR REPLACE FUNCTION public.registrar_reporte(
    p_tenant_id UUID,
    p_reporter_phone TEXT,
    p_person_name TEXT,
    p_age TEXT,
    p_gender TEXT,
    p_location TEXT,
    p_status TEXT,
    p_companion_info TEXT,
    p_cedula TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_new_report_id UUID;
    v_match_record RECORD;
BEGIN
    -- Insertar el nuevo reporte con CÉDULA
    INSERT INTO public.humanitarian_reports (tenant_id, reporter_phone, person_name, cedula, age, gender, location, status, companion_info)
    VALUES (p_tenant_id, p_reporter_phone, p_person_name, p_cedula, p_age, p_gender, p_location, p_status, p_companion_info)
    RETURNING id INTO v_new_report_id;

    -- Buscar coincidencias con reportes de ESTADO OPUESTO usando pg_trgm (similitud > 0.4)
    FOR v_match_record IN
        SELECT id, similarity(person_name, p_person_name) as score
        FROM public.humanitarian_reports
        WHERE tenant_id = p_tenant_id
          AND id != v_new_report_id
          AND status != p_status
          AND similarity(person_name, p_person_name) > 0.4
    LOOP
        -- Insertar coincidencia
        INSERT INTO public.matches (report_a_id, report_b_id, similarity_score)
        VALUES (v_new_report_id, v_match_record.id, v_match_record.score);
    END LOOP;

    RETURN jsonb_build_object('success', true, 'report_id', v_new_report_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
