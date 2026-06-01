const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  // First, delete any existing credential with this ID
  db.prepare("DELETE FROM credentials_entity WHERE id = 'CFMyPrlFJum28GvJ'").run();
  
  // Insert the encrypted credential row
  const stmt = db.prepare(`
    INSERT INTO credentials_entity (
      id, name, data, type, createdAt, updatedAt, 
      isManaged, isGlobal, isResolvable, resolvableAllowFallback, resolverId
    ) VALUES (
      'CFMyPrlFJum28GvJ', 'OpenAI account', ?, 'openAiApi', '2026-05-06 05:37:13.075', '2026-05-06 05:39:37.090',
      0, 0, 0, 0, null
    )
  `);
  
  const result = stmt.run('U2FsdGVkX1/bXqnHyNkMS3QGlfq04eqKkXfa3g5mr5QvCHkutiQ5/Q7P21fqhhuq9of8T8tT1ycNQCYfe7nnpZcj7EemPhLNgndzqQ+Xg/KK9EyIaGQMGIuLhPet7YvMvdB6CUYlXRi9Wjx6TwIin47W/la/8AIrdOiCdI0TwGyPXo1AgAPuNKIaryCqMVVhEZiXqTbS2ftEVvI5E29NyiRMK4K6sYuZjdkymt5sbURazEf028IyDmYZwFfONgxvtrVJMEN73WI4rnDrE0vKdw==');
  console.log('Inserted OpenAI credentials on VPS. Rows affected:', result.changes);
} catch (e) {
  console.error('Error inserting credential on VPS:', e);
}