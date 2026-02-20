# MacroLens - Feature List

Current features implemented in the application.

---

## Authentication

| Feature | Description |
|---------|-------------|
| Email OTP Sign-in | 6-digit one-time code sent to email |
| Email/Password Sign-in | Traditional email + password login |
| Google OAuth | Configured via Supabase (UI toggle available) |
| Session Persistence | Stay signed in across browser sessions |
| Sign Out | Clean session termination |

---

## Onboarding (5-Step Wizard)

| Step | What It Collects |
|------|-----------------|
| Welcome | User's display name, app feature overview |
| Basic Info | Age, biological sex |
| Body Measurements | Weight, height (metric or imperial) |
| Activity & Goal | Activity level (sedentary to very active), goal (lose/maintain/gain) |
| Summary | Shows calculated BMR, TDEE, calorie target, and macro breakdown |

---

## AI-Powered Food Logging

| Feature | Description |
|---------|-------------|
| Photo Analysis | Snap or upload a photo, Gemini 2.0 Flash identifies foods and estimates nutrition |
| Text Input | Describe a meal in words, AI parses food items and nutrition |
| Confidence Levels | Each food item tagged as high/medium/low confidence |
| OPTAVIA Detection | Verified OPTAVIA products receive exact nutritional data from food library |
| Food Library Lookup | Search by name, brand, or barcode against verified product database |

---

## Meal Review & Editing

| Feature | Description |
|---------|-------------|
| Review Before Saving | View all AI-identified items before committing to log |
| Edit Meal Name | Customize the meal label |
| Portion Multipliers | Quick-select buttons: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x |
| Manual Nutrition Override | Edit calories, protein, carbs, fat for any item |
| Remove Items | Delete individual food items from a meal |
| Meal Totals | Running total of all items displayed before save |

---

## Dashboard & Daily Tracking

| Feature | Description |
|---------|-------------|
| Daily Calorie Ring | Circular progress indicator showing % of daily goal |
| Remaining Calories | Shows how many calories left for the day |
| Macro Progress Cards | Protein, carbs, fat with individual progress bars |
| Date Navigation | Browse previous days, "Today" quick-return button |
| Smart Encouragement | Context-aware messages based on daily progress |

---

## Weekly Analytics

| Feature | Description |
|---------|-------------|
| 7-Day Calorie Chart | Bar chart of daily calories with target line |
| Color-Coded Bars | Green for on-target, red for over |
| Weekly Average | Mean daily calories for the week |
| Days on Target | Count of days within goal range |
| Variance | Average deviation from target (+/-) |

---

## Meal Management

| Feature | Description |
|---------|-------------|
| Meal List | All meals for selected date with timestamps |
| Edit Meals | Update name and nutrition after saving |
| Delete Meals | Remove logged meals |
| Ingredients Display | Shows individual food items within each meal |
| Source Attribution | Labels meals as AI-analyzed or manual entry |

---

## Profile & Settings

| Feature | Description |
|---------|-------------|
| Auto-Calculated BMR | Mifflin-St Jeor equation based on age, sex, weight, height |
| Auto-Calculated TDEE | BMR multiplied by activity level factor |
| Personalized Macro Targets | Goal-specific macro splits (lose: 40/30/30, maintain: 30/40/30, gain: 30/45/25) |
| Calorie Goal Adjustments | -500 cal for lose, +0 for maintain, +300 for gain |
| Unit Switching | Toggle metric/imperial with automatic value conversion |
| Edit All Profile Fields | Update age, weight, height, activity level, goal at any time |

---

## Landing & Legal

| Feature | Description |
|---------|-------------|
| Landing Page | Hero section, feature highlights, call-to-action |
| Terms of Service | Full legal document |
| Privacy Policy | Data handling, third-party services, cookie usage |

---

## UX & Polish

| Feature | Description |
|---------|-------------|
| Loading States | Spinners and skeleton screens during data fetches |
| Animations | Fade-in, slide-up, scale/bounce, progress ring, pulse effects |
| Mobile-First Design | Touch-friendly targets (44x44px min), responsive layout |
| Error Recovery | User-friendly messages with retry actions |
| Form Validation | Clear feedback on required fields |

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS |
| AI | Google Gemini 2.0 Flash (food recognition) |
| Backend | Supabase (Auth, Database, RLS) |
| Build | Vite |
| Icons | Lucide React |

---

*Last updated: February 2026*
