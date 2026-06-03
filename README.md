# 🤖 Dashboard Operativo de Inteligencia Artificial (Restaurant ERP)

![Banner del Proyecto](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200&h=300)

Bienvenido al sistema **RobotinaCentral**, un panel administrativo de nivel corporativo (Enterprise SaaS) diseñado específicamente para controlar de principio a fin la logística, ventas y marketing de un restaurante o cadena alimenticia que opera con pedidos 100% automatizados por un Bot de Inteligencia Artificial (WhatsApp/Meta Cloud).

---

## 🛠️ Stack Tecnológico
- **Frontend Framework:** React 19 + TypeScript (compilado ultrarrápido con Vite).
- **Backend & Database:** Supabase (PostgreSQL).
- **Sincronización:** Supabase Realtime Channels (Sockets en vivo sin recargas de página).
- **Analíticas Visuales:** Recharts (Data visualización SVG).
- **Routing:** React Router DOM (v6).
- **Estilos:** CSS Modules + Variables Nativas (Soporte nativo Dark Mode).

---

## 🧩 Arquitectura de Módulos (Core Features)

El sistema está dividido en 10 módulos de élite, cada uno enfocado en resolver un problema específico de la gastronomía asistida por IA.

### 1. Panel de Control (Dashboard Principal)
El centro de mandos en tiempo real.
- **KPIs Financieros:** Muestra ingresos diarios, LTV de clientes, pedidos atendidos y una métrica de Retorno de Inversión (Bot ROI).
- **Feed Vital (Sockets):** Cada vez que un cliente manda un mensaje al Bot o se registra un pedido, el Feed escupe un evento en la pantalla de inmediato.
- **Gráfica de Ocupación Acústica:** Un mapa de calor visual que le indica al gerente cómo estuvo de ocupado el Bot a lo largo del día.

### 2. Pedidos / Logística (Kanban Operativo)
La vista administrativa para los encargados de barra o despachadores.
- **Vista de Estados:** Los pedidos entran como `Pendiente`, se aceptan a `Preparando`, luego a `Listo` y finalmente a `Despachado`.
- **Integración Térmica:** Botón nativo de "Impresión" diseñado para conectarse a impresoras ESC/POS (Epson/Star).
- **Eliminación Segura:** Sistema de confirmación vía modal para anular pedidos fantasma.

### 3. Terminal Cocina KDS (Kitchen Display System)
Una visión exclusiva, cruda y de alta visibilidad para que los cocineros preparen la comida.
- **Modo Oscuro Extremo:** Diseñado con alto contraste y sin distractores. Solo muestra información relevante de la orden (Nro. Ticket, Artículos y Notas Dietéticas).
- **Filtro FIFO:** Descarta órdenes completadas y solo muestra las urgentes: `Pendientes` y `Preparando`. 

### 4. Clientes (CRM Automático)
Directorio maestro creado orgánicamente por cada interacción del Bot.
- **Operaciones CRUD:** Añadir, editar, buscar y borrar historial de clientes.
- **Segmentación Inteligente:** Etiqueta automáticamente a los usuarios en `VIP`, `Regulares` o `En Riesgo` calculando su frecuencia de compra.
- **Data AI:** Captura campos valiosos como *"Plato Favorito Detectado"* y *"Restricciones Dietéticas (ej. Vegano)"* extraídos por el Bot y sincronizados en vivo.

### 5. Menú (Inventario Bidireccional)
Control total sobre los productos que el Bot IA conoce y puede ofrecer.
- **Keywords System:** A cada producto se le pueden asociar "Palabras Clave PNL" (ej. *picante, familiar, promos, barato*) para que el Bot sepa recomendarlo cuando un humano exprese una emoción o intención natural.
- **Interruptor de Stock (Kill-Switch):** Un botón verde/rojo que, al apagarse, actualiza de inmediato la base de datos para que el Bot deje de ofrecer la *"Limonada"* si el restaurante se quedó sin limones ese segundo.

### 6. Analíticas (Business Intelligence)
Gráficos avanzados creados con `Recharts`. Mapean la retención histórica del bot, horas pico de la sucursal y el embudo de conversión para cruzar datos de rentabilidad semana a semana. 

### 7. Estado del Bot (Live Chat & Telemetría)
La consola del "Conductor".
- **Supervisión de NLP:** Muestra la intención de compra procesada y la confianza probabilística de la IA en tiempo real (ej. *Intención: Reclamo - Confianza: 98%*).
- **Control Override (Takeover):** Si un cliente se enoja o el Bot está fallando, un humano presiona "Tomar Control Humano", desconectando al Bot de esa conversación para que el administrador responda físicamente.

### 8. Marketing Bot (Generador de Difusión Masiva)
El motor de crecimiento del restaurante.
- **Campañas Inteligentes:** Permite lanzar un cupón de WhatsApp seleccionando a toda una sub-tribu del CRM (solo a los *"En Riesgo"* o solo a los *"VIP"*).
- **Simulador Realtime:** Mientras escribes las variables como `[Nombre]` o `[Plato]`, un teléfono simulado en la pantalla te muestra el mensaje final.
- **Secuencia de Despliegue:** Sistema asíncrono que manda eventos a la API de WhatsApp, registrando su éxito.

### 9. Configuración (Store Settings)
Ajustes guardados local y persistentemente. 
- **Marca:** Permite editar el nombre del local, el cual recarga el Sidebar nativamente usando Web Events.
- **Bot Behavior:** Se incluyen campos para ingresar las API Keys (OpenAI / Twilio) y manipular la "Personalidad de Sistema" de la Inteligencia Artificial.

### 10. Archivo y Auditoría (Bitácoras y Facturación)
La caja fuerte administrativa que aísla los datos cerrados del día.
- **Pestaña de Boletas:** Registra todas las órdenes "Completadas", proveyendo opciones ágiles para descargar factura en PDF o re-imprimir el ticket del pasado.
- **Audit Logs (Sistema de Trazabilidad):** Un muro tipo bitácora que registra a fuego qué empleado o qué robot (IA) realizó una acción sensible en el sistema para fines de investigación de errores y mala praxis. Cierre de caja virtual automatizado.

---

## 🚀 Instalación y Despliegue Local

1. Clona o descarga este repositorio de código.
2. Abre la terminal en el directorio del proyecto y ejecuta la instalación de los paquetes:
   ```bash
   npm install
   ```
3. Verifica que tu archivo `.env.local` tenga las llaves públicas de Supabase correctamente vinculadas:
   ```env
   VITE_SUPABASE_URL=tu-url-de-supabase
   VITE_SUPABASE_ANON_KEY=tu-llave-secreta
   ```
4. Levanta el ecosistema en desarrollo:
   ```bash
   npm run dev
   ```
5. Visita `http://localhost:5173` en tu navegador.

*El sistema está actualmente optimizado para despliegue serverless (ej. en Vercel, Netlify o AWS Amplify) operando como una Single Page Application (SPA).*
