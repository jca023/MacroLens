import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, User, Activity, Target, Scale, Check } from 'lucide-react'
import type { ActivityLevel, Goal, Profile } from '../types'
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

interface OnboardingProps {
  userId: string
  onComplete: (profile: Omit<Profile, 'created_at' | 'updated_at'>) => Promise<void>
}

type Step = 'name' | 'basics' | 'body' | 'activity' | 'goal' | 'summary'

const STEPS: Step[] = ['name', 'basics', 'body', 'activity', 'goal', 'summary']

interface FormData {
  name: string
  age: number | null
  gender: 'male' | 'female' | null
  weight: number | null
  height: number | null
  unitSystem: 'metric' | 'imperial'
  activityLevel: ActivityLevel | null
  goal: Goal | null
}

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<Step>('name')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: null,
    gender: null,
    weight: null,
    height: null,
    unitSystem: 'imperial',
    activityLevel: null,
    goal: null,
  })

  const currentIndex = STEPS.indexOf(currentStep)
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === STEPS.length - 1

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'name':
        return formData.name.trim().length >= 2
      case 'basics':
        return formData.age !== null && formData.age > 0 && formData.gender !== null
      case 'body':
        return formData.weight !== null && formData.weight > 0 && formData.height !== null && formData.height > 0
      case 'activity':
        return formData.activityLevel !== null
      case 'goal':
        return formData.goal !== null
      case 'summary':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    }
  }

  const handleComplete = async () => {
    if (!formData.name || !formData.age || !formData.gender || !formData.weight || !formData.height || !formData.activityLevel || !formData.goal) {
      return
    }

    setSaving(true)

    // Convert to metric for calculations
    const weightKg = formData.unitSystem === 'imperial'
      ? convertWeight(formData.weight, 'lbs', 'kg')
      : formData.weight
    const heightCm = formData.unitSystem === 'imperial'
      ? convertHeight(formData.height, 'in', 'cm')
      : formData.height

    const bmr = calculateBMR(weightKg, heightCm, formData.age, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activityLevel)
    const macroSplit = DEFAULT_MACRO_SPLITS[formData.goal]
    const targetCalories = calculateTargetCalories(tdee, formData.goal)
    const dailyTargets = calculateDailyTargets(targetCalories, macroSplit)

    const profile: Omit<Profile, 'created_at' | 'updated_at'> = {
      id: userId,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: formData.height,
      activity_level: formData.activityLevel,
      goal: formData.goal,
      unit_system: formData.unitSystem,
      show_ingredient_race: true,
      macro_split: macroSplit,
      bmr,
      tdee,
      daily_targets: dailyTargets,
      subscription_tier: 'free',
      usage_stats: {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalImagesProcessed: 0,
        estimatedCostUSD: 0,
      },
    }

    try {
      await onComplete(profile)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSaving(false)
    }
  }

  // Calculate preview values for summary
  const getPreviewValues = () => {
    if (!formData.age || !formData.gender || !formData.weight || !formData.height || !formData.activityLevel || !formData.goal) {
      return null
    }

    const weightKg = formData.unitSystem === 'imperial'
      ? convertWeight(formData.weight, 'lbs', 'kg')
      : formData.weight
    const heightCm = formData.unitSystem === 'imperial'
      ? convertHeight(formData.height, 'in', 'cm')
      : formData.height

    const bmr = calculateBMR(weightKg, heightCm, formData.age, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activityLevel)
    const macroSplit = DEFAULT_MACRO_SPLITS[formData.goal]
    const targetCalories = calculateTargetCalories(tdee, formData.goal)
    const dailyTargets = calculateDailyTargets(targetCalories, macroSplit)

    return { bmr, tdee, dailyTargets, macroSplit }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* Progress bar */}
      <div className="p-4">
        <div className="flex gap-1">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentIndex ? 'bg-emerald-500' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        {currentStep === 'name' && (
          <StepContent
            icon={<User size={32} />}
            title="What's your name?"
            subtitle="Let's personalize your experience"
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-4 px-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </StepContent>
        )}

        {currentStep === 'basics' && (
          <StepContent
            icon={<User size={32} />}
            title="Basic Information"
            subtitle="This helps us calculate your metabolism"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age ?? ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Enter your age"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  min={13}
                  max={120}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-3 px-4 rounded-xl border transition-colors ${
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
          </StepContent>
        )}

        {currentStep === 'body' && (
          <StepContent
            icon={<Scale size={32} />}
            title="Body Measurements"
            subtitle="Used to calculate your daily calorie needs"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Unit System</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['imperial', 'metric'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setFormData({ ...formData, unitSystem: unit })}
                      className={`py-2 px-4 rounded-xl border transition-colors text-sm ${
                        formData.unitSystem === unit
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                          : 'bg-zinc-800 border-zinc-700 text-gray-400'
                      }`}
                    >
                      {unit === 'imperial' ? 'US (lbs, in)' : 'Metric (kg, cm)'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Weight ({formData.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  value={formData.weight ?? ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder={`Enter weight in ${formData.unitSystem === 'imperial' ? 'pounds' : 'kilograms'}`}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Height ({formData.unitSystem === 'imperial' ? 'inches' : 'cm'})
                </label>
                <input
                  type="number"
                  value={formData.height ?? ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder={`Enter height in ${formData.unitSystem === 'imperial' ? 'inches (e.g., 70)' : 'centimeters'}`}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  step="0.1"
                />
                {formData.unitSystem === 'imperial' && formData.height && (
                  <p className="text-gray-500 text-xs mt-1">
                    {Math.floor(formData.height / 12)}'{Math.round(formData.height % 12)}"
                  </p>
                )}
              </div>
            </div>
          </StepContent>
        )}

        {currentStep === 'activity' && (
          <StepContent
            icon={<Activity size={32} />}
            title="Activity Level"
            subtitle="How active are you on a typical week?"
          >
            <div className="space-y-3">
              {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, activityLevel: level })}
                  className={`w-full text-left py-3 px-4 rounded-xl border transition-colors ${
                    formData.activityLevel === level
                      ? 'bg-emerald-500/20 border-emerald-500'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  <div className={formData.activityLevel === level ? 'text-emerald-500' : 'text-white'}>
                    {level.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                  <div className="text-gray-500 text-sm">{ACTIVITY_DESCRIPTIONS[level]}</div>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {currentStep === 'goal' && (
          <StepContent
            icon={<Target size={32} />}
            title="What's your goal?"
            subtitle="We'll adjust your calories accordingly"
          >
            <div className="space-y-3">
              {([
                { value: 'lose', label: 'Lose Weight', desc: '500 calorie deficit' },
                { value: 'maintain', label: 'Maintain Weight', desc: 'Match your TDEE' },
                { value: 'gain', label: 'Build Muscle', desc: '300 calorie surplus' },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, goal: option.value })}
                  className={`w-full text-left py-4 px-4 rounded-xl border transition-colors ${
                    formData.goal === option.value
                      ? 'bg-emerald-500/20 border-emerald-500'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  <div className={formData.goal === option.value ? 'text-emerald-500 font-semibold' : 'text-white'}>
                    {option.label}
                  </div>
                  <div className="text-gray-500 text-sm">{option.desc}</div>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {currentStep === 'summary' && (
          <StepContent
            icon={<Check size={32} />}
            title="Your Plan"
            subtitle={`Great job, ${formData.name}! Here's your personalized plan`}
          >
            {(() => {
              const preview = getPreviewValues()
              if (!preview) return null

              return (
                <div className="space-y-4">
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Daily Calories</div>
                    <div className="text-3xl font-bold text-emerald-500">
                      {preview.dailyTargets.calories.toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs">
                      BMR: {preview.bmr} | TDEE: {preview.tdee}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-800 rounded-xl p-3 text-center">
                      <div className="text-gray-400 text-xs mb-1">Protein</div>
                      <div className="text-xl font-bold text-white">{preview.dailyTargets.protein}g</div>
                      <div className="text-gray-500 text-xs">{preview.macroSplit.protein}%</div>
                    </div>
                    <div className="bg-zinc-800 rounded-xl p-3 text-center">
                      <div className="text-gray-400 text-xs mb-1">Carbs</div>
                      <div className="text-xl font-bold text-white">{preview.dailyTargets.carbs}g</div>
                      <div className="text-gray-500 text-xs">{preview.macroSplit.carbs}%</div>
                    </div>
                    <div className="bg-zinc-800 rounded-xl p-3 text-center">
                      <div className="text-gray-400 text-xs mb-1">Fat</div>
                      <div className="text-xl font-bold text-white">{preview.dailyTargets.fat}g</div>
                      <div className="text-gray-500 text-xs">{preview.macroSplit.fat}%</div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </StepContent>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        {!isFirstStep && (
          <button
            onClick={goBack}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-gray-400 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed() || saving}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-semibold flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Get Started
                <ChevronRight size={20} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-semibold flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  )
}

interface StepContentProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}

function StepContent({ icon, title, subtitle, children }: StepContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-emerald-500 mb-4">{icon}</div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-400 mb-6">{subtitle}</p>
      <div className="flex-1">{children}</div>
    </div>
  )
}
