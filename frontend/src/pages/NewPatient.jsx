import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Loader2, User, Phone, BookOpen, Heart, AlertTriangle } from 'lucide-react'
import apiClient from '../api/client'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const CARRERAS = [
  'Medicina','Enfermería','Odontología','Farmacia','Bioquímica','Nutrición',
  'Fisioterapia','Psicología','Trabajo Social','Derecho','Economía',
  'Administración de Empresas','Contaduría Pública','Ingeniería Civil',
  'Ingeniería Electrónica','Ingeniería Industrial','Ingeniería de Sistemas',
  'Arquitectura','Agronomía','Veterinaria','Educación','Comunicación Social','Otra'
]

const inp = `w-full bg-background border border-med-border rounded-lg px-2.5 py-1.5
  text-foreground placeholder:text-foreground/30 text-sm
  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
  transition-all duration-150`

const Field = ({ label, required, span, children }) => (
  <div className={span ? `col-span-${span}` : ''}>
    <label className="block text-[11px] font-medium text-foreground/50 mb-1">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

const Section = ({ icon: Icon, title, color, children, cols = 3 }) => (
  <div className="bg-card border border-med-border rounded-xl overflow-hidden shadow-card">
    <div className={`flex items-center gap-2 px-4 py-2 ${color}`}>
      <Icon className="w-3.5 h-3.5 text-white" />
      <span className="text-white text-xs font-semibold uppercase tracking-wider">{title}</span>
    </div>
    <div className={`p-4 grid grid-cols-${cols} gap-3`}>
      {children}
    </div>
  </div>
)

export default function NewPatient() {
  const navigate = useNavigate()
  const formEl = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const f = formEl.current
    try {
      const payload = {
        dni_pasaporte: f.ci?.value || '',
        nombre_completo: [f.nombres?.value, f.apellido_paterno?.value, f.apellido_materno?.value].filter(Boolean).join(' '),
        fecha_nacimiento: f.fecha_nacimiento?.value || '',
        genero_biologico: f.genero_biologico?.value || '',
        direccion: f.direccion?.value || '',
        telefono: f.telefono?.value || '',
        email: f.email?.value || '',
        carrera: f.carrera?.value || '',
        matricula: f.matricula?.value || '',
        semestre: f.semestre?.value || '',
        tipo_sangre: f.tipo_sangre?.value || '',
        alergias: f.alergias?.value || '',
        enfermedades_cronicas: f.enfermedades_cronicas?.value || '',
        medicamentos_actuales: f.medicamentos_actuales?.value || '',
        cirugias_previas: f.cirugias_previas?.value || '',
        contacto_emergencia_nombre: f.contacto_emergencia_nombre?.value || '',
        contacto_emergencia_tel: f.contacto_emergencia_tel?.value || '',
        contacto_emergencia_relacion: f.contacto_emergencia_relacion?.value || '',
      }
      Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k] })
      const res = await apiClient.post('/api/pacientes', payload)
      navigate(`/patients/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar al estudiante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-8">
      <button onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-foreground/50 hover:text-primary text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="mb-4 fade-up-1">
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Registrar Nuevo Estudiante
        </h1>
        <p className="text-foreground/40 text-xs mt-0.5">Complete la información del estudiante</p>
      </div>

      <form ref={formEl} onSubmit={handleSubmit} className="space-y-3 fade-up-2">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{error}
          </div>
        )}

        {/* Datos Personales */}
        <Section icon={User} title="Datos Personales" color="bg-blue-600">
          <Field label="CI" required>
            <input name="ci" type="text" className={inp} placeholder="Ej: 7654321" required autoComplete="off" />
          </Field>
          <Field label="Nombre(s)" required>
            <input name="nombres" type="text" className={inp} placeholder="Ana Sofía" required autoComplete="off" />
          </Field>
          <Field label="Apellido Paterno" required>
            <input name="apellido_paterno" type="text" className={inp} placeholder="Reyes" required autoComplete="off" />
          </Field>
          <Field label="Apellido Materno">
            <input name="apellido_materno" type="text" className={inp} placeholder="Vargas" autoComplete="off" />
          </Field>
          <Field label="Fecha de Nacimiento" required>
            <input name="fecha_nacimiento" type="date" className={inp} required />
          </Field>
          <Field label="Sexo" required>
            <select name="genero_biologico" className={inp} defaultValue="" required>
              <option value="" disabled>Seleccione...</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </Field>
        </Section>

        {/* Datos de Contacto */}
        <Section icon={Phone} title="Datos de Contacto" color="bg-teal-600">
          <Field label="Dirección" span={1}>
            <input name="direccion" type="text" className={inp} placeholder="Ej: Av. Cristo Redentor #123" autoComplete="off" />
          </Field>
          <Field label="Teléfono">
            <input name="telefono" type="tel" className={inp} placeholder="Ej: 77123456" autoComplete="off" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={inp} placeholder="ejemplo@correo.com" autoComplete="off" />
          </Field>
        </Section>

        {/* Información Académica */}
        <Section icon={BookOpen} title="Información Académica" color="bg-green-700">
          <Field label="Carrera" required>
            <select name="carrera" className={inp} defaultValue="" required>
              <option value="" disabled>Seleccione carrera...</option>
              {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Número de Matrícula" required>
            <input name="matricula" type="text" className={inp} placeholder="Ej: 218123456" required autoComplete="off" />
          </Field>
          <Field label="Semestre">
            <input name="semestre" type="number" className={inp} placeholder="Ej: 5" min="1" max="12" />
          </Field>
        </Section>

        {/* Información Médica */}
        <Section icon={Heart} title="Información Médica" color="bg-red-600" cols={2}>
          <Field label="Grupo Sanguíneo">
            <select name="tipo_sangre" className={inp} defaultValue="">
              <option value="">Seleccione...</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </Field>
          <Field label="Alergias">
            <textarea name="alergias" className={`${inp} h-9 resize-none`} placeholder="Ej: Penicilina, mariscos, polen..." />
          </Field>
          <Field label="Enfermedades Crónicas">
            <textarea name="enfermedades_cronicas" className={`${inp} h-9 resize-none`} placeholder="Ej: Diabetes, hipertensión, asma..." />
          </Field>
          <Field label="Medicamentos que Toma Actualmente">
            <textarea name="medicamentos_actuales" className={`${inp} h-9 resize-none`} placeholder="Liste medicamentos que toma regularmente..." />
          </Field>
          <Field label="Cirugías Previas" span={2}>
            <textarea name="cirugias_previas" className={`${inp} h-9 resize-none`} placeholder="Describa cirugías anteriores si las hubo..." />
          </Field>
        </Section>

        {/* Contacto de Emergencia */}
        <Section icon={AlertTriangle} title="Contacto de Emergencia" color="bg-amber-600">
          <Field label="Nombre Completo">
            <input name="contacto_emergencia_nombre" type="text" className={inp} placeholder="Ej: María López" autoComplete="off" />
          </Field>
          <Field label="Teléfono">
            <input name="contacto_emergencia_tel" type="tel" className={inp} placeholder="Ej: 77123456" autoComplete="off" />
          </Field>
          <Field label="Relación">
            <input name="contacto_emergencia_relacion" type="text" className={inp} placeholder="Ej: Madre" autoComplete="off" />
          </Field>
        </Section>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Registrando...' : 'Guardar Estudiante'}
          </button>
        </div>
        <p className="text-center text-[11px] text-foreground/30">Los campos marcados con * son obligatorios</p>
      </form>
    </div>
  )
}