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

**Status:** Implemented (see plans/2026-02-20-signin-flow-fix-design.md)

**Description:**
Sign-in page said "Sign in" which confused new users into thinking they needed a separate sign-up. Replaced with unified "Welcome" flow — OTP handles both new and returning users automatically.

**DONE:**
- [x] Changed heading from "Sign in" to "Welcome"
- [x] Changed subtext to "Enter your email to get started"
- [x] Changed button from "Let's Go!" to "Continue"
- [x] Simplified toggle text ("Use password instead" / "Use email code instead")
- [x] Added reassuring footer: "New or returning — we'll send you a secure code"

---

## Medium Priority

### Scale Photo AI Reading

**Status:** Implemented

**Description:**
Snap a photo of any scale (smart or dumb), Gemini AI reads the displayed weight and logs it. Works with digital and analog scales. Includes manual entry fallback.

**DONE:**
- [x] Scale photo capture UI (camera + upload + manual entry)
- [x] Gemini prompt for reading digital and analog scale displays
- [x] Weight entries stored in `weight_entries` table with timestamps
- [x] Confidence level display (high/medium/low)
- [x] Weight change indicator (vs last recorded)
- [x] Notes field for weigh-ins
- [x] Coach request integration ("Send to Coach" weigh-in flow)

**FUTURE:**
- [ ] Weight trend chart for progress tracking

---

### Smart Scale API Integration (RENPHO)

**Status:** Researched - future enhancement

**Description:**
Direct integration with RENPHO smart scales (~$20 on Amazon, widely recommended by diet coaches for clients). RENPHO scales sync via Bluetooth to the RENPHO app, but have no public API. Data can only be accessed through Apple Health / Google Health Connect as intermediaries.

**Why it's lower priority:** AI photo reading covers the use case without integration overhead. This becomes valuable for users who want fully automatic syncing.

**Challenges:**
- RENPHO has no public API — requires Apple HealthKit or Google Health Connect as intermediary
- Apple HealthKit / Google Health Connect requires a native or hybrid app (not web-only)
- Would need to wrap MacroLens in Capacitor/React Native or build a companion mobile app
- Alternative: RENPHO data exports to CSV (manual but functional)

**Potential approaches:**
1. **Capacitor wrapper** — Wrap existing web app, add HealthKit/Health Connect plugin for scale data
2. **Companion mobile app** — Lightweight native app just for scale sync, pushes data to Supabase
3. **Manual CSV import** — Let users export from RENPHO app and upload to MacroLens
4. **Keep AI photo reading** — Current approach works without any integration overhead

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

**Status:** Implemented (see plans/2026-02-20-portion-accuracy-design.md)

**Description:**
Gemini portion estimates were ~10-20% off due to camera magnification bias. Rewrote prompts with explicit 20% underestimation correction, smallest-reasonable-portion anchoring, standard plate sizing, and calorie cross-check validation.

**DONE:**
- [x] Update Gemini prompt with aggressive underestimation bias
- [x] Include gram estimates in quantity strings
- [x] Add calorie cross-check for meal type ranges
- [x] Remove misleading palm/fist reference hints

**FUTURE:**
- [ ] AI feedback loop: store user corrections and use aggregate data to improve estimates over time
- [ ] Reference object detection for scale reference

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
- [x] Sign-in flow UX fix (Welcome page, unified new/returning user flow)
- [x] Scale photo AI reading (camera, AI analysis, manual entry, coach integration)
- [x] AI portion accuracy improvements (underestimation bias, calorie cross-check)
- [x] Editable macro split (replaced Lose/Maintain/Gain goals with 40/40/20 default, midpoint calorie formula)

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
