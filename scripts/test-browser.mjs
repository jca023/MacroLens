#!/usr/bin/env node
/**
 * Browser test script using Puppeteer
 * Tests the MacroLens app in a real browser
 */

import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:5173'

async function testApp() {
  console.log('🚀 Starting browser test...\n')

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless testing
    defaultViewport: { width: 390, height: 844 }, // iPhone 14 Pro size
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  try {
    // Test 1: Load the app
    console.log('📱 Test 1: Loading app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 10000 })

    // Check if page loaded
    const title = await page.title()
    console.log(`   Page title: "${title}"`)

    // Test 2: Check for login page elements
    console.log('📱 Test 2: Checking login page...')

    // Wait for the MacroLens heading
    const heading = await page.waitForSelector('h1', { timeout: 5000 })
    const headingText = await heading?.evaluate(el => el.textContent)
    console.log(`   Found heading: "${headingText}"`)

    if (headingText !== 'MacroLens') {
      throw new Error(`Expected heading "MacroLens", got "${headingText}"`)
    }

    // Check for email input
    const emailInput = await page.$('input[type="email"]')
    if (!emailInput) {
      throw new Error('Email input not found')
    }
    console.log('   ✅ Email input found')

    // Check for submit button
    const submitButton = await page.$('button[type="submit"]')
    if (!submitButton) {
      throw new Error('Submit button not found')
    }
    console.log('   ✅ Submit button found')

    // Test 3: Take a screenshot
    console.log('📱 Test 3: Taking screenshot...')
    await page.screenshot({ path: 'scripts/screenshot-login.png' })
    console.log('   ✅ Screenshot saved to scripts/screenshot-login.png')

    // Test 4: Try entering an email
    console.log('📱 Test 4: Testing email input...')
    await emailInput.type('test@example.com')
    const inputValue = await emailInput.evaluate(el => el.value)
    console.log(`   Input value: "${inputValue}"`)

    console.log('\n✅ All tests passed!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)

    // Take error screenshot
    await page.screenshot({ path: 'scripts/screenshot-error.png' })
    console.log('   Error screenshot saved to scripts/screenshot-error.png')

    // Log page content for debugging
    const content = await page.content()
    if (content.length < 500) {
      console.log('\n📄 Page content (short - possible blank page):')
      console.log(content)
    }

    // Check console errors
    page.on('console', msg => console.log('Browser console:', msg.text()))

    process.exit(1)
  } finally {
    // Keep browser open for 3 seconds to see result
    console.log('\n⏳ Closing browser in 3 seconds...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    await browser.close()
  }
}

testApp().catch(console.error)
