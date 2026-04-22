import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, BarChart3, ClipboardList,
  CalendarDays, LogOut, Bell, RefreshCw, ChevronDown, Heart, Moon, Sun
} from 'lucide-react'
import { getDoctorName, getInitials } from '../utils/mockData'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/patients', icon: Users, label: 'Pacientes' },
  { to: '/reports', icon: BarChart3, label: 'Reportes' },
  { to: '/records', icon: ClipboardList, label: 'Expedientes' },
  { to: '/schedule', icon: CalendarDays, label: 'Agenda' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark);
  }, [isDark]);

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const doctorName = getDoctorName(user?.email)
  const initials = getInitials(doctorName.replace('Dr. ', ''))

  const isItemActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(to)
  }

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
            <p className="text-white font-semibold text-sm leading-tight">Expediente Clínico</p>
            <p className="text-white/80 text-xs leading-tight">Universal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2 flex-1 w-full pl-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = isItemActive(to)
            return (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                className={
                  `relative h-12 flex items-center gap-4 px-5 transition-smooth text-left ` +
                  (isActive
                    ? 'bg-card text-primary-deep font-semibold rounded-l-2xl -mr-px pr-9 z-10'
                    : 'text-white/90 hover:bg-white/20 rounded-2xl mr-4')
                }
              >
                {/* Curved corner top */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-5 right-0 w-5 h-5 pointer-events-none"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      WebkitMaskImage: 'radial-gradient(circle at 0 0, transparent 20px, black 21px)',
                      maskImage: 'radial-gradient(circle at 0 0, transparent 20px, black 21px)',
                    }}
                  />
                )}
                {/* Curved corner bottom */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      WebkitMaskImage: 'radial-gradient(circle at 0 100%, transparent 20px, black 21px)',
                      maskImage: 'radial-gradient(circle at 0 100%, transparent 20px, black 21px)',
                    }}
                  />
                )}

                <Icon className={`w-5 h-5 relative z-10 shrink-0 ${isActive ? 'text-primary-deep' : ''}`} strokeWidth={2} />
                <span className="relative z-10 text-sm font-medium">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="mx-4 h-12 rounded-xl flex items-center gap-4 px-5 text-white/90 hover:bg-white/20 transition-smooth mt-4"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 bg-card rounded-3xl shadow-card relative z-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-end px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Alternar modo oscuro"
              className="w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-primary-deep transition-smooth shadow-soft dark:bg-card dark:hover:bg-card"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              aria-label="Actualizar"
              className="w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-primary-deep transition-smooth shadow-soft dark:bg-card dark:hover:bg-card"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              aria-label="Notificaciones"
              className="w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-primary-deep transition-smooth shadow-soft relative dark:bg-card dark:hover:bg-card"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: 'hsl(var(--accent))' }} />
            </button>

            <div className="flex items-center gap-3 bg-white/70 rounded-full pl-2 pr-4 py-1.5 shadow-soft dark:bg-card">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
              <span className="text-sm font-semibold text-foreground">{doctorName}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 scroll-smooth scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
