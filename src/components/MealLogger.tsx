import { useState, useRef } from 'react'
import { X, Camera, Upload, Loader2, Check, AlertCircle, Trash2, MessageSquare, Sparkles } from 'lucide-react'
import { analyzeFoodImage, analyzeFoodText, type FoodItem } from '../services/geminiService'
import { createMeal } from '../services/mealService'
import type { MealInsert } from '../types'

interface MealLoggerProps {
  userId: string
  onClose: () => void
  onMealLogged: () => void
}

type Step = 'capture' | 'text-input' | 'analyzing' | 'review' | 'saving' | 'success' | 'error'
type InputMode = 'photo' | 'text'

export function MealLogger({ userId, onClose, onMealLogged }: MealLoggerProps) {
  const [step, setStep] = useState<Step>('capture')
  const [inputMode, setInputMode] = useState<InputMode>('photo')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [textDescription, setTextDescription] = useState('')
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [mealName, setMealName] = useState('')
  const [error, setError] = useState<string | null>(null)

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

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setInputMode('photo')

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

    const result = await analyzeFoodImage(base64, mime)

    if (!result.success) {
      setError(result.error || 'Failed to analyze image')
      setStep('error')
      return
    }

    if (result.items.length === 0) {
      setError('No food detected in the image. Please try another photo.')
      setStep('error')
      return
    }

    setFoodItems(result.items)
    setMealName(result.items.map(i => i.name).join(', '))
    setStep('review')
  }

  const handleTextAnalysis = async () => {
    if (!textDescription.trim()) {
      setError('Please describe your meal')
      return
    }

    setStep('analyzing')
    setError(null)

    const result = await analyzeFoodText(textDescription)

    if (!result.success) {
      setError(result.error || 'Failed to analyze description')
      setStep('error')
      return
    }

    if (result.items.length === 0) {
      setError('Could not identify any food from the description. Please try again.')
      setStep('error')
      return
    }

    setFoodItems(result.items)
    setMealName(result.items.map(i => i.name).join(', '))
    setStep('review')
  }

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    setFoodItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const updatePortionMultiplier = (index: number, multiplier: number) => {
    setFoodItems(prev => {
      const updated = [...prev]
      const item = updated[index]
      updated[index] = {
        ...item,
        portionMultiplier: multiplier,
        calories: Math.round(item.baseCalories * multiplier),
        protein: Math.round(item.baseProtein * multiplier),
        carbs: Math.round(item.baseCarbs * multiplier),
        fat: Math.round(item.baseFat * multiplier)
      }
      return updated
    })
  }

  const removeFoodItem = (index: number) => {
    setFoodItems(prev => prev.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    return foodItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const handleSave = async () => {
    if (foodItems.length === 0) return

    setStep('saving')
    const totals = calculateTotals()

    const meal: MealInsert = {
      user_id: userId,
      name: mealName || 'Meal',
      ingredients: foodItems.map(item => ({
        name: item.name,
        amount: item.quantity
      })),
      timestamp: Math.floor(Date.now() / 1000),
      nutrients: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat)
      },
      image_url: null,
      source: 'ai',
      cost: null
    }

    try {
      await createMeal(meal)
      setStep('success')
      // Auto close after success animation
      setTimeout(() => {
        onMealLogged()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meal')
      setStep('error')
    }
  }

  const handleRetry = () => {
    setStep('capture')
    setImagePreview(null)
    setTextDescription('')
    setFoodItems([])
    setError(null)
  }

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/95 z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">Log Meal</h2>
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
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">
                Log your meal
              </h3>
              <p className="text-[#A1A1A1] text-sm">
                Take a photo or describe what you ate
              </p>
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
                onClick={() => {
                  setInputMode('text')
                  setStep('text-input')
                }}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[#262626] border border-[#333] rounded-2xl hover:border-[#F97066]/50 transition-all"
              >
                <MessageSquare size={22} className="text-[#F97066]" />
                <span className="text-[#FAFAFA] font-medium">Describe your meal</span>
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

        {/* Text Input Step */}
        {step === 'text-input' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">
                Describe your meal
              </h3>
              <p className="text-[#A1A1A1] text-sm">
                Include foods, portions, and preparation methods
              </p>
            </div>

            <textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g., Grilled chicken breast (6 oz), brown rice (1 cup), steamed broccoli (1 cup)"
              className="flex-1 min-h-[200px] bg-[#262626] border border-[#333] rounded-2xl p-4 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] resize-none transition-colors"
              autoFocus
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-4 bg-[#262626] text-[#FAFAFA] rounded-2xl font-medium hover:bg-[#333] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleTextAnalysis}
                disabled={!textDescription.trim()}
                className="flex-1 py-4 btn-primary rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze
              </button>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food"
                className="w-48 h-48 object-cover rounded-2xl"
              />
            )}
            {inputMode === 'text' && (
              <div className="bg-[#262626] rounded-2xl p-4 max-w-sm border border-[#333]">
                <p className="text-[#A1A1A1] text-sm line-clamp-3">{textDescription}</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#F97066]/10 rounded-full flex items-center justify-center animate-pulse-soft">
                <Sparkles size={28} className="text-[#F97066]" />
              </div>
              <span className="text-[#FAFAFA] font-medium">Analyzing your meal...</span>
              <span className="text-[#6B6B6B] text-sm">AI is identifying nutrients</span>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-4 animate-slide-up">
            {imagePreview && (
              <div className="flex justify-center mb-4">
                <img
                  src={imagePreview}
                  alt="Food"
                  className="w-32 h-32 object-cover rounded-2xl"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#A1A1A1] mb-2">Meal Name</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full bg-[#262626] border border-[#333] rounded-2xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A1A1A1] mb-2">Food Items</label>
              <div className="space-y-3">
                {foodItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#262626] border border-[#333] rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                          className="bg-transparent text-[#FAFAFA] font-medium w-full focus:outline-none"
                        />
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                          className="bg-transparent text-[#A1A1A1] text-sm w-full focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeFoodItem(index)}
                        className="p-2 text-[#6B6B6B] hover:text-[#F87171] transition-colors rounded-lg hover:bg-[#333]"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Portion adjustment */}
                    <div className="mb-3">
                      <span className="text-[#6B6B6B] text-xs block mb-2">Adjust portion</span>
                      <div className="flex gap-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((mult) => (
                          <button
                            key={mult}
                            onClick={() => updatePortionMultiplier(index, mult)}
                            className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
                              item.portionMultiplier === mult
                                ? 'bg-[#F97066] text-white font-medium'
                                : 'bg-[#333] text-[#A1A1A1] hover:bg-[#404040]'
                            }`}
                          >
                            {mult}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-[#6B6B6B] block text-xs mb-1">Cal</span>
                        <input
                          type="number"
                          value={item.calories}
                          onChange={(e) => updateFoodItem(index, 'calories', parseInt(e.target.value) || 0)}
                          className="bg-[#333] rounded-lg px-2 py-1.5 w-full text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#F97066]"
                        />
                      </div>
                      <div>
                        <span className="text-[#6B6B6B] block text-xs mb-1">Protein</span>
                        <input
                          type="number"
                          value={item.protein}
                          onChange={(e) => updateFoodItem(index, 'protein', parseInt(e.target.value) || 0)}
                          className="bg-[#333] rounded-lg px-2 py-1.5 w-full text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#F97066]"
                        />
                      </div>
                      <div>
                        <span className="text-[#6B6B6B] block text-xs mb-1">Carbs</span>
                        <input
                          type="number"
                          value={item.carbs}
                          onChange={(e) => updateFoodItem(index, 'carbs', parseInt(e.target.value) || 0)}
                          className="bg-[#333] rounded-lg px-2 py-1.5 w-full text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#F97066]"
                        />
                      </div>
                      <div>
                        <span className="text-[#6B6B6B] block text-xs mb-1">Fat</span>
                        <input
                          type="number"
                          value={item.fat}
                          onChange={(e) => updateFoodItem(index, 'fat', parseInt(e.target.value) || 0)}
                          className="bg-[#333] rounded-lg px-2 py-1.5 w-full text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#F97066]"
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        item.confidence === 'high' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' :
                        item.confidence === 'medium' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        'bg-[#F87171]/20 text-[#F87171]'
                      }`}>
                        {item.confidence} confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F97066]/15 to-[#FEB8B0]/10 border border-[#F97066]/20 rounded-2xl p-5">
              <h4 className="text-[#F97066] font-medium mb-3">Total Nutrition</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#FAFAFA]">{Math.round(totals.calories)}</div>
                  <div className="text-xs text-[#A1A1A1]">Calories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F472B6]">{Math.round(totals.protein)}g</div>
                  <div className="text-xs text-[#A1A1A1]">Protein</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#FBBF24]">{Math.round(totals.carbs)}g</div>
                  <div className="text-xs text-[#A1A1A1]">Carbs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#60A5FA]">{Math.round(totals.fat)}g</div>
                  <div className="text-xs text-[#A1A1A1]">Fat</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saving Step */}
        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
            <Loader2 size={32} className="text-[#F97066] animate-spin" />
            <span className="text-[#FAFAFA]">Saving meal...</span>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-scale-in">
            <div className="w-20 h-20 bg-[#4ADE80]/20 rounded-full flex items-center justify-center animate-check-bounce">
              <Check size={40} className="text-[#4ADE80]" />
            </div>
            <span className="text-[#FAFAFA] text-xl font-semibold">Meal logged!</span>
            <span className="text-[#A1A1A1] text-sm">Great job tracking your nutrition</span>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food"
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
              {inputMode === 'photo' ? 'Retake' : 'Back'}
            </button>
            <button
              onClick={handleSave}
              disabled={foodItems.length === 0}
              className="flex-1 py-4 btn-primary rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Save Meal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
