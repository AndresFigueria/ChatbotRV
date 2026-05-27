import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Fetch nodes
  const getStmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    
    // Find Log Conversation node
    const logNode = nodes.find(n => n.name === 'Log Conversation');
    if (logNode) {
      console.log("Updating Log Conversation node JSON body...");
      logNode.parameters.jsonBody = `={{ JSON.stringify({
  "phone": $('Format WhatsApp Response').first().json.from,
  "customer_name": $('Format WhatsApp Response').first().json.customer_name || null,
  "inbound_message": $('Format WhatsApp Response').first().json.inbound_message || null,
  "inbound_type": $('Format WhatsApp Response').first().json.inbound_type || null,
  "agent_response": $('Format WhatsApp Response').first().json.reply,
  "status": "ok"
}) }}`;
    }
    
    // Find Guardar Respuesta Bot node
    const saveNode = nodes.find(n => n.name === 'Guardar Respuesta Bot');
    if (saveNode) {
      console.log("Updating Guardar Respuesta Bot node JSON body...");
      saveNode.parameters.jsonBody = `={{ JSON.stringify({
  "p_phone": $('Format WhatsApp Response').first().json.from,
  "p_message": $('Format WhatsApp Response').first().json.reply,
  "p_direction": "outbound",
  "p_customer_name": $('Normalize WhatsApp Message').first().json.customer_name || null,
  "p_tenant_id": $('HTTP Request').first().json.id
}) }}`;
    }
    
    const nodesJson = JSON.stringify(nodes);
    
    // Update workflow_entity
    const updateEntityStmt = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
    updateEntityStmt.run(nodesJson);
    console.log("Updated nodes in workflow_entity!");
    
    // Update workflow_history
    const updateHistoryStmt = db.prepare(
      "UPDATE workflow_history SET nodes = ? WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'"
    );
    updateHistoryStmt.run(nodesJson);
    console.log("Updated nodes in workflow_history!");
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error("Error fixing JSON bodies:", err);
}
