import { useState, useEffect } from 'react'
import type { Profile, Meal } from '../types'
import { Utensils, Settings as SettingsIcon, Plus, Trash2, ChevronLeft, ChevronRight, Pencil, Sparkles, Users, Scale } from 'lucide-react'
import { MealLogger } from './MealLogger'
import { MealEditor } from './MealEditor'
import { WeightLogger } from './WeightLogger'
import { Settings } from './Settings'
import { WeeklyChart } from './WeeklyChart'
import { CoachDashboard } from './CoachDashboard'
import { getMealsForDate, deleteMeal, calculateDailyTotals, getWeeklyCalories, type DailyCalories } from '../services/mealService'

interface DashboardProps {
  profile: Profile | null
  userEmail: string
  onSignOut: () => Promise<{ error: Error | null }>
  onProfileUpdated?: (profile: Profile) => void
}

export function Dashboard({ profile, userEmail, onSignOut, onProfileUpdated }: DashboardProps) {
  const [showMealLogger, setShowMealLogger] = useState(false)
  const [showWeightLogger, setShowWeightLogger] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCoachDashboard, setShowCoachDashboard] = useState(false)
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

  const handleWeightLogged = () => {
    // Refresh profile to get updated weight
    onProfileUpdated?.(profile!)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getEncouragement = () => {
    const percentage = (consumed.calories / targets.calories) * 100
    if (consumed.calories === 0) return null
    if (percentage >= 80 && percentage <= 100) return "You're doing great today!"
    if (percentage > 100 && percentage <= 110) return "Slightly over, but that's okay!"
    if (consumed.calories > 0 && percentage < 50) return "Keep logging your meals!"
    return null
  }

  const encouragement = getEncouragement()

  return (
    <div className="min-h-dvh bg-[#1A1A1A]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F97066]/20 rounded-lg flex items-center justify-center">
            <Utensils size={18} className="text-[#F97066]" />
          </div>
          <span className="font-semibold text-[#FAFAFA]">MacroLens</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowWeightLogger(true)}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors"
            title="Log Weight"
          >
            <Scale size={20} />
          </button>
          <button
            onClick={() => setShowCoachDashboard(true)}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors"
            title="Coach Dashboard"
          >
            <Users size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 pb-24">
        {/* Greeting */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-[#FAFAFA]">
            {getGreeting()}, {profile?.name ?? 'there'}
          </h1>
          <p className="text-[#A1A1A1] text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-[#262626] rounded-2xl p-3 border border-[#333]">
          <button
            onClick={goToPreviousDay}
            className="p-2 text-[#A1A1A1] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[#333]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className={`font-medium px-4 py-1 rounded-full transition-colors ${isToday() ? 'text-[#F97066] bg-[#F97066]/10' : 'text-[#FAFAFA] hover:text-[#F97066]'}`}
          >
            {formatDateHeader()}
          </button>
          <button
            onClick={goToNextDay}
            disabled={isToday()}
            className={`p-2 transition-colors rounded-lg ${isToday() ? 'text-[#333] cursor-not-allowed' : 'text-[#A1A1A1] hover:text-[#FAFAFA] hover:bg-[#333]'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calorie Ring Card */}
        <div className="bg-[#262626] rounded-3xl p-6 border border-[#333] mb-4 animate-scale-in">
          <div className="flex items-center justify-between">
            {/* Left side - Ring */}
            <div className="relative">
              <CalorieRing
                consumed={consumed.calories}
                target={targets.calories}
                size={140}
              />
            </div>

            {/* Right side - Stats */}
            <div className="flex-1 ml-6">
              <div className="mb-4">
                <span className="text-[#A1A1A1] text-sm">Daily Goal</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#FAFAFA]">{consumed.calories}</span>
                  <span className="text-[#6B6B6B]">/ {targets.calories}</span>
                </div>
              </div>

              <div className={`text-sm ${consumed.calories > targets.calories ? 'text-[#F87171]' : 'text-[#4ADE80]'}`}>
                {consumed.calories > targets.calories
                  ? `${consumed.calories - targets.calories} over target`
                  : `${targets.calories - consumed.calories} remaining`}
              </div>

              {encouragement && (
                <div className="mt-3 flex items-center gap-2 text-sm text-[#F97066]">
                  <Sparkles size={14} />
                  <span>{encouragement}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Macros grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MacroCard
            label="Protein"
            current={consumed.protein}
            target={targets.protein}
            color="#F472B6"
          />
          <MacroCard
            label="Carbs"
            current={consumed.carbs}
            target={targets.carbs}
            color="#FBBF24"
          />
          <MacroCard
            label="Fat"
            current={consumed.fat}
            target={targets.fat}
            color="#60A5FA"
          />
        </div>

        {/* Weekly Chart */}
        {weeklyData.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <WeeklyChart data={weeklyData} targetCalories={targets.calories} />
          </div>
        )}

        {/* Meals list */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">
            {isToday() ? "Today's Meals" : `Meals for ${formatDateHeader()}`}
          </h2>
          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-24 w-full"></div>
              <div className="skeleton h-24 w-full"></div>
            </div>
          ) : meals.length === 0 ? (
            <div className="bg-[#262626] rounded-2xl p-8 border border-dashed border-[#404040] text-center animate-fade-in">
              <div className="w-16 h-16 bg-[#F97066]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Utensils size={28} className="text-[#F97066]" />
              </div>
              <p className="text-[#FAFAFA] font-medium mb-1">No meals logged {isToday() ? 'yet' : 'for this day'}</p>
              {isToday() && (
                <p className="text-[#A1A1A1] text-sm">Tap the + button to log your first meal</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal, index) => (
                <div
                  key={meal.id}
                  className="bg-[#262626] rounded-2xl p-4 border border-[#333] animate-slide-up card-hover"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-[#FAFAFA] font-medium">{meal.name}</h3>
                      <span className="text-[#6B6B6B] text-xs">{formatTime(meal.timestamp)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingMeal(meal)}
                        className="p-2 text-[#6B6B6B] hover:text-[#F97066] transition-colors rounded-lg hover:bg-[#333]"
                        title="Edit meal"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-2 text-[#6B6B6B] hover:text-[#F87171] transition-colors rounded-lg hover:bg-[#333]"
                        title="Delete meal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-[#F97066] font-medium">{meal.nutrients.calories} cal</span>
                    <span className="text-[#F472B6]">{meal.nutrients.protein}g P</span>
                    <span className="text-[#FBBF24]">{meal.nutrients.carbs}g C</span>
                    <span className="text-[#60A5FA]">{meal.nutrients.fat}g F</span>
                  </div>
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="mt-2 text-xs text-[#6B6B6B]">
                      {meal.ingredients.map(i => i.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add meal FAB - only show for today */}
      {isToday() && (
        <button
          onClick={() => setShowMealLogger(true)}
          className="fixed bottom-6 right-6 w-14 h-14 btn-primary rounded-full flex items-center justify-center shadow-lg shadow-[#F97066]/20"
        >
          <Plus size={28} className="text-white" />
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

      {/* Weight Logger Modal */}
      {showWeightLogger && profile && (
        <WeightLogger
          profile={profile}
          onClose={() => setShowWeightLogger(false)}
          onWeightLogged={handleWeightLogged}
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
          userEmail={userEmail}
          onClose={() => setShowSettings(false)}
          onProfileUpdated={handleProfileUpdated}
          onSignOut={handleSignOut}
        />
      )}

      {/* Coach Dashboard Modal */}
      {showCoachDashboard && profile && (
        <CoachDashboard
          profile={profile}
          onClose={() => setShowCoachDashboard(false)}
        />
      )}
    </div>
  )
}

interface CalorieRingProps {
  consumed: number
  target: number
  size: number
}

function CalorieRing({ consumed, target, size }: CalorieRingProps) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((consumed / target) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference
  const isOver = consumed > target

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOver ? '#F87171' : '#F97066'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#FAFAFA]">{Math.round(percentage)}%</span>
        <span className="text-xs text-[#A1A1A1]">of goal</span>
      </div>
    </div>
  )
}

interface MacroCardProps {
  label: string
  current: number
  target: number
  color: string
}

function MacroCard({ label, current, target, color }: MacroCardProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isOver = current > target

  return (
    <div className="bg-[#262626] rounded-2xl p-4 border border-[#333]">
      <div className="text-xs text-[#A1A1A1] mb-2">{label}</div>
      <div className={`text-xl font-bold mb-1`} style={{ color: isOver ? '#F87171' : color }}>
        {current}g
      </div>
      <div className="text-xs text-[#6B6B6B] mb-3">/ {target}g</div>

      {/* Pill-shaped progress bar */}
      <div className="h-2 bg-[#333] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? '#F87171' : color
          }}
        />
      </div>
    </div>
  )
}
