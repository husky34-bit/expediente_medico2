import { useState, useEffect } from 'react'
import { Users, AlertTriangle, Heart, Droplets, ShieldAlert, HeartPulse, Droplet } from 'lucide-react'
import apiClient from '../api/client'
import { getPatientStatus, getPatientVitals, getPatientDisease, getInitials } from '../utils/mockData'
import StatusBadge from '../components/StatusBadge'
import DonutChart from '../components/DonutChart'
import BarChart from '../components/BarChart'
import { differenceInYears, parseISO } from 'date-fns'

const toneMap = {
  primary: 'bg-primary/10 text-primary-deep',
  destructive: 'bg-destructive/15 text-destructive',
  accent: 'bg-amber-400/20 text-amber-700',
  success: 'bg-success/15 text-success',
}

export default function Reports() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/api/pacientes', { params: { limit: 100 } })
      .then(r => setPatients(r.data.pacientes || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const total = patients.length
  const statuses = patients.map(p => getPatientStatus(p.id))
  const stableCount = statuses.filter(s => s === 'STABLE').length
  const recoveringCount = statuses.filter(s => s === 'RECOVERING').length
  const criticalCount = statuses.filter(s => s === 'CRITICAL').length

  const allVitals = patients.map(p => getPatientVitals(p.id))
  const avgHR = total > 0 ? Math.round(allVitals.reduce((s, v) => s + v.heartRate, 0) / total) : 0
  const avgGlucose = total > 0 ? Math.round(allVitals.reduce((s, v) => s + v.glucose, 0) / total) : 0

  // Blood type distribution
  const bloodTypes = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
  const bloodDist = bloodTypes.map(bt => ({
    label: bt,
    value: patients.filter(p => p.tipo_sangre === bt).length,
    color: 'hsl(174 55% 55%)',
  }))

  // Gender split
  const maleCount = patients.filter(p => p.genero_biologico === 'Masculino').length
  const femaleCount = patients.filter(p => p.genero_biologico === 'Femenino').length

  // Critical patients
  const criticalPatients = patients.filter(p => getPatientStatus(p.id) === 'CRITICAL')

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregated insights across {total} registered patient{total !== 1 && 's'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total patients', value: total, tone: 'primary' },
          { icon: ShieldAlert, label: 'Critical cases', value: criticalCount, tone: 'destructive' },
          { icon: HeartPulse, label: 'Avg. heart rate', value: `${avgHR} bpm`, tone: 'accent' },
          { icon: Droplet, label: 'Avg. glucose', value: avgGlucose, tone: 'success' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toneMap[s.tone]}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground leading-tight truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Patient status donut */}
        <div className="med-section-card">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground">Patient status</h3>
            <p className="text-xs text-muted-foreground">Distribution by current condition</p>
          </div>
          <div className="flex justify-center mb-4">
            <DonutChart
              size={180}
              strokeWidth={36}
              data={[
                { value: stableCount, color: 'hsl(152 60% 52%)' },
                { value: recoveringCount, color: 'hsl(45 95% 65%)' },
                { value: criticalCount, color: 'hsl(0 75% 62%)' },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Stable', value: stableCount, color: 'hsl(152 60% 52%)' },
              { name: 'Recovering', value: recoveringCount, color: 'hsl(45 95% 65%)' },
              { name: 'Critical', value: criticalCount, color: 'hsl(0 75% 62%)' },
            ].map(i => (
              <div key={i.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i.color }} />
                <span className="font-medium text-foreground">{i.name}</span>
                <span>· {i.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blood type distribution */}
        <div className="med-section-card">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground">Blood type distribution</h3>
            <p className="text-xs text-muted-foreground">Across all patients</p>
          </div>
          <BarChart data={bloodDist} barColor="hsl(174 55% 55%)" height={180} />
        </div>

        {/* Gender split donut */}
        <div className="med-section-card">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground">Gender split</h3>
            <p className="text-xs text-muted-foreground">Demographics</p>
          </div>
          <div className="flex justify-center mb-4">
            <DonutChart
              size={180}
              strokeWidth={36}
              data={[
                { value: maleCount, color: 'hsl(174 55% 55%)' },
                { value: femaleCount, color: 'hsl(45 95% 65%)' },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Male', value: maleCount, color: 'hsl(174 55% 55%)' },
              { name: 'Female', value: femaleCount, color: 'hsl(45 95% 65%)' },
            ].map(i => (
              <div key={i.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i.color }} />
                <span className="font-medium text-foreground">{i.name}</span>
                <span>· {i.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patients requiring attention */}
      <div className="med-card shadow-card overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-med-border">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Patients requiring attention</h2>
            <p className="text-xs text-muted-foreground">
              {criticalCount} critical case{criticalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {criticalPatients.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No critical patients at the moment.
          </div>
        ) : (
          <ul className="divide-y divide-med-border">
            {criticalPatients.map(p => {
              const v = getPatientVitals(p.id)
              const age = p.fecha_nacimiento ? differenceInYears(new Date(), parseISO(p.fecha_nacimiento)) : null
              return (
                <li key={p.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(p.nombre_completo)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.nombre_completo}</p>
                      <p className="text-xs text-muted-foreground">Age {age || '?'}</p>
                    </div>
                  </div>
                  <span className="text-foreground">{getPatientDisease(p)}</span>
                  <span className="text-foreground">{v.heartRate} bpm</span>
                  <span className="text-foreground">{v.glucose} mg/dL</span>
                  <span>
                    <StatusBadge status="CRITICAL" />
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
