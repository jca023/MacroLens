import { useState, useEffect } from 'react'
import {
  Utensils, Camera, Sparkles, TrendingUp, ChevronRight, ChevronDown,
  Scale, Users, SlidersHorizontal, PieChart, Check
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onTerms: () => void
  onPrivacy: () => void
}

const PAIN_POINTS = [
  {
    title: '10 Minutes to Log a Single Meal',
    body: 'Open the app. Search for chicken breast. Scroll through 47 results. Pick one. Guess the portion. Repeat for rice, broccoli, and that sauce you forgot the name of. No wonder 80% of people quit by week three.',
  },
  {
    title: 'Your Coach Says 40/40/20. Your App Says... Something Else.',
    body: "Generic calorie calculators don't match what real coaches prescribe. You end up tracking in one app and texting food photos to your coach in another.",
  },
  {
    title: '$20/Month for a Food Diary?',
    body: "MyFitnessPal just moved barcode scanning behind a paywall. Cronometer tracks 84 nutrients you don't need. You just want protein, carbs, fat, and calories without the sticker shock.",
  },
]

const STEPS = [
  { icon: Camera, title: 'Snap', description: 'Take a photo of your meal' },
  { icon: Sparkles, title: 'Track', description: 'AI identifies every item and calculates your macros' },
  { icon: TrendingUp, title: 'Achieve', description: 'Hit your daily targets with real-time progress tracking' },
]

const FEATURES = [
  { icon: Camera, title: 'AI Photo Logging', description: 'Snap your plate. Get calories, protein, carbs, and fat in seconds. Powered by Google Gemini.' },
  { icon: Scale, title: 'Snap Your Scale', description: 'Point your camera at any scale \u2014 digital or analog. AI reads the weight and logs it.' },
  { icon: Users, title: 'Coach Dashboard', description: 'Your coach sees your meals and progress in real time. No screenshots. No spreadsheets.' },
  { icon: SlidersHorizontal, title: 'Custom Macro Splits', description: 'Set exact protein/carbs/fat percentages. Your targets, your way \u2014 or let your coach decide.' },
  { icon: PieChart, title: 'Daily Progress', description: 'Calorie ring and macro progress cards show exactly where you stand, updated after every meal.' },
  { icon: Utensils, title: 'Food Library', description: 'Verified products including OPTAVIA Fuelings. Quick-log favorites without the camera.' },
]

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['50 AI snaps per month', 'Daily macro tracking', 'Calorie ring & progress cards', 'Custom macro splits'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Plus',
    price: '$4.99',
    period: '/month',
    description: 'For the serious tracker',
    features: ['150 AI snaps per month', 'Everything in Free', 'Coach connection', 'Scale photo reading', 'Food library access'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Everything, no limits',
    features: ['300 AI snaps per month', 'Everything in Plus', 'Priority AI processing', 'Export & analytics', 'Early access to features'],
    cta: 'Start Free Trial',
    popular: false,
  },
]

const FAQ_ITEMS = [
  {
    question: 'How accurate is the AI?',
    answer: 'MacroLens is powered by Google Gemini, one of the most capable AI models available. Research shows photo-based tracking has a ~16% error rate compared to 53% for manual estimation. You can always adjust portions after scanning.',
  },
  {
    question: 'Do I need to measure or weigh my food?',
    answer: "No. Just snap a photo of your plate as-is. The AI estimates portions visually. For packaged foods, you can also search our food library for exact nutrition data.",
  },
  {
    question: 'Can my nutrition coach see my meals?',
    answer: "Yes \u2014 coaches connect via invite code and see your meals, macros, and weight entries in real time. No more sending food diary screenshots.",
  },
  {
    question: "What's a cupcake?",
    answer: "Cupcakes are our fun credit system. 1 cupcake = 10 AI photo snaps. Free users get 5 cupcakes (50 snaps) per month. Need more? Upgrade to Plus or Pro, or grab a Snack Pack.",
  },
  {
    question: 'Does it work with OPTAVIA or other structured programs?',
    answer: "Yes. MacroLens includes verified OPTAVIA Fuelings in the food library, and custom macro splits let you match any program's targets exactly.",
  },
  {
    question: 'Can I cancel anytime?',
    answer: "Yes. No contracts, no fees. Downgrade to Free whenever you want and keep tracking your meals.",
  },
]

