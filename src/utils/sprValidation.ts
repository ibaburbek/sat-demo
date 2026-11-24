import { Question } from '../types/curriculum';

/**
 * Parses a Digital SAT Student-Produced Response (SPR) string into a number.
 * Supports integers ("8", "-6"), decimals ("0.5", ".5", "-2.25"),
 * and fractions ("3/4", "-7/2").
 */
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s+/g, '');
  if (!cleaned) return null;

  // Fraction format: a/b
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length !== 2) return null;
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    return num / den;
  }

  // Standard decimal or integer
  const val = Number(cleaned);
  return Number.isFinite(val) ? val : null;
}

export function checkQuestionAnswer(question: Question, userAnswer: string): boolean {
  const trimmed = userAnswer.trim();
  if (!trimmed) return false;

  if (question.type === 'multiple-choice') {
    return trimmed.toUpperCase() === question.correctAnswer.trim().toUpperCase();
  }

  // SPR check
  if (
    question.acceptableAnswers &&
    question.acceptableAnswers.some(
      (acc) => acc.trim().toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return true;
  }

  const userNum = parseNumericInput(trimmed);
  const expectedNum = parseNumericInput(question.correctAnswer);

  if (userNum === null || expectedNum === null) {
    return false;
  }

  return Math.abs(userNum - expectedNum) < 1e-4;
}
