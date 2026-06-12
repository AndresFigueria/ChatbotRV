import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf3 = content.find(w => w.id === '7SwRxH0Jx08L3ILP');

const toolNodes = wf3.nodes.filter(n => n.type === '@n8n/n8n-nodes-langchain.toolHttpRequest');

console.log(JSON.stringify(toolNodes[0].parameters, null, 2));

