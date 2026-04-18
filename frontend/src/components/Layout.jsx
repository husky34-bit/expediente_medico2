import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, QrCode, LogOut, Activity,
  ChevronRight, Stethoscope, Bell
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients/new', icon: Users, label: 'Nuevo Paciente' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??'

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-bg-border flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-bg-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-accent-teal/20 border border-accent-teal/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-teal" />
            </div>
            <div>
              <p className="font-display text-sm text-text-primary leading-tight">Expediente</p>
              <p className="font-display text-xs text-accent-teal leading-tight">Clínico Universal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status indicator */}
        <div className="px-4 py-3 mx-4 mb-3 rounded-sm bg-accent-teal/5 border border-accent-teal/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal animate-blink" />
            <span className="text-xs text-accent-teal font-mono">Sistema activo</span>
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-bg-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-teal to-accent-blue flex items-center justify-center text-bg-primary font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-text-muted text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-text-secondary hover:text-alert-red hover:bg-alert-red/5 transition-all duration-200 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-bg-secondary border-b border-bg-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <Stethoscope className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-primary">{user?.institution || 'Hospital'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-sm bg-bg-card border border-bg-border flex items-center justify-center text-text-secondary hover:text-accent-teal hover:border-accent-teal/30 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="text-xs text-text-muted font-mono">
              {new Date().toLocaleDateString('es-BO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
