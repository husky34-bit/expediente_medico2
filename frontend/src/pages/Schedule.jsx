import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, AlertTriangle, ChevronLeft, ChevronRight, Clock, CalendarCheck } from 'lucide-react'
import apiClient from '../api/client'
import { generateSchedule, getInitials, getPatientStatus, getPatientDisease } from '../utils/mockData'
import StatusBadge from '../components/StatusBadge'
import { format, startOfWeek, addDays, isSameDay, isToday as isTodayFn } from 'date-fns'

export default function Schedule() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Date())
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const navigate = useNavigate()

  useEffect(() => {
    apiClient.get('/api/pacientes', { params: { limit: 50 } })
      .then(r => setPatients(r.data.pacientes || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const schedule = generateSchedule(patients)

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const dayAppointments = useMemo(
    () => schedule
      .filter(s => isSameDay(new Date(s.date), selected))
      .sort((a, b) => a.time.localeCompare(b.time)),
    [schedule, selected]
  )

  const upcoming = useMemo(
    () => [...schedule]
      .filter(s => new Date(s.date).getTime() >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time))
      .slice(0, 5),
    [schedule]
  )

  const countForDay = (d) => schedule.filter(s => isSameDay(new Date(s.date), d)).length
  const todayCount = schedule.filter(s => isTodayFn(new Date(s.date))).length
  const urgentCount = schedule.filter(s => s.status === 'CRITICAL').length

  const friendlyDate = (d) => {
    if (isTodayFn(d)) return 'Today'
    const tomorrow = addDays(new Date(), 1)
    if (isSameDay(d, tomorrow)) return 'Tomorrow'
    return format(d, 'EEE, MMM d')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Plan and review appointments for your patients</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{todayCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Today's appointments</p>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{schedule.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Scheduled (14 days)</p>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{urgentCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Urgent follow-ups</p>
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div className="med-section-card mb-5" style={{ padding: '1rem 1rem' }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-deep">
              {format(weekStart, 'MMMM yyyy')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Week of {format(weekStart, 'MMM d')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="w-8 h-8 rounded-lg hover:bg-secondary/60 flex items-center justify-center transition-smooth"
              aria-label="Previous week">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => {
                const td = startOfWeek(new Date(), { weekStartsOn: 1 })
                setWeekStart(td)
                setSelected(new Date())
              }}
              className="text-xs font-semibold text-primary-deep px-3 h-8 rounded-lg hover:bg-secondary/60 transition-smooth">
              Today
            </button>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="w-8 h-8 rounded-lg hover:bg-secondary/60 flex items-center justify-center transition-smooth"
              aria-label="Next week">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const isSel = isSameDay(d, selected)
            const count = countForDay(d)
            return (
              <button key={d.toISOString()}
                onClick={() => setSelected(d)}
                className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-smooth relative ${
                  isSel
                    ? 'text-white shadow-glow'
                    : 'hover:bg-secondary/60 text-foreground'
                }`}
                style={isSel ? { background: 'linear-gradient(135deg, hsl(174 55% 55%), hsl(190 70% 70%))' } : {}}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isSel ? 'text-white/85' : 'text-muted-foreground'
                }`}>
                  {format(d, 'EEE')}
                </span>
                <span className="text-lg font-bold leading-none mt-1">{format(d, 'd')}</span>
                {count > 0 && (
                  <span className={`mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isSel ? 'bg-white/25 text-white' : 'bg-primary/15 text-primary-deep'
                  }`}>
                    {count}
                  </span>
                )}
                {isTodayFn(d) && !isSel && (
                  <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main grid: agenda (left) + upcoming (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-5">
        {/* Day agenda */}
        <div className="med-section-card">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-med-border">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-deep">
                {friendlyDate(selected)}
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {format(selected, 'EEEE, MMMM d, yyyy')}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground leading-none">{dayAppointments.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                appointment{dayAppointments.length !== 1 && 's'}
              </p>
            </div>
          </div>

          {dayAppointments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary/60 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No appointments</p>
              <p className="text-xs text-muted-foreground mt-1">There's nothing scheduled for this day.</p>
            </div>
          ) : (
            <ol className="relative space-y-3 before:absolute before:left-[2.25rem] before:top-2 before:bottom-2 before:w-px before:bg-med-border">
              {dayAppointments.map((appt, i) => {
                const d = new Date(appt.date)
                const hour = parseInt(appt.time.split(':')[0])
                return (
                  <li key={i} className="relative">
                    <div
                      onClick={() => navigate(`/patients/${appt.patient.id}`)}
                      className="group flex items-center gap-4 p-3 pl-0 rounded-2xl hover:bg-secondary/50 transition-smooth cursor-pointer"
                    >
                      <div className="w-[4.5rem] shrink-0 text-right">
                        <p className="text-sm font-bold text-primary-deep leading-none">{appt.time}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
                          {hour >= 12 ? 'PM' : 'AM'}
                        </p>
                      </div>
                      <div className="relative w-3 h-3 rounded-full bg-primary ring-4 ring-card shrink-0" />
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(appt.patient.nombre_completo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground truncate">{appt.patient.nombre_completo}</p>
                          <StatusBadge status={appt.status} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{appt.reason}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-smooth shrink-0" />
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Upcoming */}
        <div className="med-card p-5 shadow-card h-fit" style={{ borderRadius: '1.75rem' }}>
          <h3 className="text-sm font-bold text-foreground mb-3">Upcoming</h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No upcoming appointments.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((a, i) => {
                const d = new Date(a.date)
                return (
                  <li key={i}>
                    <button
                      onClick={() => setSelected(d)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-smooth ${
                        isSameDay(d, selected) ? 'bg-primary/10' : 'hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary/70 shrink-0">
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase">
                          {format(d, 'MMM')}
                        </span>
                        <span className="text-sm font-bold text-primary-deep leading-none">
                          {format(d, 'd')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{a.patient.nombre_completo}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {friendlyDate(d)} · {a.time}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
