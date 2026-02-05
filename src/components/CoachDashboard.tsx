import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Settings, Loader2 } from 'lucide-react'
import type { Profile, Coach, CoachClient } from '../types'
import { getCoach, getPendingRequests, getActiveClientCount } from '../services/coachService'
import { ClientList } from './ClientList'
import { ClientDetail } from './ClientDetail'
import { PendingRequests } from './PendingRequests'
import { CoachSettings } from './CoachSettings'
import { CoachTeaser } from './CoachTeaser'

interface CoachDashboardProps {
  profile: Profile
  onClose: () => void
}

type View = 'list' | 'detail' | 'pending' | 'settings' | 'teaser'

export function CoachDashboard({ profile, onClose }: CoachDashboardProps) {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [selectedClient, setSelectedClient] = useState<CoachClient | null>(null)
  const [pendingRequests, setPendingRequests] = useState<CoachClient[]>([])
  const [activeClientCount, setActiveClientCount] = useState(0)

  useEffect(() => {
    loadCoachData()
  }, [profile.id])

  const loadCoachData = async () => {
    setLoading(true)
    try {
      const coachData = await getCoach(profile.id)
      setCoach(coachData)

      if (coachData) {
        // Load pending requests and active count
        const [requests, count] = await Promise.all([
          getPendingRequests(coachData.id),
          getActiveClientCount(coachData.id),
        ])
        setPendingRequests(requests)
        setActiveClientCount(count)
        setView('list')
      } else {
        setView('teaser')
      }
    } catch (error) {
      console.error('Error loading coach data:', error)
      setView('teaser')
    } finally {
      setLoading(false)
    }
  }

  const handleClientSelect = (client: CoachClient) => {
    setSelectedClient(client)
    setView('detail')
  }

  const handleClientRemoved = () => {
    setSelectedClient(null)
    setView('list')
    loadCoachData()
  }

  const handleRequestHandled = () => {
    loadCoachData()
  }

  const handleSubscribe = () => {
    // TODO: Integrate with payment system (Polar)
    alert('Subscription flow coming soon! For now, coach features are in development.')
  }

  const handleUpgrade = (tier: 'growth' | 'pro') => {
    // TODO: Integrate with payment system
    alert(`Upgrade to ${tier} tier coming soon!`)
  }

  const handleInviteClient = () => {
    // TODO: Show invite client modal
    alert('Invite flow: Share your invite link or have clients request you by email.')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1A1A1A] z-50 flex items-center justify-center">
        <Loader2 size={48} className="text-[#F97066] animate-spin" />
      </div>
    )
  }

  // Non-subscriber teaser
  if (view === 'teaser' || !coach) {
    return <CoachTeaser onClose={onClose} onSubscribe={handleSubscribe} />
  }

  // Client detail view
  if (view === 'detail' && selectedClient) {
    return (
      <ClientDetail
        coachId={coach.id}
        client={selectedClient}
        onBack={() => {
          setSelectedClient(null)
          setView('list')
        }}
        onClientRemoved={handleClientRemoved}
      />
    )
  }

  // Pending requests view
  if (view === 'pending') {
    return (
      <PendingRequests
        requests={pendingRequests}
        onBack={() => setView('list')}
        onRequestHandled={handleRequestHandled}
      />
    )
  }

  // Settings view
  if (view === 'settings') {
    return (
      <CoachSettings
        coach={coach}
        activeClientCount={activeClientCount}
        onBack={() => setView('list')}
        onUpgrade={handleUpgrade}
      />
    )
  }

  // Main list view
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
          <Users size={20} className="text-[#F97066]" />
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Coach Dashboard</h2>
        </div>
        <button
          onClick={() => setView('settings')}
          className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <ClientList
          coach={coach}
          onClientSelect={handleClientSelect}
          onInviteClient={handleInviteClient}
          onPendingRequestsClick={() => setView('pending')}
          pendingCount={pendingRequests.length}
        />
      </div>
    </div>
  )
}
