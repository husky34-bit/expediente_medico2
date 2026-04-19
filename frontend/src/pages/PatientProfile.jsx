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
      const res = await apiClient.get(`/api/pacientes/${id}`)
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
      await apiClient.post(`/api/pacientes/${id}/qr-token`)
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

  const { patient, consultations, medications, laboratorios } = data
  const patientData = patient || data.paciente || {}
  const consultationsData = consultations || data.consultas || []
  const medicationsData = medications || data.medicamentos || []
  const laboratoriosData = laboratorios || data.laboratorios || []

  const age = patientData?.fecha_nacimiento
    ? differenceInYears(new Date(), parseISO(patientData.fecha_nacimiento))
    : null
  const activeMeds = (medicationsData || []).filter(m => m.esta_activo)

  // Build unified timeline
  const timeline = [
    ...(consultationsData || []).map(c => ({ type: 'consultation', date: c.fecha_consulta, ...c })),
    ...(medicationsData || []).map(m => ({ type: 'medication', date: m.fecha_inicio, ...m })),
    ...(laboratoriosData || []).map(l => ({ type: 'lab', date: l.fecha_prueba, ...l })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const initials = patientData?.nombre_completo?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '??'

  const tabs = [
    { id: 'timeline', label: 'Historial', icon: Activity },
    { id: 'medications', label: `Medicación (${(medicationsData || []).length})`, icon: Pill },
    { id: 'labs', label: `Laboratorios (${(laboratoriosData || []).length})`, icon: FlaskConical },
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
                <h1 className="font-display text-2xl text-text-primary mb-1">{patientData.nombre_completo}</h1>
                <div className="flex flex-wrap gap-3 mb-3">
                  {patientData.tipo_sangre && (
                    <span className="badge-blood flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {patientData.tipo_sangre}
                    </span>
                  )}
                  {age !== null && (
                    <span className="text-text-secondary text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {age} años
                    </span>
                  )}
                  <span className="text-text-secondary text-sm flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {patientData.genero_biologico}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                  {patientData.dni_pasaporte && (
                    <span className="font-mono">CI: {patientData.dni_pasaporte}</span>
                  )}
                  {patientData.contacto_emergencia_tel && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {patientData.contacto_emergencia_tel}
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
                          title={entry.diagnostico_cie10}
                          subtitle={entry.motivo_consulta}
                          details={entry.tratamiento}
                        />
                      )
                      if (entry.type === 'medication') return (
                        <TimelineEntry
                          key={entry.id}
                          type="medication"
                          date={entry.date}
                          title={entry.nombre_medicamento}
                          subtitle={`${entry.dosis} — ${entry.frecuencia}`}
                          details={entry.notas}
                        />
                      )
                      if (entry.type === 'lab') return (
                        <TimelineEntry
                          key={entry.id}
                          type="lab"
                          date={entry.date}
                          title={entry.nombre_prueba}
                          subtitle={`${entry.valor_resultado} ${entry.unidad || ''}`}
                          details={entry.notas}
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
                  {(medicationsData || []).length === 0
                    ? <p className="text-text-muted text-sm text-center py-8">Sin medicamentos registrados</p>
                    : medicationsData.map(m => (
                    <div key={m.id} className="p-4 rounded-xl border border-bg-border bg-bg-secondary flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${m.esta_activo ? 'bg-accent-teal/10 text-accent-teal' : 'bg-text-muted/10 text-text-muted'}`}>
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary">{m.nombre_medicamento}</h4>
                          <p className="text-sm text-text-secondary">{m.dosis} — {m.frecuencia}</p>
                          <p className="text-xs text-text-muted mt-1">Inicio: {m.fecha_inicio ? format(parseISO(m.fecha_inicio), 'PP', { locale: es }) : 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.esta_activo ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20' : 'bg-text-muted/10 text-text-muted border border-text-muted/20'}`}>
                        {m.esta_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'labs' && (
                <div className="space-y-3">
                  {(laboratoriosData || []).length === 0
                    ? <p className="text-text-muted text-sm text-center py-8">Sin resultados de laboratorio</p>
                    : laboratoriosData.map(l => (
                    <div key={l.id} className="p-4 rounded-xl border border-bg-border bg-bg-secondary flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                          <FlaskConical className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary">{l.nombre_prueba}</h4>
                          <p className="text-sm text-text-secondary">Resultado: <span className="font-bold text-accent-blue">{l.valor_resultado} {l.unidad}</span></p>
                          <p className="text-xs text-text-muted mt-1">Fecha: {l.fecha_prueba ? format(parseISO(l.fecha_prueba), 'PP', { locale: es }) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
              patientId={patientData.id}
              qrToken={patientData.qr_token}
              patientName={patientData.nombre_completo}
              onRegenerate={handleRegenerateQR}
            />
          </div>

          {/* Emergency contact */}
          {patientData.contacto_emergencia_nombre && (
            <div className="glass-card p-4 fade-up-3">
              <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Contacto de Emergencia
              </h3>
              <p className="text-text-primary font-semibold">{patientData.contacto_emergencia_nombre}</p>
              {patientData.contacto_emergencia_tel && (
                <p className="text-accent-teal font-mono text-sm mt-1">{patientData.contacto_emergencia_tel}</p>
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
              : (activeMeds || []).slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center gap-2 py-1.5 border-b border-bg-border last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-teal flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm truncate">{m.nombre_medicamento}</p>
                      <p className="text-text-muted text-xs">{m.dosis}</p>
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 fade-up-4">
            {[
              { label: 'Consultas', value: consultationsData.length, icon: Stethoscope, color: 'text-accent-teal' },
              { label: 'Medicamentos', value: medicationsData.length, icon: Pill, color: 'text-accent-blue' },
              { label: 'Laboratorios', value: laboratoriosData.length, icon: FlaskConical, color: 'text-alert-amber' },
              { label: 'Alergias', value: 0, icon: AlertTriangle, color: 'text-alert-red' },
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
