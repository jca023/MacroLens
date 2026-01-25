import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.warn('Gemini API key not configured')
}

const genAI = new GoogleGenerativeAI(API_KEY || '')

export interface FoodItem {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: 'high' | 'medium' | 'low'
}

export interface FoodAnalysisResult {
  success: boolean
  items: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  description: string
  error?: string
}

const FOOD_ANALYSIS_PROMPT = `You are a nutrition expert analyzing a food image. Identify all food items visible and estimate their nutritional content.

For each food item, provide:
1. Name of the food
2. Estimated quantity/portion size
3. Estimated calories
4. Protein (grams)
5. Carbohydrates (grams)
6. Fat (grams)
7. Confidence level (high/medium/low) based on how clearly you can identify the food

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {
      "name": "Food name",
      "quantity": "1 cup / 100g / 1 piece etc",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 8,
      "confidence": "high"
    }
  ],
  "description": "Brief description of the meal"
}

If no food is detected in the image, respond with:
{
  "items": [],
  "description": "No food detected in image"
}

Be conservative with estimates. Use standard serving sizes when portions are unclear.`

export async function analyzeFoodImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<FoodAnalysisResult> {
  if (!API_KEY) {
    return {
      success: false,
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      description: '',
      error: 'Gemini API key not configured'
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      FOOD_ANALYSIS_PROMPT,
      {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      }
    ])

    const response = result.response
    const text = response.text()

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonStr.trim())
    const items: FoodItem[] = parsed.items || []

    // Calculate totals
    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

    return {
      success: true,
      items,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein),
      totalCarbs: Math.round(totals.carbs),
      totalFat: Math.round(totals.fat),
      description: parsed.description || ''
    }
  } catch (error) {
    console.error('Error analyzing food image:', error)
    return {
      success: false,
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      description: '',
      error: error instanceof Error ? error.message : 'Failed to analyze image'
    }
  }
}

const TEXT_ANALYSIS_PROMPT = `You are a nutrition expert. The user will describe food they ate. Analyze the description and estimate nutritional content.

For each food item mentioned, provide:
1. Name of the food
2. Estimated quantity/portion size
3. Estimated calories
4. Protein (grams)
5. Carbohydrates (grams)
6. Fat (grams)
7. Confidence level (high/medium/low) based on specificity of the description

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {
      "name": "Food name",
      "quantity": "1 cup / 100g / 1 piece etc",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 8,
      "confidence": "high"
    }
  ],
  "description": "Brief description of the meal"
}

Be conservative with estimates. Use standard serving sizes when portions are unclear.`

export async function analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
  if (!API_KEY) {
    return {
      success: false,
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      description: '',
      error: 'Gemini API key not configured'
    }
  }

  if (!description.trim()) {
    return {
      success: false,
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      description: '',
      error: 'Please enter a food description'
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      TEXT_ANALYSIS_PROMPT,
      `Food description: ${description}`
    ])

    const response = result.response
    const text = response.text()

    // Extract JSON from response
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonStr.trim())
    const items: FoodItem[] = parsed.items || []

    // Calculate totals
    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

    return {
      success: true,
      items,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein),
      totalCarbs: Math.round(totals.carbs),
      totalFat: Math.round(totals.fat),
      description: parsed.description || ''
    }
  } catch (error) {
    console.error('Error analyzing food text:', error)
    return {
      success: false,
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      description: '',
      error: error instanceof Error ? error.message : 'Failed to analyze food'
    }
  }
}

export async function testGeminiConnection(): Promise<boolean> {
  if (!API_KEY) return false

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent('Say "OK" if you can read this.')
    const text = result.response.text()
    return text.toLowerCase().includes('ok')
  } catch (error) {
    console.error('Gemini connection test failed:', error)
    return false
  }
}
