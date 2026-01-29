# MacroLens - Claude Development Instructions

## Project Overview
MacroLens is an AI-powered nutrition tracking app using React, TypeScript, Supabase, and Google Gemini.

## API Credentials - READ THIS FIRST

**All API tokens are stored in `.secrets.local`** (gitignored, never committed).

Before asking the user for credentials, ALWAYS check `.secrets.local` first:
```bash
cat .secrets.local
```

### Services with Claude API Access:
| Service | Token Variable | What Claude Can Do |
|---------|---------------|-------------------|
| Supabase | `SUPABASE_MANAGEMENT_TOKEN` | Manage auth, execute SQL, update settings |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` | Admin CRUD operations (bypasses RLS) |
| Railway | `RAILWAY_TOKEN` | Deploy, add domains, manage services |
| Resend | `RESEND_API_KEY` | Send emails (to be configured) |

### If a token is missing:
1. Ask user to provide the token
2. Add it to `.secrets.local` with clear comments
3. Document the token in this table

---

## Railway Operations

### Using Railway CLI with stored token:
```bash
# Set token from .secrets.local and run commands
export RAILWAY_TOKEN=$(grep RAILWAY_TOKEN .secrets.local | cut -d= -f2)
npx @railway/cli whoami
npx @railway/cli domain add macrolens.app
```

### Common Railway Commands:
```bash
npx @railway/cli status          # Check deployment status
npx @railway/cli logs            # View logs
npx @railway/cli domain          # List/add custom domains
npx @railway/cli variables       # Manage environment variables
```

---

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

### API Credentials
**NEVER commit actual tokens to git. Read from `.secrets.local` file (gitignored).**

```
Project Ref: wnjxzotqieotjgxguynq
Project URL: https://wnjxzotqieotjgxguynq.supabase.co
```

Sensitive tokens are stored in `.secrets.local` (not committed to git).

### Example: Execute SQL via Management API
```bash
# Read token from .secrets.local, then:
curl -X POST "https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query" \
  -H "Authorization: Bearer $SUPABASE_MANAGEMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM profiles"}'
```

### Example: Check/Update Auth Config
```bash
# GET config
curl "https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer $SUPABASE_MANAGEMENT_TOKEN"

# PATCH config
curl -X PATCH "https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer $SUPABASE_MANAGEMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_url": "http://localhost:5173"}'
```

## Security Rules

1. **NEVER commit secrets to git** - Use `.secrets.local` file
2. **Read secrets from local files only** - Check `.secrets.local` before API calls
3. **Use placeholders in documentation** - Never put real tokens in CLAUDE.md or README

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
- `.secrets.local` - Local secrets (gitignored, not committed)

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
