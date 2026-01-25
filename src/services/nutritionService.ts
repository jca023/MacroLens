import type { ActivityLevel, Goal, MacroSplit, DailyTargets } from '../types'
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS } from '../types'

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @returns BMR in calories/day
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weight + 6.25 * height - 5 * age

  if (gender === 'male') {
    return Math.round(baseBMR + 5)
  } else {
    return Math.round(baseBMR - 161)
  }
}

/**
 * Calculate Total Daily Energy Expenditure
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level
 * @returns TDEE in calories/day
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
  return Math.round(bmr * multiplier)
}

/**
 * Calculate daily calorie target based on goal
 * @param tdee - Total Daily Energy Expenditure
 * @param goal - User's goal (lose, maintain, gain)
 * @returns Target calories/day
 */
export function calculateTargetCalories(tdee: number, goal: Goal): number {
  return tdee + GOAL_ADJUSTMENTS[goal]
}

/**
 * Calculate daily macro targets in grams
 * @param targetCalories - Daily calorie target
 * @param macroSplit - Percentage split for protein/carbs/fat
 * @returns DailyTargets with calories and macro grams
 */
export function calculateDailyTargets(
  targetCalories: number,
  macroSplit: MacroSplit
): DailyTargets {
  // Calories per gram: protein=4, carbs=4, fat=9
  const proteinCalories = targetCalories * (macroSplit.protein / 100)
  const carbsCalories = targetCalories * (macroSplit.carbs / 100)
  const fatCalories = targetCalories * (macroSplit.fat / 100)

  return {
    calories: targetCalories,
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
  }
}

/**
 * Convert weight between units
 */
export function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return value
  if (from === 'lbs' && to === 'kg') return value * 0.453592
  if (from === 'kg' && to === 'lbs') return value * 2.20462
  return value
}

/**
 * Convert height between units
 */
export function convertHeight(value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number {
  if (from === to) return value
  if (from === 'in' && to === 'cm') return value * 2.54
  if (from === 'cm' && to === 'in') return value / 2.54
  return value
}

/**
 * Default macro split percentages
 */
export const DEFAULT_MACRO_SPLITS: Record<Goal, MacroSplit> = {
  lose: { protein: 40, carbs: 30, fat: 30 },      // Higher protein for muscle retention
  maintain: { protein: 30, carbs: 40, fat: 30 },  // Balanced
  gain: { protein: 30, carbs: 45, fat: 25 },      // Higher carbs for energy
}

/**
 * Activity level descriptions
 */
export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: 'Little or no exercise, desk job',
  light: 'Light exercise 1-3 days/week',
  moderate: 'Moderate exercise 3-5 days/week',
  active: 'Hard exercise 6-7 days/week',
  very_active: 'Very hard exercise, physical job',
}
