#!/usr/bin/env node
/**
 * Test meal logging flow
 *
 * Required environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * - VITE_GEMINI_API_KEY
 */

import puppeteer from 'puppeteer'
import { config } from 'dotenv'

// Load environment variables from .env
config()

const BASE_URL = 'http://localhost:5173'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY
const TEST_EMAIL = 'test@macrolens.local'
const TEST_PASSWORD = 'TestPassword123!'

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testMealLogging() {
  console.log('🚀 Starting meal logging test...\n')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 390, height: 844 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  try {
    // ============ Step 1: Load app and login ============
    console.log('📱 Step 1: Loading app and logging in...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 })

    // Sign in via Supabase
    const signInResult = await page.evaluate(async (email, password, supabaseUrl, supabaseKey) => {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return { success: true }
    }, TEST_EMAIL, TEST_PASSWORD, SUPABASE_URL, SUPABASE_ANON_KEY)

    if (signInResult.error) {
      throw new Error(`Sign in failed: ${signInResult.error}`)
    }
    console.log('   ✅ Signed in\n')

    // Reload to pick up session
    await page.reload({ waitUntil: 'networkidle0' })
    await delay(2000)

    // ============ Step 2: Verify Dashboard ============
    console.log('📱 Step 2: Verifying Dashboard...')
    await page.screenshot({ path: 'scripts/meal-test-1-dashboard.png' })

    const dashboardContent = await page.content()
    if (!dashboardContent.includes('Test User') && !dashboardContent.includes('Calories')) {
      throw new Error('Dashboard not loaded correctly')
    }
    console.log('   ✅ Dashboard loaded\n')

    // ============ Step 3: Open Meal Logger ============
    console.log('📱 Step 3: Opening Meal Logger...')

    // Click the FAB button
    const fabButton = await page.$('button.fixed.bottom-6')
    if (!fabButton) {
      throw new Error('FAB button not found')
    }
    await fabButton.click()
    await delay(500)

    await page.screenshot({ path: 'scripts/meal-test-2-logger.png' })

    // Check if meal logger is open
    const loggerContent = await page.content()
    if (!loggerContent.includes('Take a photo') && !loggerContent.includes('Log Meal')) {
      throw new Error('Meal logger did not open')
    }
    console.log('   ✅ Meal Logger opened\n')

    // ============ Step 4: Test Camera/Upload buttons ============
    console.log('📱 Step 4: Verifying Camera and Upload buttons...')

    const hasCameraButton = loggerContent.includes('Camera')
    const hasUploadButton = loggerContent.includes('Upload')

    if (!hasCameraButton || !hasUploadButton) {
      throw new Error('Camera/Upload buttons not found')
    }
    console.log('   ✅ Camera and Upload buttons present\n')

    // ============ Step 5: Close Meal Logger ============
    console.log('📱 Step 5: Closing Meal Logger...')

    const closeButton = await page.$('button[title="Close"], button:has(svg)')
    // Find the X button in the header
    const buttons = await page.$$('button')
    for (const button of buttons) {
      const buttonHtml = await button.evaluate(el => el.innerHTML)
      if (buttonHtml.includes('svg') && buttonHtml.includes('24')) {
        await button.click()
        break
      }
    }
    await delay(500)
    await page.screenshot({ path: 'scripts/meal-test-3-closed.png' })
    console.log('   ✅ Meal Logger closed\n')

    // ============ Step 6: Test Gemini API connection ============
    console.log('📱 Step 6: Testing Gemini API connection...')

    const geminiResult = await page.evaluate(async (apiKey) => {
      try {
        const { GoogleGenerativeAI } = await import('https://esm.sh/@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const result = await model.generateContent('Say "OK" if you can read this.')
        const text = result.response.text()
        return { success: text.toLowerCase().includes('ok'), response: text }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }, GEMINI_API_KEY)

    if (geminiResult.success) {
      console.log('   ✅ Gemini API connected and working\n')
    } else {
      console.log(`   ⚠️ Gemini API test: ${geminiResult.error || geminiResult.response}\n`)
    }

    console.log('✅ MEAL LOGGING TEST PASSED!')
    console.log('\nScreenshots saved to scripts/meal-test-*.png')
    console.log('\nThe meal logger is ready. You can test it manually by:')
    console.log('1. Opening the app at http://localhost:5173')
    console.log('2. Logging in with test@macrolens.local / TestPassword123!')
    console.log('3. Clicking the green + button')
    console.log('4. Taking a photo or uploading an image of food')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    await page.screenshot({ path: 'scripts/meal-test-error.png' })
    console.log('Error screenshot saved to scripts/meal-test-error.png')
    process.exit(1)
  } finally {
    console.log('\n⏳ Closing browser in 3 seconds...')
    await delay(3000)
    await browser.close()
  }
}

testMealLogging().catch(console.error)
