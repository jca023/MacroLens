import { useState, useEffect, useRef, useCallback } from 'react'
import { LayoutGrid, Upload, MessageSquare, Camera, CameraOff } from 'lucide-react'
import { MealLogger } from './MealLogger'

interface CameraViewProps {
  userId: string
  onMealLogged: () => void
  onGoToDashboard: () => void
}

interface CapturedImage {
  base64: string
  mimeType: string
  previewUrl: string
}

export function CameraView({ userId, onMealLogged, onGoToDashboard }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capture, setCapture] = useState<CapturedImage | null>(null)
  const [showMealLogger, setShowMealLogger] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setCameraReady(true)
      }
    } catch {
      setCameraError('Camera access denied or unavailable.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCameraReady(false)
  }, [stream])

  useEffect(() => {
    startCamera()
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      stream?.getTracks().forEach(t => t.stop())
    }
  }, []) // Only run on mount

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const base64 = dataUrl.split(',')[1]

    stopCamera()
    setCapture({ base64, mimeType: 'image/jpeg', previewUrl: dataUrl })
    setShowMealLogger(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const previewUrl = URL.createObjectURL(file)
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      stopCamera()
      setCapture({ base64, mimeType: file.type, previewUrl })
      setShowMealLogger(true)
    }
    reader.readAsDataURL(file)
  }

  const handleMealLoggerClose = () => {
    setShowMealLogger(false)
    setShowTextInput(false)
    setCapture(null)
    // Restart camera
    startCamera()
  }

  const handleTakeAnother = () => {
    setShowMealLogger(false)
    setShowTextInput(false)
    setCapture(null)
    startCamera()
  }

  const handleViewDashboard = () => {
    setShowMealLogger(false)
    setShowTextInput(false)
    onMealLogged()
    onGoToDashboard()
  }

  const handleTextInput = () => {
    stopCamera()
    setShowTextInput(true)
    setShowMealLogger(true)
  }

  // Viewfinder square dimensions — 70% of viewport width, max 360px
  const squareSize = 'min(70vw, 360px)'

  // Show MealLogger modal (with preloaded image or text mode)
  if (showMealLogger) {
    return (
      <MealLogger
        userId={userId}
        onClose={handleMealLoggerClose}
        onMealLogged={onMealLogged}
        preloadedImage={capture || undefined}
        startInTextMode={showTextInput}
        onTakeAnother={handleTakeAnother}
        onViewDashboard={handleViewDashboard}
      />
    )
  }

  // Camera permission denied / error fallback
  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-[#1A1A1A] flex flex-col items-center justify-center p-6">
        {/* Dashboard link */}
        <button
          onClick={onGoToDashboard}
          className="absolute top-4 right-4 p-3 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors"
          title="Go to Dashboard"
        >
          <LayoutGrid size={24} />
        </button>

        <div className="w-20 h-20 bg-[#262626] rounded-full flex items-center justify-center mb-6">
          <CameraOff size={36} className="text-[#6B6B6B]" />
        </div>
        <h2 className="text-xl font-semibold text-[#FAFAFA] mb-2 text-center">
          Camera Unavailable
        </h2>
        <p className="text-[#A1A1A1] text-sm text-center mb-8 max-w-xs">
          {cameraError}
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 btn-primary rounded-2xl flex items-center justify-center gap-3"
          >
            <Upload size={20} />
            Upload a Photo
          </button>
          <button
            onClick={handleTextInput}
            className="w-full py-4 bg-[#262626] text-[#FAFAFA] rounded-2xl font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-3"
          >
            <MessageSquare size={20} />
            Describe Your Meal
          </button>
          <button
            onClick={onGoToDashboard}
            className="w-full py-4 text-[#A1A1A1] rounded-2xl font-medium hover:text-[#FAFAFA] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Dashboard icon - top right */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Camera size={18} className="text-white" />
          </div>
          <span className="text-white/80 font-medium text-sm">MacroLens</span>
        </div>
        <button
          onClick={onGoToDashboard}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all"
          title="Go to Dashboard"
        >
          <LayoutGrid size={22} />
        </button>
      </div>

      {/* Live video feed */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Loading state before camera is ready */}
        {!cameraReady && (
          <div className="absolute inset-0 bg-[#1A1A1A] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#F97066] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Viewfinder overlay — 4 rectangles around the square cutout */}
        {cameraReady && (
          <div className="absolute inset-0 pointer-events-none">
            {/* We use a single overlay with a clip-path to cut out the square */}
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%,
                  0% calc(50% - ${squareSize} / 2),
                  calc(50% - ${squareSize} / 2) calc(50% - ${squareSize} / 2),
                  calc(50% - ${squareSize} / 2) calc(50% + ${squareSize} / 2),
                  0% calc(50% + ${squareSize} / 2),
                  0% 0%,
                  100% 0%,
                  100% calc(50% - ${squareSize} / 2),
                  calc(50% + ${squareSize} / 2) calc(50% - ${squareSize} / 2),
                  calc(50% + ${squareSize} / 2) calc(50% + ${squareSize} / 2),
                  100% calc(50% + ${squareSize} / 2),
                  100% 0%
                )`
              }}
            />

            {/* Square border with rounded corners */}
            <div
              className="absolute border-2 border-white/60 rounded-2xl"
              style={{
                width: squareSize,
                height: squareSize,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Corner accents */}
              <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-2xl" />
              <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-2xl" />
              <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-2xl" />
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-2xl" />
            </div>

            {/* Guide text */}
            <div
              className="absolute left-0 right-0 text-center text-white/60 text-sm font-medium"
              style={{
                top: `calc(50% - ${squareSize} / 2 - 32px)`
              }}
            >
              Position your food in the frame
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-8 px-6">
        <div className="flex items-center justify-center gap-8">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            title="Upload photo"
          >
            <Upload size={22} />
          </button>

          {/* Capture button — large round white button */}
          <button
            onClick={handleCapture}
            disabled={!cameraReady}
            className="w-[72px] h-[72px] rounded-full bg-white border-4 border-white/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/30"
          >
            <div className="w-[58px] h-[58px] rounded-full bg-white hover:bg-white/90 transition-colors" />
          </button>

          {/* Text input button */}
          <button
            onClick={handleTextInput}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            title="Describe your meal"
          >
            <MessageSquare size={22} />
          </button>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
