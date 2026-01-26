import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, User, Activity, Target, Scale, Check, Utensils, Camera, Sparkles, TrendingUp } from 'lucide-react'
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

type Step = 'welcome' | 'name' | 'basics' | 'body' | 'activity' | 'goal' | 'summary'

const STEPS: Step[] = ['welcome', 'name', 'basics', 'body', 'activity', 'goal', 'summary']

interface FormData {
  name: string
  age: number | null
  gender: 'male' | 'female' | null
  weight: number | null
  height: number | null
  heightFeet: number | null
  heightInches: number | null
  unitSystem: 'metric' | 'imperial'
  activityLevel: ActivityLevel | null
  goal: Goal | null
}

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: null,
    gender: null,
    weight: null,
    height: null,
    heightFeet: null,
    heightInches: null,
    unitSystem: 'imperial',
    activityLevel: null,
    goal: null,
  })

  const currentIndex = STEPS.indexOf(currentStep)
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === STEPS.length - 1

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'welcome':
        return true
      case 'name':
        return formData.name.trim().length >= 2
      case 'basics':
        return formData.age !== null && formData.age > 0 && formData.gender !== null
      case 'body':
        if (formData.weight === null || formData.weight <= 0) return false
        if (formData.unitSystem === 'imperial') {
          return formData.heightFeet !== null && formData.heightFeet >= 0
        }
        return formData.height !== null && formData.height > 0
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
    if (!formData.name || !formData.age || !formData.gender || !formData.weight || !formData.activityLevel || !formData.goal) {
      return
    }

    // Calculate total height in inches for imperial
    let heightValue: number
    if (formData.unitSystem === 'imperial') {
      if (formData.heightFeet === null) return
      heightValue = (formData.heightFeet * 12) + (formData.heightInches || 0)
    } else {
      if (formData.height === null) return
      heightValue = formData.height
    }

    setSaving(true)

    // Convert to metric for calculations
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

    const profile: Omit<Profile, 'created_at' | 'updated_at'> = {
      id: userId,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: heightValue,
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
    if (!formData.age || !formData.gender || !formData.weight || !formData.activityLevel || !formData.goal) {
      return null
    }

    let heightValue: number
    if (formData.unitSystem === 'imperial') {
      if (formData.heightFeet === null) return null
      heightValue = (formData.heightFeet * 12) + (formData.heightInches || 0)
    } else {
      if (formData.height === null) return null
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
        {currentStep === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Utensils size={40} className="text-emerald-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Welcome to MacroLens</h1>
            <p className="text-gray-400 mb-8">Your AI-powered nutrition companion</p>

            {/* Feature highlights */}
            <div className="w-full space-y-4 mb-8">
              <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera size={20} className="text-emerald-500" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Snap & Track</div>
                  <div className="text-gray-500 text-sm">Take a photo of your food and we'll do the rest</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-emerald-500" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">AI-Powered Analysis</div>
                  <div className="text-gray-500 text-sm">Get instant calories and macros with Gemini AI</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="text-emerald-500" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Personalized Goals</div>
                  <div className="text-gray-500 text-sm">Targets calculated from your BMR & TDEE</div>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Let's set up your profile to calculate your personalized nutrition targets
            </p>
          </div>
        )}

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
                      {unit === 'imperial' ? 'US (lbs, ft/in)' : 'Metric (kg, cm)'}
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
              {formData.unitSystem === 'imperial' ? (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Height</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.heightFeet ?? ''}
                          onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="5"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          min={1}
                          max={8}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">ft</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.heightInches ?? ''}
                          onChange={(e) => setFormData({ ...formData, heightInches: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="10"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          min={0}
                          max={11}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">in</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height ?? ''}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Enter height in centimeters"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    step="0.1"
                  />
                </div>
              )}
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
            {currentStep === 'welcome' ? "Let's Go" : 'Continue'}
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
