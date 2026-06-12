import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf3 = content.find(w => w.id === '7SwRxH0Jx08L3ILP');

const renameMap = {
  "Consultar Catálogo": "consultar_catalogo",
  "Consultar Sucursales": "consultar_sucursales",
  "Registrar Cita o Reserva": "registrar_reserva",
  "Crear Pedido": "crear_pedido"
};

let modified = false;

// Rename the nodes
wf3.nodes.forEach(n => {
  if (renameMap[n.name]) {
    const newName = renameMap[n.name];
    console.log(`Renaming node "${n.name}" to "${newName}"`);
    
    // Update connections mapping
    if (wf3.connections[n.name]) {
      wf3.connections[newName] = wf3.connections[n.name];
      delete wf3.connections[n.name];
    }
    
    // Update incoming connections from other nodes
    for (const sourceNode in wf3.connections) {
      for (const outputType in wf3.connections[sourceNode]) {
        for (const outputArray of wf3.connections[sourceNode][outputType]) {
          if (outputArray) {
            for (const connection of outputArray) {
              if (connection.node === n.name) {
                connection.node = newName;
              }
            }
          }
        }
      }
    }
    
    // Finally rename the node itself
    n.name = newName;
    modified = true;
  }
});

if (modified) {
  fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
  console.log('Saved workflows.json with renamed tool nodes.');
} else {
  console.log('No modifications made.');
}
