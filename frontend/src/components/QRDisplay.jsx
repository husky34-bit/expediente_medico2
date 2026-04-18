import { useRef } from 'react'
import QRCode from 'react-qr-code'
import { Download, RefreshCw, QrCode } from 'lucide-react'

export default function QRDisplay({ patientId, qrToken, patientName, onRegenerate }) {
  const svgRef = useRef(null)
  const frontendUrl = import.meta.env.VITE_API_URL
    ? window.location.origin
    : 'http://localhost:3000'
  const qrUrl = `${frontendUrl}/public/${qrToken}`

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')

    // Dark background
    ctx.fillStyle = '#0a0f1a'
    ctx.fillRect(0, 0, 300, 300)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 25, 25, 250, 250)
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.download = `qr-${patientName?.replace(/\s+/g, '-') || patientId}.png`
      a.href = url
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="glass-card p-5 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 self-start">
        <QrCode className="w-4 h-4 text-accent-teal" />
        <span className="text-sm font-medium text-text-secondary">Código QR del Paciente</span>
      </div>

      {/* QR Code */}
      <div
        ref={svgRef}
        className="p-4 rounded-card bg-[#0a0f1a] border-2 border-accent-teal/30 shadow-teal"
      >
        {qrToken ? (
          <QRCode
            value={qrUrl}
            size={180}
            bgColor="#0a0f1a"
            fgColor="#00d4aa"
            level="H"
          />
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center text-text-muted text-sm">
            Sin QR
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-text-muted font-mono break-all max-w-[200px]">{qrToken}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownload}
          disabled={!qrToken}
          className="flex-1 flex items-center justify-center gap-2 btn-secondary text-sm py-2"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 btn-secondary text-sm py-2 px-3"
            title="Regenerar token QR"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
