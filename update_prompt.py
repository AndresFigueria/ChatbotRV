import json

with open('n8n_ai_prompt.txt', 'r', encoding='utf-8') as f:
    prompt = f.read()

with open('flujo_final_infalible.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ai_agent = next(n for n in data['nodes'] if n['name'] == 'AI Agent (Emergencia)')
if 'options' not in ai_agent['parameters']:
    ai_agent['parameters']['options'] = {}

ai_agent['parameters']['options']['systemMessage'] = "={{ '' }}\n" + prompt

with open('flujo_final_infalible.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
