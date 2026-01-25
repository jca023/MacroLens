# MacroLens - Claude Development Instructions

## Project Overview
MacroLens is an AI-powered nutrition tracking app using React, TypeScript, Supabase, and Google Gemini.

## Supabase Operations - IMPORTANT

**Before asking the user to do anything in Supabase, research if you can do it programmatically first.**

### What Claude CAN do via API:
- **Management API** (with `sbp_` personal access token):
  - Query/modify auth configuration
  - Execute SQL queries via `/v1/projects/{ref}/database/query`
  - Check/update project settings
  - Manage RLS policies via SQL

- **REST API** (with service_role key):
  - CRUD operations on all tables
  - Bypass RLS for admin operations
  - Query table data

### API Credentials (stored in .env and known to Claude):
```
Project Ref: wnjxzotqieotjgxguynq
Project URL: https://wnjxzotqieotjgxguynq.supabase.co
Management API Token: sbp_e6bfd6bdb21146924200e185bedb17a77e646765
```

### Example: Execute SQL via Management API
```bash
curl -X POST "https://api.supabase.com/v1/projects/wnjxzotqieotjgxguynq/database/query" \
  -H "Authorization: Bearer sbp_e6bfd6bdb21146924200e185bedb17a77e646765" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM profiles"}'
```

### Example: Check/Update Auth Config
```bash
# GET config
curl "https://api.supabase.com/v1/projects/wnjxzotqieotjgxguynq/config/auth" \
  -H "Authorization: Bearer sbp_e6bfd6bdb21146924200e185bedb17a77e646765"

# PATCH config
curl -X PATCH "https://api.supabase.com/v1/projects/wnjxzotqieotjgxguynq/config/auth" \
  -H "Authorization: Bearer sbp_e6bfd6bdb21146924200e185bedb17a77e646765" \
  -H "Content-Type: application/json" \
  -d '{"site_url": "http://localhost:5173"}'
```

## Browser Testing

Use Puppeteer for automated browser testing before asking user to manually test.

```bash
# Run browser test
npm run test:browser
```

## Development Commands

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run test:browser  # Run Puppeteer browser tests
```

## Key Files

- `src/lib/supabase.ts` - Supabase client
- `src/hooks/useAuth.ts` - Authentication hook
- `src/types/database.ts` - Database type definitions
- `src/components/` - React components

## Database Schema

### profiles
- id (uuid, PK, matches auth.users.id)
- name, age, gender, weight, height
- activity_level, goal, unit_system
- macro_split, bmr, tdee, daily_targets (jsonb)

### meals
- id (uuid, PK)
- user_id (FK to profiles.id)
- name, nutrients, ingredients (jsonb)
- timestamp, image_url, source
