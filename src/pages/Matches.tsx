import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../index.css';

export default function Matches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch Matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          similarity_score,
          status,
          created_at,
          report_a:humanitarian_reports!report_a_id ( person_name, cedula, age, location, status, reporter_phone ),
          report_b:humanitarian_reports!report_b_id ( person_name, cedula, age, location, status, reporter_phone )
        `)
        .order('similarity_score', { ascending: false });
      if (matchesError) throw matchesError;

      // 2. Fetch all Reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('humanitarian_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (reportsError) throw reportsError;

      setMatches(matchesData || []);
      setReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime matches and reports
    const channelMatches = supabase.channel('realtime_matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'humanitarian_reports' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channelMatches);
    };
  }, []);

  const updateMatchStatus = async (matchId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('matches').update({ status: newStatus }).eq('id', matchId);
      if (error) throw error;
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: newStatus } : m));
    } catch (error) {
      console.error('Error updating match status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Buscando') return '#ef4444'; // Red
    if (status === 'Encontrado' || status === 'Seguro') return '#22c55e'; // Green
    return '#f59e0b'; // Yellow for others
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255, 90, 31, 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
          Central de Búsqueda y Matches
        </h2>
        <p style={{ color: 'var(--secondary)', margin: '0.5rem 0 0 0' }}>
          Monitoriza los reportes entrantes y gestiona los cruces detectados automáticamente.
        </p>
      </header>

      <div className="grid-auto-responsive" style={{ flex: 1, minHeight: 0 }}>
        
        {/* COLUMNA 1: REPORTES */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-container-low)', borderRadius: '1rem', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>list_alt</span> 
              Reportes Entrantes
            </h3>
            <span style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{reports.length}</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No hay reportes activos.</div>
            ) : (
              reports.map(report => (
                <div key={report.id} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(report.status) }}></span>
                      <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{report.person_name}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', gap: '1rem' }}>
                      {report.cedula && <span><span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>badge</span> {report.cedula}</span>}
                      <span><span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>calendar_today</span> {report.age || 'N/A'}</span>
                      <span><span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>location_on</span> {report.location || 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', backgroundColor: `${getStatusColor(report.status)}20`, color: getStatusColor(report.status), display: 'inline-block' }}>
                      {report.status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {new Date(report.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: MATCHES */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-container-low)', borderRadius: '1rem', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>group</span> 
              Cruces (Matches)
            </h3>
            <span style={{ backgroundColor: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{matches.length}</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>search_off</span>
                <p style={{ margin: 0 }}>Aún no se detectan cruces automáticos.</p>
              </div>
            ) : (
              matches.map((match) => (
                <div key={match.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Header del Match */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: match.status === 'Pendiente' ? 'rgba(234, 179, 8, 0.1)' : match.status === 'Confirmado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: match.status === 'Pendiente' ? '#eab308' : match.status === 'Confirmado' ? '#22c55e' : '#ef4444' }}>
                        {match.status}
                      </div>
                      <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Similitud: {Math.round(match.similarity_score * 100)}%</div>
                    </div>
                    {match.status === 'Pendiente' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => updateMatchStatus(match.id, 'Confirmado')} style={{ background: 'transparent', border: '1px solid #22c55e', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Confirmar</button>
                        <button onClick={() => updateMatchStatus(match.id, 'Descartado')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Descartar</button>
                      </div>
                    )}
                  </div>

                  {/* Comparación */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: getStatusColor(match.report_a?.status), fontWeight: 700, marginBottom: '4px' }}>{match.report_a?.status}</div>
                      <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{match.report_a?.person_name}</div>
                      {match.report_a?.cedula && <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '4px' }}>Cédula: {match.report_a?.cedula}</div>}
                      <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '4px' }}>Ubicación: {match.report_a?.location}</div>
                    </div>
                    
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>compare_arrows</span>
                    
                    <div style={{ flex: 1, padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: getStatusColor(match.report_b?.status), fontWeight: 700, marginBottom: '4px' }}>{match.report_b?.status}</div>
                      <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{match.report_b?.person_name}</div>
                      {match.report_b?.cedula && <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '4px' }}>Cédula: {match.report_b?.cedula}</div>}
                      <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '4px' }}>Ubicación: {match.report_b?.location}</div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
