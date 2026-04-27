import { useState, useEffect, useRef } from 'react'
import {
  Download, Wifi, WifiOff, Smartphone, CheckCircle,
  Shield, Zap, Monitor, Moon, Sun, Sparkles,
  Heart, Chrome, X, ArrowRight
} from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

/* ── Mini modal de instrucciones cuando el prompt no está disponible ── */
function InstallGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ animation: 'fadeIn .15s ease' }}>
      <div className="bg-card border border-med-border rounded-3xl shadow-glow w-full max-w-sm mx-4 overflow-hidden"
        style={{ animation: 'popIn .2s cubic-bezier(.34,1.56,.64,1)' }}>

        <div className="px-6 py-5 border-b border-med-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm">Cómo instalar la aplicación</h3>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {[
            { step: '1', text: 'Abre esta página en Chrome o Edge (si no estás ya).' },
            { step: '2', text: 'Haz clic en el ícono ⊕ o 💾 que aparece en la barra de direcciones.' },
            { step: '3', text: 'También puedes ir al menú ⋮ → "Instalar Expediente Clínico Universal".' },
            { step: '4', text: 'Confirma la instalación y la app aparecerá en tu escritorio.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step}
              </span>
              <p className="text-sm text-foreground/80 leading-snug">{text}</p>
            </div>
          ))}

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-primary-deep/80 leading-relaxed">
            💡 El botón de instalación se activa automáticamente cuando el navegador detecta que cumples los requisitos (HTTPS + Chrome/Edge).
          </div>
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */
export default function Settings() {
  const { canInstall, isInstalled, isOnline, swStatus, promptInstall } = usePWA()
  const [installState, setInstallState] = useState('idle') // idle | installing | done
  const [showGuide,    setShowGuide]    = useState(false)
  const [toast,        setToast]        = useState(null)
  const timerRef = useRef(null)

  /* ── Tema ── */
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('darkMode') === 'true' ||
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  useEffect(() => {
    if (isInstalled) setInstallState('done')
  }, [isInstalled])

  const showToast = (msg, type = 'success') => {
    clearTimeout(timerRef.current)
    setToast({ msg, type })
    timerRef.current = setTimeout(() => setToast(null), 4000)
  }

  /* ── Acción del botón ── */
  const handleInstall = async () => {
    if (installState === 'done' || isInstalled) return

    /* Prompt nativo disponible → instalar directamente */
    if (canInstall) {
      setInstallState('installing')
      try {
        const { outcome } = await promptInstall()
        if (outcome === 'accepted') {
          setInstallState('done')
          showToast('¡Instalada! Búscala en tu escritorio.', 'success')
        } else {
          setInstallState('idle')
          showToast('Instalación cancelada. Inténtalo de nuevo cuando quieras.', 'warn')
        }
      } catch {
        setInstallState('idle')
      }
      return
    }

    /* Prompt NO disponible → mostrar guía de instalación manual */
    setShowGuide(true)
  }

  const installed = isInstalled || installState === 'done'

  /* ─── Texto e icono del botón ─────────────────────────── */
  let btnLabel = 'Instalar aplicación'
  if (installState === 'installing') btnLabel = 'Abriendo instalador…'
  if (installed) btnLabel = 'Aplicación instalada ✓'

  return (
    <div className="animate-fade-in">

      {/* ── Guide Modal ── */}
      {showGuide && <InstallGuideModal onClose={() => setShowGuide(false)} />}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-glow text-sm font-semibold border max-w-xs
          ${toast.type === 'success'
            ? 'bg-card border-success/30 text-success'
            : 'bg-card border-amber-400/30 text-amber-500'}`}
          style={{ animation: 'slideIn .2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* ── Cabecera ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Configuraciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preferencias de la aplicación y opciones de instalación
        </p>
      </div>

      {/* ══ HERO: Instalar como App ══════════════════════════ */}
      <div className="rounded-3xl mb-6 overflow-hidden shadow-glow"
        style={{ background: 'var(--gradient-hero)' }}>
        <div className="px-8 py-8 flex items-center gap-8 flex-wrap">

          {/* Texto izquierda */}
          <div className="text-white flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 mb-3 opacity-75">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Aplicación de escritorio · PWA
              </span>
            </div>
            <h2 className="text-xl font-bold leading-snug mb-2">
              Instala la app y úsala<br />sin abrir el navegador
            </h2>
            <p className="text-sm text-white/65 leading-relaxed mb-4 max-w-sm">
              Accede desde tu escritorio con ícono propio, trabaja sin internet
              y disfruta de una experiencia completamente nativa.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Zap,     label: 'Funciona offline' },
                { icon: Shield,  label: 'Datos seguros'    },
                { icon: Monitor, label: 'Sin navegador'    },
              ].map(({ icon: Icon, label }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Botón derecha — SIEMPRE ACTIVO */}
          <div className="shrink-0 w-56 flex flex-col gap-2.5">
            <button
              onClick={handleInstall}
              disabled={installState === 'installing' || installed}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm
                transition-all duration-150 shadow-xl
                ${installed
                  ? 'bg-white/20 text-white cursor-default'
                  : 'bg-white text-primary-deep hover:bg-white/90 active:scale-[0.97]'
                }`}
            >
              {installed
                ? <CheckCircle className="w-4 h-4" />
                : <Download className={`w-4 h-4 ${installState === 'installing' ? 'animate-bounce' : ''}`} />
              }
              {btnLabel}
            </button>

            {!installed && (
              <p className="text-white/50 text-[11px] text-center leading-relaxed">
                {canInstall
                  ? 'El instalador está listo — haz clic'
                  : 'Haz clic para ver cómo instalar'
                }
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ══ Grid 2 columnas ══════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* ─ Apariencia ─────────────────────────────────────── */}
        <div className="med-section-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              {isDark ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Apariencia</p>
              <p className="text-xs text-muted-foreground">Tema visual de la interfaz</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            {[
              { label: 'Claro',  dark: false, icon: Sun  },
              { label: 'Oscuro', dark: true,  icon: Moon },
            ].map(({ label, dark, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setIsDark(dark)}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 text-xs font-semibold transition-all duration-200
                  ${isDark === dark
                    ? 'border-primary bg-primary/10 text-primary-deep'
                    : 'border-med-border bg-secondary/40 text-foreground/60 hover:border-primary/30'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {label}
                {isDark === dark && (
                  <CheckCircle className="w-3 h-3 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─ Estado del sistema ─────────────────────────────── */}
        <div className="med-section-card">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              ${isOnline ? 'bg-success/10 text-success' : 'bg-amber-400/10 text-amber-500'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Estado del sistema</p>
              <p className="text-xs text-muted-foreground">Conectividad y modo offline</p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Conexión */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/40 border border-med-border/50">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-success animate-pulse' : 'bg-amber-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {isOnline ? 'Conectado a internet' : 'Sin conexión'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isOnline ? 'Datos sincronizados en tiempo real' : 'Usando datos en caché local'}
                </p>
              </div>
            </div>

            {/* Service Worker */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/40 border border-med-border/50">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                swStatus === 'registered' ? 'bg-success animate-pulse'
                : swStatus === 'error'    ? 'bg-destructive'
                : 'bg-muted-foreground animate-pulse'
              }`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">Cache offline</p>
                <p className="text-[11px] text-muted-foreground">
                  {swStatus === 'registered' ? 'Activo — la app funciona sin internet'
                  : swStatus === 'error'     ? 'Error al iniciar el servicio'
                  : 'Iniciando…'}
                </p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                swStatus === 'registered' ? 'bg-success/10 text-success'
                : swStatus === 'error'    ? 'bg-destructive/10 text-destructive'
                : 'bg-secondary text-muted-foreground'
              }`}>
                {swStatus === 'registered' ? 'OK' : swStatus === 'error' ? 'ERR' : '···'}
              </span>
            </div>
          </div>
        </div>

        {/* ─ Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/30 border border-med-border/30"
          style={{ gridColumn: '1 / -1' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs">Expediente Clínico Universal · PWA habilitada</span>
          </div>
          <span className="text-[10px] font-semibold bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
            v1.0.0
          </span>
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(14px); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        @keyframes fadeIn {
          from { opacity: 0 } to { opacity: 1 }
        }
        @keyframes popIn {
          from { transform: scale(.93) translateY(12px); opacity: 0 }
          to   { transform: scale(1)   translateY(0);    opacity: 1 }
        }
      `}</style>
    </div>
  )
}
