import { useState, useRef } from 'react'
import { X, Camera, Upload, Loader2, Check, AlertCircle, Trash2, MessageSquare } from 'lucide-react'
import { analyzeFoodImage, analyzeFoodText, type FoodItem } from '../services/geminiService'
import { createMeal } from '../services/mealService'
import type { MealInsert } from '../types'

interface MealLoggerProps {
  userId: string
  onClose: () => void
  onMealLogged: () => void
}

type Step = 'capture' | 'text-input' | 'analyzing' | 'review' | 'saving' | 'error'
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
      onMealLogged()
      onClose()
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
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Log Meal</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Capture Step */}
        {step === 'capture' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                Log your meal
              </h3>
              <p className="text-gray-400 text-sm">
                Take a photo or describe what you ate
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-colors"
              >
                <Camera size={32} className="text-emerald-500" />
                <span className="text-white font-medium">Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-colors"
              >
                <Upload size={32} className="text-emerald-500" />
                <span className="text-white font-medium">Upload</span>
              </button>
            </div>

            <div className="w-full max-w-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <button
                onClick={() => {
                  setInputMode('text')
                  setStep('text-input')
                }}
                className="w-full flex items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-colors"
              >
                <MessageSquare size={24} className="text-emerald-500" />
                <span className="text-white font-medium">Describe your meal</span>
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
          <div className="flex flex-col h-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Describe your meal
              </h3>
              <p className="text-gray-400 text-sm">
                Include foods, portions, and preparation methods
              </p>
            </div>

            <textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g., Grilled chicken breast (6 oz), brown rice (1 cup), steamed broccoli (1 cup)"
              className="flex-1 min-h-[200px] bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
              autoFocus
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleTextAnalysis}
                disabled={!textDescription.trim()}
                className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze
              </button>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food"
                className="w-48 h-48 object-cover rounded-2xl"
              />
            )}
            {inputMode === 'text' && (
              <div className="bg-zinc-900 rounded-xl p-4 max-w-sm">
                <p className="text-gray-400 text-sm line-clamp-3">{textDescription}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Loader2 size={24} className="text-emerald-500 animate-spin" />
              <span className="text-white">Analyzing food...</span>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-4">
            {imagePreview && (
              <div className="flex justify-center mb-4">
                <img
                  src={imagePreview}
                  alt="Food"
                  className="w-32 h-32 object-cover rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Meal Name</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Food Items</label>
              <div className="space-y-3">
                {foodItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                          className="bg-transparent text-white font-medium w-full focus:outline-none"
                        />
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                          className="bg-transparent text-gray-400 text-sm w-full focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeFoodItem(index)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 block">Cal</span>
                        <input
                          type="number"
                          value={item.calories}
                          onChange={(e) => updateFoodItem(index, 'calories', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 rounded px-2 py-1 w-full text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-gray-500 block">Protein</span>
                        <input
                          type="number"
                          value={item.protein}
                          onChange={(e) => updateFoodItem(index, 'protein', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 rounded px-2 py-1 w-full text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-gray-500 block">Carbs</span>
                        <input
                          type="number"
                          value={item.carbs}
                          onChange={(e) => updateFoodItem(index, 'carbs', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 rounded px-2 py-1 w-full text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-gray-500 block">Fat</span>
                        <input
                          type="number"
                          value={item.fat}
                          onChange={(e) => updateFoodItem(index, 'fat', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 rounded px-2 py-1 w-full text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${
                        item.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {item.confidence} confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-emerald-400 font-medium mb-2">Total Nutrition</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(totals.calories)}</div>
                  <div className="text-xs text-gray-400">Calories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(totals.protein)}g</div>
                  <div className="text-xs text-gray-400">Protein</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(totals.carbs)}g</div>
                  <div className="text-xs text-gray-400">Carbs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(totals.fat)}g</div>
                  <div className="text-xs text-gray-400">Fat</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saving Step */}
        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 size={32} className="text-emerald-500 animate-spin" />
            <span className="text-white">Saving meal...</span>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food"
                className="w-48 h-48 object-cover rounded-2xl opacity-50"
              />
            )}
            <div className="flex items-center gap-3 text-red-400 text-center">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer with action buttons */}
      {step === 'review' && (
        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
            >
              {inputMode === 'photo' ? 'Retake' : 'Back'}
            </button>
            <button
              onClick={handleSave}
              disabled={foodItems.length === 0}
              className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
