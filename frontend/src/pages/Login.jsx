import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff, Stethoscope, Lock, Mail } from 'lucide-react'
import './Landing.css' // Reuse the liquid-glass and background styles

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-body flex items-center justify-center p-4">
      {/* Static Background for Login */}
      <div 
        id="bg-slideshow" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=85&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)'
        }}
      />
      <div id="bg-overlay"></div>

      <div className="w-full max-w-md relative z-10 fade-up-1">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl liquid-glass mb-4 border border-white/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl text-white mb-1">
            Expediente Clínico Universal
          </h1>
          <p className="text-gray-300 text-sm">Sistema de historial médico en la nube</p>
        </div>

        {/* Card */}
        <div className="liquid-glass rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-6 text-white">
            <Stethoscope className="w-5 h-5 text-accent-teal" />
            <h2 className="font-semibold">Acceso Médico</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-center gap-2 backdrop-blur-md">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-accent-teal focus:bg-white/15 transition-all"
                  placeholder="doctor@hospital.bo"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg pl-10 pr-10 py-2.5 outline-none focus:border-accent-teal focus:bg-white/15 transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-lg bg-black/30 border border-white/10">
            <p className="text-gray-400 text-xs font-mono mb-2">Credenciales de demo:</p>
            <p className="text-gray-200 text-xs font-mono mb-1">admin@hospital.bo / Admin1234!</p>
            <p className="text-gray-200 text-xs font-mono">doctor1@clinica.bo / Doctor1234!</p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Acceso restringido a personal médico autorizado
        </p>
      </div>
    </div>
  )
}
