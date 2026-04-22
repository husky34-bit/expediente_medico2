import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Users, AlertTriangle, Heart, Droplets, ArrowUpRight, ChevronRight, TrendingUp, HeartPulse, Activity, CalendarCheck } from 'lucide-react'
import apiClient from '../api/client'
import { getPatientStatus, getPatientVitals, getPatientDisease, getInitials, generateSchedule } from '../utils/mockData'
import StatusBadge from '../components/StatusBadge'
import { differenceInYears, parseISO, format, isToday as isTodayFn } from 'date-fns'

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiClient.get('/api/pacientes', { params: { limit: 50 } })
      .then(r => setPatients(r.data.pacientes || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Compute stats
  const total = patients.length
  const statuses = patients.map(p => getPatientStatus(p.id))
  const stableCount = statuses.filter(s => s === 'STABLE').length
  const recoveringCount = statuses.filter(s => s === 'RECOVERING').length
  const criticalCount = statuses.filter(s => s === 'CRITICAL').length

  const allVitals = patients.map(p => getPatientVitals(p.id))
  const avgHR = total > 0 ? Math.round(allVitals.reduce((s, v) => s + v.heartRate, 0) / total) : 0
  const avgGlucose = total > 0 ? Math.round(allVitals.reduce((s, v) => s + v.glucose, 0) / total) : 0

  const schedule = generateSchedule(patients)
  const today = new Date()
  const todayStr = format(today, 'EEEE, MMMM d, yyyy')

  const todayAppts = schedule.filter(s => {
    const d = new Date(s.date)
    return d.toDateString() === today.toDateString()
  })

  const criticalPatients = patients.filter(p => getPatientStatus(p.id) === 'CRITICAL')

  const statusBreakdown = [
    { label: 'STABLE', value: stableCount, color: 'bg-success' },
    { label: 'RECOVERING', value: recoveringCount, color: 'bg-amber-400' },
    { label: 'CRITICAL', value: criticalCount, color: 'bg-destructive' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inicio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen de la actividad de tu clínica y salud de pacientes
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{todayStr}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 animate-fade-in">
        {[
          { label: 'Pacientes totales', value: total, icon: Users, tone: 'bg-primary/15 text-primary-deep' },
          { label: 'Casos críticos', value: criticalCount, icon: AlertTriangle, tone: 'bg-destructive/15 text-destructive' },
          { label: 'Ritmo cardíaco prom.', value: `${avgHR} bpm`, icon: HeartPulse, tone: 'bg-amber-400/20 text-amber-700' },
          { label: 'Glucosa prom.', value: `${avgGlucose} mg/dl`, icon: Activity, tone: 'bg-secondary text-primary-deep' },
        ].map((s) => (
          <div key={s.label} className="med-stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground leading-none truncate">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-5 animate-fade-in">
        {/* Left column */}
        <div className="space-y-5">
          {/* Status breakdown */}
          <div className="med-section-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Resumen de salud de pacientes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Distribución por estado actual</p>
              </div>
              <button onClick={() => navigate('/reports')}
                className="text-xs font-semibold text-primary-deep hover:underline flex items-center gap-1">
                Ver reportes <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {total > 0 ? (
              <>
                <div className="flex h-3 rounded-full overflow-hidden bg-secondary/60 mb-4">
                  {statusBreakdown.map(b =>
                    b.value > 0 && (
                      <div key={b.label} className={`h-full ${b.color}`}
                        style={{ width: `${(b.value / total) * 100}%` }} />
                    )
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {statusBreakdown.map(b => (
                    <div key={b.label} className="bg-secondary/40 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${b.color}`} />
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {b.label}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-foreground mt-1.5 leading-none">{b.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {total === 0 ? '0%' : `${Math.round((b.value / total) * 100)}%`}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hay pacientes registrados aún.</p>
            )}
          </div>

          {/* Recent patients */}
          <div className="med-section-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Pacientes recientes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Últimas entradas en tu lista de pacientes</p>
              </div>
              <button onClick={() => navigate('/patients')}
                className="text-xs font-semibold text-primary-deep hover:underline flex items-center gap-1">
                Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay pacientes.</p>
            ) : (
              <ul className="divide-y divide-med-border">
                {patients.slice(0, 5).map(p => {
                  const age = p.fecha_nacimiento ? differenceInYears(new Date(), parseISO(p.fecha_nacimiento)) : null
                  const status = getPatientStatus(p.id)
                  const disease = getPatientDisease(p)
                  return (
                    <li key={p.id}>
                      <div
                        onClick={() => navigate(`/patients/${p.id}`)}
                        className="group flex items-center gap-3 py-3 hover:bg-secondary/40 -mx-2 px-2 rounded-xl transition-smooth cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(p.nombre_completo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {p.nombre_completo}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {age !== null ? `${age} años` : ''} · {disease}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-deep transition-smooth shrink-0" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Critical attention */}
          <div className="med-section-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Requieren atención</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Pacientes marcados como críticos</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                {criticalCount}
              </span>
            </div>

            {criticalPatients.length === 0 ? (
              <div className="py-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-success mb-2" />
                <p className="text-sm font-medium text-foreground">Todo en orden</p>
                <p className="text-xs text-muted-foreground mt-1">No hay pacientes críticos en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {criticalPatients.slice(0, 4).map(p => {
                  const vitals = getPatientVitals(p.id)
                  return (
                    <div key={p.id}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-destructive/5 hover:bg-destructive/10 transition-smooth cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(p.nombre_completo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.nombre_completo}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          HR {vitals.heartRate} · {vitals.temperature}°C
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: upcoming */}
        <div className="space-y-5">
          <div className="med-card p-5 shadow-card h-fit">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary-deep" />
                <h3 className="text-sm font-bold text-foreground">Próximos</h3>
              </div>
              <button onClick={() => navigate('/schedule')}
                className="text-[11px] font-semibold text-primary-deep hover:underline">
                Agenda
              </button>
            </div>

            {schedule.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No hay citas planeadas.</p>
            ) : (
              <ul className="space-y-2">
                {schedule.slice(0, 5).map((s, i) => {
                  const d = new Date(s.date)
                  const month = format(d, 'MMM')
                  const day = format(d, 'd')
                  return (
                    <li key={i}>
                      <div
                        onClick={() => navigate(`/patients/${s.patient.id}`)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-smooth cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary/70 shrink-0">
                          <span className="text-[9px] font-semibold text-muted-foreground uppercase">{month}</span>
                          <span className="text-sm font-bold text-primary-deep leading-none">{day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{s.patient.nombre_completo}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {i === 0 ? 'Hoy' : format(d, 'EEE, MMM d')} · {s.time}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Quick stats */}
          <div className="rounded-[1.75rem] p-5 shadow-glow text-white"
            style={{ background: 'var(--gradient-hero)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-85">Hoy</p>
            <p className="text-3xl font-bold mt-1 leading-none">{todayAppts.length}</p>
            <p className="text-xs opacity-85 mt-1">citas programadas</p>
            <button onClick={() => navigate('/schedule')}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-smooth px-3 py-1.5 rounded-full">
              Abrir agenda <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
