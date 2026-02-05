import { Users, Eye, Scale, MessageSquare, Crown, ArrowLeft } from 'lucide-react'
import { COACH_TIER_PRICES } from '../types'

interface CoachTeaserProps {
  onClose: () => void
  onSubscribe: () => void
}

export function CoachTeaser({ onClose, onSubscribe }: CoachTeaserProps) {
  const features = [
    {
      icon: Eye,
      title: 'View Client Meal Logs',
      description: 'See what your clients are eating with photos and nutrition details',
    },
    {
      icon: Scale,
      title: 'Track Weight Progress',
      description: 'Monitor client weight trends and goal achievement',
    },
    {
      icon: MessageSquare,
      title: 'Send Check-in Requests',
      description: 'Prompt clients to log meals or weigh in',
    },
    {
      icon: Users,
      title: 'Manage Up to 10 Clients',
      description: 'Start with our Starter plan, upgrade as you grow',
    },
  ]

  const tiers = [
    { name: 'Starter', price: COACH_TIER_PRICES.starter, clients: 10 },
    { name: 'Growth', price: COACH_TIER_PRICES.growth, clients: 30 },
    { name: 'Pro', price: COACH_TIER_PRICES.pro, clients: 100 },
  ]

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <button
          onClick={onClose}
          className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-[#F97066]" />
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Coach Dashboard</h2>
        </div>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-lg mx-auto">
          {/* Hero */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F97066] to-[#FEB8B0] rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#FAFAFA] mb-2">
              Become a MacroLens Coach
            </h1>
            <p className="text-[#A1A1A1]">
              Help your clients achieve their nutrition goals with real-time meal tracking insights
            </p>
          </div>

          {/* Preview mockup */}
          <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] mb-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#6B6B6B] text-sm">My Clients (0/10)</span>
            </div>
            {/* Placeholder client cards */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#333] rounded-xl p-4 mb-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-[#404040] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-[#404040] rounded w-24 mb-2" />
                  <div className="h-3 bg-[#404040] rounded w-16" />
                </div>
                <div className="w-2 h-2 rounded-full bg-[#404040]" />
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#262626] rounded-xl p-4 border border-[#333] flex items-start gap-4 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-[#F97066]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon size={20} className="text-[#F97066]" />
                </div>
                <div>
                  <h3 className="text-[#FAFAFA] font-medium mb-1">{feature.title}</h3>
                  <p className="text-[#6B6B6B] text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#FAFAFA] mb-4 text-center">
              Choose Your Plan
            </h2>
            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`bg-[#262626] rounded-xl p-4 border ${
                    index === 0 ? 'border-[#F97066]' : 'border-[#333]'
                  } flex items-center justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FAFAFA] font-medium">{tier.name}</span>
                      {index === 0 && (
                        <span className="text-xs bg-[#F97066]/20 text-[#F97066] px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="text-[#6B6B6B] text-sm">Up to {tier.clients} clients</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#FAFAFA]">${tier.price}</span>
                    <span className="text-[#6B6B6B] text-sm">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Already coaching message */}
          <div className="bg-[#F97066]/5 border border-[#F97066]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#A1A1A1] text-center">
              <span className="text-[#F97066] font-medium">Already coaching?</span>
              {' '}Your clients can track their meals and share progress with you in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-[#333]">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onSubscribe}
            className="w-full py-4 btn-primary rounded-2xl font-medium flex items-center justify-center gap-2"
          >
            <Crown size={20} />
            Become a Coach
          </button>
          <p className="text-xs text-[#6B6B6B] text-center mt-3">
            Starting at ${COACH_TIER_PRICES.starter}/month
          </p>
        </div>
      </div>
    </div>
  )
}
