import { useState } from 'react'
import { X, Loader2, Settings as SettingsIcon, LogOut, Check } from 'lucide-react'
import { updateProfile } from '../services/profileService'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateDailyTargets,
  convertWeight,
  convertHeight,
  DEFAULT_MACRO_SPLITS,
  ACTIVITY_DESCRIPTIONS,
} from '../services/nutritionService'
import type { Profile, ActivityLevel, Goal } from '../types'

interface SettingsProps {
  profile: Profile
  onClose: () => void
  onProfileUpdated: (profile: Profile) => void
  onSignOut: () => void
}

interface FormData {
  name: string
  age: number
  gender: 'male' | 'female'
  weight: number
  height: number
  heightFeet: number
  heightInches: number
  unitSystem: 'metric' | 'imperial'
  activityLevel: ActivityLevel
  goal: Goal
}

export function Settings({ profile, onClose, onProfileUpdated, onSignOut }: SettingsProps) {
  const initialHeightFeet = profile.unit_system === 'imperial' && profile.height
    ? Math.floor(profile.height / 12)
    : 5
  const initialHeightInches = profile.unit_system === 'imperial' && profile.height
    ? profile.height % 12
    : 0

  const [formData, setFormData] = useState<FormData>({
    name: profile.name || '',
    age: profile.age || 25,
    gender: profile.gender || 'male',
    weight: profile.weight || 150,
    height: profile.height || 170,
    heightFeet: initialHeightFeet,
    heightInches: initialHeightInches,
    unitSystem: profile.unit_system,
    activityLevel: profile.activity_level || 'moderate',
    goal: profile.goal || 'maintain',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (newUnit === formData.unitSystem) return

    let newWeight = formData.weight
    let newHeight = formData.height
    let newHeightFeet = formData.heightFeet
    let newHeightInches = formData.heightInches

    if (newUnit === 'metric') {
      // Convert from imperial to metric
      newWeight = Math.round(convertWeight(formData.weight, 'lbs', 'kg') * 10) / 10
      const totalInches = formData.heightFeet * 12 + formData.heightInches
      newHeight = Math.round(convertHeight(totalInches, 'in', 'cm'))
    } else {
      // Convert from metric to imperial
      newWeight = Math.round(convertWeight(formData.weight, 'kg', 'lbs'))
      const totalInches = Math.round(convertHeight(formData.height, 'cm', 'in'))
      newHeightFeet = Math.floor(totalInches / 12)
      newHeightInches = totalInches % 12
    }

    setFormData({
      ...formData,
      unitSystem: newUnit,
      weight: newWeight,
      height: newHeight,
      heightFeet: newHeightFeet,
      heightInches: newHeightInches,
    })
  }

  const getCalculatedValues = () => {
    let heightValue: number
    if (formData.unitSystem === 'imperial') {
      heightValue = formData.heightFeet * 12 + formData.heightInches
    } else {
      heightValue = formData.height
    }

    const weightKg = formData.unitSystem === 'imperial'
      ? convertWeight(formData.weight, 'lbs', 'kg')
      : formData.weight
    const heightCm = formData.unitSystem === 'imperial'
      ? convertHeight(heightValue, 'in', 'cm')
      : heightValue

    const bmr = calculateBMR(weightKg, heightCm, formData.age, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activityLevel)
    const macroSplit = DEFAULT_MACRO_SPLITS[formData.goal]
    const targetCalories = calculateTargetCalories(tdee, formData.goal)
    const dailyTargets = calculateDailyTargets(targetCalories, macroSplit)

    return { bmr, tdee, macroSplit, dailyTargets }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Please enter your name')
      return
    }

    setSaving(true)
    setError(null)

    const { bmr, tdee, macroSplit, dailyTargets } = getCalculatedValues()
    const heightValue = formData.unitSystem === 'imperial'
      ? formData.heightFeet * 12 + formData.heightInches
      : formData.height

    try {
      const updated = await updateProfile(profile.id, {
        name: formData.name.trim(),
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: heightValue,
        unit_system: formData.unitSystem,
        activity_level: formData.activityLevel,
        goal: formData.goal,
        bmr,
        tdee,
        macro_split: macroSplit,
        daily_targets: dailyTargets,
      })
      onProfileUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      setSaving(false)
    }
  }

  const calculated = getCalculatedValues()

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <SettingsIcon size={20} className="text-emerald-500" />
          <h2 className="text-lg font-semibold text-white">Settings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6 max-w-lg mx-auto">
          {/* Profile Section */}
          <section>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Profile</h3>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    min={13}
                    max={120}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`flex-1 py-2 rounded-lg border transition-colors text-sm ${
                          formData.gender === g
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                            : 'bg-zinc-800 border-zinc-700 text-gray-400'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Body Measurements */}
          <section>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Body Measurements</h3>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Unit System</label>
                <div className="flex gap-2">
                  {(['imperial', 'metric'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => handleUnitChange(unit)}
                      className={`flex-1 py-2 rounded-lg border transition-colors text-sm ${
                        formData.unitSystem === unit
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                          : 'bg-zinc-800 border-zinc-700 text-gray-400'
                      }`}
                    >
                      {unit === 'imperial' ? 'US (lbs, ft/in)' : 'Metric (kg, cm)'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Weight ({formData.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  step={formData.unitSystem === 'imperial' ? '1' : '0.1'}
                />
              </div>
              {formData.unitSystem === 'imperial' ? (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={formData.heightFeet}
                        onChange={(e) => setFormData({ ...formData, heightFeet: parseInt(e.target.value) || 0 })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-8 text-white focus:outline-none focus:border-emerald-500"
                        min={1}
                        max={8}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ft</span>
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={formData.heightInches}
                        onChange={(e) => setFormData({ ...formData, heightInches: parseInt(e.target.value) || 0 })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-8 text-white focus:outline-none focus:border-emerald-500"
                        min={0}
                        max={11}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">in</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Activity & Goal */}
          <section>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Activity & Goal</h3>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Activity Level</label>
                <div className="space-y-2">
                  {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, activityLevel: level })}
                      className={`w-full text-left py-2 px-3 rounded-lg border transition-colors ${
                        formData.activityLevel === level
                          ? 'bg-emerald-500/20 border-emerald-500'
                          : 'bg-zinc-800 border-zinc-700'
                      }`}
                    >
                      <div className={`text-sm ${formData.activityLevel === level ? 'text-emerald-500' : 'text-white'}`}>
                        {level.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div className="text-xs text-gray-500">{ACTIVITY_DESCRIPTIONS[level]}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Goal</label>
                <div className="flex gap-2">
                  {([
                    { value: 'lose', label: 'Lose' },
                    { value: 'maintain', label: 'Maintain' },
                    { value: 'gain', label: 'Gain' },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, goal: option.value })}
                      className={`flex-1 py-2 rounded-lg border transition-colors text-sm ${
                        formData.goal === option.value
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                          : 'bg-zinc-800 border-zinc-700 text-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Calculated Targets Preview */}
          <section>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Daily Targets (Preview)</h3>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{calculated.dailyTargets.calories}</div>
                  <div className="text-xs text-gray-400">Calories</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{calculated.dailyTargets.protein}g</div>
                  <div className="text-xs text-gray-400">Protein</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{calculated.dailyTargets.carbs}g</div>
                  <div className="text-xs text-gray-400">Carbs</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{calculated.dailyTargets.fat}g</div>
                  <div className="text-xs text-gray-400">Fat</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-500/20 text-center text-xs text-gray-500">
                BMR: {calculated.bmr} | TDEE: {calculated.tdee}
              </div>
            </div>
          </section>

          {/* Sign Out */}
          <section>
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </section>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-3 max-w-lg mx-auto">
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
