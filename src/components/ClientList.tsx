import { useState, useEffect } from 'react'
import { Users, UserPlus, Clock } from 'lucide-react'
import type { Coach, CoachClient } from '../types'
import { getCoachClients, getClientLastActivity } from '../services/coachService'

interface ClientListProps {
  coach: Coach
  onClientSelect: (client: CoachClient) => void
  onInviteClient: () => void
  onPendingRequestsClick: () => void
  pendingCount: number
}

export function ClientList({
  coach,
  onClientSelect,
  onInviteClient,
  onPendingRequestsClick,
  pendingCount,
}: ClientListProps) {
  const [clients, setClients] = useState<CoachClient[]>([])
  const [loading, setLoading] = useState(true)
  const [lastActivities, setLastActivities] = useState<Record<string, Date | null>>({})

  useEffect(() => {
    loadClients()
  }, [coach.id])

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await getCoachClients(coach.id)
      // Filter to only active clients for the main list
      const activeClients = data.filter(c => c.status === 'active')
      setClients(activeClients)

      // Load last activity for each client
      const activities: Record<string, Date | null> = {}
      await Promise.all(
        activeClients.map(async (client) => {
          try {
            activities[client.client_id] = await getClientLastActivity(client.client_id)
          } catch {
            activities[client.client_id] = null
          }
        })
      )
      setLastActivities(activities)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityStatus = (clientId: string): 'active' | 'inactive' | 'unknown' => {
    const lastActivity = lastActivities[clientId]
    if (!lastActivity) return 'unknown'

    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceActivity < 3) return 'active'
    return 'inactive'
  }

  const formatLastActivity = (clientId: string): string => {
    const lastActivity = lastActivities[clientId]
    if (!lastActivity) return 'No activity yet'

    const daysSince = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince === 0) return 'Active today'
    if (daysSince === 1) return 'Active yesterday'
    if (daysSince < 7) return `${daysSince} days ago`
    if (daysSince < 30) return `${Math.floor(daysSince / 7)} weeks ago`
    return `${Math.floor(daysSince / 30)} months ago`
  }

  const activeCount = clients.length
  const totalLimit = coach.client_limit + coach.extra_client_count

  return (
    <div className="p-4">
      {/* Header Stats */}
      <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#FAFAFA]">My Clients</h2>
            <p className="text-[#6B6B6B] text-sm">
              {activeCount} of {totalLimit} clients
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#F97066]">{activeCount}</div>
            <div className="text-xs text-[#6B6B6B]">active</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-[#333] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F97066] rounded-full transition-all duration-500"
            style={{ width: `${Math.min((activeCount / totalLimit) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Pending Requests Banner */}
      {pendingCount > 0 && (
        <button
          onClick={onPendingRequestsClick}
          className="w-full bg-[#F97066]/10 border border-[#F97066]/30 rounded-xl p-4 mb-4 flex items-center justify-between hover:bg-[#F97066]/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F97066]/20 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-[#F97066]" />
            </div>
            <div className="text-left">
              <div className="text-[#FAFAFA] font-medium">
                {pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}
              </div>
              <div className="text-[#F97066] text-sm">Tap to review</div>
            </div>
          </div>
          <div className="w-6 h-6 bg-[#F97066] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{pendingCount}</span>
          </div>
        </button>
      )}

      {/* Client List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-[#262626] rounded-2xl p-8 border border-dashed border-[#404040] text-center">
          <div className="w-16 h-16 bg-[#F97066]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-[#F97066]" />
          </div>
          <p className="text-[#FAFAFA] font-medium mb-1">No clients yet</p>
          <p className="text-[#A1A1A1] text-sm mb-4">
            Invite your first client to get started
          </p>
          <button
            onClick={onInviteClient}
            className="px-6 py-3 btn-primary rounded-xl text-sm"
          >
            Invite Client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => {
            const status = getActivityStatus(client.client_id)
            const profile = client.client_profile

            return (
              <button
                key={client.id}
                onClick={() => onClientSelect(client)}
                className="w-full bg-[#262626] rounded-2xl p-4 border border-[#333] flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors text-left animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-[#333] rounded-full flex items-center justify-center">
                  <span className="text-[#FAFAFA] font-medium text-lg">
                    {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[#FAFAFA] font-medium truncate">
                    {profile?.name || 'Unknown'}
                  </div>
                  <div className="text-[#6B6B6B] text-sm">
                    {formatLastActivity(client.client_id)}
                  </div>
                </div>

                {/* Status indicator */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === 'active'
                      ? 'bg-[#4ADE80]'
                      : status === 'inactive'
                      ? 'bg-[#FBBF24]'
                      : 'bg-[#6B6B6B]'
                  }`}
                  title={
                    status === 'active'
                      ? 'Active recently'
                      : status === 'inactive'
                      ? 'Inactive 3+ days'
                      : 'No activity'
                  }
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Invite Client Button */}
      {clients.length > 0 && (
        <button
          onClick={onInviteClient}
          className="w-full mt-4 py-4 bg-[#262626] border border-[#333] rounded-2xl text-[#F97066] font-medium flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-colors"
        >
          <UserPlus size={20} />
          Invite Client
        </button>
      )}
    </div>
  )
}
