import { GoogleGenerativeAI } from '@google/generative-ai'
import { matchToVerifiedProduct } from './foodLibraryService'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.warn('Gemini API key not configured')
}

const genAI = new GoogleGenerativeAI(API_KEY || '')

export interface FoodItem {
  name: string
  quantity: string
  // Base values (AI estimate for 1x portion - don't change when adjusting portion)
  baseCalories: number
  baseProtein: number
  baseCarbs: number
  baseFat: number
  // Displayed values (base * portionMultiplier)
  calories: number
  protein: number
  carbs: number
  fat: number
  // Portion adjustment
  portionMultiplier: number
  confidence: 'high' | 'medium' | 'low'
  // Fields for verified products from food library
  verified?: boolean
  brand?: string
  source?: 'ai' | 'food_library'
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

CRITICAL PORTION RULES — READ CAREFULLY:
Photos make food look larger than it is. You MUST actively correct for this bias.

1. UNDERESTIMATE by 20%: After your initial estimate, reduce all portion sizes by 20%. This corrects for the camera magnification bias.
2. USE THE SMALLEST REASONABLE PORTION: When uncertain, ask yourself "what is the smallest this could realistically be?" and use that.
3. ASSUME STANDARD PLATE SIZES: A dinner plate is 10 inches. A bowl is 6 inches. A mug is 8oz. Use these to judge relative food size — food on a plate is smaller than it appears.
4. DEFAULT TO SINGLE USDA SERVINGS: Unless the portion is clearly larger, default to 1 USDA standard serving size.
5. FOR MEAT AND PROTEIN: Most home-cooked portions are 3-5oz, NOT 6-8oz. A chicken breast is typically 4oz cooked. A steak at home is 4-6oz, not 8-12oz.
6. FOR PACKAGED FOODS: Always assume exactly 1 serving unless clearly more.
7. CALORIE CROSS-CHECK: After estimating all items, check the total. A typical home meal is 400-700 calories. A restaurant meal is 600-1200 calories. A snack is 100-300 calories. If your total exceeds these ranges, your portions are too large — reduce them.

Include estimated weight in grams for every item (e.g., "1 chicken breast (~115g)").

IMPORTANT: If you see any OPTAVIA, OPTAVIA ACTIVE, OPTAVIA ASCEND, or Essential1 products, include the brand and exact product name in your response. We have verified nutritional data for these products.

For each food item, provide:
1. Name of the food (include brand name if visible, e.g., "OPTAVIA Chocolate Mint Cookie Crisp Bar")
2. Estimated quantity/portion size with weight in grams
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
      "quantity": "1 piece (~115g)",
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
}`

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
    const rawItems: FoodItem[] = parsed.items || []

    // Enrich items with verified data from food library
    const items = await enrichWithVerifiedData(rawItems)

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

CRITICAL PORTION RULES:
1. DEFAULT TO SMALL PORTIONS: When the user doesn't specify an amount, use the smallest standard USDA serving size. "Some chicken" = 3oz (~85g). "A bowl of rice" = 1 cup cooked (~160g). "A steak" = 4oz (~115g).
2. TAKE USER QUANTITIES LITERALLY: If they say "4oz steak," use exactly 4oz — do not round up.
3. FOR VAGUE DESCRIPTIONS ("some," "a little," "a bit"): Use half a standard serving.
4. FOR UNSPECIFIED AMOUNTS: Use exactly 1 USDA standard serving, not more.
5. FOR MEAT AND PROTEIN: Default to 3-4oz portions for home cooking unless the user specifies otherwise.
6. CALORIE CROSS-CHECK: A typical home meal is 400-700 calories. A restaurant meal is 600-1200 calories. A snack is 100-300 calories. If your total exceeds these ranges, reduce portion sizes.

Include estimated weight in grams for every item.

IMPORTANT: If the user mentions OPTAVIA, OPTAVIA ACTIVE, OPTAVIA ASCEND, or Essential1 products, include the brand and product name. We have verified nutritional data for these products.

For each food item mentioned, provide:
1. Name of the food (include brand if mentioned, e.g., "OPTAVIA Creamy Chocolate Shake Mix")
2. Estimated quantity/portion size with weight in grams
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
      "quantity": "1 piece (~115g)",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 8,
      "confidence": "high"
    }
  ],
  "description": "Brief description of the meal"
}`

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
    const rawItems: FoodItem[] = parsed.items || []

    // Enrich items with verified data from food library
    const items = await enrichWithVerifiedData(rawItems)

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

/**
 * Convert raw Gemini response items to FoodItem with base values
 */
function initializeFoodItem(raw: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number; confidence: 'high' | 'medium' | 'low' }): FoodItem {
  return {
    name: raw.name,
    quantity: raw.quantity,
    baseCalories: raw.calories || 0,
    baseProtein: raw.protein || 0,
    baseCarbs: raw.carbs || 0,
    baseFat: raw.fat || 0,
    calories: raw.calories || 0,
    protein: raw.protein || 0,
    carbs: raw.carbs || 0,
    fat: raw.fat || 0,
    portionMultiplier: 1.0,
    confidence: raw.confidence || 'medium',
    verified: false,
    source: 'ai'
  }
}

