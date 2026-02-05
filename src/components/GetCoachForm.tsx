import { useState } from 'react'
import { ArrowLeft, Target, Scale, Phone, Clock, MessageSquare, Loader2, Check } from 'lucide-react'
import type { Profile, LeadGoal, LeadWeightRange, LeadContactTime } from '../types'
import { submitCoachingLead, hasRecentLead } from '../services/leadService'

interface GetCoachFormProps {
  profile: Profile
  userEmail: string
  onClose: () => void
}

type Step = 'goal' | 'weight' | 'contact' | 'time' | 'message' | 'submitting' | 'success'

export function GetCoachForm({ profile, userEmail, onClose }: GetCoachFormProps) {
  const [step, setStep] = useState<Step>('goal')
  const [formData, setFormData] = useState({
    goal: '' as LeadGoal | '',
    weightRange: '' as LeadWeightRange | '',
    contactPreference: [] as string[],
    bestTime: '' as LeadContactTime | '',
    message: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleGoalSelect = (goal: LeadGoal) => {
    setFormData({ ...formData, goal })
    setStep('weight')
  }

  const handleWeightSelect = (range: LeadWeightRange) => {
    setFormData({ ...formData, weightRange: range })
    setStep('contact')
  }

  const handleContactToggle = (pref: string) => {
    const prefs = formData.contactPreference.includes(pref)
      ? formData.contactPreference.filter((p) => p !== pref)
      : [...formData.contactPreference, pref]
    setFormData({ ...formData, contactPreference: prefs })
  }

  const handleTimeSelect = (time: LeadContactTime) => {
    setFormData({ ...formData, bestTime: time })
    setStep('message')
  }

  const handleSubmit = async () => {
    if (!formData.goal || !formData.weightRange || !formData.bestTime) {
      setError('Please complete all required fields')
      return
    }

    if (formData.contactPreference.length === 0) {
      setError('Please select at least one contact preference')
      return
    }

    setStep('submitting')
    setError(null)

    try {
      // Check for recent submission
      const hasRecent = await hasRecentLead(profile.id)
      if (hasRecent) {
        setError("You've already submitted a request recently. We'll be in touch soon!")
        setStep('message')
        return
      }

      await submitCoachingLead({
        user_id: profile.id,
        goal: formData.goal as LeadGoal,
        weight_range: formData.weightRange as LeadWeightRange,
        contact_preference: formData.contactPreference,
        best_time: formData.bestTime as LeadContactTime,
        message: formData.message || null,
        status: 'new',
      })

      setStep('success')
    } catch (err) {
      console.error('Error submitting lead:', err)
      setError('Failed to submit request. Please try again.')
      setStep('message')
    }
  }

  const goBack = () => {
    switch (step) {
      case 'weight':
        setStep('goal')
        break
      case 'contact':
        setStep('weight')
        break
      case 'time':
        setStep('contact')
        break
      case 'message':
        setStep('time')
        break
    }
  }

  const canGoBack = ['weight', 'contact', 'time', 'message'].includes(step)

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-[#333]">
        {canGoBack ? (
          <button
            onClick={goBack}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Get a Coach</h2>
          <p className="text-[#6B6B6B] text-sm">Tell us about your goals</p>
        </div>
      </header>

      {/* Progress dots */}
      {!['submitting', 'success'].includes(step) && (
        <div className="flex justify-center gap-2 py-4">
          {['goal', 'weight', 'contact', 'time', 'message'].map((s, index) => {
            const currentIndex = ['goal', 'weight', 'contact', 'time', 'message'].indexOf(step)
            return (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentIndex ? 'bg-[#F97066]' : 'bg-[#333]'
                }`}
              />
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-lg mx-auto">
          {error && (
            <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-4 text-[#F87171] text-sm mb-4">
              {error}
            </div>
          )}

          {step === 'goal' && <GoalStep onSelect={handleGoalSelect} selected={formData.goal} />}
          {step === 'weight' && (
            <WeightStep onSelect={handleWeightSelect} selected={formData.weightRange} />
          )}
          {step === 'contact' && (
            <ContactStep
              selected={formData.contactPreference}
              onToggle={handleContactToggle}
              onNext={() => setStep('time')}
            />
          )}
          {step === 'time' && <TimeStep onSelect={handleTimeSelect} selected={formData.bestTime} />}
          {step === 'message' && (
            <MessageStep
              value={formData.message}
              onChange={(message) => setFormData({ ...formData, message })}
              onSubmit={handleSubmit}
              profile={profile}
              userEmail={userEmail}
            />
          )}
          {step === 'submitting' && <SubmittingStep />}
          {step === 'success' && <SuccessStep onClose={onClose} />}
        </div>
      </div>
    </div>
  )
}

interface GoalStepProps {
  onSelect: (goal: LeadGoal) => void
  selected: LeadGoal | ''
}

function GoalStep({ onSelect, selected }: GoalStepProps) {
  const options: { value: LeadGoal; label: string; description: string }[] = [
    { value: 'lose', label: 'Lose Weight', description: 'I want to shed some pounds' },
    { value: 'maintain', label: 'Maintain Weight', description: 'Keep my current weight' },
    { value: 'gain', label: 'Gain Weight', description: 'Build muscle or gain mass' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#F97066]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target size={28} className="text-[#F97066]" />
        </div>
        <h3 className="text-xl font-semibold text-[#FAFAFA]">What's your goal?</h3>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selected === option.value
                ? 'bg-[#F97066]/10 border-[#F97066]'
                : 'bg-[#262626] border-[#333] hover:border-[#F97066]/50'
            }`}
          >
            <div
              className={`font-medium ${
                selected === option.value ? 'text-[#F97066]' : 'text-[#FAFAFA]'
              }`}
            >
              {option.label}
            </div>
            <div className="text-[#6B6B6B] text-sm">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface WeightStepProps {
  onSelect: (range: LeadWeightRange) => void
  selected: LeadWeightRange | ''
}

function WeightStep({ onSelect, selected }: WeightStepProps) {
  const options: { value: LeadWeightRange; label: string }[] = [
    { value: '10-20', label: '10-20 lbs' },
    { value: '20-40', label: '20-40 lbs' },
    { value: '40-60', label: '40-60 lbs' },
    { value: '60+', label: '60+ lbs' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#60A5FA]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Scale size={28} className="text-[#60A5FA]" />
        </div>
        <h3 className="text-xl font-semibold text-[#FAFAFA]">How much do you want to change?</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selected === option.value
                ? 'bg-[#60A5FA]/10 border-[#60A5FA]'
                : 'bg-[#262626] border-[#333] hover:border-[#60A5FA]/50'
            }`}
          >
            <div
              className={`font-medium text-center ${
                selected === option.value ? 'text-[#60A5FA]' : 'text-[#FAFAFA]'
              }`}
            >
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface ContactStepProps {
  selected: string[]
  onToggle: (pref: string) => void
  onNext: () => void
}

function ContactStep({ selected, onToggle, onNext }: ContactStepProps) {
  const options = [
    { value: 'call', label: 'Phone Call' },
    { value: 'text', label: 'Text Message' },
    { value: 'email', label: 'Email' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#4ADE80]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone size={28} className="text-[#4ADE80]" />
        </div>
        <h3 className="text-xl font-semibold text-[#FAFAFA]">How can we reach you?</h3>
        <p className="text-[#6B6B6B] text-sm mt-1">Select all that apply</p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onToggle(option.value)}
            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
              selected.includes(option.value)
                ? 'bg-[#4ADE80]/10 border-[#4ADE80]'
                : 'bg-[#262626] border-[#333] hover:border-[#4ADE80]/50'
            }`}
          >
            <span
              className={`font-medium ${
                selected.includes(option.value) ? 'text-[#4ADE80]' : 'text-[#FAFAFA]'
              }`}
            >
              {option.label}
            </span>
            {selected.includes(option.value) && <Check size={20} className="text-[#4ADE80]" />}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={selected.length === 0}
        className="w-full mt-6 py-4 btn-primary rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  )
}

interface TimeStepProps {
  onSelect: (time: LeadContactTime) => void
  selected: LeadContactTime | ''
}

function TimeStep({ onSelect, selected }: TimeStepProps) {
  const options: { value: LeadContactTime; label: string; description: string }[] = [
    { value: 'morning', label: 'Morning', description: '8am - 12pm' },
    { value: 'afternoon', label: 'Afternoon', description: '12pm - 5pm' },
    { value: 'evening', label: 'Evening', description: '5pm - 9pm' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#FBBF24]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock size={28} className="text-[#FBBF24]" />
        </div>
        <h3 className="text-xl font-semibold text-[#FAFAFA]">Best time to contact?</h3>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selected === option.value
                ? 'bg-[#FBBF24]/10 border-[#FBBF24]'
                : 'bg-[#262626] border-[#333] hover:border-[#FBBF24]/50'
            }`}
          >
            <div
              className={`font-medium ${
                selected === option.value ? 'text-[#FBBF24]' : 'text-[#FAFAFA]'
              }`}
            >
              {option.label}
            </div>
            <div className="text-[#6B6B6B] text-sm">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface MessageStepProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  profile: Profile
  userEmail: string
}

function MessageStep({ value, onChange, onSubmit, profile, userEmail }: MessageStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#F472B6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={28} className="text-[#F472B6]" />
        </div>
        <h3 className="text-xl font-semibold text-[#FAFAFA]">Almost done!</h3>
        <p className="text-[#6B6B6B] text-sm mt-1">Add a message (optional)</p>
      </div>

      {/* Pre-filled info */}
      <div className="bg-[#262626] rounded-xl p-4 border border-[#333] space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#6B6B6B]">Name</span>
          <span className="text-[#FAFAFA]">{profile.name || 'Not set'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6B6B6B]">Email</span>
          <span className="text-[#FAFAFA]">{userEmail}</span>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell us a bit about yourself and what you're looking for in a coach..."
        className="w-full bg-[#262626] border border-[#333] rounded-xl px-4 py-3 text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#F97066] transition-colors resize-none h-32"
      />

      <button
        onClick={onSubmit}
        className="w-full py-4 btn-primary rounded-xl font-medium"
      >
        Submit Request
      </button>
    </div>
  )
}

function SubmittingStep() {
  return (
    <div className="text-center py-12">
      <Loader2 size={48} className="text-[#F97066] animate-spin mx-auto mb-4" />
      <p className="text-[#FAFAFA] font-medium">Submitting your request...</p>
    </div>
  )
}

function SuccessStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-12 animate-scale-in">
      <div className="w-20 h-20 bg-[#4ADE80]/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={40} className="text-[#4ADE80]" />
      </div>
      <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">Request Submitted!</h3>
      <p className="text-[#A1A1A1] mb-6">
        A coach will reach out to you within 24-48 hours.
      </p>
      <button onClick={onClose} className="px-8 py-3 btn-primary rounded-xl font-medium">
        Done
      </button>
    </div>
  )
}
