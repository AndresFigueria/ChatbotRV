import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  const getStmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const formatNode = nodes.find(n => n.name === 'Format WhatsApp Response');
    
    if (formatNode) {
      console.log("Updating Format WhatsApp Response JS code...");
      
      formatNode.parameters.jsCode = `const input = $json;

let reply = input.output || input.reply || input.text || '';

if (!reply) {
  reply = 'Gracias por escribirnos. ¿En qué puedo ayudarte?';
}

if (reply.length > 3500) {
  reply = reply.slice(0, 3400) + '\\n\\nTe resumo lo principal arriba. Si deseas, te puedo dar más detalle.';
}

// Strip markdown images entirely: ![Name](URL)
reply = reply.replace(/!\\[.*?\\]\\(.*?\\)/g, '');

// Format standard markdown links [Text](URL) to "Text (URL)"
reply = reply.replace(/\\[(.*?)\\]\\((.*?)\\)/g, '$1 ($2)');

reply = reply
  .replace(/\\*\\*/g, '*')
  .replace(/#{1,6}\\s/g, '')
  .trim();

let from = input.from || input.customer_phone || input.phone || '';

try {
  const normalize = $('Normalize WhatsApp Message').first().json;
  from = from || normalize.from || normalize.customer_phone || normalize.phone || '';
} catch (error) {
  // Safe fallback
}

return [
  {
    json: {
      from,
      reply
    }
  }
];`;
      
      const nodesJson = JSON.stringify(nodes);
      
      // Update workflow_entity
      const updateEntityStmt = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
      updateEntityStmt.run(nodesJson);
      console.log("Updated Format WhatsApp Response in workflow_entity!");
      
      // Update workflow_history
      const updateHistoryStmt = db.prepare(
        "UPDATE workflow_history SET nodes = ? WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'"
      );
      updateHistoryStmt.run(nodesJson);
      console.log("Updated Format WhatsApp Response in workflow_history!");
    }
  }
} catch (err) {
  console.error("Error updating format response code:", err);
}
