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
