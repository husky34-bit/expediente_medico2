export default function BarChart({ data = [], barColor = '#1cbcb4', height = 160 }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const ySteps = Array.from({ length: 5 }, (_, i) => Math.round(maxVal * (1 - i / 4)))

  return (
    <div className="flex flex-col" style={{ height: height + 40 }}>
      <div className="flex-1 flex items-end gap-2 relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-text-muted w-6">
          {ySteps.map((v, i) => <span key={i}>{v}</span>)}
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end gap-2 pl-8">
          {data.map((d, i) => {
            const h = maxVal > 0 ? (d.value / maxVal) * 100 : 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${h}%`,
                    minHeight: d.value > 0 ? 8 : 0,
                    backgroundColor: d.color || barColor,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex gap-2 pl-8 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-text-muted truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
