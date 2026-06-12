import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

console.log('Workflows in workflows.json:');
content.forEach(wf => {
  console.log(`- ID: ${wf.id}, Name: ${wf.name}, Active: ${wf.active}`);
});
