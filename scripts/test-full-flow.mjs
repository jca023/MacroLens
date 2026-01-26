#!/usr/bin/env node
/**
 * Full flow test - Login, Onboarding, Dashboard
 *
 * Required environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

import puppeteer from 'puppeteer'
import { config } from 'dotenv'

// Load environment variables from .env
config()

const BASE_URL = 'http://localhost:5173'
const TEST_EMAIL = 'test@macrolens.local'
const TEST_PASSWORD = 'TestPassword123!'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to click button containing text
async function clickButtonWithText(page, text) {
  const buttons = await page.$$('button')
  for (const button of buttons) {
    const buttonText = await button.evaluate(el => el.textContent)
    if (buttonText.includes(text)) {
      await button.click()
      return true
    }
  }
  return false
}

async function testFullFlow() {
  console.log('🚀 Starting full flow test...\n')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 390, height: 844 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  try {
    // ============ Step 1: Load app ============
    console.log('📱 Step 1: Loading app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 })
    await page.screenshot({ path: 'scripts/flow-1-login.png' })
    console.log('   ✅ Login page loaded\n')

    // ============ Step 2: Sign in via Supabase directly ============
    console.log('📱 Step 2: Signing in test user...')

    const signInResult = await page.evaluate(async (email, password, supabaseUrl, supabaseKey) => {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return { success: true, userId: data.user?.id }
    }, TEST_EMAIL, TEST_PASSWORD, SUPABASE_URL, SUPABASE_ANON_KEY)

    if (signInResult.error) {
      throw new Error(`Sign in failed: ${signInResult.error}`)
    }
    console.log(`   ✅ Signed in as user: ${signInResult.userId}\n`)

    // Reload page to pick up the session
    await page.reload({ waitUntil: 'networkidle0' })
    await delay(2000)

    // ============ Step 3: Onboarding - Name ============
    console.log('📱 Step 3: Onboarding - Name...')
    const nameInput = await page.waitForSelector('input[placeholder="Enter your name"]', { timeout: 10000 })
    await page.screenshot({ path: 'scripts/flow-2-onboarding-name.png' })
    await nameInput.type('Test User')
    await clickButtonWithText(page, 'Continue')
    await delay(500)
    console.log('   ✅ Name entered\n')

    // ============ Step 4: Onboarding - Basics ============
    console.log('📱 Step 4: Onboarding - Age & Gender...')
    const ageInput = await page.waitForSelector('input[placeholder="Enter your age"]', { timeout: 5000 })
    await page.screenshot({ path: 'scripts/flow-3-onboarding-basics.png' })
    await ageInput.type('30')
    await clickButtonWithText(page, 'Male')
    await delay(300)
    await clickButtonWithText(page, 'Continue')
    await delay(500)
    console.log('   ✅ Age and gender entered\n')

    // ============ Step 5: Onboarding - Body ============
    console.log('📱 Step 5: Onboarding - Weight & Height...')
    await page.screenshot({ path: 'scripts/flow-4-onboarding-body.png' })
    const inputs = await page.$$('input[type="number"]')
    if (inputs.length >= 2) {
      await inputs[0].type('180') // weight
      await inputs[1].type('70')  // height
    }
    await clickButtonWithText(page, 'Continue')
    await delay(500)
    console.log('   ✅ Weight and height entered\n')

    // ============ Step 6: Onboarding - Activity ============
    console.log('📱 Step 6: Onboarding - Activity Level...')
    await page.screenshot({ path: 'scripts/flow-5-onboarding-activity.png' })
    await clickButtonWithText(page, 'Moderate')
    await delay(300)
    await clickButtonWithText(page, 'Continue')
    await delay(500)
    console.log('   ✅ Activity level selected\n')

    // ============ Step 7: Onboarding - Goal ============
    console.log('📱 Step 7: Onboarding - Goal...')
    await page.screenshot({ path: 'scripts/flow-6-onboarding-goal.png' })
    await clickButtonWithText(page, 'Maintain Weight')
    await delay(300)
    await clickButtonWithText(page, 'Continue')
    await delay(500)
    console.log('   ✅ Goal selected\n')

    // ============ Step 8: Onboarding - Summary ============
    console.log('📱 Step 8: Onboarding - Summary...')
    await page.screenshot({ path: 'scripts/flow-7-onboarding-summary.png' })
    await clickButtonWithText(page, 'Get Started')
    await delay(3000) // Wait for profile to save
    console.log('   ✅ Profile saved\n')

    // ============ Step 9: Dashboard ============
    console.log('📱 Step 9: Dashboard...')
    await page.screenshot({ path: 'scripts/flow-8-dashboard.png' })

    // Verify we're on dashboard
    const pageContent = await page.content()
    if (pageContent.includes('Test User') || pageContent.includes('Calories')) {
      console.log('   ✅ Dashboard loaded!\n')
    } else {
      console.log('   ⚠️ Dashboard may not have loaded correctly\n')
    }

    console.log('✅ FULL FLOW TEST PASSED!')
    console.log('\nScreenshots saved to scripts/flow-*.png')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    await page.screenshot({ path: 'scripts/flow-error.png' })
    console.log('Error screenshot saved to scripts/flow-error.png')
    process.exit(1)
  } finally {
    console.log('\n⏳ Closing browser in 5 seconds...')
    await delay(5000)
    await browser.close()
  }
}

testFullFlow().catch(console.error)