/**
 * Enrich AI-detected food items with verified data from the food library
 * If a match is found, replaces AI estimates with verified nutritional data
 */
async function enrichWithVerifiedData(rawItems: Array<{ name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number; confidence: 'high' | 'medium' | 'low' }>): Promise<FoodItem[]> {
  const enrichedItems: FoodItem[] = []

  for (const rawItem of rawItems) {
    try {
      // Try to match to a verified product in our food library
      const verifiedProduct = await matchToVerifiedProduct(rawItem.name)

      if (verifiedProduct && verifiedProduct.calories !== null) {
        // Found a verified match - use verified data
        const calories = verifiedProduct.calories
        const protein = verifiedProduct.protein || 0
        const carbs = verifiedProduct.carbs || 0
        const fat = verifiedProduct.fat || 0

        enrichedItems.push({
          name: verifiedProduct.product_name,
          quantity: rawItem.quantity,
          baseCalories: calories,
          baseProtein: protein,
          baseCarbs: carbs,
          baseFat: fat,
          calories,
          protein,
          carbs,
          fat,
          portionMultiplier: 1.0,
          confidence: 'high', // Verified data is always high confidence
          verified: true,
          brand: verifiedProduct.brand,
          source: 'food_library'
        })
      } else {
        // No match found - use AI estimate with base values
        enrichedItems.push(initializeFoodItem(rawItem))
      }
    } catch (error) {
      // If lookup fails, fall back to AI estimate
      console.error('Error looking up verified product:', error)
      enrichedItems.push(initializeFoodItem(rawItem))
    }
  }

  return enrichedItems
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

// ============================================
// Scale Photo Analysis
// ============================================

export interface ScaleAnalysisResult {
  success: boolean
  weight: number | null
  unit: 'lbs' | 'kg' | null
  confidence: 'high' | 'medium' | 'low'
  scaleType: 'digital' | 'analog' | 'unknown'
  rawReading: string | null
  error?: string
}

const SCALE_ANALYSIS_PROMPT = `You are analyzing a photo of a bathroom scale to read the weight displayed.

SCALE TYPES YOU MAY ENCOUNTER:
1. **Digital scales** - LCD or LED displays showing numbers
   - Look for the main numeric display
   - May have decimal points (e.g., 185.4)
   - May show units (lbs, kg, st) on display

2. **Analog/dial scales** - Rotating needle pointing to a number on a dial
   - Read where the needle/pointer intersects the numbered scale
   - Consider the scale increments (marks may be every 1lb, 2lb, etc.)
   - Read the closest value the needle points to

IMPORTANT GUIDELINES:
- Focus on the WEIGHT READING only
- Ignore any body fat %, BMI, or other measurements
- If units are visible on the display, report them
- If no units visible, estimate based on reasonable human weight ranges:
  - Values 50-400 are likely lbs (US)
  - Values 25-180 are likely kg (metric)
- For analog scales, read the position of the needle carefully
- Account for partial visibility - estimate if part is cut off
- If you cannot read the scale at all, return null for weight

Respond ONLY with valid JSON in this exact format:
{
  "weight": 185.4,
  "unit": "lbs",
  "scaleType": "digital",
  "rawReading": "185.4 LB",
  "confidence": "high",
  "reasoning": "Clear digital LCD showing 185.4 LB"
}

Confidence levels:
- "high" - Clear, unobstructed reading
- "medium" - Partially visible, some glare, or analog scale requiring interpretation
- "low" - Significant obstruction, blur, or uncertainty

If NO weight can be determined:
{
  "weight": null,
  "unit": null,
  "scaleType": "unknown",
  "rawReading": null,
  "confidence": "low",
  "reasoning": "Could not read scale - describe why"
}`

export async function analyzeScaleImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ScaleAnalysisResult> {
  if (!API_KEY) {
    return {
      success: false,
      weight: null,
      unit: null,
      confidence: 'low',
      scaleType: 'unknown',
      rawReading: null,
      error: 'Gemini API key not configured'
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      SCALE_ANALYSIS_PROMPT,
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

    return {
      success: parsed.weight !== null,
      weight: parsed.weight,
      unit: parsed.unit,
      confidence: parsed.confidence || 'low',
      scaleType: parsed.scaleType || 'unknown',
      rawReading: parsed.rawReading
    }
  } catch (error) {
    console.error('Error analyzing scale image:', error)
    return {
      success: false,
      weight: null,
      unit: null,
      confidence: 'low',
      scaleType: 'unknown',
      rawReading: null,
      error: error instanceof Error ? error.message : 'Failed to analyze scale image'
    }
  }
}
