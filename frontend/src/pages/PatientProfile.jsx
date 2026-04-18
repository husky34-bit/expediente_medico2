import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Stethoscope, Pill, FlaskConical, AlertTriangle,
  Phone, MapPin, Droplets, Calendar, User, QrCode,
  Plus, Loader2, Activity, ClipboardList
} from 'lucide-react'
import apiClient from '../api/client'
import { format, parseISO, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'
import TimelineEntry from '../components/TimelineEntry'
import AlertBadge from '../components/AlertBadge'
import QRDisplay from '../components/QRDisplay'

export default function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('timeline')

  const fetchData = async () => {
    try {
      const res = await apiClient.get(`/api/patients/${id}`)
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleRegenerateQR = async () => {
    try {
      await apiClient.post(`/api/patients/${id}/qr-token`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-accent-teal animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="text-center py-24">
      <p className="text-text-secondary">Paciente no encontrado</p>
    </div>
  )

  const { patient, consultations, medications, labs, allergies } = data
  const age = patient.date_of_birth
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null
  const activeMeds = medications.filter(m => m.is_active)
  const criticalAllergies = allergies.filter(a => a.severity === 'anaphylactic' || a.severity === 'severe')

  // Build unified timeline
  const timeline = [
    ...consultations.map(c => ({ type: 'consultation', date: c.date, ...c })),
    ...medications.map(m => ({ type: 'medication', date: m.start_date, ...m })),
    ...labs.map(l => ({ type: 'lab', date: l.date, ...l })),
    ...allergies.map(a => ({ type: 'allergy', date: a.confirmed_date || a.created_at?.slice(0, 10), ...a })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const initials = patient.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'allergies', label: `Alergias (${allergies.length})`, icon: AlertTriangle },
    { id: 'medications', label: `Medicación (${medications.length})`, icon: Pill },
    { id: 'labs', label: `Laboratorios (${labs.length})`, icon: FlaskConical },
  ]

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-text-secondary hover:text-accent-teal text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Patient header */}
          <div className="glass-card p-6 fade-up-1">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-teal to-accent-blue flex items-center justify-center text-2xl font-bold text-bg-primary flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl text-text-primary mb-1">{patient.full_name}</h1>
                <div className="flex flex-wrap gap-3 mb-3">
                  {patient.blood_type && (
                    <span className="badge-blood flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {patient.blood_type}
                    </span>
                  )}
                  {age !== null && (
                    <span className="text-text-secondary text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {age} años
                    </span>
                  )}
                  <span className="text-text-secondary text-sm flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                  {patient.national_id && (
                    <span className="font-mono">CI: {patient.national_id}</span>
                  )}
                  {patient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {patient.phone}
                    </span>
                  )}
                  {patient.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {patient.address}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/patients/${id}/consult`)}
                className="btn-primary flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" /> Nueva Consulta
              </button>
            </div>

            {/* Critical allergy alert */}
            {criticalAllergies.length > 0 && (
              <div className="mt-4 p-3 rounded-sm bg-alert-red/10 border border-alert-red/40 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-alert-red flex-shrink-0 animate-pulse" />
                <div>
                  <span className="text-alert-red font-semibold text-sm">⚠ ALERTA CRÍTICA: </span>
                  <span className="text-alert-red text-sm">
                    {criticalAllergies.map(a => a.allergen).join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="glass-card overflow-hidden fade-up-2">
            <div className="flex border-b border-bg-border overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'text-accent-teal border-b-2 border-accent-teal bg-accent-teal/5'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'timeline' && (
                <div>
                  {timeline.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-8">Sin registros en el historial</p>
                  ) : (
                    timeline.map((entry, i) => {
                      if (entry.type === 'consultation') return (
                        <TimelineEntry
                          key={entry.id}
                          type="consultation"
                          date={entry.date}
                          title={entry.diagnosis}
                          subtitle={entry.chief_complaint}
                          details={entry.notes}
                          code={entry.diagnosis_code}
                        />
                      )
                      if (entry.type === 'medication') return (
                        <TimelineEntry
                          key={entry.id}
                          type="medication"
                          date={entry.date}
                          title={entry.name}
                          subtitle={`${entry.dose} — ${entry.frequency}`}
                          details={entry.notes}
                        />
                      )
                      if (entry.type === 'lab') return (
                        <TimelineEntry
                          key={entry.id}
                          type="lab"
                          date={entry.date}
                          title={entry.test_name}
                          subtitle={`${entry.result_value} ${entry.unit || ''} (Ref: ${entry.reference_range || 'N/A'})`}
                          details={entry.lab_name}
                        />
                      )
                      if (entry.type === 'allergy') return (
                        <TimelineEntry
                          key={entry.id}
                          type="allergy"
                          date={entry.date}
                          title={entry.allergen}
                          subtitle={`${entry.severity} — ${entry.reaction_type || ''}`}
                          details={entry.notes}
                        />
                      )
                      return null
                    })
                  )}
                </div>
              )}

              {activeTab === 'allergies' && (
                <div className="space-y-3">
                  {allergies.length === 0
                    ? <p className="text-text-muted text-sm text-center py-8">Sin alergias registradas</p>
                    : allergies.map(a => (
                        <AlertBadge
                          key={a.id}
                          allergen={a.allergen}
                          severity={a.severity}
                          reactionType={a.reaction_type}
                          showFull
                        />
                      ))
                  }
                </div>
              )}

              {activeTab === 'medications' && (
                <div className="space-y-3">
                  {medications.length === 0
                    ? <p className="text-text-muted text-sm text-center py-8">Sin medicamentos registrados</p>
                    : medications.map(m => (
                        <div key={m.id} className="flex items-start gap-3 p-3 rounded-sm bg-bg-secondary border border-bg-border">
                          <Pill className={`w-4 h-4 mt-0.5 flex-shrink-0 ${m.is_active ? 'text-accent-teal' : 'text-text-muted'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-text-primary text-sm font-semibold">{m.name}</p>
                              <span className={m.is_active ? 'badge-teal' : 'text-text-muted text-xs border border-bg-border px-1.5 py-0.5 rounded'}>
                                {m.is_active ? 'Activo' : 'Discontinuado'}
                              </span>
                            </div>
                            <p className="text-text-secondary text-xs mt-0.5">{m.dose} — {m.frequency}</p>
                            {m.notes && <p className="text-text-muted text-xs mt-1 italic">{m.notes}</p>}
                          </div>
                          <span className="text-text-muted text-xs font-mono whitespace-nowrap">{m.start_date}</span>
                        </div>
                      ))
                  }
                </div>
              )}

              {activeTab === 'labs' && (
                <div className="space-y-3">
                  {labs.length === 0
                    ? <p className="text-text-muted text-sm text-center py-8">Sin resultados de laboratorio</p>
                    : labs.map(l => (
                        <div key={l.id} className="flex items-start gap-3 p-3 rounded-sm bg-bg-secondary border border-bg-border">
                          <FlaskConical className="w-4 h-4 mt-0.5 text-alert-amber flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary text-sm font-semibold">{l.test_name}</p>
                            <p className="text-text-secondary text-xs mt-0.5">
                              <span className="font-mono font-bold text-accent-teal">{l.result_value} {l.unit}</span>
                              {l.reference_range && <span className="text-text-muted"> (Ref: {l.reference_range})</span>}
                            </p>
                            {l.lab_name && <p className="text-text-muted text-xs mt-0.5">{l.lab_name}</p>}
                          </div>
                          <span className="text-text-muted text-xs font-mono whitespace-nowrap">{l.date}</span>
                        </div>
                      ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* QR */}
          <div className="fade-up-2">
            <QRDisplay
              patientId={patient.id}
              qrToken={patient.qr_token}
              patientName={patient.full_name}
              onRegenerate={handleRegenerateQR}
            />
          </div>

          {/* Emergency contact */}
          {patient.emergency_contact_name && (
            <div className="glass-card p-4 fade-up-3">
              <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Contacto de Emergencia
              </h3>
              <p className="text-text-primary font-semibold">{patient.emergency_contact_name}</p>
              {patient.emergency_contact_phone && (
                <p className="text-accent-teal font-mono text-sm mt-1">{patient.emergency_contact_phone}</p>
              )}
            </div>
          )}

          {/* Active medications summary */}
          <div className="glass-card p-4 fade-up-3">
            <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pill className="w-3.5 h-3.5" /> Medicación Activa ({activeMeds.length})
            </h3>
            {activeMeds.length === 0
              ? <p className="text-text-muted text-sm">Sin medicación activa</p>
              : activeMeds.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center gap-2 py-1.5 border-b border-bg-border last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-teal flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm truncate">{m.name}</p>
                      <p className="text-text-muted text-xs">{m.dose}</p>
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 fade-up-4">
            {[
              { label: 'Consultas', value: consultations.length, icon: Stethoscope, color: 'text-accent-teal' },
              { label: 'Medicamentos', value: medications.length, icon: Pill, color: 'text-accent-blue' },
              { label: 'Laboratorios', value: labs.length, icon: FlaskConical, color: 'text-alert-amber' },
              { label: 'Alergias', value: allergies.length, icon: AlertTriangle, color: 'text-alert-red' },
            ].map(s => (
              <div key={s.label} className="glass-card p-3 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-text-muted text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
