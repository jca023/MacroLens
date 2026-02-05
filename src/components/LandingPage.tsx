import { Utensils, Camera, Sparkles, TrendingUp, ChevronRight } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onTerms: () => void
  onPrivacy: () => void
}

export function LandingPage({ onGetStarted, onTerms, onPrivacy }: LandingPageProps) {
  return (
    <div className="min-h-dvh bg-[#1A1A1A] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Logo with subtle glow */}
        <div className="relative mb-8 animate-scale-in">
          <div className="absolute inset-0 bg-[#F97066]/20 rounded-3xl blur-xl"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-[#F97066]/20 to-[#FEB8B0]/10 rounded-3xl flex items-center justify-center border border-[#F97066]/20">
            <Utensils size={48} className="text-[#F97066]" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#FAFAFA] mb-3 animate-fade-in">MacroLens</h1>
        <p className="text-xl text-[#A1A1A1] mb-2 animate-fade-in">Nutrition tracking, simplified</p>
        <p className="text-sm text-[#6B6B6B] mb-10 animate-fade-in">Snap a photo. Get your macros. Stay on track.</p>

        {/* Feature highlights */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          <FeatureCard
            icon={<Camera size={22} className="text-[#F97066]" />}
            title="Snap & Track"
            description="Take a photo of your meal and let AI do the counting"
            delay={100}
          />
          <FeatureCard
            icon={<Sparkles size={22} className="text-[#F97066]" />}
            title="AI-Powered Insights"
            description="Instant, accurate nutrition data powered by Gemini"
            delay={200}
          />
          <FeatureCard
            icon={<TrendingUp size={22} className="text-[#F97066]" />}
            title="Personalized Goals"
            description="Targets calculated just for you, based on your body"
            delay={300}
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pb-4">
        <button
          onClick={onGetStarted}
          className="w-full max-w-sm mx-auto btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-lg"
        >
          Get Started
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Footer Links */}
      <div className="p-4 pb-8 text-center">
        <p className="text-[#6B6B6B] text-sm">
          By continuing, you agree to our{' '}
          <button
            onClick={onTerms}
            className="text-[#A1A1A1] hover:text-[#F97066] underline underline-offset-2 transition-colors"
          >
            Terms of Service
          </button>
          {' '}and{' '}
          <button
            onClick={onPrivacy}
            className="text-[#A1A1A1] hover:text-[#F97066] underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div
      className="flex items-center gap-4 bg-[#262626] rounded-2xl p-4 border border-[#333] card-hover animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-[#F97066]/10 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-[#FAFAFA] font-semibold">{title}</div>
        <div className="text-[#A1A1A1] text-sm">{description}</div>
      </div>
    </div>
  )
}
