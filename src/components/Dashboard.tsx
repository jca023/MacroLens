import type { Profile } from '../types'
import { Utensils, LogOut, Plus, Flame, Beef, Wheat, Droplet } from 'lucide-react'

interface DashboardProps {
  profile: Profile | null
  onSignOut: () => Promise<{ error: Error | null }>
}

export function Dashboard({ profile, onSignOut }: DashboardProps) {
  const handleSignOut = async () => {
    await onSignOut()
  }

  const targets = profile?.daily_targets ?? { calories: 2000, protein: 150, carbs: 200, fat: 67 }

  // Placeholder - will be replaced with actual meal data
  const consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 }

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
      <main className="p-4 pb-24">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Hi, {profile?.name ?? 'there'}!
          </h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Calories card */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              <span className="text-gray-400">Calories</span>
            </div>
            <span className="text-gray-500 text-sm">
              {targets.calories - consumed.calories} remaining
            </span>
          </div>

          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-white">{consumed.calories}</span>
            <span className="text-gray-500 mb-1">/ {targets.calories}</span>
          </div>

          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min((consumed.calories / targets.calories) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Macros grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MacroCard
            icon={<Beef size={18} />}
            label="Protein"
            current={consumed.protein}
            target={targets.protein}
            color="text-red-400"
            bgColor="bg-red-500/10"
          />
          <MacroCard
            icon={<Wheat size={18} />}
            label="Carbs"
            current={consumed.carbs}
            target={targets.carbs}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
          />
          <MacroCard
            icon={<Droplet size={18} />}
            label="Fat"
            current={consumed.fat}
            target={targets.fat}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
        </div>

        {/* Today's meals placeholder */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Today's Meals</h2>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 border-dashed">
            <div className="text-center text-gray-500">
              <p className="mb-2">No meals logged yet</p>
              <p className="text-sm">Tap the + button to add your first meal</p>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        {profile && (
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">BMR</span>
                <span className="text-white ml-2">{profile.bmr} cal</span>
              </div>
              <div>
                <span className="text-gray-500">TDEE</span>
                <span className="text-white ml-2">{profile.tdee} cal</span>
              </div>
              <div>
                <span className="text-gray-500">Goal</span>
                <span className="text-emerald-500 ml-2 capitalize">{profile.goal}</span>
              </div>
              <div>
                <span className="text-gray-500">Activity</span>
                <span className="text-white ml-2 capitalize">{profile.activity_level?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add meal FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
        <Plus size={28} className="text-black" />
      </button>
    </div>
  )
}

interface MacroCardProps {
  icon: React.ReactNode
  label: string
  current: number
  target: number
  color: string
  bgColor: string
}

function MacroCard({ icon, label, current, target, color, bgColor }: MacroCardProps) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
      <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mb-2`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{current}g</div>
      <div className="text-xs text-gray-500 mb-2">/ {target}g</div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color.replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
