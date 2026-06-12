import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vijzjcpkypsmkhywndus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw'
);

async function seed() {
  console.log('Starting seed process...');
  
  // 1. Get default tenant ID
  const { data: tenants, error: tenantsErr } = await supabase.from('tenants').select('id');
  if (tenantsErr || !tenants || tenants.length === 0) {
    console.error('Error fetching tenants:', tenantsErr);
    return;
  }
  const tenantId = tenants[0].id;
  console.log('Using tenant ID:', tenantId);

  // 2. Clear existing orders first so we start fresh
  const { error: deleteOrdersErr } = await supabase.from('orders').delete().neq('status', 'nonexistent');
  if (deleteOrdersErr) {
    console.error('Error clearing old orders:', deleteOrdersErr);
  } else {
    console.log('Cleared existing orders.');
  }

  // 3. Make sure we have some customers
  let { data: customers } = await supabase.from('customers').select('*');
  if (!customers || customers.length < 5) {
    const mockCustomers = [
      { name: 'Elena Rodríguez', phone_number: '593991234567', status: 'VIP', tenant_id: tenantId, ltv: 350.50, total_orders: 8 },
      { name: 'Carlos Mendoza', phone_number: '593987654321', status: 'Regular', tenant_id: tenantId, ltv: 180.00, total_orders: 5 },
      { name: 'Ana Belén', phone_number: '593971112222', status: 'Nuevo', tenant_id: tenantId, ltv: 25.00, total_orders: 1 },
      { name: 'Roberto Gómez', phone_number: '593962223333', status: 'VIP', tenant_id: tenantId, ltv: 420.00, total_orders: 12 },
      { name: 'Sofía Castro', phone_number: '593953334444', status: 'Regular', tenant_id: tenantId, ltv: 95.00, total_orders: 3 }
    ];

    const { data: inserted, error: insertCustErr } = await supabase
      .from('customers')
      .insert(mockCustomers)
      .select();

    if (insertCustErr) {
      console.error('Error inserting mock customers:', insertCustErr);
      return;
    }
    customers = inserted;
    console.log('Inserted mock customers:', customers.length);
  } else {
    console.log('Using existing customers:', customers.length);
  }

  // Update customer status variety to make the Distribution Pie Chart look nice
  const statuses = ['VIP', 'Regular', 'Nuevo', 'En Riesgo'];
  for (let i = 0; i < customers.length; i++) {
    const status = statuses[i % statuses.length];
    const { error: updErr } = await supabase
      .from('customers')
      .update({ status: status })
      .eq('id', customers[i].id);
    if (updErr) console.error('Error updating customer status:', updErr);
  }
  // Refresh customers data
  const { data: refreshedCust } = await supabase.from('customers').select('*');
  customers = refreshedCust || customers;

  // 4. Generate mock orders over the last 7 days
  const itemsList = [
    { name: 'Hamburguesa Doble Smash', price: 8.50 },
    { name: 'Limonada de Coco', price: 3.00 },
    { name: 'Tacos Al Pastor (x3)', price: 9.00 },
    { name: 'Ribeye 300g', price: 22.00 },
    { name: 'Bowl Vegetariano', price: 10.50 }
  ];

  const orderStatuses = ['Pendiente', 'Preparando', 'Listo', 'Despachado'];
  const mockOrders = [];
  const now = new Date();

  // Create 65 mock orders with different dates and hours
  for (let i = 0; i < 65; i++) {
    // Distribute date randomly over the last 7 days
    const dateOffsetDays = Math.floor(Math.random() * 7);
    // Distribute hours: concentrate some during peak hours like 13:00-15:00 and 19:00-22:00
    let hour = Math.floor(Math.random() * 24);
    if (Math.random() < 0.4) {
      hour = 13 + Math.floor(Math.random() * 3); // Lunch peak
    } else if (Math.random() < 0.4) {
      hour = 19 + Math.floor(Math.random() * 3); // Dinner peak
    }
    const minute = Math.floor(Math.random() * 60);

    const orderDate = new Date(now.getTime() - dateOffsetDays * 24 * 60 * 60 * 1000);
    orderDate.setHours(hour, minute, 0, 0);

    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // Choose 1-3 random items
    const numItems = 1 + Math.floor(Math.random() * 3);
    const selectedItems = [];
    let totalAmount = 0;
    let itemsCount = 0;

    for (let j = 0; j < numItems; j++) {
      const itemTemplate = itemsList[Math.floor(Math.random() * itemsList.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      selectedItems.push({
        name: itemTemplate.name,
        qty: qty,
        price: itemTemplate.price
      });
      totalAmount += itemTemplate.price * qty;
      itemsCount += qty;
    }

    const orderCode = '#WA-' + (1000 + i);
    
    mockOrders.push({
      order_code: orderCode,
      customer_id: customer.id,
      items_json: selectedItems,
      total_amount: totalAmount,
      items_count: itemsCount,
      source: 'whatsapp',
      status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      tenant_id: tenantId,
      created_at: orderDate.toISOString()
    });
  }

  // Insert mock orders
  const { data: insertedOrders, error: insertOrdersErr } = await supabase
    .from('orders')
    .insert(mockOrders)
    .select();

  if (insertOrdersErr) {
    console.error('Error inserting mock orders:', insertOrdersErr);
  } else {
    console.log(`Successfully seeded ${insertedOrders.length} mock orders!`);
  }
}

seed();
