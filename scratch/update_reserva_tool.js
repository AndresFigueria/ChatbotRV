import { DatabaseSync } from 'node:sqlite';
import { execSync } from 'child_process';

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
  
  // 2. Find Registrar Cita o Reserva node
  const reservaNode = nodes.find(n => n.name === 'Registrar Cita o Reserva');
  if (!reservaNode) {
    throw new Error("Node 'Registrar Cita o Reserva' not found in workflow.");
  }
  
  console.log("Original Registrar Cita o Reserva parameters:", JSON.stringify(reservaNode.parameters, null, 2));
  
  // 3. Update parameters
  reservaNode.parameters.toolDescription = 'Crea una solicitud de reserva o cita en el sistema. Debes pasar un objeto JSON completo en el parámetro query que contenga estrictamente: {"customer_name": "Nombre del cliente", "phone": "Teléfono del cliente", "reservation_date": "YYYY-MM-DD", "reservation_time": "HH:mm", "guest_count": 2, "notes": "notas_opcionales"}. No omitas ninguno de estos campos en el JSON.';
  
  reservaNode.parameters.jsonBody = JSON.stringify({
    p_customer_name: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.customer_name) return parsed.customer_name; } catch (e) {} return $('Normalize WhatsApp Message').first().json.customer_name || 'Cliente WhatsApp'; })() }}",
    p_phone: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.phone) return String(parsed.phone); } catch (e) {} return $('Normalize WhatsApp Message').first().json.from; })() }}",
    p_reservation_date: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.reservation_date) return parsed.reservation_date; } catch (e) {} return ''; })() }}",
    p_reservation_time: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.reservation_time) return parsed.reservation_time; } catch (e) {} return ''; })() }}",
    p_guest_count: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.guest_count) return Number(parsed.guest_count); } catch (e) {} return 1; })() }}",
    p_notes: "={{ (() => { try { const parsed = JSON.parse($json.query); if (parsed && parsed.notes) return parsed.notes; } catch (e) {} return ''; })() }}",
    p_tenant_id: "{{ $('HTTP Request').first().json.id }}"
  }, null, 2);
  
  console.log("New Registrar Cita o Reserva parameters:", JSON.stringify(reservaNode.parameters, null, 2));
  
  // 4. Update workflow in database
  const stmtUpdate = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
  stmtUpdate.run(JSON.stringify(nodes));
  console.log("Workflow updated successfully in n8n SQLite database!");
  
  // 5. Synchronize with workflows.json
  console.log("Synchronizing workflows.json...");
  execSync('node scratch/export_updated_workflows_json.js', { stdio: 'inherit' });
  
} catch (err) {
  console.error("Error updating workflow:", err);
}
