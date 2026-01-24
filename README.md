# MacroLens

AI-powered nutrition tracking app - track meals, macros, and BMR with photo recognition.

## Features

- **AI Food Recognition** - Take a photo of any meal, get instant nutritional breakdown
- **Personalized BMR Tracking** - Set goals based on your basal metabolic rate
- **Macro Tracking** - Monitor protein, carbs, and fats against daily targets
- **Meal History** - View and manage all logged meals
- **Passwordless Auth** - Secure sign-in with email magic links

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **AI**: Google Gemini API
- **Build**: Vite

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your keys:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Supabase client, utilities
├── services/      # API services (Gemini, nutrition calculations)
├── types/         # TypeScript type definitions
└── App.tsx        # Main app component
```

## License

MIT
