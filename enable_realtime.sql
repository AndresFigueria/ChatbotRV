-- ============================================================
-- 🚀 ACTIVAR SINCRONIZACIÓN EN TIEMPO REAL
-- Ejecuta esto en tu Supabase SQL Editor
-- ============================================================

-- Asegurarnos de que las tablas envíen eventos al Dashboard en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
