import * as fs from 'fs';
import * as path from 'path';

const root = 'c:/Users/Administrator/Desktop/proyectos/Robotina-Central'.replace('Central', 'Céntral');

const files = fs.readdirSync(root);
for (const file of files) {
  if (file.endsWith('.sql')) {
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    if (content.toLowerCase().includes('crear_reserva')) {
      console.log(`Found crear_reserva in file: ${file}`);
    }
  }
}
