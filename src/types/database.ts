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

// ============================================
// Coach Dashboard Types (B2B Feature)
// ============================================

export type CoachSubscriptionTier = 'starter' | 'growth' | 'pro'

export type CoachClientStatus = 'pending_request' | 'pending_code' | 'active' | 'disconnected'

export type CoachRequestType = 'weigh_in' | 'log_meals'

export type CoachRequestStatus = 'pending' | 'completed' | 'dismissed'

export type LeadGoal = 'lose' | 'maintain' | 'gain'

export type LeadWeightRange = '10-20' | '20-40' | '40-60' | '60+'

export type LeadContactTime = 'morning' | 'afternoon' | 'evening'

export type LeadStatus = 'new' | 'contacted' | 'converted'

export interface Coach {
  id: string                           // uuid, FK to profiles.id
  subscription_tier: CoachSubscriptionTier
  client_limit: number                 // 10, 30, or 100
  extra_client_count: number           // overflow clients
  created_at: string
  updated_at: string
}

export interface CoachClient {
  id: string                           // uuid
  coach_id: string                     // FK to coaches.id
  client_id: string                    // FK to profiles.id
  status: CoachClientStatus
  initiated_by: 'coach' | 'client'
  connected_at: string | null
  disconnected_at: string | null
  created_at: string
  // Joined fields (for queries)
  client_profile?: Profile
  coach_profile?: Profile
}

export interface ClientSharingSettings {
  client_id: string                    // uuid, PK, FK to profiles.id
  share_meals_auto: boolean            // default false
  share_weight_auto: boolean           // default false
  created_at: string
  updated_at: string
}

export interface CoachInviteCode {
  id: string                           // uuid
  coach_id: string                     // FK to coaches.id
  client_email: string                 // the specific email this code is for
  code: string                         // 6 characters
  expires_at: string                   // 24-48 hours
  used_at: string | null
  created_at: string
}

export interface CoachRequest {
  id: string                           // uuid
  coach_id: string                     // FK to coaches.id
  client_id: string                    // FK to profiles.id
  request_type: CoachRequestType
  message: string | null
  status: CoachRequestStatus
  created_at: string
}

export interface CoachingLead {
  id: string                           // uuid
  user_id: string                      // FK to profiles.id
  goal: LeadGoal
  weight_range: LeadWeightRange
  contact_preference: string[]         // ['call', 'text', 'email']
  best_time: LeadContactTime
  message: string | null
  status: LeadStatus
  created_at: string
}

// Insert types for coach entities
export type CoachInsert = Omit<Coach, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type CoachClientInsert = Omit<CoachClient, 'id' | 'created_at' | 'connected_at' | 'disconnected_at' | 'client_profile' | 'coach_profile'> & {
  id?: string
  created_at?: string
  connected_at?: string | null
  disconnected_at?: string | null
}

export type ClientSharingSettingsInsert = Omit<ClientSharingSettings, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type CoachInviteCodeInsert = Omit<CoachInviteCode, 'id' | 'created_at' | 'used_at'> & {
  id?: string
  created_at?: string
  used_at?: string | null
}

export type CoachRequestInsert = Omit<CoachRequest, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type CoachingLeadInsert = Omit<CoachingLead, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// Update types for coach entities
export type CoachUpdate = Partial<Omit<Coach, 'id' | 'created_at'>>
export type CoachClientUpdate = Partial<Omit<CoachClient, 'id' | 'coach_id' | 'client_id' | 'created_at' | 'client_profile' | 'coach_profile'>>
export type ClientSharingSettingsUpdate = Partial<Omit<ClientSharingSettings, 'client_id' | 'created_at'>>
export type CoachRequestUpdate = Partial<Omit<CoachRequest, 'id' | 'coach_id' | 'client_id' | 'created_at'>>

// Coach subscription tier limits
export const COACH_TIER_LIMITS: Record<CoachSubscriptionTier, number> = {
  starter: 10,
  growth: 30,
  pro: 100,
}

export const COACH_TIER_PRICES: Record<CoachSubscriptionTier, number> = {
  starter: 19.99,
  growth: 29.99,
  pro: 49.99,
}

export const COACH_OVERFLOW_PRICE = 1.49 // per extra client per month
export const COACH_MAX_OVERFLOW = 5 // max extra clients per tier

// ============================================
// Weight Tracking Types
// ============================================

export type WeightSource = 'manual' | 'scale_photo' | 'import'

export type WeightUnit = 'lbs' | 'kg'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface WeightEntry {
  id: string                           // uuid
  user_id: string                      // FK to profiles.id
  weight: number                       // numeric value
  unit: WeightUnit
  recorded_at: string                  // ISO timestamp
  source: WeightSource
  image_url: string | null             // only for coach requests
  coach_request_id: string | null      // FK to coach_requests.id
  confidence: ConfidenceLevel | null
  notes: string | null
  created_at: string
}

export type WeightEntryInsert = Omit<WeightEntry, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type WeightEntryUpdate = Partial<Omit<WeightEntry, 'id' | 'user_id' | 'created_at'>>
