import { useState } from 'react'
import { ArrowLeft, Check, X, Clock, Loader2, Mail } from 'lucide-react'
import type { CoachClient } from '../types'
import { approveClientRequest, declineClientRequest } from '../services/coachService'

interface PendingRequestsProps {
  requests: CoachClient[]
  onBack: () => void
  onRequestHandled: () => void
}

export function PendingRequests({
  requests,
  onBack,
  onRequestHandled,
}: PendingRequestsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (request: CoachClient) => {
    const profile = request.client_profile
    if (!profile) {
      setError('Client profile not found')
      return
    }

    setProcessingId(request.id)
    setError(null)

    try {
      // For now, we'll use a placeholder email since we don't have direct access
      // In production, this would come from the auth system
      const clientEmail = `client_${request.client_id.slice(0, 8)}@placeholder.com`

      await approveClientRequest(request.id, clientEmail)
      onRequestHandled()
    } catch (err) {
      console.error('Error approving request:', err)
      setError('Failed to approve request. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId)
    setError(null)

    try {
      await declineClientRequest(requestId)
      onRequestHandled()
    } catch (err) {
      console.error('Error declining request:', err)
      setError('Failed to decline request. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Pending Requests</h2>
          <p className="text-[#6B6B6B] text-sm">
            {requests.length} request{requests.length !== 1 ? 's' : ''} waiting
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-4 text-[#F87171] text-sm mb-4">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#4ADE80]" />
            </div>
            <p className="text-[#FAFAFA] font-medium mb-1">All caught up!</p>
            <p className="text-[#6B6B6B] text-sm">
              No pending connection requests
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request, index) => {
              const profile = request.client_profile
              const isProcessing = processingId === request.id

              return (
                <div
                  key={request.id}
                  className="bg-[#262626] rounded-2xl p-4 border border-[#333] animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-[#333] rounded-full flex items-center justify-center">
                      <span className="text-[#FAFAFA] font-medium text-lg">
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="text-[#FAFAFA] font-medium">
                        {profile?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 text-[#6B6B6B] text-sm">
                        <Clock size={14} />
                        <span>Requested {formatDate(request.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecline(request.id)}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-[#333] text-[#A1A1A1] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#404040] transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <X size={18} />
                          Decline
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={isProcessing}
                      className="flex-1 py-3 btn-primary rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={18} />
                          Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 bg-[#F97066]/5 border border-[#F97066]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-[#F97066] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#A1A1A1]">
              <p className="font-medium text-[#FAFAFA] mb-1">How it works</p>
              <p>
                When you approve a request, a 6-digit code will be sent to the client's email.
                They'll need to enter this code in their app to complete the connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
