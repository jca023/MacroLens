import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import { Onboarding } from './components/Onboarding'
import { getProfile, createProfile } from './services/profileService'
import type { Profile } from './types'
import './index.css'

type AppState = 'loading' | 'login' | 'onboarding' | 'dashboard'

function App() {
  const { user, loading: authLoading, signInWithEmail, signOut } = useAuth()
  const [appState, setAppState] = useState<AppState>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)

  // Check for existing profile when user logs in
  useEffect(() => {
    async function checkProfile() {
      if (!user) {
        setAppState('login')
        setProfile(null)
        return
      }

      try {
        const existingProfile = await getProfile(user.id)
        if (existingProfile) {
          setProfile(existingProfile)
          setAppState('dashboard')
        } else {
          setAppState('onboarding')
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        setAppState('onboarding')
      }
    }

    if (!authLoading) {
      checkProfile()
    }
  }, [user, authLoading])

  // Handle onboarding completion
  const handleOnboardingComplete = async (profileData: Omit<Profile, 'created_at' | 'updated_at'>) => {
    try {
      const newProfile = await createProfile({
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setProfile(newProfile)
      setAppState('dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      throw error
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    const result = await signOut()
    setProfile(null)
    setAppState('login')
    return result
  }

  // Handle profile update from settings
  const handleProfileUpdated = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  // Show loading spinner while checking auth or profile
  if (authLoading || appState === 'loading') {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <Loader2 size={48} className="text-emerald-500 animate-spin" />
      </div>
    )
  }

  // Show login page if not authenticated
  if (appState === 'login' || !user) {
    return <LoginPage onSignIn={signInWithEmail} />
  }

  // Show onboarding if no profile
  if (appState === 'onboarding') {
    return <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />
  }

  // Show dashboard
  return <Dashboard profile={profile} onSignOut={handleSignOut} onProfileUpdated={handleProfileUpdated} />
}

export default App
