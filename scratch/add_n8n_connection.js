import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get workflow details
  const getStmt = db.prepare("SELECT connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    const connections = JSON.parse(row.connections);
    console.log("Original HTTP Request connections:", JSON.stringify(connections['HTTP Request'], null, 2));
    
    // Ensure the structure exists
    if (!connections['HTTP Request']) {
      connections['HTTP Request'] = { main: [[]] };
    }
    if (!connections['HTTP Request'].main) {
      connections['HTTP Request'].main = [[]];
    }
    if (!connections['HTTP Request'].main[0]) {
      connections['HTTP Request'].main[0] = [];
    }
    
    // Check if the connection to "Crear Pedido" already exists
    const hasConnection = connections['HTTP Request'].main[0].some(conn => conn.node === 'Crear Pedido');
    
    if (!hasConnection) {
      connections['HTTP Request'].main[0].push({
        node: 'Crear Pedido',
        type: 'main',
        index: 0
      });
      console.log("Added connection from 'HTTP Request' to 'Crear Pedido'!");
      
      // Update the database
      const updateStmt = db.prepare("UPDATE workflow_entity SET connections = ? WHERE id = '7SwRxH0Jx08L3ILP'");
      updateStmt.run(JSON.stringify(connections));
      console.log("Database updated successfully!");
    } else {
      console.log("Connection already exists!");
    }
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error("Error updating connection in database:", err);
}
