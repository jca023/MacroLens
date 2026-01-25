import { useState, useEffect } from 'react'
import type { Profile, Meal } from '../types'
import { Utensils, Settings as SettingsIcon, Plus, Flame, Beef, Wheat, Droplet, Trash2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { MealLogger } from './MealLogger'
import { MealEditor } from './MealEditor'
import { Settings } from './Settings'
import { WeeklyChart } from './WeeklyChart'
import { getMealsForDate, deleteMeal, calculateDailyTotals, getWeeklyCalories, type DailyCalories } from '../services/mealService'

interface DashboardProps {
  profile: Profile | null
  onSignOut: () => Promise<{ error: Error | null }>
  onProfileUpdated?: (profile: Profile) => void
}

export function Dashboard({ profile, onSignOut, onProfileUpdated }: DashboardProps) {
  const [showMealLogger, setShowMealLogger] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [weeklyData, setWeeklyData] = useState<DailyCalories[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleSignOut = async () => {
    await onSignOut()
  }

  const handleProfileUpdated = (updatedProfile: Profile) => {
    onProfileUpdated?.(updatedProfile)
    setShowSettings(false)
    // Refresh weekly data after profile update
    fetchWeeklyData()
  }

  const fetchMeals = async () => {
    if (!profile?.id) return

    setLoading(true)
    try {
      const dayMeals = await getMealsForDate(profile.id, selectedDate)
      setMeals(dayMeals)
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyData = async () => {
    if (!profile?.id) return
    try {
      const data = await getWeeklyCalories(profile.id)
      setWeeklyData(data)
    } catch (error) {
      console.error('Error fetching weekly data:', error)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [profile?.id, selectedDate])

  useEffect(() => {
    fetchWeeklyData()
  }, [profile?.id])

  const handleMealLogged = () => {
    fetchMeals()
    fetchWeeklyData()
  }

  const handleMealUpdated = () => {
    fetchMeals()
    fetchWeeklyData()
    setEditingMeal(null)
  }

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMeal(mealId)
      setMeals(prev => prev.filter(m => m.id !== mealId))
      fetchWeeklyData()
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    // Don't allow going past today
    if (newDate <= new Date()) {
      setSelectedDate(newDate)
    }
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = () => {
    const today = new Date()
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    )
  }

  const formatDateHeader = () => {
    if (isToday()) {
      return 'Today'
    }
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (
      selectedDate.getDate() === yesterday.getDate() &&
      selectedDate.getMonth() === yesterday.getMonth() &&
      selectedDate.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday'
    }
    return selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const targets = profile?.daily_targets ?? { calories: 2000, protein: 150, carbs: 200, fat: 67 }
  const consumed = calculateDailyTotals(meals)

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      {/* Main content */}
      <main className="p-4 pb-24">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">
            Hi, {profile?.name ?? 'there'}!
          </h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
          <button
            onClick={goToPreviousDay}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className={`font-medium ${isToday() ? 'text-emerald-500' : 'text-white hover:text-emerald-400'}`}
          >
            {formatDateHeader()}
          </button>
          <button
            onClick={goToNextDay}
            disabled={isToday()}
            className={`p-2 transition-colors ${isToday() ? 'text-zinc-700 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calories card */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              <span className="text-gray-400">Calories</span>
            </div>
            <span className={`text-sm ${consumed.calories > targets.calories ? 'text-red-400' : 'text-gray-500'}`}>
              {consumed.calories > targets.calories
                ? `${consumed.calories - targets.calories} over`
                : `${targets.calories - consumed.calories} remaining`}
            </span>
          </div>

          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-white">{consumed.calories}</span>
            <span className="text-gray-500 mb-1">/ {targets.calories}</span>
          </div>

          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                consumed.calories > targets.calories ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((consumed.calories / targets.calories) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Macros grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
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

        {/* Weekly Chart */}
        {weeklyData.length > 0 && (
          <div className="mb-6">
            <WeeklyChart data={weeklyData} targetCalories={targets.calories} />
          </div>
        )}

        {/* Meals list */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            {isToday() ? "Today's Meals" : `Meals for ${formatDateHeader()}`}
          </h2>
          {loading ? (
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="text-center text-gray-500">Loading meals...</div>
            </div>
          ) : meals.length === 0 ? (
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 border-dashed">
              <div className="text-center text-gray-500">
                <p className="mb-2">No meals logged {isToday() ? 'yet' : 'for this day'}</p>
                {isToday() && <p className="text-sm">Tap the + button to add your first meal</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{meal.name}</h3>
                      <span className="text-gray-500 text-xs">{formatTime(meal.timestamp)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingMeal(meal)}
                        className="p-1.5 text-gray-500 hover:text-emerald-500 transition-colors"
                        title="Edit meal"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-orange-400">{meal.nutrients.calories} cal</span>
                    <span className="text-red-400">{meal.nutrients.protein}g P</span>
                    <span className="text-yellow-400">{meal.nutrients.carbs}g C</span>
                    <span className="text-blue-400">{meal.nutrients.fat}g F</span>
                  </div>
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {meal.ingredients.map(i => i.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

      {/* Add meal FAB - only show for today */}
      {isToday() && (
        <button
          onClick={() => setShowMealLogger(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <Plus size={28} className="text-black" />
        </button>
      )}

      {/* Meal Logger Modal */}
      {showMealLogger && profile && (
        <MealLogger
          userId={profile.id}
          onClose={() => setShowMealLogger(false)}
          onMealLogged={handleMealLogged}
        />
      )}

      {/* Meal Editor Modal */}
      {editingMeal && (
        <MealEditor
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onMealUpdated={handleMealUpdated}
        />
      )}

      {/* Settings Modal */}
      {showSettings && profile && (
        <Settings
          profile={profile}
          onClose={() => setShowSettings(false)}
          onProfileUpdated={handleProfileUpdated}
          onSignOut={handleSignOut}
        />
      )}
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
  const isOver = current > target

  return (
    <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
      <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mb-2`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${isOver ? 'text-red-400' : 'text-white'}`}>{current}g</div>
      <div className="text-xs text-gray-500 mb-2">/ {target}g</div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : color.replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
