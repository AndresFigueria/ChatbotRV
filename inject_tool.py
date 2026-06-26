import json
import uuid

with open('flujo_final_infalible.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The AI Agent is the node named "AI Agent (Emergencia)"
ai_agent = next((n for n in data['nodes'] if n.get('name') == 'AI Agent (Emergencia)'), None)
http_request = next((n for n in data['nodes'] if n.get('name') == 'HTTP Request (Emergencia)'), None)

if not ai_agent:
    print("No se encontro AI Agent")
    exit()

tool_id = str(uuid.uuid4())

# Build the HTTP Request Tool for AI Agent
tool_node = {
  "parameters": {
    "name": "registrar_reporte",
    "description": "Call this tool whenever you extract data from a user (Option 1, 2, or 3). Provide person_name, age, gender, location, status (must be exactly 'Buscando', 'Encontrado' or 'Seguro'), and companion_info.",
    "method": "POST",
    "url": "={{ $('HTTP Request (Emergencia)').first().json.supabase_url }}/rest/v1/rpc/registrar_reporte",
    "sendHeaders": True,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "={{ 'Bearer ' + $('HTTP Request (Emergencia)').first().json.supabase_anon_key }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": True,
    "specifyBody": "json",
    "jsonBody": "={\n  \"p_tenant_id\": \"{{ $('HTTP Request (Emergencia)').first().json.id }}\",\n  \"p_reporter_phone\": \"{{ $('Normalize WhatsApp Message (Emergencia)').first().json.from }}\",\n  \"p_person_name\": \"{{ $fromAI('person_name') }}\",\n  \"p_age\": \"{{ $fromAI('age') }}\",\n  \"p_gender\": \"{{ $fromAI('gender') }}\",\n  \"p_location\": \"{{ $fromAI('location') }}\",\n  \"p_status\": \"{{ $fromAI('status') }}\",\n  \"p_companion_info\": \"{{ $fromAI('companion_info') }}\"\n}"
  },
  "id": tool_id,
  "name": "Registrar Reporte (Tool)",
  "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",
  "typeVersion": 1.1,
  "position": [
    ai_agent['position'][0] + 50,
    ai_agent['position'][1] + 300
  ]
}

data['nodes'].append(tool_node)

# Connect tool to AI Agent
# Find if there are existing connections to AI Agent's ai_tool input
if "Registrar Reporte (Tool)" not in str(data['connections']):
    if "Registrar Reporte (Tool)" not in data['connections']:
        data['connections']["Registrar Reporte (Tool)"] = {
            "ai_tool": [
                [
                    {
                        "node": "AI Agent (Emergencia)",
                        "type": "ai_tool",
                        "index": 0
                    }
                ]
            ]
        }

with open('flujo_final_infalible.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Herramienta inyectada con exito")
