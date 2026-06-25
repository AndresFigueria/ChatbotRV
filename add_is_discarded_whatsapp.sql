-- =====================================================
-- MIGRACIÓN: Guardar chats descartados (que no sirven)
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================

ALTER TABLE whatsapp_chats 
ADD COLUMN IF NOT EXISTS is_discarded BOOLEAN DEFAULT false;
