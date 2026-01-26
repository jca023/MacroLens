import { useState, useRef, useEffect } from 'react'
import { Utensils, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onSignInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>
  onSendOtp: (email: string) => Promise<{ error: Error | null }>
  onVerifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>
}

type ViewState = 'input' | 'sending' | 'otp-sent' | 'verifying'
type AuthMode = 'otp' | 'password'

export function LoginPage({ onSignInWithPassword, onSendOtp, onVerifyOtp }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [viewState, setViewState] = useState<ViewState>('input')
  const [authMode, setAuthMode] = useState<AuthMode>('otp')
  const [error, setError] = useState<string | null>(null)

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first OTP input when entering OTP mode
  useEffect(() => {
    if (viewState === 'otp-sent') {
      otpInputRefs.current[0]?.focus()
    }
  }, [viewState])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    if (authMode === 'password') {
      if (!password.trim()) {
        setError('Please enter your password')
        return
      }
      setViewState('sending')
      const { error: signInError } = await onSignInWithPassword(email, password)
      if (signInError) {
        setError(signInError.message)
        setViewState('input')
      }
    } else {
      // OTP mode - send code
      setViewState('sending')
      const { error: otpError } = await onSendOtp(email)
      if (otpError) {
        setError(otpError.message)
        setViewState('input')
      } else {
        setViewState('otp-sent')
        setOtpCode(['', '', '', '', '', ''])
      }
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1)

    const newOtp = [...otpCode]
    newOtp[index] = digit
    setOtpCode(newOtp)

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5) {
      const fullCode = newOtp.join('')
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtpCode(newOtp)
      handleVerifyOtp(pastedData)
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setError(null)
    setViewState('verifying')

    const { error: verifyError } = await onVerifyOtp(email, code)
    if (verifyError) {
      setError(verifyError.message)
      setViewState('otp-sent')
      setOtpCode(['', '', '', '', '', ''])
      otpInputRefs.current[0]?.focus()
    }
    // If successful, auth state change will handle navigation
  }

  const handleBack = () => {
    setViewState('input')
    setError(null)
    setOtpCode(['', '', '', '', '', ''])
  }

  const handleResendCode = async () => {
    setError(null)
    setViewState('sending')
    const { error: otpError } = await onSendOtp(email)
    if (otpError) {
      setError(otpError.message)
    }
    setViewState('otp-sent')
    setOtpCode(['', '', '', '', '', ''])
    otpInputRefs.current[0]?.focus()
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'otp' ? 'password' : 'otp')
    setError(null)
    setPassword('')
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
        <Utensils size={32} className="text-emerald-500" />
      </div>
      <h1 className="text-4xl font-bold text-emerald-500 mb-2">MacroLens</h1>
      <p className="text-gray-400 mb-8 text-center">Your AI Food Companion</p>

      {/* Card */}
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        {viewState === 'otp-sent' || viewState === 'verifying' ? (
          // OTP code entry state
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <h2 className="text-xl font-semibold text-white mb-2">Enter code</h2>
            <p className="text-gray-400 text-sm mb-6">
              We sent a 6-digit code to<br />
              <span className="text-white font-medium">{email}</span>
            </p>

            {/* OTP Input Boxes */}
            <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={viewState === 'verifying'}
                  className="w-12 h-14 bg-zinc-800 border border-zinc-700 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            {/* Verifying indicator */}
            {viewState === 'verifying' && (
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying...</span>
              </div>
            )}

            {/* Resend code */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendCode}
                disabled={viewState === 'verifying'}
                className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </div>
        ) : (
          // Input state
          <>
            <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
            <p className="text-gray-400 text-sm mb-6">
              {authMode === 'otp'
                ? 'Enter your email to receive a code'
                : 'Enter your email and password'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email input */}
              <div className="relative mb-4">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={viewState === 'sending'}
                  autoComplete="email"
                />
              </div>

              {/* Password input (only for password mode) */}
              {authMode === 'password' && (
                <div className="relative mb-4">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    disabled={viewState === 'sending'}
                    autoComplete="current-password"
                  />
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={viewState === 'sending'}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {viewState === 'sending' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{authMode === 'otp' ? 'Sending code...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{authMode === 'otp' ? 'Send Code' : 'Sign In'}</span>
                )}
              </button>
            </form>

            {/* Toggle auth mode */}
            <div className="mt-4 text-center">
              <button
                onClick={toggleAuthMode}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                {authMode === 'otp'
                  ? 'Sign in with password instead'
                  : 'Sign in with email code instead'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-6 text-center">
        {authMode === 'otp'
          ? 'Sign in securely with a one-time code'
          : 'Sign in with your account'}
      </p>
    </div>
  )
}
