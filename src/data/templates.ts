import type { Quiz } from '../types/quiz';
import { createQuiz, createQuestion, DEFAULT_SETTINGS } from '../types/quiz';

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>;
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Quiz',
    description: 'Start from scratch with an empty quiz',
    icon: '📝',
    category: 'Basic',
    quiz: {
      title: 'Untitled Quiz',
      description: '',
      questions: [],
      settings: { ...DEFAULT_SETTINGS },
      tags: [],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'trivia',
    name: 'Trivia Night',
    description: 'Fun general knowledge trivia with multiple choice questions',
    icon: '🎯',
    category: 'Entertainment',
    quiz: {
      title: 'Trivia Night',
      description: 'Test your general knowledge with these fun trivia questions!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the capital of France?',
          hint: 'It\'s known as the City of Light',
          explanation: 'Paris is the capital and largest city of France, known for the Eiffel Tower.',
          options: [
            { id: crypto.randomUUID(), text: 'Paris', isCorrect: true },
            { id: crypto.randomUUID(), text: 'London', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Berlin', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Madrid', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Which planet is known as the Red Planet?',
          hint: 'Named after the Roman god of war',
          explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
          options: [
            { id: crypto.randomUUID(), text: 'Mars', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Venus', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Jupiter', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Saturn', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'In what year did World War II end?',
          hint: 'Same year the United Nations was founded',
          explanation: 'WWII ended in 1945 with the surrender of Japan in September.',
          options: [
            { id: crypto.randomUUID(), text: '1945', isCorrect: true },
            { id: crypto.randomUUID(), text: '1944', isCorrect: false },
            { id: crypto.randomUUID(), text: '1946', isCorrect: false },
            { id: crypto.randomUUID(), text: '1943', isCorrect: false },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, shuffleOptions: true },
      tags: ['trivia', 'general knowledge'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary Builder',
    description: 'Type-in questions perfect for learning new words',
    icon: '📚',
    category: 'Education',
    quiz: {
      title: 'Vocabulary Challenge',
      description: 'Expand your vocabulary with these word definitions!',
      questions: [
        {
          ...createQuestion('type-in'),
          text: 'What word means "a strong feeling of annoyance or displeasure"?',
          hint: 'Starts with "A" and has 5 letters',
          explanation: '"Anger" is a strong emotion in response to perceived provocation.',
          expectedAnswer: 'anger',
        },
        {
          ...createQuestion('type-in'),
          text: 'What word means "extremely happy and excited"?',
          hint: 'Starts with "E" and rhymes with "dated"',
          explanation: '"Elated" means being in high spirits, thrilled.',
          expectedAnswer: 'elated',
        },
        {
          ...createQuestion('type-in'),
          text: 'What word means "to make something seem less important"?',
          hint: 'Starts with "D" and has 8 letters',
          explanation: '"Downplay" means to make something appear less significant.',
          expectedAnswer: 'downplay',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showHints: true },
      tags: ['vocabulary', 'english', 'education'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'flashcards',
    name: 'Study Flashcards',
    description: 'Quick flashcard-style questions for memorization',
    icon: '🗂️',
    category: 'Education',
    quiz: {
      title: 'Study Flashcards',
      description: 'Practice key concepts with flashcard-style questions',
      questions: [
        {
          ...createQuestion('type-in'),
          text: 'What is the chemical symbol for Gold?',
          hint: 'Two letters, from the Latin word "Aurum"',
          explanation: 'Au comes from the Latin word "Aurum" meaning gold.',
          expectedAnswer: 'Au',
        },
        {
          ...createQuestion('type-in'),
          text: 'What is the square root of 144?',
          hint: 'A number between 10 and 15',
          explanation: '12 × 12 = 144',
          expectedAnswer: '12',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, shuffleQuestions: true },
      tags: ['flashcards', 'study'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'personality',
    name: 'Personality Quiz',
    description: 'Multi-select questions for personality assessments',
    icon: '✨',
    category: 'Fun',
    quiz: {
      title: 'What Type Are You?',
      description: 'Discover your personality type with these questions!',
      questions: [
        {
          ...createQuestion('multi-select'),
          text: 'Which activities do you enjoy in your free time? (Select all that apply)',
          options: [
            { id: crypto.randomUUID(), text: 'Reading books', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Outdoor sports', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Video games', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Cooking', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Music', isCorrect: true },
          ],
        },
        {
          ...createQuestion('multi-select'),
          text: 'What values are most important to you? (Select all that apply)',
          options: [
            { id: crypto.randomUUID(), text: 'Creativity', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Honesty', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Adventure', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Security', isCorrect: true },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS },
      tags: ['personality', 'fun'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'timed-challenge',
    name: 'Speed Challenge',
    description: 'Race against the clock with timed questions',
    icon: '⚡',
    category: 'Challenge',
    quiz: {
      title: 'Speed Challenge',
      description: 'Answer as fast as you can! Each question has a time limit.',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'Quick! What is 7 × 8?',
          timeLimit: 10,
          options: [
            { id: crypto.randomUUID(), text: '56', isCorrect: true },
            { id: crypto.randomUUID(), text: '54', isCorrect: false },
            { id: crypto.randomUUID(), text: '58', isCorrect: false },
            { id: crypto.randomUUID(), text: '48', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'Type the opposite of "hot"',
          timeLimit: 5,
          expectedAnswer: 'cold',
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Which is the largest ocean?',
          timeLimit: 15,
          options: [
            { id: crypto.randomUUID(), text: 'Pacific', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Atlantic', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Indian', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Arctic', isCorrect: false },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, timerEnabled: true, timePerQuestion: 15 },
      tags: ['timed', 'challenge', 'speed'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'programming',
    name: 'Code Quiz',
    description: 'Test programming knowledge with code-related questions',
    icon: '💻',
    category: 'Tech',
    quiz: {
      title: 'Programming Quiz',
      description: 'Test your coding knowledge!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What does "HTML" stand for?',
          hint: 'It\'s a markup language for the web',
          explanation: 'HTML = HyperText Markup Language, the standard markup language for web pages.',
          options: [
            { id: crypto.randomUUID(), text: 'HyperText Markup Language', isCorrect: true },
            { id: crypto.randomUUID(), text: 'High Tech Modern Language', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Home Tool Markup Language', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Hyperlink Text Marking Language', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'In JavaScript, what keyword is used to declare a constant variable?',
          hint: 'It\'s 5 letters long',
          explanation: '"const" declares a constant that cannot be reassigned.',
          expectedAnswer: 'const',
        },
        {
          ...createQuestion('multi-select'),
          text: 'Which of these are valid JavaScript data types? (Select all that apply)',
          options: [
            { id: crypto.randomUUID(), text: 'string', isCorrect: true },
            { id: crypto.randomUUID(), text: 'number', isCorrect: true },
            { id: crypto.randomUUID(), text: 'boolean', isCorrect: true },
            { id: crypto.randomUUID(), text: 'character', isCorrect: false },
            { id: crypto.randomUUID(), text: 'undefined', isCorrect: true },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showExplanations: true },
      tags: ['programming', 'javascript', 'tech'],
      isFavorite: false,
      playCount: 0,
    },
  },
];

export function getTemplateById(id: string): QuizTemplate | undefined {
  return QUIZ_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): QuizTemplate[] {
  return QUIZ_TEMPLATES.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(QUIZ_TEMPLATES.map((t) => t.category))];
}

export function createQuizFromTemplate(template: QuizTemplate): Quiz {
  return createQuiz({
    ...template.quiz,
    questions: template.quiz.questions.map((q) => ({
      ...q,
      id: crypto.randomUUID(),
      options: q.options?.map((o) => ({ ...o, id: crypto.randomUUID() })),
    })),
  });
}

