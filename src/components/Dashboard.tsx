import type { User } from '@supabase/supabase-js'
import { Utensils, LogOut, Plus } from 'lucide-react'

interface DashboardProps {
  user: User
  onSignOut: () => Promise<{ error: Error | null }>
}

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const handleSignOut = async () => {
    await onSignOut()
  }

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Utensils size={18} className="text-emerald-500" />
          </div>
          <span className="font-semibold text-white">MacroLens</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main content */}
      <main className="p-4">
        {/* Welcome card */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to MacroLens!
          </h1>
          <p className="text-gray-400 text-sm">
            Signed in as <span className="text-emerald-500">{user.email}</span>
          </p>
        </div>

        {/* Placeholder content */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 border-dashed">
          <div className="text-center text-gray-500">
            <p className="mb-4">Your dashboard is being built!</p>
            <p className="text-sm">Coming soon:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Daily nutrition tracking</li>
              <li>• AI meal recognition</li>
              <li>• Progress visualization</li>
              <li>• Profile & goal settings</li>
            </ul>
          </div>
        </div>

        {/* Add meal FAB placeholder */}
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
          <Plus size={28} className="text-black" />
        </button>
      </main>
    </div>
  )
}
