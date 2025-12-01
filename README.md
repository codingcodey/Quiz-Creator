# Quiz Creator

A beautiful quiz creation and practice app built with React, TypeScript, and Tailwind CSS.

## Features

- Create multiple-choice and fill-in-the-blank quizzes
- Practice quizzes with instant feedback
- Import/export quizzes as JSON
- Dark/light theme support
- Google authentication via Supabase
- Local storage for quiz data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Supabase Setup (Required for Authentication)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create one)
3. Go to **Authentication** → **Providers** → Enable **Google**
4. Add your Google OAuth credentials (Client ID and Secret from Google Cloud Console)
5. Go to **Project Settings** → **API** and copy your credentials
6. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS 4
- Vite 7
- Supabase Authentication

## License

MIT
