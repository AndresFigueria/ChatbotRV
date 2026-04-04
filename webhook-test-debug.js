import http from 'http';
import { URL } from 'url';

const VERIFY_TOKEN = 'maitre-silencioso-token-123';

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  
  if (reqUrl.pathname === '/functions/v1/whatsapp-webhook') {
    // 1. Fase GET (Verificación de Meta)
    if (req.method === 'GET') {
      const mode = reqUrl.searchParams.get('hub.mode');
      const token = reqUrl.searchParams.get('hub.verify_token');
      const challenge = reqUrl.searchParams.get('hub.challenge');

      if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          console.log('🟢 WEBHOOK_VERIFIED (Node Simulator)');
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          return res.end(challenge);
        } else {
          res.writeHead(403);
          return res.end();
        }
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('WhatsApp Webhook simulator is running 🚀');
    }

    // 2. Fase POST (Recepción de Mensajes)
    if (req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => {
        bodyData += chunk.toString();
      });
      req.on('end', () => {
        try {
          const body = JSON.parse(bodyData);
          if (body.object === 'whatsapp_business_account') {
            if (body.entry) {
                for (const entry of body.entry) {
                    if (!entry.changes) continue;
                    for (const change of entry.changes) {
                        if (change.value && change.value.messages) {
                            const messageInfo = change.value.messages[0];
                            const contactInfo = change.value.contacts?.[0];
                            
                            const fromPhonenumber = messageInfo.from;
                            const customerName = contactInfo?.profile?.name || "Desconocido";
                            const messageBody = messageInfo.text?.body || "(Multimedia)";
                            
                            console.log(`💬 Mensaje entrante - De: ${customerName} (${fromPhonenumber}) | Texto: ${messageBody}`);
                        }
                    }
                }
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end('EVENT_RECEIVED');
          } else {
             res.writeHead(404);
             return res.end();
          }
        } catch(e) {
          console.error(e);
          res.writeHead(500);
          return res.end();
        }
      });
      return;
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 54321;
server.listen(PORT, () => {
  console.log(`📡 Servidor Local de Pruebas Webhook (Puro Node) escuchando en puerto ${PORT}...`);
});
