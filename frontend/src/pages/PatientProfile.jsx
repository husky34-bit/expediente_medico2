import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Heart, Thermometer, Droplets, FileText,
  Plus, Loader2, Link2
} from 'lucide-react'
import apiClient from '../api/client'
import { differenceInYears, parseISO, format } from 'date-fns'
import { getPatientVitals, getPatientDisease, getInitials, getBloodTypeLabel } from '../utils/mockData'
import { getPatientStatus } from '../utils/mockData'

export default function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get(`/api/pacientes/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="text-center py-24">
      <p className="text-muted-foreground">Paciente no encontrado</p>
    </div>
  )

  const patient = data.patient || data.paciente || {}
  const consultations = data.consultations || data.consultas || []
  const medications = data.medications || data.medicamentos || []
  const labs = data.laboratorios || []

  const age = patient.fecha_nacimiento
    ? differenceInYears(new Date(), parseISO(patient.fecha_nacimiento))
    : null
  const vitals = getPatientVitals(patient.id)
  const initials = getInitials(patient.nombre_completo)
  const bt = getBloodTypeLabel(patient.tipo_sangre)
  const disease = getPatientDisease(patient)

  const testReports = labs.length > 0 ? labs : [
    { id: 1, nombre_prueba: 'CT Scan - Full Body', fecha_prueba: new Date().toISOString() },
    { id: 2, nombre_prueba: 'Creatine Kinase T', fecha_prueba: new Date().toISOString() },
    { id: 3, nombre_prueba: 'Eye Fluorescein Test', fecha_prueba: new Date().toISOString() },
  ]

  const reportColors = ['hsl(210 80% 60%)', 'hsl(45 95% 60%)', 'hsl(0 75% 65%)']

  const infoItems = [
    { label: 'Gender', value: patient.genero_biologico === 'Masculino' ? 'Male' : patient.genero_biologico === 'Femenino' ? 'Female' : patient.genero_biologico },
    { label: 'Blood Type', value: bt ? patient.tipo_sangre : 'N/A' },
    { label: 'Allergies', value: patient.alergias || 'None' },
    { label: 'Diseases', value: disease },
    { label: 'Height', value: '1.78 m' },
    { label: 'Weight', value: '65 kg' },
    { label: 'Patient ID', value: patient.dni_pasaporte },
    { label: 'Last Visit', value: patient.creado_en ? format(parseISO(patient.creado_en), 'dd MMMM yyyy') : 'N/A' },
  ]

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Current Appointment
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Patient avatar card */}
          <div className="bg-gradient-hero rounded-[1.75rem] p-6 shadow-card text-white">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-white/30 blur-xl rounded-full" />
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/80 shadow-glow relative">
                  {initials}
                </div>
              </div>
              <h2 className="text-xl font-bold">{patient.nombre_completo}</h2>
              <p className="text-sm text-white/85 mb-4">Age: {age || '?'}</p>
              <button onClick={() => navigate(`/patients/${id}/consult`)}
                className="bg-med-accent hover:bg-med-accent/90 text-med-accent-foreground font-semibold px-8 py-2.5 rounded-full shadow-soft transition-smooth hover:scale-105"
                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                Update
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="med-section-card">
            <h3 className="text-base font-bold text-foreground mb-4">Information:</h3>
            <dl className="space-y-3">
              {infoItems.map((item) => (
                <div key={item.label} className="grid grid-cols-[110px_1fr] text-sm">
                  <dt className="text-muted-foreground font-medium">{item.label}:</dt>
                  <dd className="text-foreground font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Vitals cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Heart, label: 'Heart Rate', value: vitals.heartRate, unit: 'bpm', iconColor: 'hsl(0 75% 62%)', iconBg: 'hsl(0 75% 62% / 0.12)' },
              { icon: Thermometer, label: 'Body Temperature', value: vitals.temperature, unit: '°C', iconColor: 'hsl(35 90% 55%)', iconBg: 'hsl(35 90% 55% / 0.12)' },
              { icon: Droplets, label: 'Glucose', value: vitals.glucose, unit: 'mg/dl', iconColor: 'hsl(210 80% 60%)', iconBg: 'hsl(210 80% 60% / 0.12)' },
            ].map(v => (
              <div key={v.label} className="med-card p-5 flex items-center gap-4 hover:-translate-y-1 transition-smooth" style={{ borderRadius: '1.5rem' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: v.iconBg }}>
                  <v.icon className="w-6 h-6" style={{ color: v.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{v.label}</p>
                  <p className="text-xl font-bold text-foreground">
                    {v.value}
                    <span className="text-xs text-muted-foreground font-medium ml-1">{v.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Test Reports */}
          <div className="med-section-card">
            <h3 className="text-base font-bold text-foreground mb-4">Test Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testReports.slice(0, 3).map((r, i) => {
                const color = reportColors[i % reportColors.length]
                return (
                  <button key={r.id || i}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-smooth text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20` }}>
                      <FileText className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.nombre_prueba}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.fecha_prueba ? format(parseISO(r.fecha_prueba), 'dd MMMM yyyy') : 'N/A'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="med-section-card">
            <h3 className="text-base font-bold text-foreground mb-4">Prescriptions</h3>

            <button onClick={() => navigate(`/patients/${id}/consult`)}
              className="w-full border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-primary font-semibold transition-smooth mb-5">
              <Plus className="w-4 h-4" />
              Add a prescription
            </button>

            {medications.length > 0 ? (
              <div>
                <div className="grid grid-cols-[1fr_120px_100px] text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b border-med-border">
                  <span>Prescriptions</span>
                  <span>Date</span>
                  <span>Duration</span>
                </div>
                <ul className="divide-y divide-med-border">
                  {medications.map(m => (
                    <li key={m.id} className="grid grid-cols-[1fr_120px_100px] items-center py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: 'hsl(var(--accent) / 0.2)' }}>
                          <Link2 className="w-4 h-4" style={{ color: 'hsl(var(--accent-foreground))' }} />
                        </div>
                        <span className="font-semibold text-foreground">{m.nombre_medicamento}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {m.fecha_inicio ? format(parseISO(m.fecha_inicio), 'dd MMM yyyy') : 'N/A'}
                      </span>
                      <span className="text-foreground font-medium">{m.dosis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No prescriptions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
