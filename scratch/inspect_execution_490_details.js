hasimport { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ed.data 
    FROM execution_data ed
    WHERE ed.executionId = 490
  `);
  const row = stmt.get();
  
  if (row) {
    const arr = JSON.parse(row.data);
    
    // Resolve helper
    const resolve = (val) => {
      if (typeof val === 'string' && val.match(/^\d+$/)) {
        const index = parseInt(val, 10);
        return arr[index];
      }
      return val;
    };
    
    console.log("=== EXECUTION 490 DETAIL ===");
    
    const runDataHeader = arr[5];
    const crearPedidoIdx = parseInt(runDataHeader['Crear Pedido'], 10);
    console.log("Index for Crear Pedido:", crearPedidoIdx);
    
    // Let's resolve the execution data for Crear Pedido
    let cp = arr[crearPedidoIdx];
    console.log("Element at index:", JSON.stringify(cp).slice(0, 800));
    
    // If it's an array of references, let's resolve them
    if (Array.isArray(cp)) {
      cp.forEach((item, index) => {
        console.log(`\n- Item ${index}:`);
        const resolvedItem = resolve(item);
        console.log(JSON.stringify(resolvedItem).slice(0, 1000));
        
        // If the resolved item has a data property pointing to a reference, let's print that
        if (resolvedItem && resolvedItem.data) {
          const resolvedData = resolve(resolvedItem.data);
          console.log(`  Data:`, JSON.stringify(resolvedData).slice(0, 1000));
          if (resolvedData && resolvedData.main) {
            const resolvedMain = resolve(resolvedData.main);
            console.log(`  Main:`, JSON.stringify(resolvedMain).slice(0, 1000));
            if (Array.isArray(resolvedMain)) {
              resolvedMain.forEach((mainItem, mi) => {
                const resolvedMainItem = resolve(mainItem);
                console.log(`    Main Item ${mi}:`, JSON.stringify(resolvedMainItem).slice(0, 1000));
                if (Array.isArray(resolvedMainItem)) {
                  resolvedMainItem.forEach((subItem, si) => {
                    const resolvedSubItem = resolve(subItem);
                    console.log(`      Sub Item ${si}:`, JSON.stringify(resolvedSubItem).slice(0, 1000));
                  });
                }
              });
            }
          }
        }
      });
    }
  }
} catch (err) {
  console.error(err);
}
