import { supabase } from '../lib/supabase'
import type { CoachingLead, CoachingLeadInsert } from '../types'

/**
 * Submit a coaching lead form
 */
export async function submitCoachingLead(lead: CoachingLeadInsert): Promise<CoachingLead> {
  const { data, error } = await supabase
    .from('coaching_leads')
    .insert({
      ...lead,
      status: 'new',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting coaching lead:', error)
    throw error
  }

  // Send email notification via Supabase Edge Function or external service
  await sendLeadNotificationEmail(data)

  return data
}

/**
 * Send email notification for new lead
 * This would typically use a Supabase Edge Function or external email service
 */
async function sendLeadNotificationEmail(lead: CoachingLead): Promise<void> {
  // Get the user's profile for name and email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', lead.user_id)
    .single()

  if (profileError) {
    console.error('Error fetching profile for email:', profileError)
    return
  }

  // Get user's email from auth
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    console.error('Error getting user email:', userError)
    return
  }

  // Format the lead data for email
  const goalText = {
    lose: 'Lose weight',
    maintain: 'Maintain weight',
    gain: 'Gain weight',
  }[lead.goal]

  const weightRangeText = {
    '10-20': '10-20 lbs',
    '20-40': '20-40 lbs',
    '40-60': '40-60 lbs',
    '60+': '60+ lbs',
  }[lead.weight_range]

  const bestTimeText = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
  }[lead.best_time]

  const contactPrefs = lead.contact_preference.map(pref =>
    pref.charAt(0).toUpperCase() + pref.slice(1)
  ).join(', ')

  const emailContent = `
New Coaching Request - ${profile.name || 'Unknown'}

Name: ${profile.name || 'Not provided'}
Email: ${user.email}
Goal: ${goalText}
Amount: ${weightRangeText}
Contact: ${contactPrefs}
Best time: ${bestTimeText}
Message: ${lead.message || 'No message provided'}

---
Submitted via MacroLens
  `.trim()

  // Call Supabase Edge Function to send email (to be implemented)
  try {
    const { error: emailError } = await supabase.functions.invoke('send-coaching-lead-email', {
      body: {
        to: 'getcoached@macrolens.app',
        subject: `New Coaching Request - ${profile.name || 'User'}`,
        content: emailContent,
      },
    })

    if (emailError) {
      console.error('Error sending lead email:', emailError)
      // Don't throw - the lead is already saved, email failure shouldn't break the flow
    }
  } catch (err) {
    // Edge function might not exist yet, log but don't fail
    console.warn('Lead notification email not sent (function may not exist):', err)
  }
}

/**
 * Check if user has already submitted a lead recently (prevent spam)
 */
export async function hasRecentLead(userId: string): Promise<boolean> {
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { count, error } = await supabase
    .from('coaching_leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString())

  if (error) {
    console.error('Error checking recent leads:', error)
    return false
  }

  return (count || 0) > 0
}

/**
 * Get all leads for admin view (future use)
 */
export async function getAllLeads(): Promise<CoachingLead[]> {
  const { data, error } = await supabase
    .from('coaching_leads')
    .select(`
      *,
      user_profile:profiles!coaching_leads_user_id_fkey(name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    throw error
  }

  return data || []
}

/**
 * Update lead status (for admin)
 */
export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'contacted' | 'converted'
): Promise<CoachingLead> {
  const { data, error } = await supabase
    .from('coaching_leads')
    .update({ status })
    .eq('id', leadId)
    .select()
    .single()

  if (error) {
    console.error('Error updating lead status:', error)
    throw error
  }

  return data
}
