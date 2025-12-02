import type { Quiz } from '../types/quiz';
import { createQuiz, createQuestion, DEFAULT_SETTINGS } from '../types/quiz';

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>;
  // Template-specific customization options available
  customizationHints?: string[];
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'shuffled',
    name: 'Shuffled Quiz',
    description: 'Questions and answers appear in random order each time',
    icon: '🔀',
    category: 'Basic',
    quiz: {
      title: 'Shuffled Quiz',
      description: 'Questions and answers are randomized for variety!',
      questions: [],
      settings: { ...DEFAULT_SETTINGS, shuffleQuestions: true, shuffleOptions: true },
      tags: ['shuffled', 'random'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'timed-basic',
    name: 'Timed Quiz',
    description: 'Set a time limit for the entire quiz or per question',
    icon: '⏰',
    category: 'Basic',
    quiz: {
      title: 'Timed Quiz',
      description: 'Race against the clock!',
      questions: [],
      settings: { ...DEFAULT_SETTINGS, timerEnabled: true, timePerQuestion: 30 },
      tags: ['timed'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'true-false',
    name: 'True or False',
    description: 'Simple binary choice questions - great for quick facts',
    icon: '✓✗',
    category: 'Basic',
    quiz: {
      title: 'True or False',
      description: 'Test your knowledge with true or false questions!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'The Earth is the third planet from the Sun.',
          explanation: 'Earth is indeed the third planet from the Sun, after Mercury and Venus.',
          options: [
            { id: crypto.randomUUID(), text: 'True', isCorrect: true },
            { id: crypto.randomUUID(), text: 'False', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Dolphins are fish.',
          explanation: 'Dolphins are actually mammals, not fish. They breathe air and nurse their young.',
          options: [
            { id: crypto.randomUUID(), text: 'True', isCorrect: false },
            { id: crypto.randomUUID(), text: 'False', isCorrect: true },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Lightning never strikes the same place twice.',
          explanation: 'This is a myth! Lightning can and often does strike the same location multiple times.',
          options: [
            { id: crypto.randomUUID(), text: 'True', isCorrect: false },
            { id: crypto.randomUUID(), text: 'False', isCorrect: true },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showExplanations: true },
      tags: ['true-false', 'facts'],
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
    id: 'movies-tv',
    name: 'Movies & TV',
    description: 'Test your knowledge of cinema and television',
    icon: '🎬',
    category: 'Entertainment',
    quiz: {
      title: 'Movies & TV Quiz',
      description: 'How well do you know films and television shows?',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'Which movie features the quote "May the Force be with you"?',
          hint: 'A space opera franchise created by George Lucas',
          explanation: 'Star Wars (1977) introduced this iconic phrase to pop culture.',
          options: [
            { id: crypto.randomUUID(), text: 'Star Wars', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Star Trek', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Blade Runner', isCorrect: false },
            { id: crypto.randomUUID(), text: 'The Matrix', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the highest-grossing film of all time (unadjusted)?',
          hint: 'Released in 2009, directed by James Cameron',
          explanation: 'Avatar (2009) earned over $2.9 billion worldwide.',
          options: [
            { id: crypto.randomUUID(), text: 'Avatar', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Avengers: Endgame', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Titanic', isCorrect: false },
            { id: crypto.randomUUID(), text: 'The Lion King', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What is the name of the coffee shop in the TV show "Friends"?',
          hint: 'Central ____',
          explanation: 'Central Perk was the iconic hangout spot for the six main characters.',
          expectedAnswer: 'Central Perk',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, shuffleOptions: true, showHints: true },
      tags: ['movies', 'tv', 'entertainment'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'music',
    name: 'Music Trivia',
    description: 'Questions about artists, songs, and music history',
    icon: '🎵',
    category: 'Entertainment',
    quiz: {
      title: 'Music Trivia',
      description: 'Test your musical knowledge!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'Which band released the album "Abbey Road"?',
          hint: 'A British band from Liverpool',
          explanation: 'Abbey Road was released by The Beatles in 1969.',
          options: [
            { id: crypto.randomUUID(), text: 'The Beatles', isCorrect: true },
            { id: crypto.randomUUID(), text: 'The Rolling Stones', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Led Zeppelin', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Pink Floyd', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What instrument does a drummer primarily play?',
          options: [
            { id: crypto.randomUUID(), text: 'Drums', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Guitar', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Piano', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Violin', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What is the real name of the rapper known as "Eminem"?',
          hint: 'Marshall ______',
          expectedAnswer: 'Marshall Mathers',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, shuffleOptions: true },
      tags: ['music', 'entertainment'],
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
    id: 'science',
    name: 'Science Quiz',
    description: 'Explore biology, chemistry, physics and more',
    icon: '🔬',
    category: 'Education',
    quiz: {
      title: 'Science Quiz',
      description: 'Test your scientific knowledge across multiple disciplines!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the powerhouse of the cell?',
          hint: 'Starts with M',
          explanation: 'Mitochondria generate most of the cell\'s supply of ATP, used as a source of chemical energy.',
          options: [
            { id: crypto.randomUUID(), text: 'Mitochondria', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Nucleus', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Ribosome', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Golgi apparatus', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the chemical formula for water?',
          explanation: 'Water consists of two hydrogen atoms and one oxygen atom.',
          options: [
            { id: crypto.randomUUID(), text: 'H2O', isCorrect: true },
            { id: crypto.randomUUID(), text: 'CO2', isCorrect: false },
            { id: crypto.randomUUID(), text: 'NaCl', isCorrect: false },
            { id: crypto.randomUUID(), text: 'O2', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What force keeps planets in orbit around the Sun?',
          hint: 'Discovered by Isaac Newton',
          explanation: 'Gravity is the force of attraction between all masses in the universe.',
          options: [
            { id: crypto.randomUUID(), text: 'Gravity', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Magnetism', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Friction', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Inertia', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What is the atomic number of Carbon?',
          hint: 'A single digit number',
          explanation: 'Carbon has 6 protons in its nucleus, giving it an atomic number of 6.',
          expectedAnswer: '6',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showExplanations: true, showHints: true },
      tags: ['science', 'biology', 'chemistry', 'physics'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'math',
    name: 'Math Challenge',
    description: 'Arithmetic, algebra, and mathematical concepts',
    icon: '🔢',
    category: 'Education',
    quiz: {
      title: 'Math Challenge',
      description: 'Put your mathematical skills to the test!',
      questions: [
        {
          ...createQuestion('type-in'),
          text: 'What is 15 × 12?',
          timeLimit: 20,
          explanation: '15 × 12 = 180',
          expectedAnswer: '180',
        },
        {
          ...createQuestion('type-in'),
          text: 'What is the value of π (pi) to two decimal places?',
          hint: 'Approximately 3.14...',
          explanation: 'Pi (π) is approximately 3.14159...',
          expectedAnswer: '3.14',
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the formula for the area of a circle?',
          explanation: 'Area = π × r², where r is the radius.',
          options: [
            { id: crypto.randomUUID(), text: 'πr²', isCorrect: true },
            { id: crypto.randomUUID(), text: '2πr', isCorrect: false },
            { id: crypto.randomUUID(), text: 'πd', isCorrect: false },
            { id: crypto.randomUUID(), text: 'r²', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'Solve for x: 2x + 5 = 15',
          explanation: '2x + 5 = 15 → 2x = 10 → x = 5',
          expectedAnswer: '5',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showExplanations: true },
      tags: ['math', 'arithmetic', 'algebra'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'history',
    name: 'History Quiz',
    description: 'Journey through time with historical questions',
    icon: '🏛️',
    category: 'Education',
    quiz: {
      title: 'History Quiz',
      description: 'How well do you know your history?',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'Who was the first President of the United States?',
          explanation: 'George Washington served as the first President from 1789 to 1797.',
          options: [
            { id: crypto.randomUUID(), text: 'George Washington', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Thomas Jefferson', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Abraham Lincoln', isCorrect: false },
            { id: crypto.randomUUID(), text: 'John Adams', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'In which year did the Titanic sink?',
          hint: 'Early 20th century',
          explanation: 'The RMS Titanic sank on April 15, 1912, during her maiden voyage.',
          options: [
            { id: crypto.randomUUID(), text: '1912', isCorrect: true },
            { id: crypto.randomUUID(), text: '1905', isCorrect: false },
            { id: crypto.randomUUID(), text: '1920', isCorrect: false },
            { id: crypto.randomUUID(), text: '1898', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What ancient wonder was located in Alexandria, Egypt?',
          hint: 'A tall structure that guided ships',
          explanation: 'The Lighthouse of Alexandria (Pharos) was one of the Seven Wonders of the Ancient World.',
          expectedAnswer: 'Lighthouse',
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Which empire built the Colosseum in Rome?',
          explanation: 'The Colosseum was built during the Roman Empire, completed in 80 AD.',
          options: [
            { id: crypto.randomUUID(), text: 'Roman Empire', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Greek Empire', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Byzantine Empire', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Ottoman Empire', isCorrect: false },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showExplanations: true },
      tags: ['history', 'world history'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'geography',
    name: 'Geography Quiz',
    description: 'Capitals, countries, landmarks and more',
    icon: '🌍',
    category: 'Education',
    quiz: {
      title: 'Geography Quiz',
      description: 'Test your knowledge of the world!',
      questions: [
        {
          ...createQuestion('type-in'),
          text: 'What is the largest country in the world by area?',
          hint: 'Spans two continents',
          explanation: 'Russia is the largest country, covering over 17 million square kilometers.',
          expectedAnswer: 'Russia',
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Which river is the longest in the world?',
          explanation: 'The Nile River stretches approximately 6,650 km through northeastern Africa.',
          options: [
            { id: crypto.randomUUID(), text: 'Nile', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Amazon', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Yangtze', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Mississippi', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the capital of Australia?',
          hint: 'It\'s not Sydney!',
          explanation: 'Canberra is the capital city of Australia, not Sydney or Melbourne.',
          options: [
            { id: crypto.randomUUID(), text: 'Canberra', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Sydney', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Melbourne', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Brisbane', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multi-select'),
          text: 'Which of these countries are in Europe? (Select all)',
          options: [
            { id: crypto.randomUUID(), text: 'France', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Germany', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Brazil', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Poland', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Japan', isCorrect: false },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, shuffleOptions: true },
      tags: ['geography', 'world', 'capitals'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'sports',
    name: 'Sports Trivia',
    description: 'Questions about sports, athletes, and records',
    icon: '⚽',
    category: 'Entertainment',
    quiz: {
      title: 'Sports Trivia',
      description: 'How well do you know the world of sports?',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'How many players are on a standard soccer team on the field?',
          explanation: 'A soccer team has 11 players on the field, including the goalkeeper.',
          options: [
            { id: crypto.randomUUID(), text: '11', isCorrect: true },
            { id: crypto.randomUUID(), text: '9', isCorrect: false },
            { id: crypto.randomUUID(), text: '10', isCorrect: false },
            { id: crypto.randomUUID(), text: '12', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'In which sport would you perform a "slam dunk"?',
          options: [
            { id: crypto.randomUUID(), text: 'Basketball', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Volleyball', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Tennis', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Football', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What is the term for scoring three goals in a single soccer match?',
          hint: 'Related to headwear',
          explanation: 'A hat-trick is when a player scores three goals in one game.',
          expectedAnswer: 'hat-trick',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, shuffleOptions: true },
      tags: ['sports', 'trivia'],
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
    id: 'would-you-rather',
    name: 'Would You Rather',
    description: 'Fun hypothetical choice questions for friends and parties',
    icon: '🤔',
    category: 'Fun',
    quiz: {
      title: 'Would You Rather',
      description: 'Make your choice between two interesting options!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'Would you rather be able to fly or be invisible?',
          options: [
            { id: crypto.randomUUID(), text: 'Fly', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Be invisible', isCorrect: true },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Would you rather live in the past or the future?',
          options: [
            { id: crypto.randomUUID(), text: 'Live in the past', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Live in the future', isCorrect: true },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Would you rather have unlimited money or unlimited time?',
          options: [
            { id: crypto.randomUUID(), text: 'Unlimited money', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Unlimited time', isCorrect: true },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS },
      tags: ['fun', 'party', 'social'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'brain-teasers',
    name: 'Brain Teasers',
    description: 'Puzzles and riddles to challenge your mind',
    icon: '🧩',
    category: 'Fun',
    quiz: {
      title: 'Brain Teasers',
      description: 'Can you solve these tricky puzzles?',
      questions: [
        {
          ...createQuestion('type-in'),
          text: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
          hint: 'You use me to find your way',
          explanation: 'A map has representations of cities, mountains, and water, but not the actual things.',
          expectedAnswer: 'map',
        },
        {
          ...createQuestion('type-in'),
          text: 'What has hands but can\'t clap?',
          hint: 'It tells you something important',
          explanation: 'A clock has hands (hour and minute hands) but cannot clap.',
          expectedAnswer: 'clock',
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'If you have me, you want to share me. If you share me, you don\'t have me. What am I?',
          explanation: 'Once you tell a secret, it\'s no longer just yours.',
          options: [
            { id: crypto.randomUUID(), text: 'A secret', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Money', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Food', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Knowledge', isCorrect: false },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showHints: true, showExplanations: true },
      tags: ['puzzles', 'riddles', 'brain teasers'],
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
    id: 'survival',
    name: 'Survival Mode',
    description: 'How many can you get right? One wrong answer ends the game!',
    icon: '💀',
    category: 'Challenge',
    quiz: {
      title: 'Survival Mode',
      description: 'Get one wrong and it\'s game over! How far can you go?',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What color is the sky on a clear day?',
          timeLimit: 10,
          options: [
            { id: crypto.randomUUID(), text: 'Blue', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Green', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Red', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Yellow', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'How many days are in a week?',
          timeLimit: 8,
          options: [
            { id: crypto.randomUUID(), text: '7', isCorrect: true },
            { id: crypto.randomUUID(), text: '5', isCorrect: false },
            { id: crypto.randomUUID(), text: '6', isCorrect: false },
            { id: crypto.randomUUID(), text: '8', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What is 100 ÷ 4?',
          timeLimit: 12,
          options: [
            { id: crypto.randomUUID(), text: '25', isCorrect: true },
            { id: crypto.randomUUID(), text: '20', isCorrect: false },
            { id: crypto.randomUUID(), text: '30', isCorrect: false },
            { id: crypto.randomUUID(), text: '24', isCorrect: false },
          ],
        },
      ],
      settings: { ...DEFAULT_SETTINGS, timerEnabled: true, shuffleQuestions: true, shuffleOptions: true },
      tags: ['challenge', 'survival', 'hardcore'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'marathon',
    name: 'Quiz Marathon',
    description: 'A long quiz to test your endurance and knowledge',
    icon: '🏃',
    category: 'Challenge',
    quiz: {
      title: 'Quiz Marathon',
      description: 'A comprehensive quiz covering multiple topics. Can you finish it all?',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the capital of Japan?',
          options: [
            { id: crypto.randomUUID(), text: 'Tokyo', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Kyoto', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Osaka', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Hiroshima', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What is H2O commonly known as?',
          expectedAnswer: 'water',
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Who painted the Mona Lisa?',
          options: [
            { id: crypto.randomUUID(), text: 'Leonardo da Vinci', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Michelangelo', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Vincent van Gogh', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Pablo Picasso', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'What is the smallest prime number?',
          options: [
            { id: crypto.randomUUID(), text: '2', isCorrect: true },
            { id: crypto.randomUUID(), text: '1', isCorrect: false },
            { id: crypto.randomUUID(), text: '3', isCorrect: false },
            { id: crypto.randomUUID(), text: '0', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What planet is known for its rings?',
          expectedAnswer: 'Saturn',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, totalTimeLimit: 600 },
      tags: ['marathon', 'comprehensive', 'challenge'],
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
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Basics',
    description: 'Learn about online safety and security concepts',
    icon: '🔐',
    category: 'Tech',
    quiz: {
      title: 'Cybersecurity Quiz',
      description: 'Test your knowledge of online security!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What does "phishing" refer to?',
          explanation: 'Phishing is a type of social engineering attack used to steal user data.',
          options: [
            { id: crypto.randomUUID(), text: 'Fraudulent attempts to obtain sensitive information', isCorrect: true },
            { id: crypto.randomUUID(), text: 'A type of computer virus', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Catching fish online', isCorrect: false },
            { id: crypto.randomUUID(), text: 'A programming technique', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multi-select'),
          text: 'Which of these are good password practices? (Select all)',
          options: [
            { id: crypto.randomUUID(), text: 'Use a mix of letters, numbers, and symbols', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Use the same password everywhere', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Use a password manager', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Make passwords at least 12 characters', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Share passwords with friends', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What does VPN stand for?',
          hint: 'Virtual Private ______',
          explanation: 'VPN stands for Virtual Private Network, which encrypts your internet connection.',
          expectedAnswer: 'Virtual Private Network',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showExplanations: true },
      tags: ['cybersecurity', 'tech', 'security'],
      isFavorite: false,
      playCount: 0,
    },
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Explore artificial intelligence concepts',
    icon: '🤖',
    category: 'Tech',
    quiz: {
      title: 'AI & ML Quiz',
      description: 'Test your knowledge of artificial intelligence and machine learning!',
      questions: [
        {
          ...createQuestion('multiple-choice'),
          text: 'What does "AI" stand for?',
          options: [
            { id: crypto.randomUUID(), text: 'Artificial Intelligence', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Automated Integration', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Advanced Interface', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Algorithmic Innovation', isCorrect: false },
          ],
        },
        {
          ...createQuestion('multiple-choice'),
          text: 'Which company developed ChatGPT?',
          options: [
            { id: crypto.randomUUID(), text: 'OpenAI', isCorrect: true },
            { id: crypto.randomUUID(), text: 'Google', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Microsoft', isCorrect: false },
            { id: crypto.randomUUID(), text: 'Meta', isCorrect: false },
          ],
        },
        {
          ...createQuestion('type-in'),
          text: 'What type of learning uses labeled data to train models?',
          hint: 'The opposite of unsupervised',
          explanation: 'Supervised learning uses labeled examples to learn patterns.',
          expectedAnswer: 'supervised',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, showHints: true },
      tags: ['ai', 'machine learning', 'tech'],
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
