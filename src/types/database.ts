// Database types matching Supabase schema

export interface MacroSplit {
  protein: number  // percentage (e.g., 30)
  carbs: number    // percentage (e.g., 40)
  fat: number      // percentage (e.g., 30)
}

export interface DailyTargets {
  calories: number
  protein: number   // grams
  carbs: number     // grams
  fat: number       // grams
}

export interface Nutrients {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface UsageStats {
  totalInputTokens: number
  totalOutputTokens: number
  totalImagesProcessed: number
  estimatedCostUSD: number
}

export interface Ingredient {
  name: string
  amount: string
}

// Database row types
export interface Profile {
  id: string                      // uuid, matches auth.users.id
  name: string | null
  age: number | null
  gender: 'male' | 'female' | null
  weight: number | null           // in kg or lbs based on unit_system
  height: number | null           // in cm or inches based on unit_system
  activity_level: ActivityLevel | null
  goal: Goal | null
  unit_system: 'metric' | 'imperial'
  show_ingredient_race: boolean
  macro_split: MacroSplit | null
  bmr: number | null
  tdee: number | null
  daily_targets: DailyTargets | null
  subscription_tier: 'free' | 'premium'
  usage_stats: UsageStats | null
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string                      // uuid
  user_id: string                 // uuid, references profiles.id
  name: string
  ingredients: Ingredient[] | null
  timestamp: number               // Unix timestamp
  nutrients: Nutrients
  image_url: string | null
  source: 'manual' | 'ai'
  cost: number | null             // AI processing cost
  created_at: string
}

// Enums
export type ActivityLevel =
  | 'sedentary'      // Little or no exercise
  | 'light'          // Light exercise 1-3 days/week
  | 'moderate'       // Moderate exercise 3-5 days/week
  | 'active'         // Hard exercise 6-7 days/week
  | 'very_active'    // Very hard exercise & physical job

export type Goal = 'lose' | 'maintain' | 'gain'

// Insert types (for creating new records)
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type MealInsert = Omit<Meal, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// Update types (for partial updates)
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>
export type MealUpdate = Partial<Omit<Meal, 'id' | 'user_id' | 'created_at'>>
