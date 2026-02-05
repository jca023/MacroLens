import { useState, useEffect } from 'react'
import {
  UserPlus,
  KeyRound,
  Heart,
  Unlink,
  Eye,
  Scale,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { Profile, CoachClient, ClientSharingSettings } from '../types'
import {
  getClientCoachConnection,
  getClientSharingSettings,
  updateSharingSettings,
  disconnectCoachClient,
} from '../services/coachService'

interface CoachingSectionProps {
  profile: Profile
  onRequestCoach: () => void
  onEnterCode: () => void
  onGetCoach: () => void
}

export function CoachingSection({
  profile,
  onRequestCoach,
  onEnterCode,
  onGetCoach,
}: CoachingSectionProps) {
  const [connection, setConnection] = useState<CoachClient | null>(null)
  const [sharingSettings, setSharingSettings] = useState<ClientSharingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    loadConnectionData()
  }, [profile.id])

  const loadConnectionData = async () => {
    setLoading(true)
    try {
      const conn = await getClientCoachConnection(profile.id)
      setConnection(conn)

      if (conn && conn.status === 'active') {
        const settings = await getClientSharingSettings(profile.id)
        setSharingSettings(settings)
      }
    } catch (error) {
      console.error('Error loading connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSetting = async (setting: 'share_meals_auto' | 'share_weight_auto') => {
    if (!sharingSettings) return

    setUpdatingSettings(true)
    try {
      const updated = await updateSharingSettings(profile.id, {
        [setting]: !sharingSettings[setting],
      })
      setSharingSettings(updated)
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleDisconnect = async () => {
    if (!connection) return

    setDisconnecting(true)
    try {
      await disconnectCoachClient(connection.id)
      setConnection(null)
      setSharingSettings(null)
      setShowDisconnectConfirm(false)
    } catch (error) {
      console.error('Error disconnecting:', error)
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#262626] rounded-2xl p-6 border border-[#333]">
        <div className="flex items-center justify-center py-4">
          <Loader2 size={24} className="text-[#F97066] animate-spin" />
        </div>
      </div>
    )
  }

  // Connected to coach
  if (connection && connection.status === 'active') {
    const coachName = connection.coach_profile?.name || 'Your Coach'

    return (
      <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] space-y-4">
        {/* Connected status */}
        <div className="flex items-center gap-3 p-3 bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-xl">
          <div className="w-3 h-3 bg-[#4ADE80] rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="text-[#4ADE80] font-medium text-sm">Connected to Coach</div>
            <div className="text-[#FAFAFA]">{coachName}</div>
          </div>
        </div>

        {/* Sharing settings */}
        <div>
          <h4 className="text-[#A1A1A1] text-xs font-medium mb-3">SHARING SETTINGS</h4>
          <div className="space-y-3">
            <ToggleSetting
              icon={Eye}
              label="Share meals automatically"
              description="Your coach can see your meal logs"
              enabled={sharingSettings?.share_meals_auto || false}
              onChange={() => handleToggleSetting('share_meals_auto')}
              disabled={updatingSettings}
            />
            <ToggleSetting
              icon={Scale}
              label="Share weight automatically"
              description="Your coach can see your weight entries"
              enabled={sharingSettings?.share_weight_auto || false}
              onChange={() => handleToggleSetting('share_weight_auto')}
              disabled={updatingSettings}
            />
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-2 text-xs text-[#6B6B6B]">
          <Lock size={14} className="flex-shrink-0 mt-0.5" />
          <span>Your data is only visible to your coach while connected</span>
        </div>

        {/* Disconnect */}
        {showDisconnectConfirm ? (
          <div className="p-4 bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl space-y-3">
            <p className="text-sm text-[#A1A1A1] text-center">
              Disconnect from {coachName}? They will no longer see your data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="flex-1 py-2 bg-[#333] text-[#FAFAFA] rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex-1 py-2 bg-[#F87171] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                {disconnecting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            className="w-full py-3 text-[#F87171] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#333] rounded-xl transition-colors"
          >
            <Unlink size={16} />
            Disconnect from Coach
          </button>
        )}
      </div>
    )
  }

  // Pending connection
  if (connection && (connection.status === 'pending_request' || connection.status === 'pending_code')) {
    const coachName = connection.coach_profile?.name || 'Coach'
    const isPendingCode = connection.status === 'pending_code'

    return (
      <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] space-y-4">
        <div className="flex items-center gap-3 p-3 bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-xl">
          <AlertCircle size={20} className="text-[#FBBF24]" />
          <div className="flex-1">
            <div className="text-[#FBBF24] font-medium text-sm">
              {isPendingCode ? 'Code Required' : 'Request Pending'}
            </div>
            <div className="text-[#A1A1A1] text-sm">
              {isPendingCode
                ? `Check your email for a code from ${coachName}`
                : `Waiting for ${coachName} to approve`}
            </div>
          </div>
        </div>

        {isPendingCode && (
          <button
            onClick={onEnterCode}
            className="w-full py-3 btn-primary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <KeyRound size={18} />
            Enter Invite Code
          </button>
        )}

        <div className="flex items-start gap-2 text-xs text-[#6B6B6B]">
          <Lock size={14} className="flex-shrink-0 mt-0.5" />
          <span>Your data is completely private until connected</span>
        </div>
      </div>
    )
  }

  // Not connected
  return (
    <div className="bg-[#262626] rounded-2xl p-4 border border-[#333] space-y-4">
      {/* Not connected status */}
      <div className="flex items-center gap-3 p-3 bg-[#333] rounded-xl">
        <Lock size={20} className="text-[#6B6B6B]" />
        <div className="flex-1">
          <div className="text-[#FAFAFA] font-medium text-sm">No coach connected</div>
          <div className="text-[#6B6B6B] text-sm">Your data is completely private</div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <button
          onClick={onRequestCoach}
          className="w-full bg-[#333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#404040] transition-colors text-left"
        >
          <div className="w-10 h-10 bg-[#F97066]/10 rounded-xl flex items-center justify-center">
            <UserPlus size={20} className="text-[#F97066]" />
          </div>
          <div>
            <div className="text-[#FAFAFA] font-medium">Request a Coach</div>
            <div className="text-[#6B6B6B] text-sm">Enter your coach's email</div>
          </div>
        </button>

        <button
          onClick={onEnterCode}
          className="w-full bg-[#333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#404040] transition-colors text-left"
        >
          <div className="w-10 h-10 bg-[#60A5FA]/10 rounded-xl flex items-center justify-center">
            <KeyRound size={20} className="text-[#60A5FA]" />
          </div>
          <div>
            <div className="text-[#FAFAFA] font-medium">Enter Invite Code</div>
            <div className="text-[#6B6B6B] text-sm">Already have a code from your coach</div>
          </div>
        </button>

        <button
          onClick={onGetCoach}
          className="w-full bg-[#333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#404040] transition-colors text-left"
        >
          <div className="w-10 h-10 bg-[#4ADE80]/10 rounded-xl flex items-center justify-center">
            <Heart size={20} className="text-[#4ADE80]" />
          </div>
          <div>
            <div className="text-[#FAFAFA] font-medium">Get a Coach</div>
            <div className="text-[#6B6B6B] text-sm">We'll match you with a coach</div>
          </div>
        </button>
      </div>
    </div>
  )
}

interface ToggleSettingProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  description: string
  enabled: boolean
  onChange: () => void
  disabled?: boolean
}

function ToggleSetting({
  icon: Icon,
  label,
  description,
  enabled,
  onChange,
  disabled,
}: ToggleSettingProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 bg-[#333] rounded-xl hover:bg-[#404040] transition-colors text-left disabled:opacity-50"
    >
      <Icon size={20} className={enabled ? 'text-[#4ADE80]' : 'text-[#6B6B6B]'} />
      <div className="flex-1">
        <div className="text-[#FAFAFA] text-sm font-medium">{label}</div>
        <div className="text-[#6B6B6B] text-xs">{description}</div>
      </div>
      <div
        className={`w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-[#4ADE80]' : 'bg-[#404040]'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  )
}
