import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Stethoscope, Plus, Trash2, Loader2 } from 'lucide-react'
import apiClient from '../api/client'

export default function NewConsult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const [consult, setConsult] = useState({
    patient_id: id,
    date: today,
    institution: '',
    chief_complaint: '',
    diagnosis: '',
    diagnosis_code: '',
    notes: '',
  })

  const [medications, setMedications] = useState([])
  const [allergies, setAllergies] = useState([])

  useEffect(() => {
    apiClient.get(`/api/patients/${id}`)
      .then(r => setPatient(r.data.patient))
      .catch(console.error)
  }, [id])

  const setC = (k, v) => setConsult(f => ({ ...f, [k]: v }))

  const addMed = () => setMedications(m => [...m, {
    patient_id: id,
    name: '', dose: '', frequency: '',
    start_date: today, end_date: '',
    is_active: true, notes: '',
  }])

  const updateMed = (i, k, v) => setMedications(m => m.map((med, idx) => idx === i ? { ...med, [k]: v } : med))
  const removeMed = (i) => setMedications(m => m.filter((_, idx) => idx !== i))

  const addAllergy = () => setAllergies(a => [...a, {
    patient_id: id,
    allergen: '', reaction_type: '',
    severity: 'mild', confirmed_date: today, notes: '',
  }])

  const updateAllergy = (i, k, v) => setAllergies(a => a.map((al, idx) => idx === i ? { ...al, [k]: v } : al))
  const removeAllergy = (i) => setAllergies(a => a.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/api/consultations', consult)

      for (const med of medications) {
        if (med.name) {
          const payload = { ...med }
          if (!payload.end_date) delete payload.end_date
          await apiClient.post('/api/medications', payload)
        }
      }

      for (const al of allergies) {
        if (al.allergen) {
          const payload = { ...al }
          if (!payload.confirmed_date) delete payload.confirmed_date
          await apiClient.post('/api/allergies', payload)
        }
      }

      navigate(`/patients/${id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar la consulta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`/patients/${id}`)}
        className="flex items-center gap-2 text-text-secondary hover:text-accent-teal text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al expediente
      </button>

      {patient && (
        <div className="fade-up-1 mb-6">
          <h1 className="font-display text-2xl text-text-primary mb-1 flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-accent-teal" />
            Nueva Consulta
          </h1>
          <p className="text-text-secondary text-sm">Paciente: <span className="text-accent-teal">{patient.full_name}</span></p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-sm bg-alert-red/10 border border-alert-red/30 text-alert-red text-sm">⚠ {error}</div>
        )}

        {/* Consultation data */}
        <div className="glass-card p-6 fade-up-2">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-4">Datos de la Consulta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha *</label>
              <input type="date" value={consult.date} onChange={e => setC('date', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label">Institución</label>
              <input type="text" value={consult.institution} onChange={e => setC('institution', e.target.value)} className="input-field" placeholder="Hospital / Clínica" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Motivo de consulta *</label>
              <input type="text" value={consult.chief_complaint} onChange={e => setC('chief_complaint', e.target.value)} className="input-field" placeholder="Ej: Dolor de cabeza intenso" required />
            </div>
            <div>
              <label className="label">Diagnóstico *</label>
              <input type="text" value={consult.diagnosis} onChange={e => setC('diagnosis', e.target.value)} className="input-field" placeholder="Diagnóstico principal" required />
            </div>
            <div>
              <label className="label">Código CIE-10</label>
              <input type="text" value={consult.diagnosis_code} onChange={e => setC('diagnosis_code', e.target.value)} className="input-field font-mono" placeholder="Ej: J06.9" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notas clínicas</label>
              <textarea
                value={consult.notes}
                onChange={e => setC('notes', e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Observaciones, evolución, indicaciones..."
              />
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="glass-card p-6 fade-up-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-secondary text-xs uppercase tracking-wider">Medicamentos Prescritos</h2>
            <button type="button" onClick={addMed} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
          {medications.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">No se agregaron medicamentos</p>
          ) : (
            <div className="space-y-4">
              {medications.map((med, i) => (
                <div key={i} className="p-4 rounded-sm bg-bg-secondary border border-bg-border relative">
                  <button
                    type="button"
                    onClick={() => removeMed(i)}
                    className="absolute top-3 right-3 text-text-muted hover:text-alert-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-6">
                    <div className="sm:col-span-2">
                      <label className="label text-xs">Nombre *</label>
                      <input type="text" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} className="input-field text-sm" placeholder="Nombre del medicamento" />
                    </div>
                    <div>
                      <label className="label text-xs">Dosis *</label>
                      <input type="text" value={med.dose} onChange={e => updateMed(i, 'dose', e.target.value)} className="input-field text-sm" placeholder="500mg" />
                    </div>
                    <div>
                      <label className="label text-xs">Frecuencia *</label>
                      <input type="text" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} className="input-field text-sm" placeholder="Cada 8 horas" />
                    </div>
                    <div>
                      <label className="label text-xs">Inicio</label>
                      <input type="date" value={med.start_date} onChange={e => updateMed(i, 'start_date', e.target.value)} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="label text-xs">Fin (opcional)</label>
                      <input type="date" value={med.end_date} onChange={e => updateMed(i, 'end_date', e.target.value)} className="input-field text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="glass-card p-6 fade-up-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-secondary text-xs uppercase tracking-wider">Alergias Detectadas</h2>
            <button type="button" onClick={addAllergy} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
          {allergies.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">No se registraron alergias</p>
          ) : (
            <div className="space-y-4">
              {allergies.map((al, i) => (
                <div key={i} className="p-4 rounded-sm bg-bg-secondary border border-bg-border relative">
                  <button
                    type="button"
                    onClick={() => removeAllergy(i)}
                    className="absolute top-3 right-3 text-text-muted hover:text-alert-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <div>
                      <label className="label text-xs">Alérgeno *</label>
                      <input type="text" value={al.allergen} onChange={e => updateAllergy(i, 'allergen', e.target.value)} className="input-field text-sm" placeholder="Penicilina, mariscos..." />
                    </div>
                    <div>
                      <label className="label text-xs">Severidad</label>
                      <select value={al.severity} onChange={e => updateAllergy(i, 'severity', e.target.value)} className="input-field text-sm">
                        <option value="mild">Leve</option>
                        <option value="moderate">Moderada</option>
                        <option value="severe">Severa</option>
                        <option value="anaphylactic">Anafiláctica</option>
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Tipo de reacción</label>
                      <input type="text" value={al.reaction_type} onChange={e => updateAllergy(i, 'reaction_type', e.target.value)} className="input-field text-sm" placeholder="Urticaria, angioedema..." />
                    </div>
                    <div>
                      <label className="label text-xs">Fecha confirmación</label>
                      <input type="date" value={al.confirmed_date} onChange={e => updateAllergy(i, 'confirmed_date', e.target.value)} className="input-field text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 fade-up-5">
          <button type="button" onClick={() => navigate(`/patients/${id}`)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
            {loading ? 'Guardando...' : 'Guardar Consulta'}
          </button>
        </div>
      </form>
    </div>
  )
}
