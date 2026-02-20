# MacroLens Product Backlog

All planned features, improvements, and ideas in one place.

---

## High Priority

### Subscription & Monetization

**Status:** Designed - ready for implementation

**Description:**
Freemium model using Polar for international payment processing. Usage tracked with a "Cupcake" credit system (1 cupcake = 10 snaps).

**Tiers:**

| Tier | Price | Cupcakes | Snaps/mo |
|------|-------|----------|----------|
| Free | $0 | 5 | 50 |
| Plus | $4.99/mo | 15 | 150 |
| Pro | $9.99/mo | 30 | 300 |
| Snack Pack | $1.99 (one-time) | 1 | 10 |

**TODO:**
- [ ] Set up Polar payment integration
- [ ] Create subscription tier logic in Supabase
- [ ] Build cupcake usage meter UI (visual cupcake graphic)
- [ ] Track scan count per billing cycle
- [ ] Soft warning messages when running low on snaps
- [ ] Paywall / upgrade prompts when snaps run out
- [ ] Snack Pack purchase flow (buy-as-you-go)

---

### Sign-In Flow Fix

**Status:** Ready for implementation

**Description:**
Current sign-in page is confusing for new users. No clear distinction between sign-in and sign-up. Users don't know if they need to create an account first.

**TODO:**
- [ ] Clarify sign-in vs sign-up messaging
- [ ] Add "New here?" / "Already have an account?" toggle or context

---

## Medium Priority

### Scale Photo AI Reading

**Status:** Designed - ready for implementation

**Description:**
Snap a photo of any scale (smart or dumb), Gemini AI reads the displayed weight and logs it. Simplest approach - works with any scale, no API integrations needed, consistent with the "snap a photo" UX.

**TODO:**
- [ ] Build scale photo capture UI
- [ ] Add Gemini prompt for reading scale displays
- [ ] Store weight entries in database with timestamps
- [ ] Weight trend chart for progress tracking
- [ ] "Send to Coach" option for weigh-ins

---

### Smart Scale API Integration

**Status:** Researched - future enhancement

**Description:**
Direct integration with smart scale APIs for automatic weight syncing. Best option is Withings Health Mate API (OAuth 2.0, well-documented). Fitbit Aria also viable. Most affordable scales (Renpho, Eufy) have no public API and require Apple Health/Google Health Connect as intermediary.

**Why it's lower priority:** AI photo reading covers the use case without integration overhead. This becomes valuable for users who want fully automatic syncing.

**Open questions:**
- Worth the integration cost for v1?
- Apple HealthKit / Google Health Connect requires native or hybrid app
- Withings partner application approval process

---

### Coach Dashboard (B2B)

**Status:** Designed - needs implementation planning

**Description:**
Separate product tier for nutrition coaches. Coaches view client meal logs, weight entries, and progress. Supports a hierarchy: top coach creates sub-coaches who each manage clients.

**Pricing:** TBD (~$19.99-29.99/mo for coach tier)

**TODO:**
- [ ] Coach subscription tier and pricing
- [ ] Coach dashboard UI (client list, meal/weight views)
- [ ] Client management (add/remove clients)
- [ ] "Send to Coach" button in client app
- [ ] Coach hierarchy (top coach -> sub-coaches -> clients)
- [ ] Sub-coach client limits (1-20+ depending on plan)
- [ ] Weekly scale photo requests from coaches to clients

---

## Low Priority / Future Ideas

### AI Portion Estimation Improvements

**Status:** Plan exists (see plans/dapper-dreaming-blossom.md)

**Description:**
Gemini portion estimates are ~10-20% off. Improve prompts for more conservative estimates, include weight-in-grams alongside descriptive quantities, use USDA serving sizes as baseline.

**TODO:**
- [ ] Update Gemini prompt with conservative estimation guidance
- [ ] Include gram estimates in quantity strings
- [ ] Reference object detection for scale reference (future)

---

### Barcode Scanning for Food Products

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

### Bar/Restaurant Drink Scanning

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

### Additional Ideas

- [ ] **Meal Templates / Favorites** - Quick-log frequently eaten meals
- [ ] **Water Tracking** - Daily hydration logging
- [ ] **Streak / Gamification** - Reward consistent logging

---

## Completed

- [x] Email OTP and password authentication
- [x] Google OAuth configuration
- [x] 5-step onboarding wizard
- [x] AI photo-based meal logging (Gemini)
- [x] AI text-based meal logging
- [x] Portion adjustment multipliers (0.5x-2x)
- [x] Daily calorie ring and macro progress cards
- [x] Weekly analytics chart
- [x] Date navigation
- [x] Meal editing and deletion
- [x] Profile management with auto-calculated BMR/TDEE
- [x] Metric/Imperial unit switching
- [x] OPTAVIA product detection
- [x] Food library with verified products
- [x] Landing page
- [x] Terms of Service and Privacy Policy
- [x] Favicon (fork & knife SVG)

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

---

*Last updated: February 2026*
