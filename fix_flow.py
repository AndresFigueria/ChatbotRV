import json

with open('flujo_final_infalible.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. Remove Memory node
data['nodes'] = [n for n in data['nodes'] if n['name'] != 'Memory by WhatsApp Number']

# 2. Add Obtener Historial node (based on Consultar Modo Humano)
consultar_node = next(n for n in data['nodes'] if n['name'] == 'Consultar Modo Humano (Emergencia)')
historial_node = json.loads(json.dumps(consultar_node))
historial_node['name'] = 'Obtener Historial (Emergencia)'
historial_node['id'] = 'node-historial-uuid-1234'
historial_node['position'] = [consultar_node['position'][0] + 704, consultar_node['position'][1] + 64]
historial_node['parameters']['method'] = 'POST'
historial_node['parameters']['url'] = '=https://uwcizesexahodlsjxuiq.supabase.co/rest/v1/rpc/get_chat_history'
historial_node['parameters']['sendBody'] = True
historial_node['parameters']['specifyBody'] = 'json'
historial_node['parameters']['jsonBody'] = '={"p_phone": "{{ $(\'Normalize WhatsApp Message (Emergencia)\').first().json.from }}"}'
data['nodes'].append(historial_node)

# 3. Update AI Agent Prompt
ai_agent = next(n for n in data['nodes'] if n['name'] == 'AI Agent (Emergencia)')
ai_agent['parameters']['text'] = '={{ \'[HISTORIAL DE CHAT]\\n\' + $json.data + \'\\n\\n[NUEVO MENSAJE ACTUAL]\\n\' + $(\'Normalize WhatsApp Message (Emergencia)\').first().json.text }}'

# 4. Fix Connections
# Disconnect Obtener Estadisticas from AI Agent
for conn_list in data['connections']['Obtener Estadisticas (Emergencia)']['main'][0]:
    if conn_list['node'] == 'AI Agent (Emergencia)':
        conn_list['node'] = 'Obtener Historial (Emergencia)'

# Connect Obtener Historial to AI Agent
data['connections']['Obtener Historial (Emergencia)'] = {
    'main': [
        [
            {
                "node": "AI Agent (Emergencia)",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

# Remove AI Agent's memory connection
if 'ai_memory' in data['connections'].get('Memory by WhatsApp Number', {}):
    del data['connections']['Memory by WhatsApp Number']

if 'ai_memory' in ai_agent.get('parameters', {}):
    pass # n8n connections handle this

with open('flujo_final_infalible.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
