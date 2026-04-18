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
        const res = await apiClient.get(`/api/public/${qrToken}`)
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

  const initials = data?.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  const hasAnaphylactic = data?.allergies?.some(a => a.severity === 'anaphylactic')

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
              <h1 className="font-display text-2xl text-text-primary">{data.full_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {data.blood_type && (
                  <span className="badge-blood flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> {data.blood_type}
                  </span>
                )}
                <span className="text-text-secondary text-sm capitalize">{data.gender === 'male' ? 'Masculino' : data.gender === 'female' ? 'Femenino' : 'Otro'}</span>
              </div>
            </div>
          </div>

          {data.emergency_contact_name && (
            <div className="p-3 rounded-sm bg-accent-blue/5 border border-accent-blue/20">
              <p className="text-xs text-accent-blue font-medium mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> CONTACTO DE EMERGENCIA
              </p>
              <p className="text-text-primary font-semibold">{data.emergency_contact_name}</p>
              {data.emergency_contact_phone && (
                <a
                  href={`tel:${data.emergency_contact_phone}`}
                  className="text-accent-blue font-mono text-sm hover:underline"
                >
                  {data.emergency_contact_phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="glass-card p-5 mb-4 fade-up-3">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-alert-red" /> Alergias Conocidas
          </h2>
          {data.allergies.length === 0 ? (
            <p className="text-text-muted text-sm">Sin alergias registradas</p>
          ) : (
            <div className="space-y-2">
              {data.allergies.map((a, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-sm border ${severityStyle[a.severity] || ''}`}>
                  <div>
                    <span className="font-semibold text-sm">{a.allergen}</span>
                    {a.reaction_type && <p className="text-xs opacity-80 mt-0.5">{a.reaction_type}</p>}
                  </div>
                  <span className="text-xs ml-2 whitespace-nowrap">{severityLabel[a.severity]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active medications */}
        <div className="glass-card p-5 mb-4 fade-up-4">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-accent-blue" /> Medicación Activa
          </h2>
          {data.active_medications.length === 0 ? (
            <p className="text-text-muted text-sm">Sin medicación activa</p>
          ) : (
            <div className="space-y-2">
              {data.active_medications.map((m, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-sm bg-bg-secondary border border-bg-border">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-text-primary text-sm font-medium">{m.name}</p>
                    <p className="text-text-secondary text-xs">{m.dose} — {m.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent consultations */}
        <div className="glass-card p-5 mb-6 fade-up-5">
          <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-accent-teal" /> Últimas Consultas
          </h2>
          {data.recent_consultations.length === 0 ? (
            <p className="text-text-muted text-sm">Sin consultas registradas</p>
          ) : (
            <div className="space-y-3">
              {data.recent_consultations.map((c, i) => (
                <div key={i} className="border-l-2 border-accent-teal/30 pl-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-text-primary text-sm font-medium">{c.diagnosis}</p>
                    <span className="text-text-muted text-xs font-mono whitespace-nowrap">{c.date}</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-0.5">{c.chief_complaint}</p>
                  {c.institution && <p className="text-text-muted text-xs">{c.institution}</p>}
                </div>
              ))}
            </div>
          )}
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
