import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf3 = content.find(w => w.id === '7SwRxH0Jx08L3ILP');
const aiAgentNode = wf3.nodes.find(n => n.name === 'AI Agent');

// Tools are connected to the AI Agent's input.
// n8n tools are usually inputs to the AI Agent.
// We can check the names of the "Tool" nodes in the workflow.
const toolNodes = wf3.nodes.filter(n => n.type.includes('Tool') || n.name.toLowerCase().includes('consultar') || n.name.toLowerCase().includes('registrar') || n.name.toLowerCase().includes('crear'));

console.log('Potential Tool Nodes:');
toolNodes.forEach(t => console.log(`- Name: "${t.name}" | Type: ${t.type}`));
