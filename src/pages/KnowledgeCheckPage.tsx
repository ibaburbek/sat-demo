import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardCheck, Send } from 'lucide-react';
import { DifficultyLevel, QuizAttempt } from '../types/curriculum';
import { CURRICULUM_TOPICS, getTopicById } from '../data/curriculumStructure';
import { getTopicContent } from '../data/topics';
import { checkQuestionAnswer } from '../utils/sprValidation';
import { RichMathText, TranslatedText } from '../components/TranslatedText';

interface KnowledgeCheckPageProps {
  topicId: string;
  onSelectTopic: (topicId: string) => void;
  onCompleteQuiz: (attempt: QuizAttempt) => void;
}

export const KnowledgeCheckPage: React.FC<KnowledgeCheckPageProps> = ({
  topicId,
  onSelectTopic,
  onCompleteQuiz,
}) => {
  const completeTopics = CURRICULUM_TOPICS.filter((t) => t.status === 'complete');
  const activeTopic =
    getTopicById(topicId)?.status === 'complete'
      ? getTopicById(topicId)!
      : completeTopics[0];
  const content = getTopicContent(activeTopic.id)!;
  const questions = content.assessmentQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
  }, [activeTopic.id]);

  const currentQ = questions[currentIndex];
  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim() !== '').length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
  };

  const handleSubmitAssessment = () => {
    const breakdown: Record<DifficultyLevel, { total: number; correct: number }> = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      'medium-hard': { total: 0, correct: 0 },
    };

    const resultsByQuestion = questions.map((q) => {
      const userAnswer = (answers[q.id] ?? '').trim();
      const isCorrect = checkQuestionAnswer(q, userAnswer);
      breakdown[q.difficulty].total += 1;
      if (isCorrect) breakdown[q.difficulty].correct += 1;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        difficulty: q.difficulty,
      };
    });

    const correctCount = resultsByQuestion.filter((r) => r.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    const attempt: QuizAttempt = {
      id: `quiz-${Date.now()}`,
      topicId: activeTopic.id,
      topicTitle: activeTopic.title,
      timestamp: new Date().toISOString(),
      mode: 'quiz',
      totalQuestions: questions.length,
      correctCount,
      percentage,
      answers,
      resultsByQuestion,
      breakdownByDifficulty: breakdown,
    };

    onCompleteQuiz(attempt);
  };

  const diffLabel = (d: DifficultyLevel) =>
    d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Medium-Hard';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">
              10-Question Knowledge Check · 3 Easy · 4 Medium · 3 Medium-Hard
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] mt-0.5">
              {activeTopic.title} Assessment
            </h1>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {completeTopics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTopic(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  t.id === activeTopic.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
            <span>
              Answered: <strong className="font-mono-tabular">{answeredCount}/10</strong>
            </span>
            <span className="font-mono-tabular">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question Step Numbers */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const hasAns = (answers[q.id] ?? '').trim() !== '';
            const active = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-md border text-xs font-mono-tabular transition-colors ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                    : hasAns
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Question Card (Never reveals answer before submit) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs text-slate-500">
          <span className="font-mono-tabular font-semibold text-[#0F172A]">
            Question {currentIndex + 1} of 10
          </span>
          <div className="flex items-center gap-2">
            <span>{diffLabel(currentQ.difficulty)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {currentQ.type === 'spr' ? 'Student-Produced Response' : 'Multiple Choice'}
            </span>
          </div>
        </div>

        <div className="text-base md:text-lg font-medium text-[#0F172A] leading-relaxed">
          <RichMathText text={currentQ.question} />
        </div>

        {currentQ.type === 'multiple-choice' && currentQ.choices ? (
          <div className="space-y-2.5">
            {currentQ.choices.map((choice) => {
              const letter = choice.trim().charAt(0).toUpperCase();
              const selected = (answers[currentQ.id] ?? '').toUpperCase() === letter;

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleAnswerChange(letter)}
                  className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm md:text-base transition-colors flex items-start gap-3 ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-[#0F172A]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono-tabular font-semibold shrink-0 mt-0.5 ${
                      selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="leading-relaxed">
                    <RichMathText text={choice.replace(/^[A-D]\.\s*/, '')} />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="max-w-sm space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              <TranslatedText text="Enter your numerical answer (integer, decimal, or fraction):" />
            </label>
            <input
              type="text"
              value={answers[currentQ.id] ?? ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="e.g., 5 or -4 or 3/2"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 font-mono-tabular text-base text-[#0F172A] focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-slate-800"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitAssessment}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Assessment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Submit Footer Note */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <ClipboardCheck className="w-4 h-4 text-slate-400" />
          Answers are graded automatically upon submission.
        </span>
        {currentIndex < questions.length - 1 && answeredCount === questions.length && (
          <button
            type="button"
            onClick={handleSubmitAssessment}
            className="text-blue-600 font-semibold hover:underline"
          >
            All 10 answered — Submit now
          </button>
        )}
      </div>
    </div>
  );
};
