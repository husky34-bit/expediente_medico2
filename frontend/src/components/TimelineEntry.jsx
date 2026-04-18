import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Stethoscope, Pill, FlaskConical, AlertTriangle } from 'lucide-react'

const typeConfig = {
  consultation: {
    icon: Stethoscope,
    color: 'accent-teal',
    label: 'Consulta',
    dotClass: 'bg-accent-teal',
  },
  medication: {
    icon: Pill,
    color: 'accent-blue',
    label: 'Medicamento',
    dotClass: 'bg-accent-blue',
  },
  lab: {
    icon: FlaskConical,
    color: 'alert-amber',
    label: 'Laboratorio',
    dotClass: 'bg-alert-amber',
  },
  allergy: {
    icon: AlertTriangle,
    color: 'alert-red',
    label: 'Alergia',
    dotClass: 'bg-alert-red',
  },
}

export default function TimelineEntry({ type, date, title, subtitle, details, code }) {
  const cfg = typeConfig[type] || typeConfig.consultation
  const Icon = cfg.icon

  const formattedDate = date
    ? format(parseISO(date), "d 'de' MMMM yyyy", { locale: es })
    : ''

  return (
    <div className="flex gap-4 group">
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-3 h-3 rounded-full mt-1 ${cfg.dotClass} ring-2 ring-bg-primary group-hover:ring-bg-border transition-all`} />
        <div className="w-px flex-1 bg-bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="glass-card p-4 hover:border-bg-border/60 transition-all duration-200 group-hover:shadow-card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded flex items-center justify-center bg-${cfg.color}/10`}>
                <Icon className={`w-3.5 h-3.5 text-${cfg.color}`} />
              </div>
              <span className={`text-xs font-medium text-${cfg.color} uppercase tracking-wide`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {code && (
                <span className="font-mono text-xs text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded">
                  {code}
                </span>
              )}
              <span className="text-xs text-text-muted font-mono whitespace-nowrap">{formattedDate}</span>
            </div>
          </div>
          <p className="text-text-primary font-medium text-sm mb-1">{title}</p>
          {subtitle && <p className="text-text-secondary text-xs">{subtitle}</p>}
          {details && (
            <p className="text-text-muted text-xs mt-2 border-t border-bg-border pt-2 italic">{details}</p>
          )}
        </div>
      </div>
    </div>
  )
}
