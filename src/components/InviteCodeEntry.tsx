import { useState, useRef, useEffect } from 'react'
import { X, Loader2, Check, AlertCircle } from 'lucide-react'
import { verifyInviteCode } from '../services/coachService'

interface InviteCodeEntryProps {
  clientId: string
  clientEmail: string
  onClose: () => void
  onSuccess: () => void
}

export function InviteCodeEntry({
  clientId,
  clientEmail,
  onClose,
  onSuccess,
}: InviteCodeEntryProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    // Only allow alphanumeric
    const sanitized = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    if (sanitized.length > 1) {
      // Handle paste
      const chars = sanitized.slice(0, 6 - index).split('')
      const newCode = [...code]
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char
        }
      })
      setCode(newCode)
      const nextIndex = Math.min(index + chars.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      const newCode = [...code]
      newCode[index] = sanitized
      setCode(newCode)

      // Auto-advance to next input
      if (sanitized && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    setError(null)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const chars = pastedText.slice(0, 6).split('')
    const newCode = [...code]
    chars.forEach((char, i) => {
      newCode[i] = char
    })
    setCode(newCode)
    const nextIndex = Math.min(chars.length, 5)
    inputRefs.current[nextIndex]?.focus()
    setError(null)
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter all 6 characters')
      return
    }

    setVerifying(true)
    setError(null)

    try {
      await verifyInviteCode(clientId, clientEmail, fullCode)
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      console.error('Error verifying code:', err)
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const isComplete = code.every((c) => c !== '')

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-sm border border-[#333] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Enter Invite Code</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#262626]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 animate-scale-in">
              <div className="w-16 h-16 bg-[#4ADE80]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-[#4ADE80]" />
              </div>
              <p className="text-[#FAFAFA] font-medium">Connected!</p>
              <p className="text-[#6B6B6B] text-sm mt-1">You're now connected to your coach</p>
            </div>
          ) : (
            <>
              <p className="text-[#A1A1A1] text-sm text-center mb-6">
                Enter the 6-character code your coach sent to your email
              </p>

              {/* Code input */}
              <div
                className="flex justify-center gap-2 mb-6"
                onPaste={handlePaste}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 bg-[#262626] border-2 border-[#333] rounded-xl text-center text-xl font-bold text-[#FAFAFA] focus:outline-none focus:border-[#F97066] transition-colors uppercase"
                    disabled={verifying}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-[#F87171] text-sm mb-4 justify-center">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={!isComplete || verifying}
                className="w-full py-4 btn-primary rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              {/* Help text */}
              <p className="text-xs text-[#6B6B6B] text-center mt-4">
                Codes expire after 48 hours. Contact your coach for a new code if needed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
