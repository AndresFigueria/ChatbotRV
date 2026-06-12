import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf3 = content.find(w => w.id === '7SwRxH0Jx08L3ILP');

// Define safe names mapping
const safeNames = {
  "Consultar Catálogo": "consultar_catalogo",
  "Consultar Sucursales": "consultar_sucursales",
  "Registrar Cita o Reserva": "registrar_reserva",
  "Crear Pedido": "crear_pedido"
};

let modified = false;

wf3.nodes.forEach(n => {
  if (n.type === '@n8n/n8n-nodes-langchain.toolHttpRequest' && safeNames[n.name]) {
    n.parameters.name = safeNames[n.name];
    console.log(`Updated tool ${n.name} with safe name: ${n.parameters.name}`);
    modified = true;
  }
});

if (modified) {
  fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
  console.log('Saved workflows.json with valid tool names.');
} else {
  console.log('No modifications made.');
}
