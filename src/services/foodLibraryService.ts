import { supabase } from '../lib/supabase'

export interface FoodLibraryItem {
  id: string
  barcode: string | null
  brand: string
  product_line: string | null
  category: string | null
  product_name: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  sugar: number | null
  sodium: number | null
  soy_protein: number | null
  caffeine_added: string | null
  caffeine_natural: string | null
  serving_size: string | null
  serving_unit: string | null
  notes: string | null
  verified: boolean
}

/**
 * Search food library by product name
 * Uses fuzzy matching to find similar products
 */
export async function searchFoodLibrary(searchTerm: string): Promise<FoodLibraryItem[]> {
  // Search for products matching the search term
  const { data, error } = await supabase
    .from('food_library')
    .select('*')
    .or(`product_name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
    .limit(10)

  if (error) {
    console.error('Error searching food library:', error)
    return []
  }

  return data || []
}

/**
 * Find exact match by product name and brand
 */
export async function findExactProduct(productName: string, brand?: string): Promise<FoodLibraryItem | null> {
  let query = supabase
    .from('food_library')
    .select('*')
    .ilike('product_name', productName)

  if (brand) {
    query = query.ilike('brand', `%${brand}%`)
  }

  const { data, error } = await query.limit(1).single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Find product by barcode
 */
export async function findByBarcode(barcode: string): Promise<FoodLibraryItem | null> {
  const { data, error } = await supabase
    .from('food_library')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Get all products for a specific brand
 */
export async function getProductsByBrand(brand: string): Promise<FoodLibraryItem[]> {
  const { data, error } = await supabase
    .from('food_library')
    .select('*')
    .ilike('brand', `%${brand}%`)
    .order('category')
    .order('product_name')

  if (error) {
    console.error('Error fetching products by brand:', error)
    return []
  }

  return data || []
}

/**
 * Check if a food name mentions a known brand in our library
 * Returns the brand name if found
 */
export function detectKnownBrand(foodName: string): string | null {
  const knownBrands = ['optavia', 'optavia active', 'optavia ascend', 'essential1']
  const lowerName = foodName.toLowerCase()

  for (const brand of knownBrands) {
    if (lowerName.includes(brand)) {
      return brand
    }
  }

  return null
}

/**
 * Try to match an AI-detected food item to a verified product in the library
 * Returns the verified product if found, null otherwise
 */
export async function matchToVerifiedProduct(
  foodName: string,
  brand?: string
): Promise<FoodLibraryItem | null> {
  // First check if the food name mentions a known brand
  const detectedBrand = brand || detectKnownBrand(foodName)

  if (!detectedBrand) {
    return null
  }

  // Search for matching product
  const searchTerm = foodName
    .toLowerCase()
    .replace(/optavia/gi, '')
    .replace(/active/gi, '')
    .replace(/ascend/gi, '')
    .replace(/essential1/gi, '')
    .trim()

  const results = await searchFoodLibrary(searchTerm)

  if (results.length === 0) {
    return null
  }

  // Try to find the best match
  // Prioritize exact name matches
  const exactMatch = results.find(
    r => r.product_name.toLowerCase() === searchTerm ||
         foodName.toLowerCase().includes(r.product_name.toLowerCase())
  )

  return exactMatch || results[0]
}
