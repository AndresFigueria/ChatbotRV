import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf3 = content[3];
const httpNode = wf3.nodes.find(n => n.name === 'HTTP Request');

console.log('HTTP Request Node details:', JSON.stringify(httpNode, null, 2));
