import { ArrowLeft, Crown, Users, TrendingUp, Zap } from 'lucide-react'
import type { Coach } from '../types'
import { COACH_TIER_PRICES, COACH_TIER_LIMITS, COACH_OVERFLOW_PRICE } from '../types'

interface CoachSettingsProps {
  coach: Coach
  activeClientCount: number
  onBack: () => void
  onUpgrade: (tier: 'growth' | 'pro') => void
}

export function CoachSettings({
  coach,
  activeClientCount,
  onBack,
  onUpgrade,
}: CoachSettingsProps) {
  const currentTier = coach.subscription_tier
  const baseLimit = COACH_TIER_LIMITS[currentTier]
  const totalLimit = baseLimit + coach.extra_client_count
  const usagePercentage = Math.min((activeClientCount / totalLimit) * 100, 100)

  const tiers = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: COACH_TIER_PRICES.starter,
      clients: COACH_TIER_LIMITS.starter,
      current: currentTier === 'starter',
    },
    {
      id: 'growth' as const,
      name: 'Growth',
      price: COACH_TIER_PRICES.growth,
      clients: COACH_TIER_LIMITS.growth,
      current: currentTier === 'growth',
      popular: true,
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: COACH_TIER_PRICES.pro,
      clients: COACH_TIER_LIMITS.pro,
      current: currentTier === 'pro',
    },
  ]

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-[#333]">
        <button
          onClick={onBack}
          className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Coach Settings</h2>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Current Plan Card */}
        <div className="bg-gradient-to-br from-[#F97066]/20 to-[#FEB8B0]/10 rounded-2xl p-4 border border-[#F97066]/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F97066]/20 rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-[#F97066]" />
              </div>
              <div>
                <div className="text-[#FAFAFA] font-semibold text-lg capitalize">
                  {currentTier} Plan
                </div>
                <div className="text-[#F97066] text-sm">
                  ${COACH_TIER_PRICES[currentTier]}/month
                </div>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#A1A1A1]">Client Usage</span>
              <span className="text-[#FAFAFA] font-medium">
                {activeClientCount} / {totalLimit}
              </span>
            </div>
            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage >= 90 ? 'bg-[#F87171]' : 'bg-[#F97066]'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          {/* Extra clients info */}
          {coach.extra_client_count > 0 && (
            <div className="text-xs text-[#A1A1A1]">
              +{coach.extra_client_count} overflow client{coach.extra_client_count > 1 ? 's' : ''}
              (${(coach.extra_client_count * COACH_OVERFLOW_PRICE).toFixed(2)}/mo extra)
            </div>
          )}
        </div>

        {/* Upgrade Options */}
        {currentTier !== 'pro' && (
          <div className="mb-6">
            <h3 className="text-[#A1A1A1] text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Upgrade Your Plan
            </h3>
            <div className="space-y-3">
              {tiers
                .filter((tier) => !tier.current && tier.clients > COACH_TIER_LIMITS[currentTier])
                .map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => onUpgrade(tier.id as 'growth' | 'pro')}
                    className={`w-full bg-[#262626] rounded-xl p-4 border text-left hover:bg-[#2a2a2a] transition-colors ${
                      tier.popular ? 'border-[#F97066]' : 'border-[#333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FAFAFA] font-medium">{tier.name}</span>
                          {tier.popular && (
                            <span className="text-xs bg-[#F97066]/20 text-[#F97066] px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="text-[#6B6B6B] text-sm">
                          Up to {tier.clients} clients
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[#FAFAFA]">
                          ${tier.price}
                        </span>
                        <span className="text-[#6B6B6B] text-sm">/mo</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-[#A1A1A1] text-sm font-medium mb-3">Plan Features</h3>
          <div className="bg-[#262626] rounded-xl p-4 border border-[#333] space-y-3">
            {[
              { icon: Users, text: `Manage up to ${totalLimit} clients` },
              { icon: Zap, text: 'Real-time meal viewing' },
              { icon: TrendingUp, text: 'Client weight tracking' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-[#A1A1A1]">
                <feature.icon size={18} className="text-[#F97066]" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overflow Pricing Info */}
        <div className="bg-[#262626] rounded-xl p-4 border border-[#333]">
          <h4 className="text-[#FAFAFA] font-medium mb-2">Need more clients?</h4>
          <p className="text-[#6B6B6B] text-sm mb-2">
            Add up to 5 extra clients beyond your plan limit at ${COACH_OVERFLOW_PRICE}/client/month.
          </p>
          <p className="text-[#A1A1A1] text-xs">
            Or upgrade to a higher tier for better value!
          </p>
        </div>
      </div>
    </div>
  )
}
