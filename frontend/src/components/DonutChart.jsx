import { useMemo } from 'react'

export default function DonutChart({ data = [], size = 180, strokeWidth = 32, centerText }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const total = data.reduce((s, d) => s + d.value, 0)

  const segments = useMemo(() => {
    let offset = 0
    return data.map(d => {
      const pct = total > 0 ? d.value / total : 0
      const dash = pct * circumference
      const gap = circumference - dash
      const seg = { ...d, dashArray: `${dash} ${gap}`, dashOffset: -offset }
      offset += dash
      return seg
    })
  }, [data, total, circumference])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={center} cy={center} r={radius} fill="none"
          stroke="#e8ecf1" strokeWidth={strokeWidth} />
        {/* Data segments */}
        {segments.map((seg, i) => (
          <circle key={i} cx={center} cy={center} r={radius} fill="none"
            stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={seg.dashArray} strokeDashoffset={seg.dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
          />
        ))}
      </svg>
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-text-primary">{centerText}</span>
        </div>
      )}
    </div>
  )
}
