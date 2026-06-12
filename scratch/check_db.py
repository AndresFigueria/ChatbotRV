import sqlite3
import json

conn = sqlite3.connect('/root/.n8n/database.sqlite')
cursor = conn.cursor()
cursor.execute("SELECT executionId, data FROM execution_data ORDER BY executionId DESC LIMIT 1")
row = cursor.fetchone()
if row:
    execution_id = row[0]
    data_str = row[1]
    print(f"--- Execution {execution_id} ---")
    arr = json.loads(data_str)
    
    # Let's search for the system prompt in the arr
    found = False
    for i, item in enumerate(arr):
        if isinstance(item, str) and "Eres Robotina" in item:
            print(f"FOUND PROMPT IN EXECUTION (Index {i}):")
            print(item)
            found = True
            break
    if not found:
        print("Prompt not found in the flatted array. Let's dump string values longer than 100 chars.")
        for item in arr:
            if isinstance(item, str) and len(item) > 100:
                print(f"Long string: {item[:150]}...")
conn.close()
