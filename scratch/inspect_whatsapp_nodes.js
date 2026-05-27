import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const targetNodes = nodes.filter(n => 
      n.type.includes('whatsapp') || 
      n.name.toLowerCase().includes('whatsapp') ||
      JSON.stringify(n.parameters).includes('graph.facebook.com') ||
      n.name === 'Send WhatsApp Message' ||
      n.name === 'WhatsApp Webhook POST'
    );
    
    console.log(JSON.stringify(targetNodes, null, 2));
  } else {
    console.log("Workflow not found.");
  }
} catch (err) {
  console.error(err);
}
