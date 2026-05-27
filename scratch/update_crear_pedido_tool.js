import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get current workflow nodes
  const stmtSelect = db.prepare("SELECT name, nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmtSelect.get();
  
  if (!row) {
    throw new Error("Workflow with ID '7SwRxH0Jx08L3ILP' not found.");
  }
  
  console.log(`Modifying workflow: ${row.name}`);
  const nodes = JSON.parse(row.nodes);
  
  // 2. Find Crear Pedido node
  const crearPedidoNode = nodes.find(n => n.name === 'Crear Pedido');
  if (!crearPedidoNode) {
    throw new Error("Node 'Crear Pedido' not found in workflow.");
  }
  
  console.log("Original Crear Pedido parameters:", JSON.stringify(crearPedidoNode.parameters, null, 2));
  
  // 3. Update parameters
  crearPedidoNode.parameters.toolDescription = 'Crea un pedido en Supabase. Debes pasar un objeto JSON completo en el parámetro query que contenga estrictamente: {"items": [{"name": "Nombre de Producto", "qty": 1}], "phone": "Número de WhatsApp del cliente", "customer_name": "Nombre del cliente", "total": total_en_número}. No omitas ninguno de estos campos en el JSON.';
  
  crearPedidoNode.parameters.jsonBody = JSON.stringify({
    p_phone: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.phone) return String(parsed.phone); } catch (e) {} return $('Normalize WhatsApp Message').first().json.from; })() }}",
    p_customer_name: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.customer_name) return parsed.customer_name; } catch (e) {} return $('Normalize WhatsApp Message').first().json.customer_name || 'Cliente WhatsApp'; })() }}",
    p_items: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.items) return parsed.items; } catch (e) {} return []; })() }}",
    p_total: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.total) return Number(parsed.total); } catch (e) {} return 0; })() }}",
    p_source: "whatsapp",
    p_tenant_id: "{{ $('HTTP Request').first().json.id }}"
  }, null, 2);
  
  console.log("New Crear Pedido parameters:", JSON.stringify(crearPedidoNode.parameters, null, 2));
  
  // 4. Update workflow in database
  const stmtUpdate = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
  stmtUpdate.run(JSON.stringify(nodes));
  console.log("Workflow updated successfully in n8n SQLite database!");
  
} catch (err) {
  console.error("Error updating workflow:", err);
}
