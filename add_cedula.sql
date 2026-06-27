ALTER TABLE public.humanitarian_reports ADD COLUMN IF NOT EXISTS cedula TEXT;

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
    INSERT INTO public.humanitarian_reports (tenant_id, reporter_phone, person_name, age, gender, location, status, companion_info, cedula)
    VALUES (p_tenant_id, p_reporter_phone, p_person_name, p_age, p_gender, p_location, p_status, p_companion_info, p_cedula)
    RETURNING id INTO v_new_report_id;

    FOR v_match_record IN
        SELECT id, similarity(person_name, p_person_name) as score
        FROM public.humanitarian_reports
        WHERE tenant_id = p_tenant_id
          AND id != v_new_report_id
          AND status != p_status
          AND similarity(person_name, p_person_name) > 0.4
    LOOP
        INSERT INTO public.matches (report_a_id, report_b_id, similarity_score)
        VALUES (v_new_report_id, v_match_record.id, v_match_record.score);
    END LOOP;

    RETURN jsonb_build_object('success', true, 'report_id', v_new_report_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
