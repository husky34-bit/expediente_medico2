import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, LayoutGrid, List, Loader2, ChevronRight, UserPlus } from 'lucide-react'
import apiClient from '../api/client'
import { differenceInYears, parseISO, format } from 'date-fns'
import { getPatientStatus, getPatientDisease, getInitials, getBloodTypeLabel } from '../utils/mockData'
import StatusBadge from '../components/StatusBadge'

const MaleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`} aria-hidden="true">
    <circle cx="12" cy="4" r="2.5" />
    <path d="M14 7.5H10c-1.1 0-2 .9-2 2v6h2v6.5h4v-6.5h2v-6c0-1.1-.9-2-2-2z" />
  </svg>
)

const FemaleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`} aria-hidden="true">
    <circle cx="12" cy="4" r="2.5" />
    <path d="M15.39 8.5l-1.39-2h-4L8.61 8.5 5 16h3.5v6.5h7V16H19l-3.61-7.5z" />
  </svg>
)

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('cards')
  const navigate = useNavigate()

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/pacientes', {
        params: { search: search || undefined, page, limit: 12 },
      })
      setPatients(res.data.pacientes)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300)
    return () => clearTimeout(timer)
  }, [fetchPatients])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estudiantes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} estudiante{total !== 1 && 's'} registrado{total !== 1 && 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar estudiante..."
              className="pl-9 pr-4 h-10 rounded-full bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-56"
            />
          </div>
          {/* Add patient */}
          <button onClick={() => navigate('/patients/new')}
            className="rounded-full h-10 gap-2 px-5 flex items-center bg-primary text-white hover:bg-primary/90 shadow-soft font-semibold text-sm transition-smooth">
            <UserPlus className="w-4 h-4" />
            Añadir estudiante
          </button>

          {/* View toggle */}
          <div role="group" aria-label="Modo de vista"
            className="inline-flex items-center bg-secondary p-1 rounded-full shadow-soft">
            <button type="button" onClick={() => setViewMode('cards')}
              aria-pressed={viewMode === 'cards'} aria-label="Vista de tarjetas"
              className={`h-8 px-3 rounded-full flex items-center gap-2 text-xs font-semibold transition-smooth ${
                viewMode === 'cards'
                  ? 'bg-card text-primary-deep shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              <LayoutGrid className="w-4 h-4" /> Tarjetas
            </button>
            <button type="button" onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'} aria-label="Vista de lista"
              className={`h-8 px-3 rounded-full flex items-center gap-2 text-xs font-semibold transition-smooth ${
                viewMode === 'list'
                  ? 'bg-card text-primary-deep shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              <List className="w-4 h-4" /> Lista
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="med-section-card text-center py-16">
          <p className="text-sm text-muted-foreground mb-4">No se encontraron estudiantes</p>
          <button onClick={() => navigate('/patients/new')}
            className="rounded-full h-10 gap-2 px-5 inline-flex items-center bg-primary text-white hover:bg-primary/90 shadow-soft font-semibold text-sm transition-smooth">
            <Plus className="w-4 h-4" /> Registrar primer estudiante
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {patients.map((p) => {
            const age = p.fecha_nacimiento ? differenceInYears(new Date(), parseISO(p.fecha_nacimiento)) : null
            const status = getPatientStatus(p.id)
            const disease = getPatientDisease(p)
            const bt = getBloodTypeLabel(p.tipo_sangre)
            const initials = getInitials(p.nombre_completo)

            return (
              <div key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="group med-card p-5 cursor-pointer hover:-translate-y-1 hover:shadow-glow transition-smooth flex flex-col">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-lg relative border-2 border-card">
                      {initials}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground truncate">{p.nombre_completo}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                      {p.genero_biologico === 'Masculino' ? (
                        <MaleIcon className="text-blue-500 w-3.5 h-3.5" />
                      ) : p.genero_biologico === 'Femenino' ? (
                        <FemaleIcon className="text-pink-500 w-3.5 h-3.5" />
                      ) : null}
                      <span>{p.genero_biologico} · Edad {age || '?'}</span>
                    </div>
                    <div className="mt-2">
                      <StatusBadge status={status} />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Tipo de Sangre</dt>
                    <dd className="font-semibold text-foreground">{bt ? `${bt.type} ${bt.sign}` : 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Enfermedad Base</dt>
                    <dd className="font-semibold text-foreground truncate">{disease}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">N° Matrícula</dt>
                    <dd className="font-semibold text-foreground">{p.dni_pasaporte}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Última Visita</dt>
                    <dd className="font-semibold text-foreground">
                      {p.creado_en ? format(parseISO(p.creado_en), 'dd MMM yyyy') : 'N/A'}
                    </dd>
                  </div>
                </dl>

                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary-deep group-hover:gap-2 transition-smooth">
                  Ver perfil <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="med-card shadow-card overflow-hidden animate-fade-in">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_40px] px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-med-border">
            <span>Estudiante</span>
            <span>Género</span>
            <span>T. Sangre</span>
            <span>Última Visita</span>
            <span>Estado</span>
            <span />
          </div>
          <ul className="divide-y divide-med-border">
            {patients.map(p => {
              const age = p.fecha_nacimiento ? differenceInYears(new Date(), parseISO(p.fecha_nacimiento)) : null
              const status = getPatientStatus(p.id)
              const bt = getBloodTypeLabel(p.tipo_sangre)
              const initials = getInitials(p.nombre_completo)

              return (
                <li key={p.id}>
                  <div
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_40px] items-center px-6 py-4 text-sm hover:bg-secondary transition-smooth cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{p.nombre_completo}</p>
                        <p className="text-xs text-muted-foreground">Edad {age || '?'}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-foreground">
                      {p.genero_biologico === 'Masculino' ? (
                        <MaleIcon className="text-blue-500 w-4 h-4" />
                      ) : p.genero_biologico === 'Femenino' ? (
                        <FemaleIcon className="text-pink-500 w-4 h-4" />
                      ) : null}
                      {p.genero_biologico}
                    </span>
                    <span className="text-foreground font-medium">
                      {bt ? `${bt.type} ${bt.sign}` : 'N/A'}
                    </span>
                    <span className="text-muted-foreground">
                      {p.creado_en ? format(parseISO(p.creado_en), 'dd MMM yyyy') : 'N/A'}
                    </span>
                    <span>
                      <StatusBadge status={status} />
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground justify-self-end" />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
