export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  type: 'multiple-choice' | 'type-in';
  text: string;
  image?: string;
  options?: QuizOption[];
  expectedAnswer?: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
};

export function createQuiz(partial?: Partial<Quiz>): Quiz {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled Quiz',
    description: '',
    questions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...partial,
  };
}

export function createQuestion(type: Question['type'], partial?: Partial<Question>): Question {
  const base: Question = {
    id: crypto.randomUUID(),
    type,
    text: '',
    ...partial,
  };

  if (type === 'multiple-choice') {
    base.options = partial?.options ?? [
      { id: crypto.randomUUID(), text: '', isCorrect: true },
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

// Validate that an object is a valid QuizOption
function isValidOption(obj: unknown): obj is QuizOption {
  if (typeof obj !== 'object' || obj === null) return false;
  const option = obj as Record<string, unknown>;
  return (
    typeof option.id === 'string' &&
    typeof option.text === 'string' &&
    typeof option.isCorrect === 'boolean'
  );
}

// Validate that an object is a valid Question
function isValidQuestion(obj: unknown): obj is Question {
  if (typeof obj !== 'object' || obj === null) return false;
  const question = obj as Record<string, unknown>;
  
  // Check required fields
  if (typeof question.id !== 'string') return false;
  if (question.type !== 'multiple-choice' && question.type !== 'type-in') return false;
  if (typeof question.text !== 'string') return false;
  
  // Check optional image field
  if (question.image !== undefined && typeof question.image !== 'string') return false;
  
  // Validate based on question type
  if (question.type === 'multiple-choice') {
    if (!Array.isArray(question.options)) return false;
    if (!question.options.every(isValidOption)) return false;
  } else if (question.type === 'type-in') {
    if (question.expectedAnswer !== undefined && typeof question.expectedAnswer !== 'string') return false;
  }
  
  return true;
}

// Validate that an object is a valid Quiz
export function isValidQuiz(obj: unknown): obj is Quiz {
  if (typeof obj !== 'object' || obj === null) return false;
  const quiz = obj as Record<string, unknown>;
  
  // Check required fields
  if (typeof quiz.title !== 'string') return false;
  if (typeof quiz.description !== 'string') return false;
  if (!Array.isArray(quiz.questions)) return false;
  
  // Check optional coverImage field
  if (quiz.coverImage !== undefined && typeof quiz.coverImage !== 'string') return false;
  
  // Validate all questions
  if (!quiz.questions.every(isValidQuestion)) return false;
  
  return true;
}
