import { Loader2 } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import './index.css'

function App() {
  const { user, loading, signInWithEmail, signOut } = useAuth()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <Loader2 size={48} className="text-emerald-500 animate-spin" />
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onSignIn={signInWithEmail} />
  }

  // Show dashboard if authenticated
  return <Dashboard user={user} onSignOut={signOut} />
}

export default App
