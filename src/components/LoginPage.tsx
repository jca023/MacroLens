import { useState } from 'react'
import { Utensils, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onSignIn: (email: string) => Promise<{ error: Error | null }>
}

type ViewState = 'input' | 'sending' | 'sent'

export function LoginPage({ onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [viewState, setViewState] = useState<ViewState>('input')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setViewState('sending')

    const { error: signInError } = await onSignIn(email)

    if (signInError) {
      setError(signInError.message)
      setViewState('input')
    } else {
      setViewState('sent')
    }
  }

  const handleBack = () => {
    setViewState('input')
    setError(null)
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
        {viewState === 'sent' ? (
          // Success state
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm mb-4">
              We sent a magic link to<br />
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Click the link in the email to sign in. No password needed!
            </p>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mx-auto"
            >
              <ArrowLeft size={16} />
              <span>Use a different email</span>
            </button>
          </div>
        ) : (
          // Input state
          <>
            <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email to receive a magic link
            </p>

            {/* Email Form */}
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Continue with Email</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-6 text-center">
        Sign in securely with magic link
      </p>
    </div>
  )
}
