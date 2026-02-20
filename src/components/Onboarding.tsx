import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, User, Activity, Scale, Check, Utensils, Camera, Sparkles, TrendingUp } from 'lucide-react'
import type { ActivityLevel, Profile } from '../types'
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

interface OnboardingProps {
  userId: string
  onComplete: (profile: Omit<Profile, 'created_at' | 'updated_at'>) => Promise<void>
}

type Step = 'welcome' | 'basics' | 'body' | 'activity' | 'summary'

const STEPS: Step[] = ['welcome', 'basics', 'body', 'activity', 'summary']

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
  })

  const currentIndex = STEPS.indexOf(currentStep)
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === STEPS.length - 1

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'welcome':
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
    if (!formData.name || !formData.age || !formData.gender || !formData.weight || !formData.activityLevel) {
      return
    }

    let heightValue: number
    if (formData.unitSystem === 'imperial') {
      if (formData.heightFeet === null) return
      heightValue = (formData.heightFeet * 12) + (formData.heightInches || 0)
    } else {
      if (formData.height === null) return
      heightValue = formData.height
    }

    setSaving(true)

    const weightKg = formData.unitSystem === 'imperial'
      ? convertWeight(formData.weight, 'lbs', 'kg')
      : formData.weight
    const heightCm = formData.unitSystem === 'imperial'
      ? convertHeight(heightValue, 'in', 'cm')
      : heightValue

    const bmr = calculateBMR(weightKg, heightCm, formData.age, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activityLevel)
    const targetCalories = calculateTargetCalories(bmr, tdee)
    const dailyTargets = calculateDailyTargets(targetCalories, DEFAULT_MACRO_SPLIT)

    const profile: Omit<Profile, 'created_at' | 'updated_at'> = {
      id: userId,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: heightValue,
      activity_level: formData.activityLevel,
      goal: 'maintain',
      unit_system: formData.unitSystem,
      show_ingredient_race: true,
      macro_split: DEFAULT_MACRO_SPLIT,
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

  const getPreviewValues = () => {
    if (!formData.age || !formData.gender || !formData.weight || !formData.activityLevel) {
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
    const targetCalories = calculateTargetCalories(bmr, tdee)
    const dailyTargets = calculateDailyTargets(targetCalories, DEFAULT_MACRO_SPLIT)

    return { bmr, tdee, dailyTargets }
  }

  return (
    <div className="min-h-dvh bg-[#1A1A1A] flex flex-col">
      {/* Progress dots */}
      <div className="p-6 pb-2">
        <div className="flex justify-center gap-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#F97066] w-6'
                  : index < currentIndex
                    ? 'bg-[#F97066]'
                    : 'bg-[#333]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        {currentStep === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center animate-fade-in max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F97066]/20 rounded-2xl blur-xl"></div>
                <div className="relative w-16 h-16 bg-[#F97066]/10 rounded-2xl flex items-center justify-center border border-[#F97066]/20">
                  <Utensils size={32} className="text-[#F97066]" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#FAFAFA] text-center mb-2">Welcome to MacroLens</h1>
            <p className="text-[#A1A1A1] text-center mb-8">Let's set up your personalized nutrition plan</p>

            {/* Feature highlights - more compact */}
            <div className="space-y-3 mb-8">
              <MiniFeature icon={<Camera size={18} />} text="Snap photos to log meals instantly" />
              <MiniFeature icon={<Sparkles size={18} />} text="AI analyzes your food automatically" />
              <MiniFeature icon={<TrendingUp size={18} />} text="Track progress toward your goals" />
            </div>

            {/* Name input integrated into welcome */}
            <div>
              <label className="block text-[#A1A1A1] text-sm mb-2">What should we call you?</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full bg-[#262626] border border-[#333] rounded-2xl py-4 px-4 text-[#FAFAFA] text-lg placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}

        {currentStep === 'basics' && (
          <StepContent
            icon={<User size={28} />}
            title={`Nice to meet you, ${formData.name}!`}
            subtitle="A few quick details to personalize your plan"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-[#A1A1A1] text-sm mb-2">How old are you?</label>
                <input
                  type="number"
                  value={formData.age ?? ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Age"
                  className="w-full bg-[#262626] border border-[#333] rounded-2xl py-4 px-4 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors"
                  min={13}
                  max={120}
                />
              </div>
              <div>
                <label className="block text-[#A1A1A1] text-sm mb-2">What's your biological sex?</label>
                <p className="text-[#6B6B6B] text-xs mb-3">Used to calculate your metabolism</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-4 px-4 rounded-2xl border-2 transition-all ${
                        formData.gender === g
                          ? 'bg-[#F97066]/10 border-[#F97066] text-[#F97066]'
                          : 'bg-[#262626] border-[#333] text-[#A1A1A1] hover:border-[#404040]'
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
            icon={<Scale size={28} />}
            title="Body measurements"
            subtitle="This helps us calculate your daily calorie needs"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-[#A1A1A1] text-sm mb-2">Preferred units</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['imperial', 'metric'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setFormData({ ...formData, unitSystem: unit })}
                      className={`py-3 px-4 rounded-xl border-2 transition-all text-sm ${
                        formData.unitSystem === unit
                          ? 'bg-[#F97066]/10 border-[#F97066] text-[#F97066]'
                          : 'bg-[#262626] border-[#333] text-[#A1A1A1] hover:border-[#404040]'
                      }`}
                    >
                      {unit === 'imperial' ? 'US (lbs, ft)' : 'Metric (kg, cm)'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[#A1A1A1] text-sm mb-2">
                  Weight ({formData.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  value={formData.weight ?? ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder={formData.unitSystem === 'imperial' ? '150' : '68'}
                  className="w-full bg-[#262626] border border-[#333] rounded-2xl py-4 px-4 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors"
                  step="0.1"
                />
              </div>
              {formData.unitSystem === 'imperial' ? (
                <div>
                  <label className="block text-[#A1A1A1] text-sm mb-2">Height</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.heightFeet ?? ''}
                          onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="5"
                          className="w-full bg-[#262626] border border-[#333] rounded-2xl py-4 px-4 pr-12 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors"
                          min={1}
                          max={8}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">ft</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.heightInches ?? ''}
                          onChange={(e) => setFormData({ ...formData, heightInches: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="10"
                          className="w-full bg-[#262626] border border-[#333] rounded-2xl py-4 px-4 pr-12 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors"
                          min={0}
                          max={11}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">in</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[#A1A1A1] text-sm mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height ?? ''}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="170"
                    className="w-full bg-[#262626] border border-[#333] rounded-2xl py-4 px-4 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </StepContent>
        )}

        {currentStep === 'activity' && (
          <StepContent
            icon={<Activity size={28} />}
            title="Activity level"
            subtitle="Almost there! Just one more choice"
          >
            <div>
              <label className="block text-[#A1A1A1] text-sm mb-3">How active are you?</label>
              <div className="space-y-2">
                {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, activityLevel: level })}
                    className={`w-full text-left py-3 px-4 rounded-xl border-2 transition-all ${
                      formData.activityLevel === level
                        ? 'bg-[#F97066]/10 border-[#F97066]'
                        : 'bg-[#262626] border-[#333] hover:border-[#404040]'
                    }`}
                  >
                    <div className={`font-medium ${formData.activityLevel === level ? 'text-[#F97066]' : 'text-[#FAFAFA]'}`}>
                      {level.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                    <div className="text-[#6B6B6B] text-sm">{ACTIVITY_DESCRIPTIONS[level]}</div>
                  </button>
                ))}
              </div>
            </div>
          </StepContent>
        )}

        {currentStep === 'summary' && (
          <StepContent
            icon={<Check size={28} />}
            title="Your personalized plan"
            subtitle={`Here's what we've calculated for you, ${formData.name}`}
          >
            {(() => {
              const preview = getPreviewValues()
              if (!preview) return null

              return (
                <div className="space-y-4">
                  {/* Daily calories - hero card */}
                  <div className="bg-gradient-to-br from-[#F97066]/20 to-[#FEB8B0]/10 rounded-3xl p-6 border border-[#F97066]/20">
                    <div className="text-[#A1A1A1] text-sm mb-1">Daily Calorie Target</div>
                    <div className="text-5xl font-bold text-[#FAFAFA] mb-1">
                      {preview.dailyTargets.calories.toLocaleString()}
                    </div>
                    <div className="text-[#F97066]">calories per day</div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-3">
                    <MacroPreview label="Protein" value={preview.dailyTargets.protein} color="#F472B6" />
                    <MacroPreview label="Carbs" value={preview.dailyTargets.carbs} color="#FBBF24" />
                    <MacroPreview label="Fat" value={preview.dailyTargets.fat} color="#60A5FA" />
                  </div>

                  <p className="text-[#6B6B6B] text-sm text-center pt-2">
                    You can adjust these anytime in settings
                  </p>
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
            className="flex-1 py-4 px-4 rounded-2xl border border-[#333] text-[#A1A1A1] flex items-center justify-center gap-2 hover:bg-[#262626] transition-colors"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed() || saving}
            className="flex-1 py-4 px-4 rounded-2xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating plan...
              </>
            ) : (
              <>
                Start Tracking
                <ChevronRight size={20} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="flex-1 py-4 px-4 rounded-2xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    <div className="flex-1 flex flex-col animate-fade-in">
      <div className="text-[#F97066] mb-4">{icon}</div>
      <h1 className="text-2xl font-bold text-[#FAFAFA] mb-2">{title}</h1>
      <p className="text-[#A1A1A1] mb-6">{subtitle}</p>
      <div className="flex-1">{children}</div>
    </div>
  )
}

interface MiniFeatureProps {
  icon: React.ReactNode
  text: string
}

function MiniFeature({ icon, text }: MiniFeatureProps) {
  return (
    <div className="flex items-center gap-3 text-[#A1A1A1]">
      <div className="text-[#F97066]">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

interface MacroPreviewProps {
  label: string
  value: number
  color: string
}

function MacroPreview({ label, value, color }: MacroPreviewProps) {
  return (
    <div className="bg-[#262626] rounded-2xl p-4 text-center border border-[#333]">
      <div className="text-2xl font-bold text-[#FAFAFA]">{value}g</div>
      <div className="text-sm" style={{ color }}>{label}</div>
    </div>
  )
}
