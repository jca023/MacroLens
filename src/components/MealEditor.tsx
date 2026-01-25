import { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { updateMeal } from '../services/mealService'
import type { Meal } from '../types'

interface MealEditorProps {
  meal: Meal
  onClose: () => void
  onMealUpdated: () => void
}

export function MealEditor({ meal, onClose, onMealUpdated }: MealEditorProps) {
  const [name, setName] = useState(meal.name)
  const [calories, setCalories] = useState(meal.nutrients.calories)
  const [protein, setProtein] = useState(meal.nutrients.protein)
  const [carbs, setCarbs] = useState(meal.nutrients.carbs)
  const [fat, setFat] = useState(meal.nutrients.fat)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a meal name')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateMeal(meal.id, {
        name: name.trim(),
        nutrients: {
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat)
        }
      })
      onMealUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meal')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Edit Meal</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Meal name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Meal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Nutrition inputs */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nutrition</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <h4 className="text-emerald-400 font-medium mb-2">Updated Nutrition</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(calories)}</div>
                <div className="text-xs text-gray-400">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(protein)}g</div>
                <div className="text-xs text-gray-400">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(carbs)}g</div>
                <div className="text-xs text-gray-400">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(fat)}g</div>
                <div className="text-xs text-gray-400">Fat</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
