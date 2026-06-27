import json

with open('flujo_final_infalible.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data['nodes']:
    if node.get('name') == 'Registrar Reporte (Tool)':
        # Update description to include cedula
        desc = node['parameters'].get('description', '')
        if 'cedula' not in desc:
            node['parameters']['description'] = desc.replace('person_name, age, gender', 'person_name, cedula, age, gender')
        
        # Update JSON body
        json_body = node['parameters'].get('jsonBody', '')
        if 'p_cedula' not in json_body:
            # We insert p_cedula before p_age
            new_body = json_body.replace(
                '"p_age": "{{ $fromAI(\'age\') }}"',
                '"p_cedula": "{{ $fromAI(\'cedula\') }}",\n  "p_age": "{{ $fromAI(\'age\') }}"'
            )
            node['parameters']['jsonBody'] = new_body

with open('flujo_final_infalible.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Actualizado flujo_final_infalible.json con p_cedula")
