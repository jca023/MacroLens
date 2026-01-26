import { useState } from 'react'
import { Utensils, Mail, Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onSignInWithEmail: (email: string) => Promise<{ error: Error | null }>
  onSignInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>
}

type ViewState = 'input' | 'sending' | 'sent'
type AuthMode = 'magic-link' | 'password'

export function LoginPage({ onSignInWithEmail, onSignInWithPassword }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [viewState, setViewState] = useState<ViewState>('input')
  const [authMode, setAuthMode] = useState<AuthMode>('password')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    if (authMode === 'password' && !password.trim()) {
      setError('Please enter your password')
      return
    }

    setViewState('sending')

    if (authMode === 'magic-link') {
      const { error: signInError } = await onSignInWithEmail(email)
      if (signInError) {
        setError(signInError.message)
        setViewState('input')
      } else {
        setViewState('sent')
      }
    } else {
      const { error: signInError } = await onSignInWithPassword(email, password)
      if (signInError) {
        setError(signInError.message)
        setViewState('input')
      }
      // If successful, the auth state change will handle navigation
    }
  }

  const handleBack = () => {
    setViewState('input')
    setError(null)
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'magic-link' ? 'password' : 'magic-link')
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
        {viewState === 'sent' ? (
          // Magic link sent state
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
              {authMode === 'magic-link'
                ? 'Enter your email to receive a magic link'
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
                    <span>{authMode === 'magic-link' ? 'Sending...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{authMode === 'magic-link' ? 'Send Magic Link' : 'Sign In'}</span>
                )}
              </button>
            </form>

            {/* Toggle auth mode */}
            <div className="mt-4 text-center">
              <button
                onClick={toggleAuthMode}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                {authMode === 'magic-link'
                  ? 'Sign in with password instead'
                  : 'Sign in with magic link instead'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-6 text-center">
        {authMode === 'magic-link'
          ? 'Sign in securely with magic link'
          : 'Sign in with your account'}
      </p>
    </div>
  )
}
