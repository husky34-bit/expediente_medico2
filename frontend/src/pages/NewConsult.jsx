import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Stethoscope, Plus, Trash2, Loader2, ClipboardList, Pill } from 'lucide-react'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function NewConsult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formEl = useRef(null)
  const medsRef = useRef([])

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    apiClient.get(`/api/pacientes/${id}`)
      .then(r => setPatient(r.data.paciente))
      .catch(console.error)
  }, [id])

  const getFormData = () => {
    const form = formEl.current
    return {
      paciente_id: id,
      medico_id: user?.id || '',
      centro_id: 1,
      motivo_consulta: form.motivo_consulta?.value || '',
      diagnostico_cie10: form.diagnostico_cie10?.value || '',
      tratamiento: form.tratamiento?.value || '',
      notas_privadas: form.notas_privadas?.value || '',
    }
  }

  const getMedications = () => {
    return medsRef.current.filter(med => med.nombre?.value?.trim())
      .map(med => ({
        paciente_id: id,
        prescrito_por: user?.id,
        nombre_medicamento: med.nombre?.value || '',
        dosis: med.dosis?.value || '',
        frecuencia: med.frecuencia?.value || '',
        fecha_inicio: today,
        esta_activo: true,
      }))
  }

  const addMed = () => {
    const container = document.getElementById('medications-container')
    const div = document.createElement('div')
    div.className = 'p-4 rounded-xl bg-bg-secondary border border-bg-border relative group'
    div.innerHTML = `
      <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 p-1.5 text-text-muted hover:text-alert-red transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-1">
          <label class="text-[10px] font-bold text-text-muted uppercase mb-1 block">Medicamento</label>
          <input type="text" name="nombre_medicamento" class="input-field py-1.5 text-sm" placeholder="Ej: Amoxicilina" />
        </div>
        <div>
          <label class="text-[10px] font-bold text-text-muted uppercase mb-1 block">Dosis</label>
          <input type="text" name="dosis" class="input-field py-1.5 text-sm" placeholder="Ej: 500mg" />
        </div>
        <div>
          <label class="text-[10px] font-bold text-text-muted uppercase mb-1 block">Frecuencia</label>
          <input type="text" name="frecuencia" class="input-field py-1.5 text-sm" placeholder="Ej: Cada 8h" />
        </div>
      </div>
    `
    container.appendChild(div)
    const inputs = div.querySelectorAll('input')
    medsRef.current.push({
      nombre: inputs[0],
      dosis: inputs[1],
      frecuencia: inputs[2],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/api/consultas', getFormData())

      const medications = getMedications()
      for (const med of medications) {
        await apiClient.post('/api/medicamentos', med)
      }

      navigate(`/patients/${id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar la consulta')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )

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
          <p className="text-text-secondary text-sm">Paciente: <span className="text-accent-teal font-medium">{patient.nombre_completo}</span></p>
        </div>
      )}

      <form ref={formEl} onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-alert-red/10 border border-alert-red/30 text-alert-red text-sm">⚠ {error}</div>
        )}

        <div className="glass-card p-6 fade-up-2">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Datos de la Consulta
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Motivo de Consulta *">
              <input
                type="text"
                name="motivo_consulta"
                className="input-field"
                placeholder="Ej: Dolor abdominal, Control rutinario"
                required
                autoComplete="off"
              />
            </Field>
            <Field label="Diagnóstico (CIE-10) *">
              <input
                type="text"
                name="diagnostico_cie10"
                className="input-field"
                placeholder="Ej: K29.5, Z00.0"
                required
                autoComplete="off"
              />
            </Field>
          </div>

          <div className="space-y-4">
            <Field label="Tratamiento / Plan">
              <textarea
                name="tratamiento"
                className="input-field min-h-[100px] resize-none"
                placeholder="Prescripciones, recomendaciones, etc."
              />
            </Field>
            <Field label="Notas Privadas">
              <textarea
                name="notas_privadas"
                className="input-field min-h-[80px] resize-none"
                placeholder="Observaciones adicionales (no visibles en perfil público)"
              />
            </Field>
          </div>
        </div>

        <div className="glass-card p-6 fade-up-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-secondary text-xs uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4" /> Medicación Recetada
            </h2>
            <button
              type="button"
              onClick={addMed}
              className="text-accent-teal hover:bg-accent-teal/10 px-2 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> AGREGAR
            </button>
          </div>

          <div id="medications-container">
            <p className="text-text-muted text-xs italic text-center py-4 border border-dashed border-bg-border rounded-lg">
              No se han agregado medicamentos a esta consulta
            </p>
          </div>
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