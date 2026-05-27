import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tenantId, setTenantId] = useState('');
  
  // Step 1: Negocio
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurante');
  const [systemPrompt, setSystemPrompt] = useState('Eres un asistente amable que toma pedidos para un restaurante.');

  // Step 2: WhatsApp (Técnico)
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');

  // Step 2: Asistencia VIP
  const [vipMode, setVipMode] = useState(false);
  const [vipPhone, setVipPhone] = useState('');
  const [vipProfileName, setVipProfileName] = useState('');
  const [vipCardNumber, setVipCardNumber] = useState('');
  const [vipCardExpiry, setVipCardExpiry] = useState('');
  const [vipCardCvc, setVipCardCvc] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Cargar los datos iniciales del tenant
    async function loadTenantData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate('/login');
        return;
      }

      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('tenant_id, tenants(business_name)')
        .eq('user_id', userData.user.id)
        .single();

      if (tenantUser) {
        setTenantId(tenantUser.tenant_id);
        const tenants: any = tenantUser.tenants;
        const bName = Array.isArray(tenants) ? tenants[0]?.business_name : tenants?.business_name;
        if (bName && bName !== 'Nuevo Negocio (Completar Setup)') {
          setBusinessName(bName);
        }
      }
    }
    loadTenantData();
  }, [navigate]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ 
          business_name: businessName,
          business_type: businessType,
          system_prompt: systemPrompt
        })
        .eq('id', tenantId);

      if (updateError) throw updateError;
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (vipMode) {
        // Guardar teléfono y dejar inactivo hasta que soporte configure el Token real
        const { error: updateError } = await supabase
          .from('tenants')
          .update({ 
            whatsapp_phone: vipPhone,
            is_active: false
          })
          .eq('id', tenantId);

        if (updateError) throw updateError;
      } else {
        // Guardar Tokens (modo autoservicio técnico)
        const { error: updateError } = await supabase
          .from('tenants')
          .update({ 
            phone_number_id: phoneNumberId || null,
            whatsapp_token: whatsappToken || null,
            is_active: (phoneNumberId && whatsappToken) ? true : false
          })
          .eq('id', tenantId);

        if (updateError) throw updateError;
      }
      
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    // Si completó el onboarding, marcamos al usuario como listo
    // (Si faltó el token, el status is_active será false, pero ya completó la UI)
    onComplete();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#111', borderRadius: '1rem', border: '1px solid #222', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header Onboarding */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #222', backgroundColor: '#151515', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 90, 31, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '2rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>rocket_launch</span>
            Paso {step} de 3
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: 0, fontWeight: 700 }}>
            {step === 1 && 'Configura tu Negocio'}
            {step === 2 && 'Conecta tu WhatsApp'}
            {step === 3 && '¡Todo Listo!'}
          </h2>
          <p style={{ color: 'var(--secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {step === 1 && 'Personaliza cómo la inteligencia artificial atenderá a tus clientes.'}
            {step === 2 && 'El cerebro de Robotina necesita una boca para hablar.'}
            {step === 3 && 'Tu espacio está creado.'}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* PASO 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Nombre Comercial</label>
                <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} 
                />
              </div>
              
              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Tipo de Negocio</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', appearance: 'none' }}>
                  <option value="Restaurante">Restaurante / Comida Rápida</option>
                  <option value="Servicios">Agencia / Servicios Profesionales</option>
                  <option value="Retail">Tienda Online / Retail</option>
                </select>
              </div>

              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Instrucciones Base para la IA (System Prompt)</label>
                <textarea rows={4} required value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }} 
                />
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>Dile a Robotina cómo debe comportarse. Ej: "Eres un vendedor experto. Saluda de manera informal y usa emojis."</p>
              </div>

              <button type="submit" disabled={loading} style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Guardando...' : 'Siguiente Paso'}
              </button>
            </form>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <>
              {!vipMode ? (
                /* MODO TÉCNICO AUTOSERVICIO */
                <form onSubmit={handleStep2} className="flex flex-col gap-4">
                  <div style={{ backgroundColor: 'rgba(255, 90, 31, 0.05)', border: '1px solid rgba(255, 90, 31, 0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>info</span>
                      Conexión Oficial de Meta
                    </h4>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      Robotina utiliza la API Cloud oficial de WhatsApp. Necesitas generar estos tokens desde Meta Developers.
                    </p>
                  </div>

                  <div>
                    <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Phone Number ID</label>
                    <input type="text" value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} required
                      placeholder="Ej. 1091076967420278"
                      style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', fontFamily: 'monospace' }} 
                    />
                  </div>

                  <div>
                    <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Token Permanente (System User)</label>
                    <input type="password" value={whatsappToken} onChange={e => setWhatsappToken(e.target.value)} required
                      placeholder="EAA...xxx"
                      style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', fontFamily: 'monospace' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setVipMode(true)} style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.1)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>workspace_premium</span>
                      Solicitar Asistencia VIP
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 1, backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? 'Conectando...' : 'Conectar Solos'}
                    </button>
                  </div>
                </form>
              ) : (
                /* MODO ASISTENCIA VIP (CONCIERGE) */
                <form onSubmit={handleStep2} className="flex flex-col gap-4">
                  <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <h4 style={{ color: '#3B82F6', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>support_agent</span>
                      Servicio VIP: Lo hacemos por ti
                    </h4>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      Nuestro equipo se encargará de todo el trabajo técnico en Meta. 
                      <br/><strong style={{ color: '#EF4444' }}>⚠️ IMPORTANTE:</strong> El número de WhatsApp que proporciones debe ser <strong>exclusivo para el negocio</strong>. No servirá ni podrá vincularse a la aplicación normal de WhatsApp una vez conectado a la Inteligencia Artificial.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Número de Teléfono a conectar</label>
                      <input type="text" required value={vipPhone} onChange={e => setVipPhone(e.target.value)}
                        placeholder="+51 999 888 777"
                        style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Nombre del Perfil en WhatsApp</label>
                      <input type="text" required value={vipProfileName} onChange={e => setVipProfileName(e.target.value)}
                        placeholder="Ej. Tacos Locos Oficial"
                        style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} 
                      />
                    </div>
                  </div>

                  {/* Formulario de Tarjeta (UI Simulada para MVP) */}
                  <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: '#0f0f0f', border: '1px solid #222', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>credit_card</span>
                          Método de Pago Seguro
                        </h4>
                        <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: 0 }}>
                          Disfruta de <strong style={{ color: '#fff' }}>7 días de prueba gratis</strong>. Cancela en cualquier momento.
                        </p>
                      </div>
                      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        No se cobrará hoy
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Número de Tarjeta</label>
                      <input type="text" required value={vipCardNumber} onChange={e => setVipCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        style={{ width: '100%', backgroundColor: '#000', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', letterSpacing: '2px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Vencimiento (MM/AA)</label>
                        <input type="text" required value={vipCardExpiry} onChange={e => setVipCardExpiry(e.target.value)}
                          placeholder="12/28"
                          style={{ width: '100%', backgroundColor: '#000', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>CVC</label>
                        <input type="text" required value={vipCardCvc} onChange={e => setVipCardCvc(e.target.value)}
                          placeholder="123"
                          style={{ width: '100%', backgroundColor: '#000', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setVipMode(false)} style={{ backgroundColor: 'transparent', color: '#888', border: 'none', padding: '1rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                      Volver
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 1, backgroundColor: '#fff', color: '#000', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      {loading ? 'Procesando...' : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>lock</span> Iniciar Prueba de 7 Días
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#10B981', marginBottom: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>check_circle</span>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>¡Configuración Completa!</h3>
              
              {!phoneNumberId ? (
                <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Tu espacio está listo. Como saltaste la configuración de WhatsApp, **nuestro equipo técnico te contactará** en las próximas horas para realizar la conexión oficial (Concierge VIP).
                </p>
              ) : (
                <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Tu número de WhatsApp ha sido vinculado y tu base de datos de Inteligencia Artificial está en línea. Puedes empezar a cargar tu catálogo de productos.
                </p>
              )}

              <button onClick={handleFinish} style={{ width: '100%', backgroundColor: '#fff', color: '#000', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                Ir al Dashboard <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
