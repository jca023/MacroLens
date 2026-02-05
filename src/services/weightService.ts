import { supabase } from '../lib/supabase'
import type { WeightEntry, WeightEntryInsert, WeightEntryUpdate, Profile, WeightUnit } from '../types'

export async function createWeightEntry(entry: WeightEntryInsert): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from('weight_entries')
    .insert(entry)
    .select()
    .single()

  if (error) {
    console.error('Error creating weight entry:', error)
    throw error
  }

  return data
}

export async function getWeightEntries(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  limit?: number
): Promise<WeightEntry[]> {
  let query = supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })

  if (startDate) {
    query = query.gte('recorded_at', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('recorded_at', endDate.toISOString())
  }
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching weight entries:', error)
    throw error
  }

  return data || []
}

export async function getLatestWeight(userId: string): Promise<WeightEntry | null> {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No entries found
    console.error('Error fetching latest weight:', error)
    throw error
  }

  return data
}

export async function updateWeightEntry(
  entryId: string,
  updates: WeightEntryUpdate
): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from('weight_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single()

  if (error) {
    console.error('Error updating weight entry:', error)
    throw error
  }

  return data
}

export async function deleteWeightEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    console.error('Error deleting weight entry:', error)
    throw error
  }
}

export async function uploadWeightPhoto(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('weight-photos')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading weight photo:', error)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from('weight-photos')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

// Weight trend data for charts
export interface WeightTrendPoint {
  date: Date
  weight: number
  unit: WeightUnit
}

export async function getWeightTrend(
  userId: string,
  days: number = 30
): Promise<WeightTrendPoint[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const entries = await getWeightEntries(userId, startDate)

  return entries.map(entry => ({
    date: new Date(entry.recorded_at),
    weight: entry.weight,
    unit: entry.unit
  }))
}

// Convert weight between units
export function convertWeight(
  weight: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number {
  if (fromUnit === toUnit) return weight
  if (fromUnit === 'lbs') return Math.round(weight * 0.453592 * 10) / 10 // lbs to kg
  return Math.round(weight * 2.20462 * 10) / 10 // kg to lbs
}

// Update profile weight after logging
export async function updateProfileWeight(
  userId: string,
  weight: number,
  unit: WeightUnit,
  profile: Profile
): Promise<void> {
  // Convert to profile's unit system if different
  const profileUnit: WeightUnit = profile.unit_system === 'imperial' ? 'lbs' : 'kg'
  const convertedWeight = convertWeight(weight, unit, profileUnit)

  const { error } = await supabase
    .from('profiles')
    .update({
      weight: convertedWeight,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile weight:', error)
    throw error
  }
}

// Mark coach request as completed after weight submission
export async function completeWeighInRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_requests')
    .update({ status: 'completed' })
    .eq('id', requestId)

  if (error) {
    console.error('Error completing weigh-in request:', error)
    throw error
  }
}

// Get client weight entries for coach view
export async function getClientWeightEntries(
  coachId: string,
  clientId: string,
  startDate?: Date,
  endDate?: Date
): Promise<WeightEntry[]> {
  // First verify coach has access
  const { data: connection, error: connError } = await supabase
    .from('coach_clients')
    .select('*')
    .eq('coach_id', coachId)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  if (connError || !connection) {
    throw new Error('No active connection with this client')
  }

  // Check sharing settings
  const { data: settings } = await supabase
    .from('client_sharing_settings')
    .select('share_weight_auto')
    .eq('client_id', clientId)
    .single()

  if (!settings?.share_weight_auto) {
    return [] // Sharing not enabled
  }

  // Fetch entries
  return getWeightEntries(clientId, startDate, endDate)
}

// Calculate weight change statistics
export interface WeightStats {
  currentWeight: number
  startWeight: number
  change: number
  changePercent: number
  unit: WeightUnit
  entries: number
  daysCovered: number
}

export async function getWeightStats(
  userId: string,
  days: number = 30
): Promise<WeightStats | null> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const entries = await getWeightEntries(userId, startDate)

  if (entries.length === 0) {
    return null
  }

  // Most recent entry is first (sorted desc)
  const currentWeight = entries[0].weight
  const unit = entries[0].unit

  // Get the oldest entry in the range
  const startWeight = entries[entries.length - 1].weight
  const change = currentWeight - startWeight
  const changePercent = startWeight > 0 ? (change / startWeight) * 100 : 0

  // Calculate actual days covered
  const oldestDate = new Date(entries[entries.length - 1].recorded_at)
  const newestDate = new Date(entries[0].recorded_at)
  const daysCovered = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))

  return {
    currentWeight,
    startWeight,
    change: Math.round(change * 10) / 10,
    changePercent: Math.round(changePercent * 10) / 10,
    unit,
    entries: entries.length,
    daysCovered: Math.max(daysCovered, 1)
  }
}
