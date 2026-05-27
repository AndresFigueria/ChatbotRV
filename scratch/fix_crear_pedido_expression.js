import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get workflow details
  const getStmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    let nodes = JSON.parse(row.nodes);
    let updated = false;
    
    nodes = nodes.map(node => {
      if (node.name === 'Crear Pedido') {
        let jsonBody = node.parameters.jsonBody;
        if (jsonBody && jsonBody.includes("{{$node['HTTP Request'].json.id}}")) {
          jsonBody = jsonBody.replace("{{$node['HTTP Request'].json.id}}", "{{ $('HTTP Request').first().json.id }}");
          node.parameters.jsonBody = jsonBody;
          console.log("Updated jsonBody for Crear Pedido!");
          console.log("New jsonBody:", jsonBody);
          updated = true;
        }
      }
      return node;
    });
    
    if (updated) {
      const updateStmt = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
      updateStmt.run(JSON.stringify(nodes));
      console.log("Workflow nodes updated successfully in database!");
    } else {
      console.log("Crear Pedido jsonBody did not contain legacy reference, or node not found.");
    }
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error("Error updating Crear Pedido expression:", err);
}
