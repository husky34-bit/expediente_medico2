export default function VitalsCard({ label, value, unit, icon: Icon, trend, color = 'teal' }) {
  const colorMap = {
    teal: 'text-accent-teal border-accent-teal/30 bg-accent-teal/5',
    blue: 'text-accent-blue border-accent-blue/30 bg-accent-blue/5',
    red: 'text-alert-red border-alert-red/30 bg-alert-red/5',
    amber: 'text-alert-amber border-alert-amber/30 bg-alert-amber/5',
    green: 'text-alert-green border-alert-green/30 bg-alert-green/5',
  }

  return (
    <div className={`rounded-card border p-4 ${colorMap[color]} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 opacity-70" />}
      </div>
      <div className="flex items-end gap-1">
        <span className="font-mono text-2xl font-bold text-text-primary">{value ?? '—'}</span>
        {unit && <span className="text-xs text-text-secondary mb-1">{unit}</span>}
      </div>
      {trend && (
        <p className="text-xs text-text-muted mt-1">{trend}</p>
      )}
    </div>
  )
}
