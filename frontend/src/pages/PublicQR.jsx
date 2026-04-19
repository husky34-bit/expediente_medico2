import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Activity, Droplets, Phone, AlertTriangle, Pill,
  Stethoscope, User, Shield, Zap, QrCode
} from 'lucide-react'
import apiClient from '../api/client'

const severityLabel = {
  mild: 'Leve',
  moderate: 'Moderada',
  severe: 'Severa',
  anaphylactic: '⚡ ANAFILAXIA',
}

const severityStyle = {
  mild: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
  moderate: 'bg-alert-amber/10 text-alert-amber border-alert-amber/30',
  severe: 'bg-alert-red/10 text-alert-red border-alert-red/30',
  anaphylactic: 'bg-alert-red/20 text-alert-red border-alert-red/60 animate-pulse font-bold',
}

export default function PublicQR() {
  const { qrToken } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get(`/api/publico/${qrToken}`)
        setData(res.data)
      } catch (err) {
        setError(err.response?.status === 404
          ? 'Código QR inválido o expirado'
          : 'Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [qrToken])

  const initials = data?.nombre_completo?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  const hasAnaphylactic = data?.alergias?.toLowerCase().includes('anafilaxia')

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm font-mono">Cargando perfil médico...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-sm w-full text-center">
        <QrCode className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <h2 className="text-text-primary font-semibold mb-2">Perfil no encontrado</h2>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg mx-auto">
        {/* Header badge */}
        <div className="flex items-center justify-center gap-2 mb-6 fade-up-1">
          <Activity className="w-4 h-4 text-accent-teal" />
          <span className="text-accent-teal text-sm font-medium">Expediente Clínico Universal</span>
          <span className="badge-teal">Perfil Público</span>
        </div>

        {/* ANAPHYLACTIC banner */}
        {hasAnaphylactic && (
          <div className="mb-4 p-4 rounded-card bg-alert-red/15 border border-alert-red/50 shadow-[0_0_24px_rgba(255,77,109,0.3)] fade-up-1">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-alert-red animate-pulse flex-shrink-0" />
              <div>
                <p className="text-alert-red font-bold">⛔ ALERGIA ANAFILÁCTICA</p>
                <p className="text-alert-red/80 text-sm">
                  {data.allergies.filter(a => a.severity === 'anaphylactic').map(a => a.allergen).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Patient card */}
        <div className="glass-card p-6 mb-4 fade-up-2">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-teal to-accent-blue flex items-center justify-center text-2xl font-bold text-bg-primary flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-display text-text-primary leading-tight">{data.nombre_completo}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-text-muted font-mono">ID: {data.dni_pasaporte}</span>
                <span className="w-1 h-1 rounded-full bg-text-muted/30" />
                <span className="text-xs text-text-muted">{data.fecha_nacimiento}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-bg-secondary border border-bg-border">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sangre</span>
              </div>
              <p className="text-text-primary font-bold">{data.tipo_sangre || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-bg-border">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <User className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Género</span>
              </div>
              <p className="text-text-primary font-bold">{data.genero_biologico}</p>
            </div>
          </div>

          {data.contacto_emergencia_tel && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/20">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent-teal" />
                <div>
                  <p className="text-[10px] font-bold text-accent-teal uppercase tracking-wider">Emergencia</p>
                  <p className="text-text-primary font-bold text-sm">{data.contacto_emergencia_nombre}</p>
                </div>
              </div>
              <a href={`tel:${data.contacto_emergencia_tel}`} className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center text-white shadow-teal">
                <Phone className="w-5 h-5 fill-current" />
              </a>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* Allergies */}
          <div className="glass-card p-5 fade-up-3">
            <div className="flex items-center gap-2 mb-3 text-alert-red">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Alergias</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.alergias ? (
                <span className="badge-red">{data.alergias}</span>
              ) : (
                <span className="text-text-muted text-sm italic">Sin alergias conocidas</span>
              )}
            </div>
          </div>

          {/* Medications */}
          <div className="glass-card p-5 fade-up-3">
            <div className="flex items-center gap-2 mb-3 text-accent-teal">
              <Pill className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Medicación Activa</h3>
            </div>
            <div className="space-y-3">
              {data.medicamentos_activos.length > 0 ? (
                data.medicamentos_activos.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-bg-border">
                    <div className="w-8 h-8 rounded-lg bg-accent-teal/10 flex items-center justify-center text-accent-teal flex-shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold text-sm">{m.nombre}</p>
                      <p className="text-text-secondary text-xs">{m.dosis} — {m.frecuencia}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-muted text-sm italic">Sin medicación reportada</p>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="glass-card p-5 fade-up-3">
            <div className="flex items-center gap-2 mb-3 text-accent-blue">
              <Stethoscope className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Consultas Recientes</h3>
            </div>
            <div className="space-y-4">
              {data.consultas_recientes.length > 0 ? (
                data.consultas_recientes.map((c, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-accent-blue/20">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-accent-blue" />
                    <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">{c.fecha}</p>
                    <p className="text-text-primary font-semibold text-sm">{c.diagnostico}</p>
                    <p className="text-text-secondary text-xs">{c.motivo}</p>
                  </div>
                ))
              ) : (
                <p className="text-text-muted text-sm italic">Sin historial reciente</p>
              )}
            </div>
          </div>
        </div>

        {/* Login CTA */}
        <div className="text-center fade-up-5">
          <a
            href="/login"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <Shield className="w-4 h-4" />
            Ver expediente completo
          </a>
          <p className="text-text-muted text-xs mt-3">
            Requiere credenciales médicas autorizadas
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-4">
          <p className="text-text-muted text-xs font-mono">
            Expediente Clínico Universal · Acceso vía QR
          </p>
        </div>
      </div>
    </div>
  )
}
