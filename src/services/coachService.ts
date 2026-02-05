import { supabase } from '../lib/supabase'
import type {
  Coach,
  CoachClient,
  CoachInviteCode,
  CoachRequest,
  ClientSharingSettings,
  CoachInsert,
  CoachRequestInsert,
  ClientSharingSettingsUpdate,
  CoachUpdate,
  CoachRequestUpdate,
  Meal,
} from '../types'

// ============================================
// Coach CRUD Operations
// ============================================

/**
 * Get coach record by user ID
 */
export async function getCoach(userId: string): Promise<Coach | null> {
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching coach:', error)
    throw error
  }

  return data
}

/**
 * Create a new coach subscription
 */
export async function createCoach(coach: CoachInsert): Promise<Coach> {
  const { data, error } = await supabase
    .from('coaches')
    .insert({
      ...coach,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating coach:', error)
    throw error
  }

  return data
}

/**
 * Update coach record
 */
export async function updateCoach(coachId: string, updates: CoachUpdate): Promise<Coach> {
  const { data, error } = await supabase
    .from('coaches')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', coachId)
    .select()
    .single()

  if (error) {
    console.error('Error updating coach:', error)
    throw error
  }

  return data
}

// ============================================
// Coach-Client Relationship Operations
// ============================================

/**
 * Get all clients for a coach (with profile data)
 */
export async function getCoachClients(coachId: string): Promise<CoachClient[]> {
  const { data, error } = await supabase
    .from('coach_clients')
    .select(`
      *,
      client_profile:profiles!coach_clients_client_id_fkey(*)
    `)
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coach clients:', error)
    throw error
  }

  return data || []
}

/**
 * Get active client count for a coach
 */
export async function getActiveClientCount(coachId: string): Promise<number> {
  const { count, error } = await supabase
    .from('coach_clients')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', coachId)
    .eq('status', 'active')

  if (error) {
    console.error('Error counting clients:', error)
    throw error
  }

  return count || 0
}

/**
 * Get pending connection requests for a coach
 */
export async function getPendingRequests(coachId: string): Promise<CoachClient[]> {
  const { data, error } = await supabase
    .from('coach_clients')
    .select(`
      *,
      client_profile:profiles!coach_clients_client_id_fkey(*)
    `)
    .eq('coach_id', coachId)
    .eq('status', 'pending_request')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending requests:', error)
    throw error
  }

  return data || []
}

/**
 * Client initiates connection request to a coach by email
 */
export async function requestCoachByEmail(
  clientId: string,
  coachEmail: string
): Promise<CoachClient> {
  // Find coach by email via RPC function (needs to be created in Supabase)
  const { data: coaches, error: coachError } = await supabase
    .rpc('find_coach_by_email', { email_input: coachEmail })

  if (coachError || !coaches || coaches.length === 0) {
    throw new Error('No coach found with that email address')
  }

  const coachId = coaches[0].id

  // Check if relationship already exists
  const { data: existing } = await supabase
    .from('coach_clients')
    .select('*')
    .eq('coach_id', coachId)
    .eq('client_id', clientId)
    .not('status', 'eq', 'disconnected')
    .single()

  if (existing) {
    throw new Error('A connection request already exists with this coach')
  }

  // Create the connection request
  const { data, error } = await supabase
    .from('coach_clients')
    .insert({
      coach_id: coachId,
      client_id: clientId,
      status: 'pending_request',
      initiated_by: 'client',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating coach request:', error)
    throw error
  }

  return data
}

/**
 * Coach approves a client request and generates invite code
 */
export async function approveClientRequest(
  coachClientId: string,
  clientEmail: string
): Promise<CoachInviteCode> {
  // Update the relationship status
  const { data: updated, error: updateError } = await supabase
    .from('coach_clients')
    .update({ status: 'pending_code' })
    .eq('id', coachClientId)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating client request:', updateError)
    throw updateError
  }

  // Generate a 6-character alphanumeric code
  const code = generateInviteCode()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 48) // 48 hour expiry

  // Create the invite code
  const { data: inviteCode, error: codeError } = await supabase
    .from('coach_invite_codes')
    .insert({
      coach_id: updated.coach_id,
      client_email: clientEmail,
      code,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (codeError) {
    console.error('Error creating invite code:', codeError)
    throw codeError
  }

  return inviteCode
}

/**
 * Coach declines a client request
 */
export async function declineClientRequest(coachClientId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_clients')
    .delete()
    .eq('id', coachClientId)

  if (error) {
    console.error('Error declining client request:', error)
    throw error
  }
}

/**
 * Client enters invite code to complete connection
 */
export async function verifyInviteCode(
  clientId: string,
  clientEmail: string,
  code: string
): Promise<CoachClient> {
  // Find the invite code
  const { data: inviteCode, error: codeError } = await supabase
    .from('coach_invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('client_email', clientEmail.toLowerCase())
    .is('used_at', null)
    .single()

  if (codeError || !inviteCode) {
    throw new Error('Invalid or expired invite code')
  }

  // Check if expired
  if (new Date(inviteCode.expires_at) < new Date()) {
    throw new Error('This invite code has expired')
  }

  // Mark code as used
  await supabase
    .from('coach_invite_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', inviteCode.id)

  // Update the coach-client relationship to active
  const { data: connection, error: connectionError } = await supabase
    .from('coach_clients')
    .update({
      status: 'active',
      connected_at: new Date().toISOString(),
    })
    .eq('coach_id', inviteCode.coach_id)
    .eq('client_id', clientId)
    .select()
    .single()

  if (connectionError) {
    console.error('Error activating connection:', connectionError)
    throw connectionError
  }

  return connection
}

/**
 * Disconnect coach-client relationship (either party)
 */
export async function disconnectCoachClient(coachClientId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_clients')
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
    })
    .eq('id', coachClientId)

  if (error) {
    console.error('Error disconnecting:', error)
    throw error
  }
}

