import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const connections = JSON.parse(row.connections);
    console.log("=== CONNECTIONS TO Format WhatsApp Response ===");
    // Find who targets Format WhatsApp Response
    Object.keys(connections).forEach(nodeName => {
      const nodeconns = connections[nodeName];
      if (nodeconns.main) {
        nodeconns.main.forEach((targets, index) => {
          targets.forEach(target => {
            if (target.node === 'Format WhatsApp Response') {
              console.log(`Source: ${nodeName} (Port: main, index: ${index}) -> Target: Format WhatsApp Response`);
            }
          });
        });
      }
    });
  }
} catch (err) {
  console.error(err);
}
