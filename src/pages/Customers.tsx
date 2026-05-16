import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  total_orders: number;
  ltv: number;
  last_order_date: string;
  status: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
    const sub = supabase.channel('customers_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchCustomers())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('last_order_date', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone_number?.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h2 className="display-md">Base de Clientes 👥</h2>
          <p className="body-md" style={{ color: 'var(--secondary)' }}>CRM Inteligente alimentado por WhatsApp.</p>
        </div>
        <div className="flex gap-4">
          <div className="input-group" style={{ position: 'relative' }}>
             <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}>search</span>
             <input 
               type="text" 
               placeholder="Buscar cliente..." 
               className="input-base" 
               style={{ paddingLeft: '35px' }}
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="btn-primary">Exportar CSV</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container-highest)' }}>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Teléfono</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actividad</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Gastado</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>Sincronizando clientes...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>No hay clientes registrados aún.</td></tr>
            ) : filteredCustomers.map(customer => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{customer.name || 'Cliente WhatsApp'}</td>
                <td style={{ padding: '1rem', color: 'var(--secondary)' }}>{customer.phone_number}</td>
                <td style={{ padding: '1rem' }}>{customer.total_orders}</td>
                <td style={{ padding: '1rem', fontWeight: 700 }}>${Number(customer.ltv || 0).toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ backgroundColor: 'var(--primary-dim)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {customer.status || 'Activo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
