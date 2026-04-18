import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import apiClient from '../api/client'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function NewPatient() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'female',
    blood_type: '',
    national_id: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.blood_type) delete payload.blood_type
      if (!payload.national_id) delete payload.national_id
      const res = await apiClient.post('/api/patients', payload)
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-sm bg-alert-red/10 border border-alert-red/30 text-alert-red text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Personal data */}
        <div className="glass-card p-6 fade-up-2">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nombre completo *">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  className="input-field"
                  placeholder="Ana Sofía Reyes Vargas"
                  required
                />
              </Field>
            </div>

            <Field label="Fecha de nacimiento *">
              <input
                type="date"
                value={form.date_of_birth}
                onChange={e => set('date_of_birth', e.target.value)}
                className="input-field"
                required
              />
            </Field>

            <Field label="Género *">
              <select
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
                className="input-field"
                required
              >
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="other">Otro</option>
              </select>
            </Field>

            <Field label="Tipo de sangre">
              <select
                value={form.blood_type}
                onChange={e => set('blood_type', e.target.value)}
                className="input-field"
              >
                <option value="">-- Seleccionar --</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </Field>

            <Field label="Cédula de identidad">
              <input
                type="text"
                value={form.national_id}
                onChange={e => set('national_id', e.target.value)}
                className="input-field"
                placeholder="12345678"
              />
            </Field>

            <Field label="Teléfono">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="input-field"
                placeholder="+591 7xxxxxxx"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Dirección">
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  className="input-field"
                  placeholder="Av. Ejemplo 123, Cochabamba"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="glass-card p-6 fade-up-3">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-4">Contacto de Emergencia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre">
              <input
                type="text"
                value={form.emergency_contact_name}
                onChange={e => set('emergency_contact_name', e.target.value)}
                className="input-field"
                placeholder="Nombre del familiar"
              />
            </Field>
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.emergency_contact_phone}
                onChange={e => set('emergency_contact_phone', e.target.value)}
                className="input-field"
                placeholder="+591 7xxxxxxx"
              />
            </Field>
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
