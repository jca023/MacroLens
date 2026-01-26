import { Utensils, Camera, Sparkles, TrendingUp, ChevronRight } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-8">
          <Utensils size={48} className="text-emerald-500" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">MacroLens</h1>
        <p className="text-xl text-gray-400 mb-8">Your AI-powered nutrition companion</p>

        {/* Feature highlights */}
        <div className="w-full max-w-sm space-y-4 mb-10">
          <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Camera size={24} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Snap & Track</div>
              <div className="text-gray-500 text-sm">Take a photo of your food and we'll do the rest</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">AI-Powered Analysis</div>
              <div className="text-gray-500 text-sm">Instant calories and macros with Gemini AI</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Personalized Goals</div>
              <div className="text-gray-500 text-sm">Custom targets based on your BMR & TDEE</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pb-10">
        <button
          onClick={onGetStarted}
          className="w-full max-w-sm mx-auto bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
        >
          Get Started
          <ChevronRight size={24} />
        </button>
        <p className="text-gray-600 text-xs mt-4 text-center">
          Free to use. No credit card required.
        </p>
      </div>
    </div>
  )
}
