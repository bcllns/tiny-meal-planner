# Meal Planner Application

A modern meal planning application built with React, Vite, TypeScript, and OpenAI. This app helps you generate personalized meal ideas and complete recipes based on the number of people you're cooking for.

## Features

- 🔐 **User Authentication** - Secure sign up and sign in with Supabase Auth
- 🍳 Generate meal plans for any number of people (1-50)
- 📋 Get complete recipes with ingredients and step-by-step instructions
- 💾 Save your favorite recipes to Supabase database (user-specific)
- 📚 **View Saved Recipes** - See all your saved recipes on the dashboard
- 🗑️ Delete saved recipes you no longer need
- 🎯 Filter by meal type (breakfast, lunch, dinner, or all)
- 📝 Add dietary restrictions and preferences
- 👤 Personalized dashboard with user profile
- 🎨 Beautiful, responsive UI built with Shadcn/ui components
- 🌙 Dark mode support
- ⚡ Fast and modern development with Vite
- 🤖 Powered by OpenAI's GPT-4 for intelligent meal suggestions

## Prerequisites

- Node.js 18+ installed
- An OpenAI API key (get one at [OpenAI Platform](https://platform.openai.com/api-keys))
- A Supabase account and project (get one at [Supabase](https://supabase.com))

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Set up Supabase Database

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use an existing one
3. Go to the SQL Editor
4. Run the following SQL to create the `recipes` table:

```sql
-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL,
  prep_time TEXT,
  cook_time TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  category TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recipes_meal_id ON recipes(meal_id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);
```

5. **Enable Email Auth** in Supabase:

   - Go to Authentication > Providers
   - Enable "Email" provider
   - Configure email templates if desired

6. Get your Supabase URL and anon key from Settings > API
7. Add them to your `.env` file

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Use

### First Time Users

1. **Sign Up**:

   - Enter your full name, email address, and password (min 6 characters)
   - Click "Create Account"
   - You'll be automatically signed in and redirected to your dashboard

2. **Sign In** (returning users):
   - Enter your email and password
   - Click "Sign In"
   - Access your personalized dashboard

### Using the Meal Planner

1. Enter the number of people you're planning meals for (1-50)
2. Select the meal type (all meals, breakfast, lunch, or dinner)
3. Optionally add dietary restrictions or preferences in the notes field
4. Click the "Plan Meals" button
5. Wait for OpenAI to generate your personalized meal plan
6. Browse through the generated meals with complete recipes
7. Click "Save Recipe" on any meal card to save it to your account
8. Saved recipes show a "Recipe Saved" button with a checkmark icon
9. Click "Plan New Meals" to generate a new meal plan

### Account Management

- Your name and email appear in the header
- Click the logout icon (top right) to sign out
- All saved recipes are linked to your account

## Project Structure

```
meal-planner/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── textarea.tsx
│   │   ├── Header.tsx       # App header with user info
│   │   ├── Footer.tsx       # App footer
│   │   ├── SignInPage.tsx   # Sign in form
│   │   ├── SignUpPage.tsx   # Sign up form
│   │   ├── MealCard.tsx     # Individual meal display component
│   │   └── MealPlannerForm.tsx  # Main form component
│   ├── lib/
│   │   ├── auth.ts          # Authentication functions
│   │   ├── openai.ts        # OpenAI integration
│   │   ├── supabase.ts      # Supabase client configuration
│   │   ├── recipes.ts       # Recipe save/load functions
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   └── meal.ts          # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── index.css            # Global styles with Tailwind
│   └── main.tsx             # Application entry point
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **OpenAI API** - AI-powered meal generation
- **Supabase** - Database for saving recipes
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI component library
- **Lucide React** - Icons

## Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Environment Variables

## Environment Variables

| Variable                 | Description                 | Required                 |
| ------------------------ | --------------------------- | ------------------------ |
| `VITE_OPENAI_API_KEY`    | Your OpenAI API key         | Yes                      |
| `VITE_SUPABASE_URL`      | Your Supabase project URL   | Yes (for saving recipes) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes (for saving recipes) |

## Notes

- The app uses GPT-4o-mini for cost-effective meal generation
- Each request generates 3 meals (breakfast, lunch, and dinner)
- API costs are minimal but make sure to monitor your OpenAI usage
- Keep your `.env` file private and never commit it to version control

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
