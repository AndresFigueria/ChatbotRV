import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get workflow details from workflow_entity
  const getStmt = db.prepare("SELECT connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    const connections = JSON.parse(row.connections);
    console.log("Current HTTP Request connections:", JSON.stringify(connections['HTTP Request'], null, 2));
    
    if (connections['HTTP Request'] && connections['HTTP Request'].main && connections['HTTP Request'].main[0]) {
      // Filter out Crear Pedido
      const originalLength = connections['HTTP Request'].main[0].length;
      connections['HTTP Request'].main[0] = connections['HTTP Request'].main[0].filter(conn => conn.node !== 'Crear Pedido');
      const newLength = connections['HTTP Request'].main[0].length;
      
      if (originalLength !== newLength) {
        console.log("Removed connection from 'HTTP Request' to 'Crear Pedido'!");
        
        const connectionsJson = JSON.stringify(connections);
        
        // 2. Update workflow_entity
        const updateEntityStmt = db.prepare("UPDATE workflow_entity SET connections = ? WHERE id = '7SwRxH0Jx08L3ILP'");
        updateEntityStmt.run(connectionsJson);
        console.log("Updated workflow_entity connections!");
        
        // 3. Update workflow_history
        const updateHistoryStmt = db.prepare(
          "UPDATE workflow_history SET connections = ? WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'"
        );
        updateHistoryStmt.run(connectionsJson);
        console.log("Updated workflow_history connections!");
      } else {
        console.log("Crear Pedido connection not found in HTTP Request.");
      }
    }
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error("Error removing connection:", err);
}
