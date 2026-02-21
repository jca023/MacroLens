import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { LandingPage } from './components/LandingPage'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import { CameraView } from './components/CameraView'
import { Onboarding } from './components/Onboarding'
import { TermsOfService } from './components/TermsOfService'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { getProfile, upsertProfile } from './services/profileService'
import type { Profile } from './types'
import './index.css'

type AppState = 'loading' | 'landing' | 'login' | 'onboarding' | 'camera' | 'dashboard' | 'terms' | 'privacy'

function App() {
  const { user, loading: authLoading, sendOtp, verifyOtp, signInWithPassword, signOut } = useAuth()
  const [appState, setAppState] = useState<AppState>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)

  // Check for existing profile when user logs in
  useEffect(() => {
    async function checkProfile() {
      if (!user) {
        // Show landing page for non-authenticated users
        setAppState('landing')
        setProfile(null)
        return
      }

      try {
        const existingProfile = await getProfile(user.id)
        // Check if profile exists AND is complete (has required fields)
        const isProfileComplete = existingProfile &&
          existingProfile.name &&
          existingProfile.age &&
          existingProfile.gender &&
          existingProfile.weight &&
          existingProfile.height &&
          existingProfile.activity_level &&
          existingProfile.goal

        if (isProfileComplete) {
          setProfile(existingProfile)
          setAppState('camera')
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
      // Use upsert since a partial profile row might already exist
      const newProfile = await upsertProfile({
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setProfile(newProfile)
      setAppState('camera')
    } catch (error) {
      console.error('Error saving profile:', error)
      throw error
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    const result = await signOut()
    setProfile(null)
    setAppState('landing')
    return result
  }

  // Handle profile update from settings
  const handleProfileUpdated = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  // Navigate from landing to login
  const handleGetStarted = () => {
    setAppState('login')
  }

  // Navigate to Terms of Service
  const handleTerms = () => {
    setAppState('terms')
  }

  // Navigate to Privacy Policy
  const handlePrivacy = () => {
    setAppState('privacy')
  }

  // Navigate back to landing from legal pages
  const handleBackToLanding = () => {
    setAppState('landing')
  }

  // Show loading spinner while checking auth or profile
  if (authLoading || appState === 'loading') {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <Loader2 size={48} className="text-[#F97066] animate-spin" />
      </div>
    )
  }

  // Show Terms of Service
  if (appState === 'terms') {
    return <TermsOfService onBack={handleBackToLanding} />
  }

  // Show Privacy Policy
  if (appState === 'privacy') {
    return <PrivacyPolicy onBack={handleBackToLanding} />
  }

  // Show landing page for non-authenticated users (first visit)
  if (appState === 'landing' && !user) {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onTerms={handleTerms}
        onPrivacy={handlePrivacy}
      />
    )
  }

  // Show login page
  if (appState === 'login' && !user) {
    return (
      <LoginPage
        onSignInWithPassword={signInWithPassword}
        onSendOtp={sendOtp}
        onVerifyOtp={verifyOtp}
      />
    )
  }

  // Show onboarding if no profile
  if (appState === 'onboarding' && user) {
    return <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />
  }

  // Show camera view (default after login)
  if (appState === 'camera' && user && profile) {
    return (
      <CameraView
        userId={profile.id}
        onMealLogged={() => {}}
        onGoToDashboard={() => setAppState('dashboard')}
      />
    )
  }

  // Show dashboard
  return (
    <Dashboard
      profile={profile}
      userEmail={user?.email || ''}
      onSignOut={handleSignOut}
      onProfileUpdated={handleProfileUpdated}
      onGoToCamera={() => setAppState('camera')}
    />
  )
}

export default App
