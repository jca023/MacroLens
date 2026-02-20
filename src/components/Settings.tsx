import { useState } from 'react'
import { X, Loader2, Settings as SettingsIcon, LogOut, Check, Activity, Calculator, Users } from 'lucide-react'
import { updateProfile } from '../services/profileService'
import { CoachingSection } from './CoachingSection'
import { GetCoachForm } from './GetCoachForm'
import { InviteCodeEntry } from './InviteCodeEntry'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateDailyTargets,
  convertWeight,
  convertHeight,
  DEFAULT_MACRO_SPLIT,
  ACTIVITY_DESCRIPTIONS,
} from '../services/nutritionService'
import type { Profile, ActivityLevel, MacroSplit } from '../types'

interface SettingsProps {
  profile: Profile
  userEmail: string
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
  macroSplit: MacroSplit
}

export function Settings({ profile, userEmail, onClose, onProfileUpdated, onSignOut }: SettingsProps) {
  const [showGetCoachForm, setShowGetCoachForm] = useState(false)
  const [showInviteCodeEntry, setShowInviteCodeEntry] = useState(false)

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
    macroSplit: profile.macro_split || { ...DEFAULT_MACRO_SPLIT },
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
      newWeight = Math.round(convertWeight(formData.weight, 'lbs', 'kg') * 10) / 10
      const totalInches = formData.heightFeet * 12 + formData.heightInches
      newHeight = Math.round(convertHeight(totalInches, 'in', 'cm'))
    } else {
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
    const targetCalories = calculateTargetCalories(bmr, tdee)
    const dailyTargets = calculateDailyTargets(targetCalories, formData.macroSplit)

    return { bmr, tdee, dailyTargets }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Please enter your name')
      return
    }

    setSaving(true)
    setError(null)

    const { bmr, tdee, dailyTargets } = getCalculatedValues()
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
        goal: 'maintain',
        bmr,
        tdee,
        macro_split: formData.macroSplit,
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
    <div className="fixed inset-0 bg-[#1A1A1A]/98 z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <SettingsIcon size={20} className="text-[#F97066]" />
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Settings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
        >
          <X size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6 max-w-lg mx-auto">
          {/* Profile Section */}
          <section>
            <h3 className="text-sm font-medium text-[#A1A1A1] mb-3">Profile</h3>
            <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] space-y-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
                    min={13}
                    max={120}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all text-sm ${
                          formData.gender === g
                            ? 'bg-[#F97066]/10 border-[#F97066] text-[#F97066]'
                            : 'bg-[#333] border-[#404040] text-[#A1A1A1] hover:border-[#6B6B6B]'
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
            <h3 className="text-sm font-medium text-[#A1A1A1] mb-3">Body Measurements</h3>
            <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] space-y-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2">Unit System</label>
                <div className="flex gap-2">
                  {(['imperial', 'metric'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => handleUnitChange(unit)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all text-sm ${
                        formData.unitSystem === unit
                          ? 'bg-[#F97066]/10 border-[#F97066] text-[#F97066]'
                          : 'bg-[#333] border-[#404040] text-[#A1A1A1] hover:border-[#6B6B6B]'
                      }`}
                    >
                      {unit === 'imperial' ? 'US (lbs, ft/in)' : 'Metric (kg, cm)'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2">
                  Weight ({formData.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
                  step={formData.unitSystem === 'imperial' ? '1' : '0.1'}
                />
              </div>
              {formData.unitSystem === 'imperial' ? (
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2">Height</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={formData.heightFeet}
                        onChange={(e) => setFormData({ ...formData, heightFeet: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-3 pr-10 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
                        min={1}
                        max={8}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-sm">ft</span>
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={formData.heightInches}
                        onChange={(e) => setFormData({ ...formData, heightInches: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-3 pr-10 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
                        min={0}
                        max={11}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-sm">in</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Activity & Macro Split */}
          <section>
            <h3 className="text-sm font-medium text-[#A1A1A1] mb-3 flex items-center gap-2">
              <Activity size={16} />
              Activity & Macro Split
            </h3>
            <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] space-y-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2">Activity Level</label>
                <div className="space-y-2">
                  {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, activityLevel: level })}
                      className={`w-full text-left py-3 px-4 rounded-xl border-2 transition-all ${
                        formData.activityLevel === level
                          ? 'bg-[#F97066]/10 border-[#F97066]'
                          : 'bg-[#333] border-[#404040] hover:border-[#6B6B6B]'
                      }`}
                    >
                      <div className={`text-sm font-medium ${formData.activityLevel === level ? 'text-[#F97066]' : 'text-[#FAFAFA]'}`}>
                        {level.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div className="text-xs text-[#6B6B6B]">{ACTIVITY_DESCRIPTIONS[level]}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2">Macro Split</label>
                <div className="space-y-2">
                  {([
                    { key: 'protein' as const, label: 'Protein', color: 'text-[#F472B6]' },
                    { key: 'carbs' as const, label: 'Carbs', color: 'text-[#FBBF24]' },
                    { key: 'fat' as const, label: 'Fat', color: 'text-[#60A5FA]' },
                  ]).map((macro) => (
                    <div key={macro.key} className="flex items-center gap-3">
                      <span className={`text-sm font-medium w-16 ${macro.color}`}>{macro.label}</span>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={formData.macroSplit[macro.key]}
                          onChange={(e) => setFormData({
                            ...formData,
                            macroSplit: { ...formData.macroSplit, [macro.key]: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full bg-[#333] border border-[#404040] rounded-xl px-4 py-2.5 pr-8 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F97066] transition-colors"
                          min={0}
                          max={100}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-sm">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const total = formData.macroSplit.protein + formData.macroSplit.carbs + formData.macroSplit.fat
                  return (
                    <div className={`text-xs mt-2 text-right ${total === 100 ? 'text-[#6B6B6B]' : 'text-[#F87171]'}`}>
                      Total: {total}%{total !== 100 && ' — must equal 100%'}
                    </div>
                  )
                })()}
              </div>
            </div>
          </section>

          {/* Calculated Stats */}
          <section>
            <h3 className="text-sm font-medium text-[#A1A1A1] mb-3 flex items-center gap-2">
              <Calculator size={16} />
              Your Metabolism
            </h3>
            <div className="bg-[#262626] rounded-2xl p-4 border border-[#333]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-[#333] rounded-xl">
                  <div className="text-xs text-[#6B6B6B] mb-1">BMR</div>
                  <div className="text-xl font-bold text-[#FAFAFA]">{calculated.bmr}</div>
                  <div className="text-xs text-[#6B6B6B]">cal/day at rest</div>
                </div>
                <div className="text-center p-3 bg-[#333] rounded-xl">
                  <div className="text-xs text-[#6B6B6B] mb-1">TDEE</div>
                  <div className="text-xl font-bold text-[#FAFAFA]">{calculated.tdee}</div>
                  <div className="text-xs text-[#6B6B6B]">cal/day active</div>
                </div>
              </div>
              <p className="text-xs text-[#6B6B6B] text-center">
                BMR = Base Metabolic Rate (calories burned at rest)
                <br />
                TDEE = Total Daily Energy Expenditure (with activity)
              </p>
            </div>
          </section>

          {/* Daily Targets Preview */}
          <section>
            <h3 className="text-sm font-medium text-[#A1A1A1] mb-3">Daily Targets</h3>
            <div className="bg-gradient-to-br from-[#F97066]/15 to-[#FEB8B0]/10 border border-[#F97066]/20 rounded-2xl p-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-[#FAFAFA]">{calculated.dailyTargets.calories}</div>
                  <div className="text-xs text-[#A1A1A1]">Calories</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#F472B6]">{calculated.dailyTargets.protein}g</div>
                  <div className="text-xs text-[#A1A1A1]">Protein</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#FBBF24]">{calculated.dailyTargets.carbs}g</div>
                  <div className="text-xs text-[#A1A1A1]">Carbs</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#60A5FA]">{calculated.dailyTargets.fat}g</div>
                  <div className="text-xs text-[#A1A1A1]">Fat</div>
                </div>
              </div>
            </div>
          </section>

          {/* Coaching Section */}
          <section>
            <h3 className="text-sm font-medium text-[#A1A1A1] mb-3 flex items-center gap-2">
              <Users size={16} />
              Coaching
            </h3>
            <CoachingSection
              profile={profile}
              onRequestCoach={() => {
                // TODO: Show request coach modal
                alert('Request Coach: Enter your coach\'s email address to send a connection request.')
              }}
              onEnterCode={() => setShowInviteCodeEntry(true)}
              onGetCoach={() => setShowGetCoachForm(true)}
            />
          </section>

          {/* Sign Out */}
          <section>
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#262626] border border-[#333] rounded-2xl text-[#F87171] hover:bg-[#333] transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </section>

          {error && (
            <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-4 text-[#F87171] text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333]">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-[#262626] text-[#FAFAFA] rounded-2xl font-medium hover:bg-[#333] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 btn-primary rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Get Coach Form Modal */}
      {showGetCoachForm && (
        <GetCoachForm
          profile={profile}
          userEmail={userEmail}
          onClose={() => setShowGetCoachForm(false)}
        />
      )}

      {/* Invite Code Entry Modal */}
      {showInviteCodeEntry && (
        <InviteCodeEntry
          clientId={profile.id}
          clientEmail={userEmail}
          onClose={() => setShowInviteCodeEntry(false)}
          onSuccess={() => {
            setShowInviteCodeEntry(false)
            // Refresh the page to show updated connection status
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
