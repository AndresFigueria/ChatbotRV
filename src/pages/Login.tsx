import { useState } from 'react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulación de conexión a Supabase Auth y validación de suscripción activa
    setTimeout(() => {
      const isEmailValid = email.trim().toLowerCase() === 'admin@empresa.com';
      if (isEmailValid && password === '1234') {
        onLogin();
      } else {
        setError('Credenciales inválidas o suscripción mensual inactiva.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="login-page-container" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0A0A0A', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sección Izquierda: Branding (Tu Agencia) - Hidden on Mobile */}
      <div className="desktop-only" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4rem', backgroundImage: 'linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.9)), url("https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1500")', backgroundSize: 'cover', backgroundPosition: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Decoración */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', backgroundColor: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>

        <div>
           <div className="flex items-center gap-3" style={{ marginBottom: '3rem' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>robot_2</span>
             <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', letterSpacing: '1px' }}>Robotina <span style={{ fontWeight: 300 }}>IA</span></h1>
           </div>

           <h2 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '600px', letterSpacing: '-1px' }}>
             El futuro del control gastronómico, <span style={{ color: 'var(--primary)' }}>automatizado.</span>
           </h2>
           <p style={{ color: 'var(--secondary)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '500px' }}>
             Acceso exclusivo para franquicias y restaurantes asociados. Gestiona logística, marketing y la inteligencia artificial de todo tu negocio desde un solo ecosistema.
           </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <img src="https://ui-avatars.com/api/?name=Tu+Agencia&background=FF5A1F&color=fff&rounded=true" alt="Agencia Logo" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
            <div>
              <p style={{ color: '#fff', margin: 0, fontWeight: 600, letterSpacing: '0.5px' }}>Licencia Operativa B2B</p>
              <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.85rem' }}>Software Comercializado por Tu Agencia™</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Formulario de Login */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', position: 'relative' }}>
         {/* Fondo Sutil */}
         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255, 90, 31, 0.03) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
         
         <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', zIndex: 10 }}>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: '#fff', marginBottom: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>passkey</span>
              <h3 style={{ color: '#fff', fontSize: '2rem', margin: 0, letterSpacing: '-0.5px' }}>Iniciar Sesión</h3>
              <p style={{ color: 'var(--secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Verificando credenciales del servidor.</p>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>Correo Corporativo del Local</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: '1.2rem' }}>mail</span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                    placeholder="gerencia@tacoslocos.com"
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Contraseña de Cifrado</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: '1.2rem' }}>lock</span>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                    placeholder="••••••••••••"
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-0.5rem' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                   <input type="checkbox" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                   Recordar mi sesión (30 días)
                 </label>
                 <a href="#" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>¿Olvidaste tu clave?</a>
              </div>

              <button type="submit" disabled={loading} style={{ 
                backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '0.5rem', 
                fontSize: '1rem', fontWeight: 700, marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 10px 25px rgba(255, 90, 31, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.1s' 
              }}>
                {loading ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1.5s linear infinite' }}>autorenew</span>
                    Autenticando Red...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">login</span>
                    Entrar a la Central
                  </>
                )}
              </button>
            </form>

            {/* Aviso B2B (Manejo de Suscripción) */}
            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '1.5rem', borderTop: '1px solid #222' }}>
               <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                 ¿No eres cliente o tu licencia de pago prescribió? 
                 <br/><a href="#" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>Comunícate comercialmente con nuestra agencia</a> para adquirir un plan mensual.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
