import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const slides = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1920&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1920&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=85&auto=format&fit=crop"
];

const kbClasses = ['kb1', 'kb2', 'kb3', 'kb4'];
const INTERVAL = 6000;

export default function Landing() {
  const [current, setCurrent] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [headingVisible, setHeadingVisible] = useState(false);
  
  // Modal & Auth State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const emailInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Sequence animations
    requestAnimationFrame(() => setHeadingVisible(true));
    setTimeout(() => setShowSub(true), 800);
    setTimeout(() => setShowButtons(true), 1200);
    setTimeout(() => setShowTag(true), 1400);
  }, []);

  // Close modal on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (emailInputRef.current) emailInputRef.current.focus();
    }, 320);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor llena todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const headingText1 = "Transformando";
  const headingText2 = "la gestión médica con precisión.";

  return (
    <div className="landing-body">
      {/* Ken Burns Slideshow */}
      <div id="bg-slideshow">
        {slides.map((url, i) => (
          <div
            key={url}
            className={`slide ${i === current ? 'active ' + kbClasses[i % kbClasses.length] : ''}`}
            style={{ backgroundImage: `url('${url}')` }}
          />
        ))}
      </div>

      {/* Overlay for readability */}
      <div id="bg-overlay"></div>

      {/* Slide dots */}
      <div id="slide-dots">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`dot ${i === current ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* ── LOGIN MODAL ── */}
      <div 
        id="modal-overlay" 
        className={isModalOpen ? 'open' : ''} 
        onClick={(e) => {
          if (e.target.id === 'modal-overlay') closeModal();
        }}
        role="dialog" 
        aria-modal="true"
      >
        <div id="modal">
          <button id="modal-close" onClick={closeModal} aria-label="Cerrar">✕</button>

          <div className="modal-logo">
            <Activity className="w-7 h-7 text-white" />
            <span>Expediente Universal</span>
          </div>

          <h2>Bienvenido</h2>
          <p className="modal-sub">Inicie sesión para acceder a su portal médico</p>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-center gap-2 backdrop-blur-md">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input 
                ref={emailInputRef}
                type="email" 
                id="email" 
                placeholder="doctor@hospital.bo" 
                autoComplete="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••" 
                autoComplete="current-password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <a href="#" className="modal-forgot" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>

            <button type="submit" className="btn-modal" disabled={loading}>
              {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="modal-divider"><span>or continue with</span></div>

          <button className="btn-modal-outline" onClick={(e) => e.preventDefault()}>
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button className="btn-modal-outline" onClick={(e) => e.preventDefault()}>
            <svg viewBox="0 0 18 18" fill="white">
              <path d="M12.53 9.02c-.02-2.04 1.67-3.02 1.75-3.07-1.02-1.49-2.52-1.62-3.04-1.63-1.3-.13-2.5.77-3.17.77-.64 0-1.67-.75-2.73-.73-1.4.02-2.68.82-3.41 2.07-1.44 2.5-.37 6.22 1.04 8.26.69 1 1.5 2.12 2.58 2.08 1.03-.04 1.42-.67 2.67-.67 1.24 0 1.59.67 2.67.65 1.1-.02 1.81-1.01 2.49-2.01.78-1.14 1.1-2.26 1.12-2.31-.03-.01-2.15-.83-2.97-3.41z"/>
              <path d="M10.46 3.14C11 2.46 11.37 1.52 11.27.57c-.83.05-1.83.56-2.42 1.22-.52.59-.98 1.54-.85 2.45.91.07 1.85-.45 2.46-1.1z"/>
            </svg>
            Continue with Apple
          </button>

          <p className="modal-register">
            Don't have an account? <a href="#" onClick={(e) => e.preventDefault()}>Create one</a>
          </p>

          {/* Demo credentials */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs font-mono mb-2">Credenciales de demo:</p>
            <p className="text-gray-300 text-xs font-mono mb-1">admin@hospital.bo / Admin1234!</p>
            <p className="text-gray-300 text-xs font-mono">doctor1@clinica.bo / Doctor1234!</p>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section id="hero">
        <nav id="navbar">
          <div className="navbar-bar liquid-glass">
            <a href="#" className="nav-logo">
              <Activity className="w-6 h-6 text-white" />
              MedCore
            </a>
            <ul className="nav-links">
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Beneficios</a></li>
              <li><a href="#">Plataforma NHS</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
            <div className="nav-right">
              <button className="nav-login" onClick={openModal}>Accesso</button>
              <button className="nav-cta" onClick={openModal}>Iniciar Sesión</button>
            </div>
          </div>
        </nav>

        <div id="hero-content">
          <div className="hero-grid">
            <div className="hero-left">
              <h1 id="hero-heading" aria-label={`${headingText1} ${headingText2}`}>
                {headingText1.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char ${headingVisible ? 'visible' : ''}`}
                    style={{ transitionDelay: `${200 + i * 30}ms` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
                <span className="line-break" />
                {headingText2.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char ${headingVisible ? 'visible' : ''}`}
                    style={{ transitionDelay: `${200 + (headingText1.length + i) * 30}ms` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h1>
              <p id="hero-sub" className={showSub ? 'visible' : ''}>
                Historial médico en la nube siempre accesible. Combinamos tecnología avanzada y un enfoque centrado en la portabilidad para que los datos del paciente viajen con él.
              </p>
              <div id="hero-buttons" className={showButtons ? 'visible' : ''}>
                <button className="btn-primary" onClick={openModal}>Acceso Médico</button>
                <button className="btn-secondary liquid-glass">Conocer más</button>
              </div>
            </div>
            <div className="hero-right">
              <div id="hero-tag" className={`liquid-glass ${showTag ? 'visible' : ''}`}>
                <p>Cuidado. Precisión. Portabilidad.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