export function LandingPage({ onGetStarted, onTerms, onPrivacy }: LandingPageProps) {
  const [showNav, setShowNav] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowNav(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-page min-h-dvh">
      {/* Sticky Navigation */}
      <nav
        className={`landing-nav fixed top-0 left-0 right-0 z-50 border-b border-gray-200 transition-all duration-300 ${
          showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils size={20} className="text-[#F97066]" />
            <span className="font-bold text-lg text-[#1A1A1A]">MacroLens</span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm text-gray-500 hover:text-[#F97066] transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm text-gray-500 hover:text-[#F97066] transition-colors">Pricing</button>
            <button onClick={() => scrollTo('faq')} className="text-sm text-gray-500 hover:text-[#F97066] transition-colors">FAQ</button>
          </div>
          <button
            onClick={onGetStarted}
            className="btn-primary px-5 py-2 rounded-full text-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FEF2F1] to-white"></div>
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-20 sm:pt-28 sm:pb-28 text-center">
          {/* Logo */}
          <div className="relative inline-block mb-8 animate-scale-in">
            <div className="absolute inset-0 bg-[#F97066]/20 rounded-3xl blur-xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#F97066] to-[#E85A50] rounded-3xl flex items-center justify-center shadow-lg">
              <Utensils size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 animate-fade-in leading-tight">
            Track Your Macros,{' '}
            <span className="text-[#F97066]">In Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed">
            Snap a photo of your plate. AI breaks down the calories, protein, carbs, and fat instantly. No searching. No measuring. Just eat and track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <button
              onClick={onGetStarted}
              className="btn-primary px-8 py-4 rounded-full text-lg flex items-center gap-2"
            >
              Get Started Free
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="px-8 py-4 rounded-full text-lg border border-gray-300 text-gray-600 hover:border-[#F97066] hover:text-[#F97066] transition-colors"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-[#F9FAFB] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Tracking Shouldn't Feel Like <span className="text-[#F97066]">Homework</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Most nutrition apps make you work harder than your diet.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((point, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-hover animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">"{point.title}"</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Up and Running in <span className="text-[#F97066]">30 Seconds</span>
            </h2>
            <p className="text-lg text-gray-500">Three simple steps to start tracking.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[#FEF2F1] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon size={28} className="text-[#F97066]" />
                </div>
                <div className="text-sm font-semibold text-[#F97066] mb-2">Step {i + 1}</div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#F9FAFB] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Everything You Need, <span className="text-[#F97066]">Nothing You Don't</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Built for people who just want to track their food and hit their goals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-hover"
              >
                <div className="w-12 h-12 bg-[#FEF2F1] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon size={22} className="text-[#F97066]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Simple, <span className="text-[#F97066]">Honest</span> Pricing
            </h2>
            <p className="text-lg text-gray-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-6 border card-hover ${
                  tier.popular
                    ? 'border-[#F97066] shadow-lg shadow-[#F97066]/10 bg-white'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F97066] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{tier.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[#1A1A1A]">{tier.price}</span>
                    <span className="text-gray-400 text-sm">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={16} className="text-[#F97066] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    tier.popular
                      ? 'btn-primary'
                      : 'border border-gray-300 text-[#1A1A1A] hover:border-[#F97066] hover:text-[#F97066]'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#F9FAFB] py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-500">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-[#1A1A1A] pr-4">{item.question}</span>
                  <span className={`flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-gray-400" />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-5 pb-5 text-gray-500 leading-relaxed text-sm">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-[#F97066] to-[#E85A50] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to ditch the food diary?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Free to start. No credit card required.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-[#F97066] font-semibold px-8 py-4 rounded-full text-lg hover:shadow-lg hover:shadow-black/10 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            Get Started Free
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Utensils size={18} className="text-[#F97066]" />
                <span className="font-bold text-lg">MacroLens</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered macro tracking. Snap your food, hit your goals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-300 mb-3">Product</h4>
              <div className="space-y-2">
                <button onClick={() => scrollTo('features')} className="block text-sm text-gray-400 hover:text-[#F97066] transition-colors">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block text-sm text-gray-400 hover:text-[#F97066] transition-colors">Pricing</button>
                <button onClick={() => scrollTo('faq')} className="block text-sm text-gray-400 hover:text-[#F97066] transition-colors">FAQ</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-300 mb-3">Legal</h4>
              <div className="space-y-2">
                <button onClick={onTerms} className="block text-sm text-gray-400 hover:text-[#F97066] transition-colors">Terms of Service</button>
                <button onClick={onPrivacy} className="block text-sm text-gray-400 hover:text-[#F97066] transition-colors">Privacy Policy</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm">&copy; 2026 MacroLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
