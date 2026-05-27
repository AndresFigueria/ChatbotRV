import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Crear el usuario en Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName
          }
        }
      });

      if (authError) throw authError;

      // Si es exitoso, el Trigger de la BD crea el Tenant automáticamente.
      // Redirigir al proceso de Onboarding.
      // (Asumiendo que el usuario ya está logueado tras el signup)
      navigate('/onboarding');
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0A0A0A', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sección Izquierda: Branding - Hidden on Mobile */}
      <div className="desktop-only" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4rem', backgroundImage: 'linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.9)), url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1500")', backgroundSize: 'cover', backgroundPosition: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Decoración */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', backgroundColor: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>

        <div>
           <div className="flex items-center gap-3" style={{ marginBottom: '3rem' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>robot_2</span>
             <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', letterSpacing: '1px' }}>Robotina <span style={{ fontWeight: 300 }}>Central</span></h1>
           </div>

           <h2 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '600px', letterSpacing: '-1px' }}>
             Escala tu negocio con <span style={{ color: 'var(--primary)' }}>Inteligencia Artificial.</span>
           </h2>
           <p style={{ color: 'var(--secondary)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '500px' }}>
             Únete a los restaurantes de élite que ya están automatizando su atención, reservas y pedidos por WhatsApp 24/7 sin esfuerzo.
           </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#fff' }}>rocket_launch</span>
            </div>
            <div>
              <p style={{ color: '#fff', margin: 0, fontWeight: 600, letterSpacing: '0.5px' }}>7 días de prueba gratis</p>
              <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.85rem' }}>Sin tarjeta de crédito requerida.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Formulario de Registro */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', position: 'relative', overflowY: 'auto' }}>
         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255, 90, 31, 0.03) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
         
         <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', zIndex: 10 }}>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '2rem', margin: 0, letterSpacing: '-0.5px' }}>Crea tu cuenta</h3>
              <p style={{ color: 'var(--secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Comienza a automatizar tu negocio hoy.</p>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Nombre de tu Negocio</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: '1.2rem' }}>storefront</span>
                  <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                    placeholder="Ej. Tacos Locos"
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: '1.2rem' }}>mail</span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                    placeholder="gerencia@empresa.com"
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Contraseña Segura</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: '1.2rem' }}>lock</span>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6}
                    style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                    placeholder="Mínimo 6 caracteres"
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ 
                backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '0.5rem', 
                fontSize: '1rem', fontWeight: 700, marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 10px 25px rgba(255, 90, 31, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.1s' 
              }}>
                {loading ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1.5s linear infinite' }}>autorenew</span>
                    Creando tu espacio...
                  </>
                ) : (
                  <>
                    Crear Cuenta Ahora
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #222' }}>
               <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: 0 }}>
                 ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Inicia Sesión aquí</Link>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
