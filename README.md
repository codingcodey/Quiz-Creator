# Quiz Creator

A beautiful quiz creation and practice app built with React, TypeScript, and Tailwind CSS.

## Features

- Create multiple-choice and fill-in-the-blank quizzes
- Practice quizzes with instant feedback
- Import/export quizzes as JSON
- Dark/light theme support
- Google authentication
- Local storage for quiz data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Firebase Setup (Required for Authentication)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Go to **Authentication** → **Sign-in method** → Enable **Google**
4. Go to **Project Settings** → **General** → **Your apps** → Click **Add app** (Web)
5. Copy the config values and create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains** and add your domain (for local dev, `localhost` is already included)

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
- Firebase Authentication

## License

MIT
