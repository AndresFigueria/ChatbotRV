CREATE OR REPLACE FUNCTION public.get_chat_history(p_phone TEXT)
RETURNS JSONB AS $$
DECLARE
    v_history TEXT := '';
    v_msg RECORD;
BEGIN
    FOR v_msg IN (
        SELECT m.direction, m.message_body
        FROM public.whatsapp_messages m
        JOIN public.whatsapp_chats c ON c.id = m.chat_id
        WHERE c.phone = p_phone
        ORDER BY m.created_at DESC
        LIMIT 6
    ) LOOP
        v_history := UPPER(v_msg.direction) || ': ' || v_msg.message_body || E'\n\n' || v_history;
    END LOOP;
    
    IF v_history = '' THEN
        v_history := 'Sin historial previo.';
    END IF;
    
    RETURN jsonb_build_object('history', v_history);
END;
$$ LANGUAGE plpgsql;
