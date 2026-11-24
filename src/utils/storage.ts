import {
  AppPage,
  IncorrectRecord,
  QuizAttempt,
  StudentProgress,
  VocabEntry,
} from '../types/curriculum';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

const PROGRESS_STORAGE_KEY = 'sat_math_lab_progress_v1';
const CUSTOM_VOCAB_STORAGE_KEY = 'sat_math_lab_custom_vocab_v1';

export function getDefaultProgress(): StudentProgress {
  return {
    studentName: '',
    completedTopicIds: [],
    completedPracticeByTopic: {},
    markedForReview: [],
    quizAttempts: [],
    incorrectAnswers: [],
    lastVisitedTopicId: 'alg-linear-one-var',
    lastVisitedPage: 'home',
  };
}

export function loadProgress(): StudentProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    return {
      ...getDefaultProgress(),
      ...parsed,
      completedTopicIds: Array.isArray(parsed.completedTopicIds)
        ? parsed.completedTopicIds
        : [],
      completedPracticeByTopic: parsed.completedPracticeByTopic ?? {},
      markedForReview: Array.isArray(parsed.markedForReview)
        ? parsed.markedForReview
        : [],
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
      incorrectAnswers: Array.isArray(parsed.incorrectAnswers)
        ? parsed.incorrectAnswers
        : [],
    };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetAllProgress(): StudentProgress {
  const fresh = getDefaultProgress();
  saveProgress(fresh);
  return fresh;
}

export function loadCustomVocabulary(): VocabEntry[] {
  try {
    const raw = localStorage.getItem(CUSTOM_VOCAB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomVocabulary(entries: VocabEntry[]): void {
  try {
    localStorage.setItem(CUSTOM_VOCAB_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

export function getMergedVocabulary(customEntries: VocabEntry[]): VocabEntry[] {
  // Custom entries take precedence if matching the same English phrase
  const map = new Map<string, VocabEntry>();
  for (const item of INITIAL_VOCABULARY) {
    map.set(item.english.toLowerCase(), item);
  }
  for (const item of customEntries) {
    map.set(item.english.toLowerCase(), item);
  }
  return Array.from(map.values());
}

export function updateLastVisited(
  prev: StudentProgress,
  page: AppPage,
  topicId?: string
): StudentProgress {
  const next: StudentProgress = {
    ...prev,
    lastVisitedPage: page,
    lastVisitedTopicId: topicId ?? prev.lastVisitedTopicId,
  };
  saveProgress(next);
  return next;
}

export function recordPracticeSubmission(
  prev: StudentProgress,
  topicId: string,
  questionId: string,
  answer: string,
  isCorrect: boolean,
  correctAnswer: string
): StudentProgress {
  const prevTopicMap = prev.completedPracticeByTopic[topicId] ?? {};
  const updatedTopicMap = {
    ...prevTopicMap,
    [questionId]: { answer, isCorrect },
  };

  let nextIncorrect: IncorrectRecord[] = prev.incorrectAnswers.filter(
    (rec) => !(rec.questionId === questionId && rec.source === 'practice')
  );
  if (!isCorrect) {
    const newRec: IncorrectRecord = {
      questionId,
      topicId,
      userAnswer: answer,
      correctAnswer,
      timestamp: new Date().toISOString(),
      source: 'practice',
    };
    nextIncorrect = [newRec, ...nextIncorrect].slice(0, 100);
  }

  const next: StudentProgress = {
    ...prev,
    completedPracticeByTopic: {
      ...prev.completedPracticeByTopic,
      [topicId]: updatedTopicMap,
    },
    incorrectAnswers: nextIncorrect,
  };
  saveProgress(next);
  return next;
}

export function recordQuizAttempt(
  prev: StudentProgress,
  attempt: QuizAttempt
): StudentProgress {
  const newIncorrects: IncorrectRecord[] = attempt.resultsByQuestion
    .filter((r) => !r.isCorrect)
    .map((r) => ({
      questionId: r.questionId,
      topicId: attempt.topicId,
      userAnswer: r.userAnswer || '(blank)',
      correctAnswer: r.correctAnswer,
      timestamp: attempt.timestamp,
      source: (attempt.mode === 'demo-diagnostic' ? 'demo' : 'quiz') as 'demo' | 'quiz',
    }));

  const completedTopics =
    attempt.percentage >= 70 && !prev.completedTopicIds.includes(attempt.topicId)
      ? [...prev.completedTopicIds, attempt.topicId]
      : prev.completedTopicIds;

  const next: StudentProgress = {
    ...prev,
    completedTopicIds: completedTopics,
    quizAttempts: [attempt, ...prev.quizAttempts].slice(0, 50),
    incorrectAnswers: [...newIncorrects, ...prev.incorrectAnswers].slice(0, 100),
  };
  saveProgress(next);
  return next;
}
