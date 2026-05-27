# 🤖 Robotina — Falta Por Hacer (Roadmap SaaS)

Última actualización: 2026-05-18

---

## 🔴 FASE 1 — MVP Vendible (Crítico, ~3-4 semanas)
Sin esto NO se puede vender el producto.

- [x] **1. Multi-tenant en n8n y Supabase**
  - Tabla `tenants` en Supabase con datos de cada cliente
  - Columna `tenant_id` en todas las tablas existentes (orders, reservations, menu_items, etc.)
  - Nodo "Resolver Tenant" en n8n por `business_phone_number_id`
  - Credenciales dinámicas por cliente (token WhatsApp, system prompt)

- [x] **2. Onboarding del cliente en el dashboard**
  - Formulario de registro del negocio (nombre, tipo, logo)
  - Paso para conectar número de WhatsApp (manual por ahora)
  - Paso para cargar menú inicial

- [x] **3. Panel para que el cliente gestione su menú**
  - CRUD de productos (crear, editar, eliminar)
  - Subida de imágenes por producto
  - Toggle de disponibilidad (is_available)

- [x] **4. Token WhatsApp permanente por cliente**
  - Sistema User de Meta por cliente
  - Almacenamiento seguro del token en Supabase (cifrado)
  - Renovación automática si vence

- [x] **5. Manejo de errores robusto en n8n**
  - Fallback si OpenAI falla (respuesta genérica)
  - Fallback si Supabase falla
  - Log de errores por tenant
  - Alerta al administrador (Robotina) si hay falla crítica

---

## 🟡 FASE 2 — Producto Completo (~4-6 semanas después)
Necesario para retener clientes y escalar.

- [x] **6. Dashboard con conversaciones en tiempo real**
  - Vista de chats activos por número de WhatsApp
  - Historial de conversaciones filtrado por fecha
  - Indicador de bot activo / modo humano

- [x] **7. Configuración del bot desde el dashboard**
  - Editar system prompt (tono, nombre del bot, reglas)
  - Configurar horario de atención
  - Toggle de funciones (pedidos, reservas, catálogo)

- [x] **8. Vista de pedidos y reservas**
  - Lista de pedidos con estado (Pendiente, Preparando, Listo)
  - Cambio de estado desde el dashboard
  - Vista de reservas (Formato lista detallada)

- [x] **9. Notificaciones cuando llega pedido/reserva**
  - Notificación push en el dashboard (realtime Supabase)
  - Email al negocio cuando llega pedido nuevo
  - Opción: notificación por WhatsApp al dueño

- [ ] **10. Métricas básicas**
  - Mensajes recibidos por día/semana
  - Pedidos registrados vs. conversaciones
  - Tasa de respuesta del bot
  - Clientes nuevos vs. recurrentes

---

## 🟢 FASE 3 — Competir con los grandes (Futuro)
Nice to have para diferenciarse.

- [ ] **11. Transferencia a agente humano** desde WhatsApp ("hablar con persona")
- [ ] **12. Soporte para imágenes** en mensajes entrantes
- [ ] **13. Respuestas con botones y listas** de WhatsApp (Interactive Messages)
- [ ] **14. Horarios automáticos** (bot activo solo en horario del negocio)
- [ ] **15. Embedded Signup** (cliente conecta su número de WhatsApp solo, sin asistencia)
- [ ] **16. Multi-agente humano** (varios empleados atienden desde el dashboard)
- [ ] **17. Campañas de mensajes masivos** (broadcast a clientes)
- [ ] **18. Bot entrenado con datos del negocio** (RAG con menú, FAQs, etc.)

---

## 💰 Modelo de Precios Sugerido

| Plan | Precio/mes | Mensajes | Features |
|------|-----------|---------|---------|
| Starter | $49 | 1,000 conv. | Catálogo + Respuestas |
| Growth | $99 | 5,000 conv. | + Pedidos + Reservas |
| Advanced | $199 | Ilimitado | + Analytics + Soporte |
| Enterprise | A convenir | Ilimitado | + Setup completo + Multi-agente |

---

## 📋 Estado del sistema al día de hoy

| Componente | Estado | Notas |
|-----------|--------|-------|
| Bot WhatsApp con IA | ✅ Funciona | n8n + GPT-4o-mini |
| Consulta de menú | ✅ Funciona | Supabase menu_items |
| Registro de pedidos | ✅ Funciona | RPC crear_pedido |
| Registro de reservas | ✅ Funciona | RPC crear_reserva |
| Control modo humano | ✅ Funciona | is_bot_active en Supabase |
| Dashboard React | ✅ Existe | Falta funcionalidad |
| Sistema de pagos | ✅ Existe | Stripe integrado |
| Multi-tenant | ✅ Listo | Supabase RLS y n8n dinámico |
| Onboarding cliente | ✅ Listo | Wizard VIP / Auto-servicio |
| Gestión de menú UI | ✅ Listo | CRUD en Catalog.tsx |
