# MacroLens Product Backlog

Future feature ideas that need further research, planning, or dependencies before implementation.

---

## Barcode Scanning for Food Products

**Status:** Parked - needs data source

**Description:**
Scan product barcodes to instantly look up nutritional information instead of using AI image recognition.

**Why it was parked:**
The UI and scanner were implemented, but without a comprehensive barcode database, the feature doesn't work. Barcodes require either:
- An external API (Open Food Facts - free, Nutritionix - paid)
- A manually curated database (not scalable)

**Requirements to revisit:**
1. Choose a barcode database provider
2. Evaluate cost vs. usage patterns
3. Handle fallback when barcode not found (fall back to AI?)
4. Consider caching frequently scanned products locally

**Original use case:** Quick logging for packaged foods like Optavia products

---

## Bar/Restaurant Drink Scanning

**Status:** Idea - needs research

**Description:**
Scan drinks at bars or restaurants to log alcohol and mixers with accurate nutritional data.

**Open questions:**
- What would be scanned? Menu QR codes? Drink labels?
- Would this integrate with bar/restaurant POS systems?
- How to handle custom cocktails vs. standard drinks?
- Alcohol calorie calculation is straightforward (7 cal/gram), but mixers vary widely

**Potential approaches:**
1. Partner with bar/restaurant chains for menu data
2. Build a cocktail recipe database with standard pours
3. AI recognition of drink type + manual confirmation
4. Integration with alcohol brand databases

**Why this is valuable:** Alcohol is often under-tracked in nutrition apps, and bar drinks are especially hard to estimate accurately.

---

## Template for New Ideas

```markdown
## [Feature Name]

**Status:** Idea | Researching | Parked | Ready for Implementation

**Description:**
What does this feature do?

**Open questions:**
- Question 1
- Question 2

**Requirements:**
- What's needed before this can be built?

**Why this is valuable:**
User benefit or problem it solves.
```
