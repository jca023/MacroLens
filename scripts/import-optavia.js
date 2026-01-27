// Script to import Optavia products into Supabase food_library table
// Run with: node scripts/import-optavia.js

const optaviaProducts = [
  // Bar Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Campfire S\'mores Crisp Bar', calories: 110, protein: 11, carbs: 14, fat: 3, soy_protein: 10, caffeine_added: '5-10 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Caramel Delight Crisp Bar', calories: 110, protein: 11, carbs: 13, fat: 3.5, soy_protein: 10, caffeine_added: '5-10 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Chocolate Mint Cookie Crisp Bar', calories: 110, protein: 11, carbs: 14, fat: 3, soy_protein: 9, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Cookie Dough Bar', calories: 110, protein: 11, carbs: 15, fat: 3, soy_protein: 6 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Cranberry Honey Nut Granola Bar', calories: 100, protein: 11, carbs: 13, fat: 3, soy_protein: 9, notes: 'Almonds' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Creamy Double Peanut Butter Crisp Bar', calories: 110, protein: 11, carbs: 12, fat: 3.5, soy_protein: 8 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Drizzled Berry Crisp Bar', calories: 110, protein: 11, carbs: 13, fat: 3, soy_protein: 10 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Drizzled Chocolate Fudge Crisp Bar', calories: 100, protein: 11, carbs: 12, fat: 3, soy_protein: 9, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Frosted Cinnamon Spice Crisp Bar', calories: 110, protein: 11, carbs: 14, fat: 3, soy_protein: 10 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Lemon Tart Crisp Bar', calories: 110, protein: 11, carbs: 13, fat: 3.5, soy_protein: 10 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Peanut Butter & Chocolate Chip Bar', calories: 110, protein: 11, carbs: 15, fat: 3, soy_protein: 6, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Bar Fuelings', product_name: 'Raisin Oat Cinnamon Crisp Bar', calories: 110, protein: 11, carbs: 13, fat: 3, soy_protein: 10 },

  // Breakfast Style Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Apple & Cinnamon Spiced Oatmeal', calories: 110, protein: 11, carbs: 15, fat: 1.5, soy_protein: 9, notes: 'May Contain' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Cinnamon O\'s Cereal', calories: 110, protein: 11, carbs: 14, fat: 1, soy_protein: 10 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Golden Chocolate Chip Pancake Mix', calories: 100, protein: 13, carbs: 12, fat: 2.5, soy_protein: 5, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Golden Pancake Mix', calories: 90, protein: 13, carbs: 9, fat: 1.5, soy_protein: 5 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Maple & Brown Sugar Oatmeal', calories: 110, protein: 11, carbs: 15, fat: 1.5, soy_protein: 9, notes: 'May Contain' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Mixed Berry O\'s Cereal', calories: 110, protein: 11, carbs: 15, fat: 1, soy_protein: 10 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Breakfast Style Fuelings', product_name: 'Sweet Blueberry Muffin Mix', calories: 100, protein: 11, carbs: 15, fat: 1.5, soy_protein: 7 },

  // Crunchers, Poppers & Sticks Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Crunchers, Poppers & Sticks', product_name: 'BBQ Crunchers', calories: 110, protein: 13, carbs: 8, fat: 3, soy_protein: 13 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Crunchers, Poppers & Sticks', product_name: 'Cheese Pizza Crunchers', calories: 110, protein: 14, carbs: 8, fat: 3, soy_protein: 13 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Crunchers, Poppers & Sticks', product_name: 'Cinnamon Sugar Sticks', calories: 100, protein: 11, carbs: 14, fat: 1.5, soy_protein: 9 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Crunchers, Poppers & Sticks', product_name: 'Honey Mustard & Onion Sticks', calories: 100, protein: 11, carbs: 13, fat: 1.5, soy_protein: 9 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Crunchers, Poppers & Sticks', product_name: 'Nacho Cheese Poppers', calories: 110, protein: 12, carbs: 12, fat: 2, soy_protein: 9 },

  // Dessert Style Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Chocolate Chip Cookie Cake Mix', calories: 110, protein: 11, carbs: 14, fat: 2, soy_protein: 8, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Chocolate Fudge Pudding Mix', calories: 110, protein: 14, carbs: 15, fat: 1, soy_protein: 3, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Cinnamon Roll Cake Mix', calories: 110, protein: 11, carbs: 13, fat: 3, soy_protein: 5 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Coffee Soft Serve Mix', calories: 110, protein: 11, carbs: 14, fat: 2.5, soy_protein: 0, caffeine_added: '30-35 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Decadent Chocolate Brownie Mix with Greek Yogurt Chips', calories: 110, protein: 11, carbs: 15, fat: 2, soy_protein: 9, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Golden Butterscotch Blondie Mix', calories: 110, protein: 11, carbs: 15, fat: 1.5, soy_protein: 9 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Dessert Style Fuelings', product_name: 'Mint Chocolate Soft Serve Mix', calories: 110, protein: 11, carbs: 14, fat: 2.5, soy_protein: 0, caffeine_added: '<5 mg' },

  // Drink Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Drink Fuelings', product_name: 'Frothy Cappuccino Drink Mix', calories: 100, protein: 14, carbs: 12, fat: 0, soy_protein: 0, caffeine_added: '55 mg', caffeine_natural: '35-40 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Drink Fuelings', product_name: 'Velvety Hot Chocolate Drink Mix', calories: 100, protein: 13, carbs: 13, fat: 0.5, soy_protein: 0, caffeine_added: '<5 mg' },

  // Hearty Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Cheddar Biscuit Mix', calories: 100, protein: 12, carbs: 12, fat: 1.5, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Cheesy Buttermilk Cheddar Mac', calories: 110, protein: 11, carbs: 15, fat: 2, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Red Bean & Vegetable Chili Mix', calories: 110, protein: 12, carbs: 15, fat: 1, soy_protein: 8 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Roasted Garlic Mashed Potatoes', calories: 100, protein: 11, carbs: 15, fat: 1, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Rustic Tomato Herb Penne', calories: 110, protein: 11, carbs: 14, fat: 1, soy_protein: 9 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Soft Pretzel Mix', calories: 100, protein: 11, carbs: 15, fat: 0, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Hearty Fuelings', product_name: 'Sour Cream and Chive Mashed Potatoes', calories: 100, protein: 11, carbs: 15, fat: 0.5, soy_protein: 0 },

  // Shakes & Smoothie Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Caramel Macchiato Shake Mix', calories: 100, protein: 12, carbs: 14, fat: 1, soy_protein: 0, caffeine_added: '5-10 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Creamy Chocolate Shake Mix', calories: 100, protein: 14, carbs: 12, fat: 1, soy_protein: 11, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Creamy Vanilla Shake Mix', calories: 110, protein: 14, carbs: 13, fat: 0.5, soy_protein: 12 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Mocha Shake Mix', calories: 100, protein: 14, carbs: 13, fat: 1, soy_protein: 11, caffeine_added: '35-40 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Peanut Butter Shake Mix', calories: 110, protein: 12, carbs: 12, fat: 2.5, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Rich Dark Chocolate Shake Mix', calories: 100, protein: 14, carbs: 13, fat: 1, soy_protein: 0, caffeine_added: '10-15 mg' },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Shakes & Smoothie Fuelings', product_name: 'Strawberry Delight Shake Mix', calories: 100, protein: 14, carbs: 13, fat: 0.5, soy_protein: 14 },

  // Soup Fuelings
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Soup Fuelings', product_name: 'Homestyle Chick\'n Noodle Soup Mix', calories: 110, protein: 12, carbs: 13, fat: 2, soy_protein: 10 },
  { brand: 'OPTAVIA', product_line: 'Fuelings', category: 'Soup Fuelings', product_name: 'Savory Rice & Chicken Flavored Soup Mix', calories: 110, protein: 13, carbs: 14, fat: 1, soy_protein: 9 },

  // Snacks
  { brand: 'OPTAVIA', product_line: 'Snacks', category: 'Snacks', product_name: 'Olive Oil & Sea Salt Popcorn', calories: 70, protein: 1, carbs: 5, fat: 5, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Snacks', category: 'Snacks', product_name: 'White Cheddar Cheese Flavored Popcorn', calories: 70, protein: 1, carbs: 6, fat: 4.5, soy_protein: 0 },

  // Flavors of Home
  { brand: 'OPTAVIA', product_line: 'Flavors of Home', category: 'Flavors of Home', product_name: 'Beef Stew', calories: 290, protein: 26, carbs: 15, fat: 14, soy_protein: 0 },
  { brand: 'OPTAVIA', product_line: 'Flavors of Home', category: 'Flavors of Home', product_name: 'Chicken Cacciatore', calories: 290, protein: 25, carbs: 15, fat: 15, soy_protein: 2 },
  { brand: 'OPTAVIA', product_line: 'Flavors of Home', category: 'Flavors of Home', product_name: 'Chicken and Rice with Vegetables', calories: 300, protein: 26, carbs: 15, fat: 15, soy_protein: 2 },
  { brand: 'OPTAVIA', product_line: 'Flavors of Home', category: 'Flavors of Home', product_name: 'Chili Lime Chicken & Rice', calories: 290, protein: 25, carbs: 15, fat: 14, soy_protein: 2 },
  { brand: 'OPTAVIA', product_line: 'Flavors of Home', category: 'Flavors of Home', product_name: 'Ginger Lemongrass Chicken', calories: 290, protein: 25, carbs: 15, fat: 15, soy_protein: 2 },
  { brand: 'OPTAVIA', product_line: 'Flavors of Home', category: 'Flavors of Home', product_name: 'Turkey Meatball Marinara', calories: 290, protein: 25, carbs: 15, fat: 15, soy_protein: 0 },

  // OPTAVIA ACTIVE
  { brand: 'OPTAVIA ACTIVE', product_line: 'Essential Amino Acid Blend', category: 'Supplements', product_name: 'Orange Mango Essential Amino Acid Blend', calories: 60, protein: 0, carbs: 5, fat: 0, soy_protein: 0 },
  { brand: 'OPTAVIA ACTIVE', product_line: 'Essential Amino Acid Blend', category: 'Supplements', product_name: 'Strawberry Lemonade Essential Amino Acid Blend', calories: 60, protein: 0, carbs: 5, fat: 0, soy_protein: 0 },
  { brand: 'OPTAVIA ACTIVE', product_line: 'Protein Powder', category: 'Protein Powder', product_name: 'Chocolate Whey Protein', calories: 140, protein: 24, carbs: 3, fat: 3, soy_protein: 0, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA ACTIVE', product_line: 'Protein Powder', category: 'Protein Powder', product_name: 'Vanilla Whey Protein', calories: 130, protein: 24, carbs: 2, fat: 2.5, soy_protein: 0 },

  // Essential1
  { brand: 'Essential1', product_line: 'Calorie Burn Flavor Infusers', category: 'Flavor Infusers', product_name: 'Mixed Berry Flavor Infuser Drink Mix', calories: 5, protein: 0, carbs: 2, fat: 0, soy_protein: 0, caffeine_added: '100 mg' },
  { brand: 'Essential1', product_line: 'Calorie Burn Flavor Infusers', category: 'Flavor Infusers', product_name: 'Strawberry Lemonade Flavor Infuser Drink Mix', calories: 5, protein: 0, carbs: 2, fat: 0, soy_protein: 0, caffeine_added: '100 mg' },

  // OPTAVIA ASCEND
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Bars', product_name: 'Birthday Cake Bar', calories: 210, protein: 21, carbs: 26, fat: 8, soy_protein: 0 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Bars', product_name: 'Chocolate Brownie Bar', calories: 240, protein: 21, carbs: 28, fat: 10, soy_protein: 4, caffeine_added: '10-15 mg', notes: 'Almond' },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Bars', product_name: 'Everything Bagel Bar', calories: 190, protein: 22, carbs: 19, fat: 6, soy_protein: 10 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Bars', product_name: 'Strawberry Shortcake Bar', calories: 240, protein: 20, carbs: 29, fat: 10, soy_protein: 4, notes: 'Almond' },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Shakes', product_name: 'Vanilla Shake Mix', calories: 180, protein: 24, carbs: 18, fat: 2, soy_protein: 0 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Shakes', product_name: 'Chocolate Shake Mix', calories: 180, protein: 25, carbs: 19, fat: 2, soy_protein: 0, caffeine_added: '<5 mg' },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Shakes', product_name: 'Strawberries & Cream Shake Mix', calories: 180, protein: 25, carbs: 18, fat: 2, soy_protein: 0 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Breakfast', product_name: 'Waffle & Pancake Mix', calories: 210, protein: 23, carbs: 29, fat: 1.5, soy_protein: 0 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Breakfast', product_name: 'Cinnamon Toast Cereal', calories: 210, protein: 24, carbs: 14, fat: 6, soy_protein: 24 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Hearty', product_name: 'Creamy Tomato Bisque Mix', calories: 180, protein: 21, carbs: 21, fat: 2, soy_protein: 0 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Straws', product_name: 'Cheddar Straws', calories: 220, protein: 25, carbs: 13, fat: 7, soy_protein: 24 },
  { brand: 'OPTAVIA ASCEND', product_line: 'ASCEND', category: 'Straws', product_name: 'Sweet Chili Straws', calories: 210, protein: 25, carbs: 14, fat: 6, soy_protein: 24 },
];

// Normalize products to have all the same keys
const normalizedProducts = optaviaProducts.map(p => ({
  brand: p.brand,
  product_line: p.product_line,
  category: p.category,
  product_name: p.product_name,
  calories: p.calories,
  protein: p.protein,
  carbs: p.carbs,
  fat: p.fat,
  soy_protein: p.soy_protein || null,
  caffeine_added: p.caffeine_added || null,
  caffeine_natural: p.caffeine_natural || null,
  notes: p.notes || null,
  verified: true
}));

// Import using Supabase REST API
async function importProducts() {
  const SUPABASE_URL = 'https://wnjxzotqieotjgxguynq.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induanh6b3RxaWVvdGpneGd1eW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwMzIxOCwiZXhwIjoyMDgyNjc5MjE4fQ.3gOc4mRb6il6ccGmj4OL1qP9Cl-NxhYivMAhgl5sqPU';

  const response = await fetch(`${SUPABASE_URL}/rest/v1/food_library`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(normalizedProducts)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Import failed:', error);
    process.exit(1);
  }

  console.log(`Successfully imported ${normalizedProducts.length} Optavia products!`);
}

importProducts();
