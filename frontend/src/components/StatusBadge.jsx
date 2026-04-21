const statusStyles = {
  STABLE: 'bg-success/15 text-success',
  RECOVERING: 'bg-amber-400/20 text-amber-700',
  CRITICAL: 'bg-destructive/15 text-destructive',
}

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.STABLE
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${style}`}>
      {status}
    </span>
  )
}