/**
 * Get client's current coach connection (if any)
 */
export async function getClientCoachConnection(clientId: string): Promise<CoachClient | null> {
  const { data, error } = await supabase
    .from('coach_clients')
    .select(`
      *,
      coach_profile:profiles!coach_clients_coach_id_fkey(*)
    `)
    .eq('client_id', clientId)
    .in('status', ['pending_request', 'pending_code', 'active'])
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching coach connection:', error)
    throw error
  }

  return data
}

// ============================================
// Client Sharing Settings
// ============================================

/**
 * Get or create client sharing settings
 */
export async function getClientSharingSettings(clientId: string): Promise<ClientSharingSettings> {
  const { data, error } = await supabase
    .from('client_sharing_settings')
    .select('*')
    .eq('client_id', clientId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Create default settings
      const { data: newSettings, error: createError } = await supabase
        .from('client_sharing_settings')
        .insert({
          client_id: clientId,
          share_meals_auto: false,
          share_weight_auto: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }
      return newSettings
    }
    throw error
  }

  return data
}

/**
 * Update client sharing settings
 */
export async function updateSharingSettings(
  clientId: string,
  updates: ClientSharingSettingsUpdate
): Promise<ClientSharingSettings> {
  const { data, error } = await supabase
    .from('client_sharing_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('client_id', clientId)
    .select()
    .single()

  if (error) {
    console.error('Error updating sharing settings:', error)
    throw error
  }

  return data
}

// ============================================
// Coach Requests (Check-ins)
// ============================================

/**
 * Coach sends a request to a client
 */
export async function sendCoachRequest(request: CoachRequestInsert): Promise<CoachRequest> {
  const { data, error } = await supabase
    .from('coach_requests')
    .insert({
      ...request,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending coach request:', error)
    throw error
  }

  return data
}

/**
 * Get pending requests for a client
 */
export async function getClientPendingRequests(clientId: string): Promise<CoachRequest[]> {
  const { data, error } = await supabase
    .from('coach_requests')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client requests:', error)
    throw error
  }

  return data || []
}

/**
 * Update coach request status
 */
export async function updateCoachRequest(
  requestId: string,
  updates: CoachRequestUpdate
): Promise<CoachRequest> {
  const { data, error } = await supabase
    .from('coach_requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    console.error('Error updating coach request:', error)
    throw error
  }

  return data
}

// ============================================
// Coach Data Access (View Client Data)
// ============================================

/**
 * Coach views client's meals (respecting sharing settings)
 */
export async function getClientMeals(
  coachId: string,
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<Meal[]> {
  // Verify coach has access to this client
  const { data: connection, error: connectionError } = await supabase
    .from('coach_clients')
    .select('*')
    .eq('coach_id', coachId)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  if (connectionError || !connection) {
    throw new Error('No active connection with this client')
  }

  // Check sharing settings
  const settings = await getClientSharingSettings(clientId)
  if (!settings.share_meals_auto) {
    // Only return manually shared meals (future feature)
    return []
  }

  // Get meals within date range
  const startTimestamp = Math.floor(startDate.getTime() / 1000)
  const endTimestamp = Math.floor(endDate.getTime() / 1000)

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', clientId)
    .gte('timestamp', startTimestamp)
    .lte('timestamp', endTimestamp)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching client meals:', error)
    throw error
  }

  return data || []
}

/**
 * Get client's last activity date
 */
export async function getClientLastActivity(clientId: string): Promise<Date | null> {
  const { data, error } = await supabase
    .from('meals')
    .select('timestamp')
    .eq('user_id', clientId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data ? new Date(data.timestamp * 1000) : null
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a 6-character alphanumeric invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded confusing chars: I, O, 0, 1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Check if coach can add more clients
 */
export async function canAddClient(coachId: string): Promise<{
  canAdd: boolean
  currentCount: number
  limit: number
  requiresOverflow: boolean
}> {
  const coach = await getCoach(coachId)
  if (!coach) {
    throw new Error('Coach not found')
  }

  const currentCount = await getActiveClientCount(coachId)
  const baseLimit = coach.client_limit
  const totalLimit = baseLimit + coach.extra_client_count

  return {
    canAdd: currentCount < totalLimit + 5, // Max +5 overflow
    currentCount,
    limit: totalLimit,
    requiresOverflow: currentCount >= totalLimit,
  }
}
