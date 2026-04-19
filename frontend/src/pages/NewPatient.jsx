import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import apiClient from '../api/client'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function NewPatient() {
  const navigate = useNavigate()
  const formEl = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getFormData = () => {
    const form = formEl.current
    return {
      nombre_completo: form.nombre_completo?.value || '',
      fecha_nacimiento: form.fecha_nacimiento?.value || '',
      genero_biologico: form.genero_biologico?.value || '',
      tipo_sangre: form.tipo_sangre?.value || '',
      dni_pasaporte: form.dni_pasaporte?.value || '',
      alergias: form.alergias?.value || '',
      contacto_emergencia_nombre: form.contacto_emergencia_nombre?.value || '',
      contacto_emergencia_tel: form.contacto_emergencia_tel?.value || '',
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = getFormData()
      if (!payload.tipo_sangre) delete payload.tipo_sangre
      if (!payload.dni_pasaporte) delete payload.dni_pasaporte
      const res = await apiClient.post('/api/pacientes', payload)
      navigate(`/patients/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el paciente')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-text-secondary hover:text-accent-teal text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="fade-up-1 mb-6">
        <h1 className="font-display text-2xl text-text-primary mb-1 flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-accent-teal" />
          Registrar Nuevo Paciente
        </h1>
        <p className="text-text-secondary text-sm">Complete los datos básicos del paciente</p>
      </div>

      <form ref={formEl} onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-sm bg-alert-red/10 border border-alert-red/30 text-alert-red text-sm">
            ⚠ {error}
          </div>
        )}

        <div className="glass-card p-6 fade-up-2">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nombre completo *">
                <input
                  type="text"
                  name="nombre_completo"
                  className="input-field"
                  placeholder="Ana Sofía Reyes Vargas"
                  required
                  autoComplete="off"
                />
              </Field>
            </div>

            <Field label="Fecha de nacimiento *">
              <input
                type="date"
                name="fecha_nacimiento"
                className="input-field"
                required
              />
            </Field>

            <Field label="Género biológico *">
              <select
                name="genero_biologico"
                className="input-field"
                required
                defaultValue="Femenino"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </Field>

            <Field label="Tipo de Sangre">
              <select
                name="tipo_sangre"
                className="input-field"
                defaultValue=""
              >
                <option value="">Desconocido</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </Field>

            <Field label="Cédula de Identidad / Pasaporte *">
              <input
                type="text"
                name="dni_pasaporte"
                className="input-field"
                placeholder="7654321"
                required
                autoComplete="off"
              />
            </Field>
          </div>
        </div>

        <div className="glass-card p-6 fade-up-3">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-4">Contacto de Emergencia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre del contacto">
              <input
                type="text"
                name="contacto_emergencia_nombre"
                className="input-field"
                placeholder="Nombre completo"
                autoComplete="off"
              />
            </Field>

            <Field label="Teléfono de emergencia">
              <input
                type="tel"
                name="contacto_emergencia_tel"
                className="input-field"
                placeholder="+591 70000000"
                autoComplete="off"
              />
            </Field>
            
            <div className="sm:col-span-2">
              <Field label="Alergias">
                <textarea
                  name="alergias"
                  className="input-field min-h-[80px]"
                  placeholder="Ej: Penicilina, Nueces, etc."
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex gap-3 fade-up-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Registrando...' : 'Registrar Paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}