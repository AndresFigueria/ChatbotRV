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
  const [activeTab, setActiveTab] = useState<'customers' | 'leads'>('customers');
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    fetchCustomers();
    fetchLeads();
    const subCustomers = supabase.channel('customers_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchCustomers())
      .subscribe();

    const subLeads = supabase.channel('leads_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_leads' }, () => fetchLeads())
      .subscribe();

    return () => {
      supabase.removeChannel(subCustomers);
      supabase.removeChannel(subLeads);
    };
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('last_order_date', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    const { data } = await supabase.from('landing_leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoadingLeads(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone_number?.includes(searchTerm)
  );

  const filteredLeads = leads.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.phone?.includes(searchTerm) ||
    l.segment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.goal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Base de Clientes 👥</h2>
          <p className="body-md" style={{ color: 'var(--secondary)' }}>CRM Inteligente alimentado por WhatsApp y Landing Page.</p>
        </div>
        <div className="flex gap-4">
          <div className="input-group" style={{ position: 'relative' }}>
             <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}>search</span>
             <input 
               type="text" 
               placeholder="Buscar cliente o lead..." 
               className="input-base" 
               style={{ paddingLeft: '35px' }}
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="btn-primary">Exportar CSV</button>
        </div>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('customers')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: activeTab === 'customers' ? 'var(--primary)' : 'var(--secondary)',
            backgroundColor: activeTab === 'customers' ? 'rgba(255, 90, 31, 0.1)' : 'transparent',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Clientes CRM (WhatsApp)
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: activeTab === 'leads' ? 'var(--primary)' : 'var(--secondary)',
            backgroundColor: activeTab === 'leads' ? 'rgba(255, 90, 31, 0.1)' : 'transparent',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Leads de la Landing (Pre-calificados)
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          {activeTab === 'customers' ? (
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container-highest)' }}>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Teléfono</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actividad</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Gastado</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estado</th>
              </tr>
            </thead>
          ) : (
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container-highest)' }}>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>WhatsApp</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Giro / Sector</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Volumen Mensajes</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Objetivo Automatizar</th>
              </tr>
            </thead>
          )}
          <tbody>
            {activeTab === 'customers' ? (
              loading ? (
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
              ))
            ) : (
              loadingLeads ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>Cargando leads de landing...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>No se encontraron leads perfilados.</td></tr>
              ) : filteredLeads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
                  <td style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                    {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--secondary)' }}>
                    <a 
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--emerald-400)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                      {lead.phone}
                    </a>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {lead.segment || 'No especificado'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{lead.volume || 'No especificado'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>{lead.goal || 'No especificado'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
