import { useState, useEffect } from 'react'
import { Activity, Filter, Inbox, CheckCircle2, Clock, FileText } from 'lucide-react'
import apiClient from '../api/client'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Consultas() {
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('todas')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [pacientesMap, setPacientesMap] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [consRes, pacRes] = await Promise.all([
          apiClient.get('/api/consultas/all'),
          apiClient.get('/api/pacientes')
        ])
        
        setConsultas(consRes.data)
        
        const map = {}
        if (pacRes.data && pacRes.data.pacientes) {
          pacRes.data.pacientes.forEach(p => { map[p.id] = p.nombre_completo })
        }
        setPacientesMap(map)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleFilter = () => {
    // Simple frontend filtering could be applied here
  }

  const tabs = [
    { id: 'todas', label: 'Todas', icon: Activity, color: 'text-primary' },
    { id: 'pendientes', label: 'Pendientes', icon: Clock, color: 'text-amber-500' },
    { id: 'referencia', label: 'En Referencia', icon: FileText, color: 'text-cyan-500' },
    { id: 'completadas', label: 'Completadas', icon: CheckCircle2, color: 'text-success' },
  ]

  const filteredConsultas = consultas.filter(c => {
    if (fechaDesde && new Date(c.fecha_consulta) < new Date(fechaDesde)) return false
    if (fechaHasta && new Date(c.fecha_consulta) > new Date(fechaHasta + 'T23:59:59')) return false
    
    if (activeTab === 'pendientes') return false
    if (activeTab === 'referencia') return false
    return true
  })

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-4 font-medium tracking-wide">
        Inicio <span className="mx-2">/</span> <span className="text-foreground">Consultas</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-7 h-7 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Consultas Médicas</h1>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg border border-border flex overflow-hidden mb-6 shadow-sm">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-smooth border-b-2 ${
                isActive 
                  ? 'border-primary bg-secondary/10 text-foreground' 
                  : 'border-transparent text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? tab.color : 'text-inherit'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Fecha Desde</label>
            <div className="relative">
              <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Fecha Hasta</label>
            <div className="relative">
              <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth" />
            </div>
          </div>
          <button onClick={handleFilter}
            className="h-10 px-8 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-smooth shadow-glow">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl shadow-sm border border-border min-h-[300px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredConsultas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
            <Inbox className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay consultas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold tracking-wide">Fecha</th>
                  <th className="px-6 py-3 font-semibold tracking-wide">Estudiante</th>
                  <th className="px-6 py-3 font-semibold tracking-wide">Motivo</th>
                  <th className="px-6 py-3 font-semibold tracking-wide">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredConsultas.map(c => (
                  <tr key={c.id} className="hover:bg-secondary/10 transition-smooth">
                    <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                      {format(parseISO(c.fecha_consulta), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-foreground font-semibold">
                      {pacientesMap[c.paciente_id] || 'Cargando...'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {c.motivo_consulta}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                        {c.diagnostico_cie10}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
