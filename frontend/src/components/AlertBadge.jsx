import { AlertTriangle, Zap } from 'lucide-react'

const severityConfig = {
  mild: { label: 'Leve', className: 'badge-teal' },
  moderate: { label: 'Moderada', className: 'badge-amber' },
  severe: { label: 'Severa', className: 'bg-alert-red/10 text-alert-red border border-alert-red/30 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium' },
  anaphylactic: { label: '⚡ ANAFILAXIA', className: 'badge-red text-xs font-bold' },
}

export default function AlertBadge({ allergen, severity, reactionType, showFull = false }) {
  const config = severityConfig[severity] || severityConfig.mild
  const isAnaphylactic = severity === 'anaphylactic'

  return (
    <div className={`flex items-start gap-2 p-3 rounded-sm border transition-all ${
      isAnaphylactic
        ? 'bg-alert-red/10 border-alert-red/40 shadow-[0_0_12px_rgba(255,77,109,0.2)]'
        : 'bg-bg-secondary border-bg-border'
    }`}>
      <div className={`mt-0.5 flex-shrink-0 ${isAnaphylactic ? 'text-alert-red animate-pulse' : 'text-alert-amber'}`}>
        {isAnaphylactic ? <Zap className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary text-sm font-semibold">{allergen}</span>
          <span className={config.className}>{config.label}</span>
        </div>
        {showFull && reactionType && (
          <p className="text-text-secondary text-xs mt-0.5">{reactionType}</p>
        )}
      </div>
    </div>
  )
}
