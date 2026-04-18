import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, User, Droplets, Calendar, Phone, QrCode, Loader2 } from 'lucide-react'
import apiClient from '../api/client'
import { format, parseISO, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'

const bloodTypeColor = {
  'O+': 'bg-alert-red/20 text-alert-red border-alert-red/40',
  'O-': 'bg-alert-red/20 text-alert-red border-alert-red/40',
  'A+': 'bg-accent-blue/20 text-accent-blue border-accent-blue/40',
  'A-': 'bg-accent-blue/20 text-accent-blue border-accent-blue/40',
  'B+': 'bg-alert-amber/20 text-alert-amber border-alert-amber/40',
  'B-': 'bg-alert-amber/20 text-alert-amber border-alert-amber/40',
  'AB+': 'bg-accent-teal/20 text-accent-teal border-accent-teal/40',
  'AB-': 'bg-accent-teal/20 text-accent-teal border-accent-teal/40',
}

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/patients', {
        params: { search: search || undefined, page, limit: 12 },
      })
      setPatients(res.data.patients)
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

  const totalPages = Math.ceil(total / 12)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 fade-up-1">
        <div>
          <h1 className="font-display text-2xl text-text-primary mb-1">Panel de Pacientes</h1>
          <p className="text-text-secondary text-sm">
            {total} {total === 1 ? 'paciente registrado' : 'pacientes registrados'}
          </p>
        </div>
        <button
          onClick={() => navigate('/patients/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 fade-up-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre o cédula..."
          className="input-field pl-10 max-w-md"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-accent-teal animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-24 fade-up-3">
          <User className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No se encontraron pacientes</p>
          <button onClick={() => navigate('/patients/new')} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p, i) => {
            const age = p.date_of_birth
              ? differenceInYears(new Date(), parseISO(p.date_of_birth))
              : null
            const btColor = bloodTypeColor[p.blood_type] || 'bg-bg-card text-text-muted border-bg-border'

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="glass-card p-5 cursor-pointer hover:border-accent-teal/40 hover:shadow-teal transition-all duration-300 group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Avatar + name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-teal/20 to-accent-blue/20 border border-accent-teal/30 flex items-center justify-center text-lg font-bold text-accent-teal flex-shrink-0 group-hover:shadow-teal transition-all">
                    {p.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary font-semibold truncate group-hover:text-accent-teal transition-colors">
                      {p.full_name}
                    </p>
                    <p className="text-text-muted text-xs font-mono">{p.national_id || 'Sin CI'}</p>
                  </div>
                </div>

                {/* Info chips */}
                <div className="flex flex-wrap gap-2">
                  {p.blood_type && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${btColor}`}>
                      <Droplets className="w-3 h-3" />
                      {p.blood_type}
                    </span>
                  )}
                  {age !== null && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-bg-secondary border border-bg-border text-text-secondary">
                      <Calendar className="w-3 h-3" />
                      {age} años
                    </span>
                  )}
                  {p.phone && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-bg-secondary border border-bg-border text-text-secondary font-mono">
                      <Phone className="w-3 h-3" />
                      {p.phone}
                    </span>
                  )}
                </div>

                {/* QR indicator */}
                <div className="mt-3 pt-3 border-t border-bg-border flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Registrado {p.created_at ? format(parseISO(p.created_at), "d MMM yyyy", { locale: es }) : ''}
                  </span>
                  <QrCode className="w-4 h-4 text-accent-teal/60 group-hover:text-accent-teal transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-text-secondary text-sm font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
