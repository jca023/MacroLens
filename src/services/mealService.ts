import { supabase } from '../lib/supabase'
import type { Meal, MealInsert, MealUpdate } from '../types'

export async function createMeal(meal: MealInsert): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .insert(meal)
    .select()
    .single()

  if (error) {
    console.error('Error creating meal:', error)
    throw error
  }

  return data
}

export async function getMealsForDate(userId: string, date: Date): Promise<Meal[]> {
  // Get start and end of day in Unix timestamp
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const startTimestamp = Math.floor(startOfDay.getTime() / 1000)
  const endTimestamp = Math.floor(endOfDay.getTime() / 1000)

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startTimestamp)
    .lte('timestamp', endTimestamp)
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching meals:', error)
    throw error
  }

  return data || []
}

export async function getMealById(mealId: string): Promise<Meal | null> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', mealId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('Error fetching meal:', error)
    throw error
  }

  return data
}

export async function deleteMeal(mealId: string): Promise<void> {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)

  if (error) {
    console.error('Error deleting meal:', error)
    throw error
  }
}

export async function updateMeal(mealId: string, updates: MealUpdate): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', mealId)
    .select()
    .single()

  if (error) {
    console.error('Error updating meal:', error)
    throw error
  }

  return data
}

export async function uploadMealImage(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('meal-images')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from('meal-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export function calculateDailyTotals(meals: Meal[]): {
  calories: number
  protein: number
  carbs: number
  fat: number
} {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + (meal.nutrients?.calories || 0),
      protein: totals.protein + (meal.nutrients?.protein || 0),
      carbs: totals.carbs + (meal.nutrients?.carbs || 0),
      fat: totals.fat + (meal.nutrients?.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export interface DailyCalories {
  date: Date
  calories: number
}

export async function getWeeklyCalories(userId: string): Promise<DailyCalories[]> {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const startTimestamp = Math.floor(sevenDaysAgo.getTime() / 1000)
  const endTimestamp = Math.floor(today.getTime() / 1000) + 86400 // Include all of today

  const { data, error } = await supabase
    .from('meals')
    .select('timestamp, nutrients')
    .eq('user_id', userId)
    .gte('timestamp', startTimestamp)
    .lte('timestamp', endTimestamp)

  if (error) {
    console.error('Error fetching weekly meals:', error)
    throw error
  }

  // Group by day and sum calories
  const dailyMap = new Map<string, number>()

  // Initialize all 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = date.toDateString()
    dailyMap.set(key, 0)
  }

  // Sum up calories for each day
  for (const meal of data || []) {
    const mealDate = new Date(meal.timestamp * 1000)
    const key = mealDate.toDateString()
    const current = dailyMap.get(key) || 0
    dailyMap.set(key, current + (meal.nutrients?.calories || 0))
  }

  // Convert to array
  const result: DailyCalories[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const key = date.toDateString()
    result.push({
      date,
      calories: dailyMap.get(key) || 0
    })
  }

  return result
}
