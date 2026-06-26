import json

with open('restored_workflow.json', 'r', encoding='utf-8') as f:
    old_flow = json.load(f)

with open('n8n_flow_updated.json', 'r', encoding='utf-8') as f:
    new_flow = json.load(f)

name_map = {}
for n in new_flow['nodes']:
    old_name = n['name']
    if n['type'] != 'n8n-nodes-base.webhook':
        n['name'] = old_name + ' (Emergencia)'
    name_map[old_name] = n['name']
    if 'position' in n:
        n['position'][1] += 800

for n in new_flow['nodes']:
    params_str = json.dumps(n['parameters'])
    for old_name, new_name in name_map.items():
        # Reemplazar $('Name') -> $('Name (Emergencia)')
        params_str = params_str.replace(f"$('{old_name}')", f"$('{new_name}')")
        # Reemplazar $node["Name"] -> $node["Name (Emergencia)"]
        params_str = params_str.replace(f"$node[\"{old_name}\"]", f"$node[\"{new_name}\"]")
        # Reemplazar $node['Name'] -> $node['Name (Emergencia)']
        params_str = params_str.replace(f"$node['{old_name}']", f"$node['{new_name}']")
    n['parameters'] = json.loads(params_str)

new_connections = {}
for old_key, targets in new_flow['connections'].items():
    if old_key == 'WhatsApp Webhook POST':
        continue
    new_key = name_map[old_key]
    
    for arr in targets.get('main', []):
        for conn in arr:
            conn['node'] = name_map.get(conn['node'], conn['node'])
            
    if 'ai_languageModel' in targets:
        for arr in targets['ai_languageModel']:
            for conn in arr:
                conn['node'] = name_map.get(conn['node'], conn['node'])
                
    if 'ai_memory' in targets:
        for arr in targets['ai_memory']:
            for conn in arr:
                conn['node'] = name_map.get(conn['node'], conn['node'])
                
    new_connections[new_key] = targets

# Remove the webhook from the new flow
new_flow['nodes'] = [n for n in new_flow['nodes'] if n['type'] != 'n8n-nodes-base.webhook']

final_flow = {
    "nodes": old_flow['nodes'] + new_flow['nodes'],
    "connections": {**old_flow['connections'], **new_connections}
}

# Disconnect the old webhook from anything
final_flow['connections']['WhatsApp Webhook POST'] = {"main": [[]]}

# Connect it to HTTP Request (Emergencia)
final_flow['connections']['WhatsApp Webhook POST']['main'][0].append({
    "node": "HTTP Request (Emergencia)",
    "type": "main",
    "index": 0
})

with open('flujo_final_infalible.json', 'w', encoding='utf-8') as f:
    json.dump(final_flow, f, indent=2)

print("Done")
