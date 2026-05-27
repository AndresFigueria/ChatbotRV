import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get current connections from workflow_entity
  const stmt = db.prepare("SELECT connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const connections = JSON.parse(row.connections);
    
    console.log("=== OLD CONNECTIONS ===");
    console.log("Bot Activo?:", JSON.stringify(connections['Bot Activo?'], null, 2));
    console.log("AI Agent:", JSON.stringify(connections['AI Agent'], null, 2));
    
    // Rewire Bot Activo? to ONLY target AI Agent
    connections['Bot Activo?'].main[0] = [
      {
        node: "AI Agent",
        type: "main",
        index: 0
      }
    ];
    
    // Rewire AI Agent (Success Port 0) to target Format WhatsApp Response
    connections['AI Agent'].main[0] = [
      {
        node: "Format WhatsApp Response",
        type: "main",
        index: 0
      }
    ];
    
    const connectionsJson = JSON.stringify(connections);
    
    // Update workflow_entity
    const updateEntityStmt = db.prepare("UPDATE workflow_entity SET connections = ? WHERE id = '7SwRxH0Jx08L3ILP'");
    updateEntityStmt.run(connectionsJson);
    console.log("Successfully rewired connections in workflow_entity!");
    
    // Update workflow_history
    const updateHistoryStmt = db.prepare(
      "UPDATE workflow_history SET connections = ? WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'"
    );
    updateHistoryStmt.run(connectionsJson);
    console.log("Successfully rewired connections in workflow_history!");
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error("Error rewiring workflow:", err);
}
