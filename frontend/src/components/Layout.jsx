import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, BarChart3, ClipboardList,
  CalendarDays, LogOut, Bell, RefreshCw, ChevronDown, Heart,
  Moon, Sun, CheckCheck, Info, AlertCircle, Calendar, X, Loader2, CheckCircle2, Activity,
  Settings
} from 'lucide-react'
import { getDoctorName, getInitials } from '../utils/mockData'
import apiClient from '../api/client'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/patients',  icon: Users,           label: 'Estudiantes' },
  { to: '/consultas', icon: Activity,        label: 'Consultas' },
  { to: '/reports',   icon: BarChart3,        label: 'Reportes' },
  { to: '/records',   icon: ClipboardList,    label: 'Expedientes' },
  { to: '/schedule',  icon: CalendarDays,     label: 'Agenda' },
  { to: '/settings',  icon: Settings,         label: 'Configuraciones' },
]

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'alert',   icon: AlertCircle, color: 'text-destructive',  title: 'Consulta pendiente',         body: 'Ana Sofía Reyes tiene consulta sin completar.',  time: 'hace 5 min',  read: false },
  { id: 2, type: 'info',    icon: Info,         color: 'text-primary',      title: 'Nuevo estudiante registrado', body: 'Carlos Mamani fue añadido al sistema.',           time: 'hace 20 min', read: false },
  { id: 3, type: 'schedule',icon: Calendar,     color: 'text-amber-500',    title: 'Cita programada mañana',     body: '3 citas agendadas para mañana a las 9:00 AM.',    time: 'hace 1h',     read: false },
  { id: 4, type: 'info',    icon: Info,         color: 'text-success',      title: 'Sistema actualizado',        body: 'Se aplicaron actualizaciones de seguridad.',      time: 'hace 3h',     read: true  },
]

