-- =====================================================
-- MIGRACIÓN: Guardar chats resaltados en Base de Datos
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================

ALTER TABLE whatsapp_chats 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
