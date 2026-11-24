export type DomainId =
  | 'algebra'
  | 'advanced-math'
  | 'problem-solving-data'
  | 'geometry-trig';

export type DifficultyLevel = 'easy' | 'medium' | 'medium-hard';

export type QuestionType = 'multiple-choice' | 'spr';

export type SourceType = 'original' | 'official-practice' | 'historical-sat';

export type ContentStatus = 'complete' | 'planned';

export type AppPage =
  | 'home'
  | 'curriculum'
  | 'topic'
  | 'practice'
  | 'quiz'
  | 'results'
  | 'pdf'
  | 'demo'
  | 'glossary';

export type TeacherLanguage = 'en' | 'kz' | 'ru';

export interface DomainInfo {
  id: DomainId;
  name: string;
  shortName: string;
  satWeight: string;
  description: string;
}

export interface TopicMetadata {
  id: string;
  slug: string;
  domainId: DomainId;
  domainName: string;
  title: string;
  shortDescription: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  status: ContentStatus;
  order: number;
}

export interface VocabEntry {
  id: string;
  english: string;
  russian: string;
  explanation?: string;
  topicId?: string; // 'general' or specific topic id
  category:
    | 'core-math'
    | 'algebra'
    | 'equations'
    | 'functions'
    | 'word-problems'
    | 'geometry'
    | 'data-stats'
    | 'test-instructions';
  isCustom?: boolean;
}

export interface WorkedExample {
  id: string;
  title: string;
  problem: string;
  steps: string[];
  finalAnswer: string;
}

export interface TheoryConcept {
  id: string;
  title: string;
  definition: string;
  rule: string;
  formula?: string;
  whenToUse: string;
  example: WorkedExample;
}

export interface FormulaCardItem {
  id: string;
  title: string;
  formulaLatex: string;
  copyText: string;
  variables: Array<{
    symbol: string;
    meaning: string;
  }>;
  note?: string;
}

export interface Question {
  id: string;
  domain: string;
  topic: string;
  topicId: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  question: string;
  choices?: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]
  correctAnswer: string; // "A"-"D" for MC, or numeric string e.g. "5", "3/4", "-2.5" for SPR
  acceptableAnswers?: string[]; // Additional equivalent numeric formats for SPR
  explanation: string;
  whyCorrect: string;
  commonMistake: string;
  vocabulary: string[]; // Key English terms used in this question
  sourceType: SourceType;
  sourceReference: string | null;
}

export interface TopicContent {
  topicId: string;
  objectives: {
    intro: string;
    whatYouWillLearn: string[];
    prerequisites: string[];
  };
  theory: TheoryConcept[];
  formulas: FormulaCardItem[];
  visualizationType: 'linear-equation' | 'systems' | 'quadratic' | 'none';
  practiceQuestions: Question[]; // 22 questions: 6 easy, 10 medium, 6 medium-hard
  assessmentQuestions: Question[]; // 10 questions: 3 easy, 4 medium, 3 medium-hard
}

export interface QuizAttempt {
  id: string;
  topicId: string;
  topicTitle: string;
  timestamp: string;
  mode: 'quiz' | 'demo-diagnostic';
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  answers: Record<string, string>;
  resultsByQuestion: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    difficulty: DifficultyLevel;
  }>;
  breakdownByDifficulty: Record<
    DifficultyLevel,
    {
      total: number;
      correct: number;
    }
  >;
}

export interface IncorrectRecord {
  questionId: string;
  topicId: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: string;
  source: 'practice' | 'quiz' | 'demo';
}

export interface StudentProgress {
  studentName: string;
  completedTopicIds: string[];
  completedPracticeByTopic: Record<string, Record<string, { answer: string; isCorrect: boolean }>>;
  markedForReview: string[];
  quizAttempts: QuizAttempt[];
  incorrectAnswers: IncorrectRecord[];
  lastVisitedTopicId: string;
  lastVisitedPage: AppPage;
}
