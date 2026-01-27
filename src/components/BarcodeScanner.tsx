import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Loader2, AlertCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scannerId = 'barcode-scanner'
    let scanner: Html5Qrcode | null = null

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode(scannerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // Barcode scanned successfully
            onScan(decodedText)
          },
          () => {
            // QR code scan error (ignore - happens on each frame without a code)
          }
        )

        setIsStarting(false)
      } catch (err) {
        console.error('Failed to start barcode scanner:', err)
        setError('Could not access camera. Please check permissions.')
        setIsStarting(false)
      }
    }

    startScanner()

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(console.error)
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Scan Barcode</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {isStarting && (
          <div className="flex items-center gap-3 text-white mb-4">
            <Loader2 size={24} className="animate-spin text-emerald-500" />
            <span>Starting camera...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        <div
          ref={containerRef}
          id="barcode-scanner"
          className="w-full max-w-sm rounded-xl overflow-hidden"
        />

        {!error && !isStarting && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Point your camera at a barcode
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Works with UPC, EAN, and other standard barcodes
            </p>
          </div>
        )}
      </div>

      {/* Manual Entry Option */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-center text-gray-500 text-sm mb-3">
          Can't scan? Enter barcode manually
        </p>
        <ManualBarcodeEntry onSubmit={onScan} />
      </div>
    </div>
  )
}

function ManualBarcodeEntry({ onSubmit }: { onSubmit: (barcode: string) => void }) {
  const [barcode, setBarcode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcode.trim()) {
      onSubmit(barcode.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Enter barcode number"
        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={!barcode.trim()}
        className="px-6 py-3 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search
      </button>
    </form>
  )
}
