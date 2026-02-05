import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Utensils,
  Scale,
  MessageSquare,
  UserMinus,
  Lock,
  Unlock,
  Loader2,
  TrendingDown,
  TrendingUp,
  Minus,
  Image,
} from 'lucide-react'
import type { CoachClient, Meal, ClientSharingSettings, WeightEntry } from '../types'
import {
  getClientMeals,
  getClientSharingSettings,
  disconnectCoachClient,
  sendCoachRequest,
} from '../services/coachService'
import { getClientWeightEntries, getWeightStats, type WeightStats } from '../services/weightService'

interface ClientDetailProps {
  coachId: string
  client: CoachClient
  onBack: () => void
  onClientRemoved: () => void
}

type TabType = 'meals' | 'weight' | 'requests'

export function ClientDetail({
  coachId,
  client,
  onBack,
  onClientRemoved,
}: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('meals')
  const [meals, setMeals] = useState<Meal[]>([])
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [weightStats, setWeightStats] = useState<WeightStats | null>(null)
  const [sharingSettings, setSharingSettings] = useState<ClientSharingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [selectedDate] = useState(new Date())

  const profile = client.client_profile

  useEffect(() => {
    loadClientData()
  }, [client.client_id, selectedDate])

  const loadClientData = async () => {
    setLoading(true)
    try {
      // Load sharing settings
      const settings = await getClientSharingSettings(client.client_id)
      setSharingSettings(settings)

      // Load meals for selected date (7-day window)
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)

      if (settings.share_meals_auto) {
        const clientMeals = await getClientMeals(coachId, client.client_id, startDate, endDate)
        setMeals(clientMeals)
      } else {
        setMeals([])
      }

      // Load weight data if sharing enabled
      if (settings.share_weight_auto) {
        try {
          const entries = await getClientWeightEntries(coachId, client.client_id, startDate, endDate)
          setWeightEntries(entries)
          const stats = await getWeightStats(client.client_id, 30)
          setWeightStats(stats)
        } catch (weightError) {
          console.error('Error loading weight data:', weightError)
          setWeightEntries([])
          setWeightStats(null)
        }
      } else {
        setWeightEntries([])
        setWeightStats(null)
      }
    } catch (error) {
      console.error('Error loading client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (type: 'weigh_in' | 'log_meals') => {
    setSendingRequest(true)
    try {
      await sendCoachRequest({
        coach_id: coachId,
        client_id: client.client_id,
        request_type: type,
        message: null,
        status: 'pending',
      })
      // Show success feedback
      alert(`${type === 'weigh_in' ? 'Weigh-in' : 'Meal logging'} request sent!`)
    } catch (error) {
      console.error('Error sending request:', error)
      alert('Failed to send request. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  const handleRemoveClient = async () => {
    try {
      await disconnectCoachClient(client.id)
      onClientRemoved()
    } catch (error) {
      console.error('Error removing client:', error)
      alert('Failed to remove client. Please try again.')
    }
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const connectedDate = client.connected_at
    ? new Date(client.connected_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown'

  const tabs = [
    { id: 'meals' as const, label: 'Meals', icon: Utensils },
    { id: 'weight' as const, label: 'Weight', icon: Scale },
    { id: 'requests' as const, label: 'Requests', icon: MessageSquare },
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
          <h2 className="text-lg font-semibold text-[#FAFAFA]">
            {profile?.name || 'Unknown Client'}
          </h2>
          <p className="text-[#6B6B6B] text-sm">Connected {connectedDate}</p>
        </div>
      </header>

      {/* Sharing Status Banner */}
      <div className="px-4 py-3 bg-[#262626] border-b border-[#333]">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#6B6B6B]">Sharing:</span>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 ${
                sharingSettings?.share_meals_auto ? 'text-[#4ADE80]' : 'text-[#6B6B6B]'
              }`}
            >
              {sharingSettings?.share_meals_auto ? (
                <Unlock size={14} />
              ) : (
                <Lock size={14} />
              )}
              Meals
            </span>
            <span className="text-[#333]">|</span>
            <span
              className={`flex items-center gap-1 ${
                sharingSettings?.share_weight_auto ? 'text-[#4ADE80]' : 'text-[#6B6B6B]'
              }`}
            >
              {sharingSettings?.share_weight_auto ? (
                <Unlock size={14} />
              ) : (
                <Lock size={14} />
              )}
              Weight
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'text-[#F97066] border-b-2 border-[#F97066]'
                : 'text-[#6B6B6B] hover:text-[#A1A1A1]'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-[#F97066] animate-spin" />
          </div>
        ) : activeTab === 'meals' ? (
          <MealsTab
            meals={meals}
            sharingEnabled={sharingSettings?.share_meals_auto || false}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        ) : activeTab === 'weight' ? (
          <WeightTab
            sharingEnabled={sharingSettings?.share_weight_auto || false}
            weightEntries={weightEntries}
            weightStats={weightStats}
          />
        ) : (
          <RequestsTab
            onSendRequest={handleSendRequest}
            sendingRequest={sendingRequest}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333]">
        {showRemoveConfirm ? (
          <div className="space-y-3">
            <p className="text-center text-[#A1A1A1] text-sm">
              Are you sure you want to remove this client?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 py-3 bg-[#262626] text-[#FAFAFA] rounded-xl font-medium hover:bg-[#333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveClient}
                className="flex-1 py-3 bg-[#F87171] text-white rounded-xl font-medium hover:bg-[#EF4444] transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="w-full py-3 bg-[#262626] border border-[#333] rounded-xl text-[#F87171] font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors"
          >
            <UserMinus size={18} />
            Remove Client
          </button>
        )}
      </div>
    </div>
  )
}

interface MealsTabProps {
  meals: Meal[]
  sharingEnabled: boolean
  formatDate: (ts: number) => string
  formatTime: (ts: number) => string
}

function MealsTab({ meals, sharingEnabled, formatDate, formatTime }: MealsTabProps) {
  if (!sharingEnabled) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-[#6B6B6B]" />
        </div>
        <p className="text-[#FAFAFA] font-medium mb-1">Meals not shared</p>
        <p className="text-[#6B6B6B] text-sm">
          This client has not enabled automatic meal sharing
        </p>
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Utensils size={28} className="text-[#6B6B6B]" />
        </div>
        <p className="text-[#FAFAFA] font-medium mb-1">No meals logged</p>
        <p className="text-[#6B6B6B] text-sm">
          This client hasn't logged any meals recently
        </p>
      </div>
    )
  }

  // Group meals by date
  const mealsByDate = meals.reduce((acc, meal) => {
    const date = formatDate(meal.timestamp)
    if (!acc[date]) acc[date] = []
    acc[date].push(meal)
    return acc
  }, {} as Record<string, Meal[]>)

  return (
    <div className="space-y-6">
      {Object.entries(mealsByDate).map(([date, dateMeals]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-[#A1A1A1] mb-3">{date}</h3>
          <div className="space-y-3">
            {dateMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-[#262626] rounded-xl p-4 border border-[#333]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-[#FAFAFA] font-medium">{meal.name}</h4>
                    <span className="text-[#6B6B6B] text-xs">
                      {formatTime(meal.timestamp)}
                    </span>
                  </div>
                  {meal.image_url && (
                    <img
                      src={meal.image_url}
                      alt={meal.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-[#F97066] font-medium">
                    {meal.nutrients.calories} cal
                  </span>
                  <span className="text-[#F472B6]">{meal.nutrients.protein}g P</span>
                  <span className="text-[#FBBF24]">{meal.nutrients.carbs}g C</span>
                  <span className="text-[#60A5FA]">{meal.nutrients.fat}g F</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface WeightTabProps {
  sharingEnabled: boolean
  weightEntries: WeightEntry[]
  weightStats: WeightStats | null
}

function WeightTab({ sharingEnabled, weightEntries, weightStats }: WeightTabProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  if (!sharingEnabled) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-[#6B6B6B]" />
        </div>
        <p className="text-[#FAFAFA] font-medium mb-1">Weight not shared</p>
        <p className="text-[#6B6B6B] text-sm">
          This client has not enabled automatic weight sharing
        </p>
      </div>
    )
  }

  if (weightEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Scale size={28} className="text-[#6B6B6B]" />
        </div>
        <p className="text-[#FAFAFA] font-medium mb-1">No weight logged</p>
        <p className="text-[#6B6B6B] text-sm">
          This client hasn't logged any weight entries recently
        </p>
      </div>
    )
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Weight Stats Summary */}
      {weightStats && (
        <div className="bg-gradient-to-br from-[#60A5FA]/15 to-[#3B82F6]/10 border border-[#60A5FA]/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#60A5FA] font-medium">30-Day Progress</h3>
            <div className="flex items-center gap-1">
              {weightStats.change < 0 ? (
                <TrendingDown size={18} className="text-[#4ADE80]" />
              ) : weightStats.change > 0 ? (
                <TrendingUp size={18} className="text-[#FBBF24]" />
              ) : (
                <Minus size={18} className="text-[#6B6B6B]" />
              )}
              <span className={`text-sm font-medium ${
                weightStats.change < 0 ? 'text-[#4ADE80]' :
                weightStats.change > 0 ? 'text-[#FBBF24]' : 'text-[#6B6B6B]'
              }`}>
                {weightStats.change > 0 ? '+' : ''}{weightStats.change} {weightStats.unit}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-[#FAFAFA]">
                {weightStats.currentWeight}
              </div>
              <div className="text-xs text-[#A1A1A1]">Current ({weightStats.unit})</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#FAFAFA]">
                {weightStats.startWeight}
              </div>
              <div className="text-xs text-[#A1A1A1]">Start ({weightStats.unit})</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#FAFAFA]">
                {weightStats.entries}
              </div>
              <div className="text-xs text-[#A1A1A1]">Entries</div>
            </div>
          </div>
        </div>
      )}

      {/* Weight Entries List */}
      <div>
        <h3 className="text-sm font-medium text-[#A1A1A1] mb-3">Recent Entries</h3>
        <div className="space-y-3">
          {weightEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-[#262626] rounded-xl p-4 border border-[#333]"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#FAFAFA]">
                      {entry.weight} {entry.unit}
                    </span>
                    {entry.confidence && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.confidence === 'high' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' :
                        entry.confidence === 'medium' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        'bg-[#F87171]/20 text-[#F87171]'
                      }`}>
                        {entry.confidence}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                    <span>{formatDate(entry.recorded_at)}</span>
                    <span>at {formatTime(entry.recorded_at)}</span>
                    <span className="text-[#404040]">|</span>
                    <span className="capitalize">{entry.source.replace('_', ' ')}</span>
                  </div>
                </div>
                {entry.image_url && (
                  <button
                    onClick={() => setSelectedPhoto(entry.image_url)}
                    className="p-2 bg-[#333] rounded-lg hover:bg-[#404040] transition-colors"
                    title="View scale photo"
                  >
                    <Image size={18} className="text-[#A1A1A1]" />
                  </button>
                )}
              </div>
              {entry.notes && (
                <p className="text-sm text-[#A1A1A1] mt-2 border-t border-[#333] pt-2">
                  {entry.notes}
                </p>
              )}
              {/* Show change from previous entry */}
              {index < weightEntries.length - 1 && (
                <div className="mt-2 text-xs">
                  {(() => {
                    const diff = entry.weight - weightEntries[index + 1].weight
                    if (Math.abs(diff) < 0.1) return null
                    return (
                      <span className={diff < 0 ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} {entry.unit} from previous
                      </span>
                    )
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Scale photo"
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}
    </div>
  )
}

interface RequestsTabProps {
  onSendRequest: (type: 'weigh_in' | 'log_meals') => void
  sendingRequest: boolean
}

function RequestsTab({ onSendRequest, sendingRequest }: RequestsTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-[#A1A1A1] text-sm text-center mb-6">
        Send a gentle reminder to your client
      </p>

      <button
        onClick={() => onSendRequest('log_meals')}
        disabled={sendingRequest}
        className="w-full bg-[#262626] border border-[#333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
      >
        <div className="w-12 h-12 bg-[#F97066]/10 rounded-xl flex items-center justify-center">
          <Utensils size={24} className="text-[#F97066]" />
        </div>
        <div className="text-left">
          <div className="text-[#FAFAFA] font-medium">Request Meal Log</div>
          <div className="text-[#6B6B6B] text-sm">
            Remind them to log their meals
          </div>
        </div>
      </button>

      <button
        onClick={() => onSendRequest('weigh_in')}
        disabled={sendingRequest}
        className="w-full bg-[#262626] border border-[#333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
      >
        <div className="w-12 h-12 bg-[#60A5FA]/10 rounded-xl flex items-center justify-center">
          <Scale size={24} className="text-[#60A5FA]" />
        </div>
        <div className="text-left">
          <div className="text-[#FAFAFA] font-medium">Request Weigh-in</div>
          <div className="text-[#6B6B6B] text-sm">
            Remind them to log their weight
          </div>
        </div>
      </button>
    </div>
  )
}
