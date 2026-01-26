import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from 'dotenv'

// Load environment variables from .env
config()

const API_KEY = process.env.VITE_GEMINI_API_KEY
if (!API_KEY) {
  console.error('❌ VITE_GEMINI_API_KEY not found in environment')
  process.exit(1)
}
const genAI = new GoogleGenerativeAI(API_KEY)

async function testFoodAnalysis() {
  console.log('Testing Gemini food analysis...\n')

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a nutrition expert. Analyze this food and respond ONLY with valid JSON:
{
  "items": [
    {
      "name": "Food name",
      "quantity": "portion size",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 8,
      "confidence": "high"
    }
  ],
  "description": "Brief description"
}

Food: Grilled chicken breast 6oz with brown rice 1 cup and steamed broccoli`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('Raw response:\n', text)

    // Try to parse JSON
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonStr.trim())
    console.log('\n✅ Parsed successfully!')
    console.log('\nFood items detected:')
    parsed.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name} (${item.quantity})`)
      console.log(`     Cal: ${item.calories}, P: ${item.protein}g, C: ${item.carbs}g, F: ${item.fat}g`)
    })

    const totals = parsed.items.reduce((acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    console.log('\nTotal:', totals)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testFoodAnalysis()
