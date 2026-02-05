import { useState, useRef } from 'react'
import { X, Camera, Upload, Loader2, Check, AlertCircle, Scale, Edit3, Sparkles } from 'lucide-react'
import { analyzeScaleImage, type ScaleAnalysisResult } from '../services/geminiService'
import { createWeightEntry, uploadWeightPhoto, updateProfileWeight, completeWeighInRequest } from '../services/weightService'
import type { Profile, WeightEntryInsert, CoachRequest, WeightUnit, ConfidenceLevel } from '../types'

interface WeightLoggerProps {
  profile: Profile
  onClose: () => void
  onWeightLogged: () => void
  coachRequest?: CoachRequest // If responding to a coach request
}

type Step = 'capture' | 'analyzing' | 'review' | 'saving' | 'success' | 'error'

export function WeightLogger({ profile, onClose, onWeightLogged, coachRequest }: WeightLoggerProps) {
  const defaultUnit: WeightUnit = profile.unit_system === 'imperial' ? 'lbs' : 'kg'

  const [step, setStep] = useState<Step>('capture')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ScaleAnalysisResult | null>(null)
  const [editedWeight, setEditedWeight] = useState<string>('')
  const [editedUnit, setEditedUnit] = useState<WeightUnit>(defaultUnit)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isManualEntry, setIsManualEntry] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setImageFile(file)
    setIsManualEntry(false)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      analyzeImage(base64, file.type)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (base64: string, mime: string) => {
    setStep('analyzing')
    setError(null)

    const result = await analyzeScaleImage(base64, mime)
    setAnalysisResult(result)

    if (!result.success || result.weight === null) {
      // Allow user to manually enter weight even if analysis failed
      setEditedWeight(profile.weight?.toString() || '')
      setError(result.error || 'Could not read the scale. You can enter the weight manually.')
      setStep('review')
      return
    }

    setEditedWeight(result.weight.toString())
    if (result.unit) {
      setEditedUnit(result.unit)
    }
    setStep('review')
  }

  const handleManualEntry = () => {
    // Allow manual entry without photo
    setIsManualEntry(true)
    setImagePreview(null)
    setImageFile(null)
    setEditedWeight(profile.weight?.toString() || '')
    setAnalysisResult(null)
    setStep('review')
  }

  const handleSave = async () => {
    const weightValue = parseFloat(editedWeight)
    if (isNaN(weightValue) || weightValue <= 0) {
      setError('Please enter a valid weight')
      return
    }

    setStep('saving')

    try {
      // Only upload photo if this is a coach request and we have an image
      let imageUrl: string | null = null
      if (coachRequest && imageFile) {
        imageUrl = await uploadWeightPhoto(profile.id, imageFile)
      }

      const entry: WeightEntryInsert = {
        user_id: profile.id,
        weight: weightValue,
        unit: editedUnit,
        recorded_at: new Date().toISOString(),
        source: imageFile ? 'scale_photo' : 'manual',
        image_url: imageUrl,
        coach_request_id: coachRequest?.id || null,
        confidence: analysisResult?.confidence as ConfidenceLevel || null,
        notes: notes.trim() || null
      }

      await createWeightEntry(entry)

      // Update profile weight
      await updateProfileWeight(profile.id, weightValue, editedUnit, profile)

      // If this was a coach request, mark it as completed
      if (coachRequest) {
        await completeWeighInRequest(coachRequest.id)
      }

      setStep('success')
      setTimeout(() => {
        onWeightLogged()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weight')
      setStep('error')
    }
  }

  const handleRetry = () => {
    setStep('capture')
    setImagePreview(null)
    setImageFile(null)
    setAnalysisResult(null)
    setEditedWeight('')
    setError(null)
    setNotes('')
    setIsManualEntry(false)
  }

  // Calculate weight change from profile
  const getWeightChange = (): { change: number; direction: 'up' | 'down' | 'same' } | null => {
    if (!profile.weight || !editedWeight) return null
    const newWeight = parseFloat(editedWeight)
    if (isNaN(newWeight)) return null

    // Convert profile weight to the same unit if needed
    let profileWeight = profile.weight
    const profileUnit: WeightUnit = profile.unit_system === 'imperial' ? 'lbs' : 'kg'
    if (profileUnit !== editedUnit) {
      // Convert profile weight to edited unit
      if (profileUnit === 'lbs' && editedUnit === 'kg') {
        profileWeight = profileWeight * 0.453592
      } else if (profileUnit === 'kg' && editedUnit === 'lbs') {
        profileWeight = profileWeight * 2.20462
      }
    }

    const change = Math.round((newWeight - profileWeight) * 10) / 10
    const direction = change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'same'
    return { change: Math.abs(change), direction }
  }

  const weightChange = getWeightChange()

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/95 z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">
          {coachRequest ? 'Submit Weigh-In' : 'Log Weight'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
        >
          <X size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Capture Step */}
        {step === 'capture' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-[#F97066]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Scale size={40} className="text-[#F97066]" />
              </div>
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">
                {coachRequest ? 'Submit your weigh-in' : 'Log your weight'}
              </h3>
              <p className="text-[#A1A1A1] text-sm">
                Take a photo of your scale or enter manually
              </p>
              {coachRequest && (
                <p className="text-[#F97066] text-sm mt-2">
                  Photo will be saved for coach verification
                </p>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 bg-[#262626] border border-[#333] rounded-2xl hover:border-[#F97066]/50 transition-all hover:scale-105"
              >
                <div className="w-14 h-14 bg-[#F97066]/10 rounded-xl flex items-center justify-center">
                  <Camera size={28} className="text-[#F97066]" />
                </div>
                <span className="text-[#FAFAFA] font-medium">Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 bg-[#262626] border border-[#333] rounded-2xl hover:border-[#F97066]/50 transition-all hover:scale-105"
              >
                <div className="w-14 h-14 bg-[#F97066]/10 rounded-xl flex items-center justify-center">
                  <Upload size={28} className="text-[#F97066]" />
                </div>
                <span className="text-[#FAFAFA] font-medium">Upload</span>
              </button>
            </div>

            <div className="w-full max-w-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-[#333]" />
                <span className="text-[#6B6B6B] text-sm">or</span>
                <div className="flex-1 h-px bg-[#333]" />
              </div>

              <button
                onClick={handleManualEntry}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[#262626] border border-[#333] rounded-2xl hover:border-[#F97066]/50 transition-all"
              >
                <Edit3 size={22} className="text-[#F97066]" />
                <span className="text-[#FAFAFA] font-medium">Enter manually</span>
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Scale"
                className="w-48 h-48 object-cover rounded-2xl"
              />
            )}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#F97066]/10 rounded-full flex items-center justify-center animate-pulse-soft">
                <Sparkles size={28} className="text-[#F97066]" />
              </div>
              <span className="text-[#FAFAFA] font-medium">Reading scale...</span>
              <span className="text-[#6B6B6B] text-sm">AI is detecting the weight</span>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-6 animate-slide-up">
            {imagePreview && (
              <div className="flex justify-center mb-4">
                <img
                  src={imagePreview}
                  alt="Scale"
                  className="w-40 h-40 object-cover rounded-2xl"
                />
              </div>
            )}

            {/* AI result info */}
            {analysisResult && (
              <div className="text-center mb-2">
                {analysisResult.success ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      analysisResult.confidence === 'high' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' :
                      analysisResult.confidence === 'medium' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                      'bg-[#F87171]/20 text-[#F87171]'
                    }`}>
                      {analysisResult.confidence} confidence
                    </span>
                    {analysisResult.scaleType !== 'unknown' && (
                      <span className="text-xs text-[#6B6B6B]">
                        {analysisResult.scaleType} scale
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[#FBBF24] text-sm">
                    Could not read scale automatically
                  </p>
                )}
              </div>
            )}

            {/* Weight Input */}
            <div className="bg-[#262626] border border-[#333] rounded-2xl p-6">
              <label className="block text-sm text-[#A1A1A1] mb-3 text-center">
                {isManualEntry ? 'Enter your weight' : 'Confirm weight'}
              </label>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  value={editedWeight}
                  onChange={(e) => setEditedWeight(e.target.value)}
                  placeholder="0.0"
                  className="w-32 bg-[#333] border border-[#404040] rounded-xl px-4 py-3 text-3xl font-bold text-[#FAFAFA] text-center focus:outline-none focus:border-[#F97066] transition-colors"
                />
                <select
                  value={editedUnit}
                  onChange={(e) => setEditedUnit(e.target.value as WeightUnit)}
                  className="bg-[#333] border border-[#404040] rounded-xl px-4 py-3 text-xl font-medium text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors cursor-pointer"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>

              {/* Weight change indicator */}
              {weightChange && weightChange.direction !== 'same' && (
                <div className="mt-4 text-center">
                  <span className={`text-sm ${
                    weightChange.direction === 'down' ? 'text-[#4ADE80]' : 'text-[#FBBF24]'
                  }`}>
                    {weightChange.direction === 'down' ? '-' : '+'}{weightChange.change} {editedUnit} from last recorded
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-[#A1A1A1] mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this weigh-in..."
                className="w-full bg-[#262626] border border-[#333] rounded-2xl px-4 py-3 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] resize-none h-24 transition-colors"
              />
            </div>

            {/* Error display in review */}
            {error && (
              <div className="bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl p-3 text-center">
                <span className="text-[#F87171] text-sm">{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Saving Step */}
        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
            <Loader2 size={32} className="text-[#F97066] animate-spin" />
            <span className="text-[#FAFAFA]">Saving weight...</span>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-scale-in">
            <div className="w-20 h-20 bg-[#4ADE80]/20 rounded-full flex items-center justify-center animate-check-bounce">
              <Check size={40} className="text-[#4ADE80]" />
            </div>
            <span className="text-[#FAFAFA] text-xl font-semibold">Weight logged!</span>
            <span className="text-[#A1A1A1] text-sm">
              {editedWeight} {editedUnit} recorded
            </span>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Scale"
                className="w-48 h-48 object-cover rounded-2xl opacity-50"
              />
            )}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-16 h-16 bg-[#F87171]/20 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-[#F87171]" />
              </div>
              <span className="text-[#FAFAFA] font-medium">Something went wrong</span>
              <span className="text-[#A1A1A1] text-sm max-w-xs">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-[#262626] text-[#FAFAFA] rounded-2xl hover:bg-[#333] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer with action buttons */}
      {step === 'review' && (
        <div className="p-4 border-t border-[#333]">
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-4 bg-[#262626] text-[#FAFAFA] rounded-2xl font-medium hover:bg-[#333] transition-colors"
            >
              {isManualEntry ? 'Back' : 'Retake'}
            </button>
            <button
              onClick={handleSave}
              disabled={!editedWeight || parseFloat(editedWeight) <= 0}
              className="flex-1 py-4 btn-primary rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Save Weight
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
