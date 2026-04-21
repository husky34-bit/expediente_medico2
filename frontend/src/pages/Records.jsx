import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Activity, AlertCircle, Heart, ChevronRight, FileText } from 'lucide-react'
import apiClient from '../api/client'
import { getInitials, getPatientVitals, getPatientStatus } from '../utils/mockData'
import { format, parseISO } from 'date-fns'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'allergy', label: 'Allergy' },
  { id: 'vitals', label: 'Vitals' },
]

const typeConfig = {
  DIAGNOSIS: { bg: 'bg-primary/10', fg: 'text-primary-deep', icon: Activity },
  ALLERGY: { bg: 'bg-destructive/15', fg: 'text-destructive', icon: AlertCircle },
  VITALS: { bg: 'bg-amber-400/20', fg: 'text-amber-700', icon: Heart },
}

export default function Records() {
  const [patients, setPatients] = useState([])
  const [records, setRecords] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const pRes = await apiClient.get('/api/pacientes', { params: { limit: 100 } })
        const pats = pRes.data.pacientes || []
        setPatients(pats)

        // Build records from each patient
        const allRecords = []
        for (const p of pats) {
          try {
            const detail = await apiClient.get(`/api/pacientes/${p.id}`)
            const consultas = detail.data.consultas || []
            const medicamentos = detail.data.medicamentos || []
            const labs = detail.data.laboratorios || []

            // Diagnosis records from consultations
            consultas.forEach(c => {
              allRecords.push({
                id: `diag-${c.id}`, type: 'DIAGNOSIS',
                title: c.diagnostico_cie10 || c.motivo_consulta,
                description: `Ongoing condition · ${c.tratamiento || ''}`.trim(),
                date: c.fecha_consulta,
                patient: p,
              })
            })

            // Allergy records
            if (p.alergias) {
              p.alergias.split(',').forEach((a, i) => {
                allRecords.push({
                  id: `allergy-${p.id}-${i}`, type: 'ALLERGY',
                  title: a.trim(),
                  description: `Known allergies for ${p.nombre_completo}`,
                  date: p.creado_en || new Date().toISOString(),
                  patient: p,
                })
              })
            }

            // Vitals records
            const vitals = getPatientVitals(p.id)
            allRecords.push({
              id: `vitals-${p.id}`, type: 'VITALS',
              title: `HR ${vitals.heartRate} bpm · ${vitals.temperature}°C · ${vitals.glucose} mg/dL`,
              description: `Latest vitals reading · ${p.tipo_sangre || 'N/A'}`,
              date: p.creado_en || new Date().toISOString(),
              patient: p,
            })
          } catch (e) {
            console.error(e)
          }
        }
        setRecords(allRecords)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = records.filter(r => {
    if (activeTab !== 'all' && r.type.toLowerCase() !== activeTab) return false
    if (search) {
      const q = search.toLowerCase()
      return r.title.toLowerCase().includes(q) ||
        r.patient.nombre_completo.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {records.length} record{records.length !== 1 && 's'} across {patients.length} patient{patients.length !== 1 && 's'}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search records..."
            className="pl-9 pr-4 h-10 rounded-full bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64" />
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center bg-secondary p-1 rounded-full shadow-soft mb-5">
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-8 px-4 rounded-full text-xs font-semibold transition-smooth ${
              activeTab === tab.id
                ? 'bg-card text-primary-deep shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Records grid */}
      {loading ? (
        <div className="med-section-card text-center py-16 text-sm text-muted-foreground">Loading records...</div>
      ) : filtered.length === 0 ? (
        <div className="med-section-card text-center py-16">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No records match your search.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => {
            const config = typeConfig[r.type]
            const Icon = config.icon
            const dateStr = r.date ? format(parseISO(r.date), 'dd MMM yyyy') : ''

            return (
              <li key={r.id}>
                <div
                  onClick={() => navigate(`/patients/${r.patient.id}`)}
                  className="group med-card p-5 cursor-pointer hover:-translate-y-0.5 hover:shadow-glow transition-smooth flex items-start gap-4"
                  style={{ borderRadius: '1rem' }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.fg}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-foreground">
                        {r.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{dateStr}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-[9px] font-bold">
                        {getInitials(r.patient.nombre_completo)}
                      </div>
                      <span className="text-xs font-medium text-foreground">{r.patient.nombre_completo}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-smooth" />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
