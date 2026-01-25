import { useState } from 'react'
import { Utensils, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onSignIn: (email: string) => Promise<{ error: Error | null }>
  onSignInWithGoogle: () => Promise<{ error: Error | null }>
}

type ViewState = 'input' | 'sending' | 'sent'

export function LoginPage({ onSignIn, onSignInWithGoogle }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [viewState, setViewState] = useState<ViewState>('input')
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)

    const { error: signInError } = await onSignInWithGoogle()

    if (signInError) {
      setError(signInError.message)
      setGoogleLoading(false)
    }
    // If successful, page will redirect to Google
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
              Choose your preferred sign in method
            </p>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || viewState === 'sending'}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-900 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-3 mb-4"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

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
                  disabled={viewState === 'sending' || googleLoading}
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
                disabled={viewState === 'sending' || googleLoading}
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
        Sign in securely with Google or magic link
      </p>
    </div>
  )
}