export default function Layout() {
  const { user, setUser, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  /* ── Dark mode ── */
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('darkMode') === 'true' ||
    (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  /* ── Refresh ── */
  const [spinning, setSpinning] = useState(false)
  const handleRefresh = () => {
    setSpinning(true)
    window.location.reload()
  }

  /* ── Notifications ── */
  const [notes, setNotes]         = useState(INITIAL_NOTIFICATIONS)
  const [showNotes, setShowNotes] = useState(false)
  const notifRef                  = useRef(null)
  const unread                    = notes.filter(n => !n.read).length

  const markAllRead = () => setNotes(prev => prev.map(n => ({ ...n, read: true })))
  const dismiss     = (id) => setNotes(prev => prev.filter(n => n.id !== id))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotes(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Profile dropdown ── */
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  const doctorNameFromMock = user?.nombre_completo || getDoctorName(user?.email) || "Usuario"
  const [localDoctorName, setLocalDoctorName] = useState(doctorNameFromMock)
  const initials   = getInitials((localDoctorName || "Usuario").replace('Dr. ', ''))

  /* ── Modals state ── */
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  
  // Form handling
  const [editName, setEditName] = useState(localDoctorName)
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  const handleSaveProfile = async () => {
    setModalError('')
    if (!editName.trim()) return setModalError('El nombre no puede estar vacío.')
    
    setModalLoading(true)
    try {
      const res = await apiClient.put('/api/auth/profile', { nombre_completo: editName })
      const updatedUser = res.data
      setLocalDoctorName(updatedUser.nombre_completo)
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setModalSuccess('Perfil actualizado correctamente.')
      setTimeout(() => {
        setShowEditProfileModal(false)
        setModalSuccess('')
      }, 1500)
    } catch (error) {
      setModalError(error.response?.data?.detail || 'Error al actualizar perfil')
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    setModalError('')
    if (!passData.current || !passData.new || !passData.confirm) {
      return setModalError('Por favor complete todos los campos.')
    }
    if (passData.new !== passData.confirm) {
      return setModalError('Las contraseñas nuevas no coinciden.')
    }
    
    setModalLoading(true)
    try {
      await apiClient.put('/api/auth/password', {
        current_password: passData.current,
        new_password: passData.new
      })
      setModalSuccess('Contraseña actualizada con éxito.')
      setPassData({ current: '', new: '', confirm: '' })
      setTimeout(() => {
        setShowChangePasswordModal(false)
        setModalSuccess('')
      }, 1500)
    } catch (error) {
      setModalError(error.response?.data?.detail || 'Error al actualizar contraseña')
    } finally {
      setModalLoading(false)
    }
  }
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isItemActive = (to) =>
    to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(to)

  const iconBtn = `w-10 h-10 rounded-full flex items-center justify-center text-primary-deep 
    transition-all duration-200 shadow-soft relative
    bg-background/70 hover:bg-background dark:bg-card dark:hover:bg-muted`

  return (
    <div className="h-screen flex p-4 gap-0 overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="relative w-64 bg-gradient-sidebar flex flex-col py-8 shadow-card rounded-3xl shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-white/95 flex items-center justify-center shadow-soft shrink-0">
            <Heart className="w-6 h-6 text-primary-deep" fill="currentColor" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Seguro Universitario</p>
            <p className="text-white/80 text-xs leading-tight">Expediente Estudiantil</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2 flex-1 w-full pl-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = isItemActive(to)
            return (
              <NavLink
                key={to} to={to} aria-label={label}
                className={
                  `relative h-12 flex items-center gap-4 px-5 transition-smooth text-left ` +
                  (isActive
                    ? 'bg-card text-primary-deep font-semibold rounded-l-2xl -mr-px pr-9 z-10'
                    : 'text-white/90 hover:bg-white/20 rounded-2xl mr-4')
                }
              >
                {isActive && (
                  <span aria-hidden="true" className="absolute -top-5 right-0 w-5 h-5 pointer-events-none"
                    style={{ backgroundColor:'hsl(var(--card))', WebkitMaskImage:'radial-gradient(circle at 0 0,transparent 20px,black 21px)', maskImage:'radial-gradient(circle at 0 0,transparent 20px,black 21px)' }} />
                )}
                {isActive && (
                  <span aria-hidden="true" className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none"
                    style={{ backgroundColor:'hsl(var(--card))', WebkitMaskImage:'radial-gradient(circle at 0 100%,transparent 20px,black 21px)', maskImage:'radial-gradient(circle at 0 100%,transparent 20px,black 21px)' }} />
                )}
                <Icon className={`w-5 h-5 relative z-10 shrink-0 ${isActive ? 'text-primary-deep' : ''}`} strokeWidth={2} />
                <span className="relative z-10 text-sm font-medium">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <button onClick={() => { logout(); navigate('/login') }} aria-label="Cerrar sesión"
          className="mx-4 h-12 rounded-xl flex items-center gap-4 px-5 text-white/90 hover:bg-white/20 transition-smooth mt-1">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 bg-card rounded-3xl shadow-card relative z-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-end px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-3">

            {/* Dark mode toggle */}
            <button onClick={() => setIsDark(!isDark)} aria-label="Alternar modo oscuro" className={iconBtn}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              aria-label="Actualizar página"
              title="Actualizar página"
              className={iconBtn}
            >
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${spinning ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotes(v => !v)}
                aria-label="Notificaciones"
                title="Notificaciones"
                className={iconBtn}
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              {showNotes && (
                <div className="absolute right-0 top-12 w-80 bg-card border border-med-border rounded-2xl shadow-glow z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-med-border">
                    <span className="text-sm font-semibold text-foreground">Notificaciones</span>
                    {unread > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/70 transition-colors font-medium">
                        <CheckCheck className="w-3 h-3" /> Marcar todo leído
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto">
                    {notes.length === 0 ? (
                      <div className="py-10 text-center text-foreground/40 text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Sin notificaciones
                      </div>
                    ) : (
                      notes.map(({ id, icon: Icon, color, title, body, time, read }) => (
                        <div key={id}
                          className={`flex gap-3 px-4 py-3 border-b border-med-border/50 last:border-0 transition-colors ${read ? 'opacity-60' : 'bg-primary/5'}`}>
                          <div className={`mt-0.5 shrink-0 ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight">{title}</p>
                            <p className="text-xs text-foreground/50 mt-0.5 leading-snug">{body}</p>
                            <p className="text-[10px] text-foreground/30 mt-1">{time}</p>
                          </div>
                          <button onClick={() => dismiss(id)}
                            className="text-foreground/30 hover:text-foreground/70 transition-colors shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notes.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-med-border text-center">
                      <button onClick={() => { setNotes([]); setShowNotes(false) }}
                        className="text-xs text-foreground/40 hover:text-destructive transition-colors">
                        Limpiar todas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(v => !v)}
                className="flex items-center gap-3 bg-background/70 rounded-full pl-2 pr-4 py-1.5 shadow-soft dark:bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-xs">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-foreground">{localDoctorName}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-14 w-60 bg-card border border-med-border rounded-2xl shadow-glow z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-4 border-b border-med-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-sm shadow-soft shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate leading-tight">{localDoctorName}</p>
                        <p className="text-[11px] text-foreground/50 truncate mt-0.5">{user?.email}</p>
                        <div className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary uppercase tracking-wider">
                          {(user?.email?.includes('admin') || user?.email?.includes('medico')) ? 'Medicina General' : 'Enfermería'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => { setShowProfile(false); setShowEditProfileModal(true); }}
                        className="w-full py-2 bg-background border border-med-border hover:border-primary/30 hover:text-primary hover:bg-primary/5 text-xs font-medium text-foreground/70 rounded-lg transition-all duration-200">
                        Editar Perfil
                      </button>
                      <button 
                        onClick={() => { setShowProfile(false); setShowChangePasswordModal(true); }}
                        className="w-full py-2 bg-background border border-med-border hover:border-primary/30 hover:text-primary hover:bg-primary/5 text-xs font-medium text-foreground/70 rounded-lg transition-all duration-200">
                        Cambiar Contraseña
                      </button>
                    </div>
                  </div>

                  {/* Session */}
                  <div className="px-4 py-2.5 border-b border-med-border">
                    <p className="text-[10px] text-foreground/30">
                      Sesión iniciada · {new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Logout */}
                  <button onClick={() => { logout(); navigate('/login') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 scroll-smooth scrollbar-hide">
          <Outlet />
        </main>
      </div>

      {/* ── Modals ── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-glow p-8 border border-med-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Editar Perfil</h2>
              <button onClick={() => { setShowEditProfileModal(false); setModalError(''); setModalSuccess(''); }} className="text-foreground/40 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modalError && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{modalError}</div>}
            {modalSuccess && <div className="mb-4 p-3 bg-success/10 border border-success/20 text-success text-xs rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{modalSuccess}</div>}

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-background border border-med-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
                <input type="email" value={user?.email || ''} className="w-full bg-background/50 border border-med-border rounded-xl px-4 py-3 text-sm text-foreground/60 cursor-not-allowed" disabled />
                <p className="text-[10px] text-foreground/40 mt-2">El correo institucional no puede ser modificado aquí.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => { setShowEditProfileModal(false); setModalError(''); setModalSuccess(''); }} className="px-5 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-xl transition-colors font-medium" disabled={modalLoading}>Cancelar</button>
              <button onClick={handleSaveProfile} disabled={modalLoading || modalSuccess} className="px-6 py-2.5 text-sm bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
                {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-glow p-8 border border-med-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Cambiar Contraseña</h2>
              <button onClick={() => { setShowChangePasswordModal(false); setModalError(''); setModalSuccess(''); setPassData({current:'',new:'',confirm:''}); }} className="text-foreground/40 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{modalError}</div>}
            {modalSuccess && <div className="mb-4 p-3 bg-success/10 border border-success/20 text-success text-xs rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{modalSuccess}</div>}

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Contraseña Actual</label>
                <input type="password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} placeholder="••••••••" className="w-full bg-background border border-med-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Nueva Contraseña</label>
                <input type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} placeholder="••••••••" className="w-full bg-background border border-med-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Confirmar Contraseña</label>
                <input type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} placeholder="••••••••" className="w-full bg-background border border-med-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => { setShowChangePasswordModal(false); setModalError(''); setModalSuccess(''); setPassData({current:'',new:'',confirm:''}); }} className="px-5 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-xl transition-colors font-medium" disabled={modalLoading}>Cancelar</button>
              <button onClick={handleUpdatePassword} disabled={modalLoading || modalSuccess} className="px-6 py-2.5 text-sm bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
                {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Actualizar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
