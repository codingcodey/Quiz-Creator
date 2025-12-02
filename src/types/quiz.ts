export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  type: 'multiple-choice' | 'multi-select' | 'type-in';
  text: string;
  image?: string;
  options?: QuizOption[];
  expectedAnswer?: string;
  // New fields for enhanced features
  hint?: string;
  explanation?: string;
  timeLimit?: number; // seconds for this specific question (optional override)
};

export type QuizSettings = {
  // Timer settings
  timerEnabled: boolean;
  timePerQuestion?: number; // seconds per question
  totalTimeLimit?: number; // total quiz time in seconds
  // Randomization
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  // Display
  showHints: boolean;
  showExplanations: boolean;
  // Sharing
  isPublic: boolean;
  shareId?: string; // short ID for sharing
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  maxStreak: number;
  timeSpent: number; // seconds
  timeRemaining?: number; // seconds remaining if timed
  completedAt: number;
  answers: {
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
};

export type QuizAnalytics = {
  quizId: string;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  averageTime: number;
  questionStats: {
    questionId: string;
    timesAnswered: number;
    timesCorrect: number;
    averageTime: number;
  }[];
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
  // New fields
  settings: QuizSettings;
  tags?: string[];
  folderId?: string;
  isFavorite?: boolean;
  playCount?: number;
};

export type Folder = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

export const DEFAULT_SETTINGS: QuizSettings = {
  timerEnabled: false,
  shuffleQuestions: false,
  shuffleOptions: false,
  showHints: true,
  showExplanations: true,
  isPublic: false,
};

export function createQuiz(partial?: Partial<Quiz>): Quiz {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled Quiz',
    description: '',
    questions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
    tags: [],
    isFavorite: false,
    playCount: 0,
    ...partial,
  };
}

export function createQuestion(type: Question['type'], partial?: Partial<Question>): Question {
  const base: Question = {
    id: crypto.randomUUID(),
    type,
    text: '',
    hint: '',
    explanation: '',
    ...partial,
  };

  if (type === 'multiple-choice') {
    base.options = partial?.options ?? [
      { id: crypto.randomUUID(), text: '', isCorrect: true },
      { id: crypto.randomUUID(), text: '', isCorrect: false },
    ];
  } else if (type === 'multi-select') {
    base.options = partial?.options ?? [
      { id: crypto.randomUUID(), text: '', isCorrect: true },
      { id: crypto.randomUUID(), text: '', isCorrect: true },
      { id: crypto.randomUUID(), text: '', isCorrect: false },
      { id: crypto.randomUUID(), text: '', isCorrect: false },
    ];
  } else {
    base.expectedAnswer = partial?.expectedAnswer ?? '';
  }

  return base;
}

export function createOption(partial?: Partial<QuizOption>): QuizOption {
  return {
    id: crypto.randomUUID(),
    text: '',
    isCorrect: false,
    ...partial,
  };
}

// Generate a short share ID
export function generateShareId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Shuffle an array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
