import json

with open('flujo_final_infalible.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data['nodes']:
    if node.get('name') == 'Guardar Mensaje Cliente (Emergencia)':
        node['parameters']['jsonBody'] = "={{ JSON.stringify({\n  \"p_phone\": $node['Normalize WhatsApp Message (Emergencia)'].json.from,\n  \"p_message\": $node['Normalize WhatsApp Message (Emergencia)'].json.text,\n  \"p_direction\": \"inbound\",\n  \"p_customer_name\": $node['Normalize WhatsApp Message (Emergencia)'].json.customer_name,\n  \"p_tenant_id\": $node['HTTP Request (Emergencia)'].json.id\n}) }}"

with open('flujo_final_infalible.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
