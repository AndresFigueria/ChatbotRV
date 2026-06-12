import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vijzjcpkypsmkhywndus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw'
);

async function updateLTV() {
  console.log('Calculating LTV and orders counts...');
  
  // 1. Fetch all customers
  const { data: customers, error: custErr } = await supabase.from('customers').select('*');
  if (custErr || !customers) {
    console.error('Error fetching customers:', custErr);
    return;
  }

  // 2. Fetch all orders
  const { data: orders, error: ordersErr } = await supabase.from('orders').select('*');
  if (ordersErr || !orders) {
    console.error('Error fetching orders:', ordersErr);
    return;
  }

  console.log(`Processing ${customers.length} customers and ${orders.length} orders...`);

  // 3. Update each customer's total_orders and ltv
  for (const customer of customers) {
    const customerOrders = orders.filter(o => o.customer_id === customer.id);
    const totalOrders = customerOrders.length;
    const ltv = customerOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    
    console.log(`Customer ${customer.name}: orders count = ${totalOrders}, LTV = $${ltv}`);

    const { error: updateErr } = await supabase
      .from('customers')
      .update({
        total_orders: totalOrders,
        ltv: ltv
      })
      .eq('id', customer.id);

    if (updateErr) {
      console.error(`Error updating customer ${customer.name}:`, updateErr);
    }
  }

  console.log('Finished updating customers.');
}

updateLTV();
