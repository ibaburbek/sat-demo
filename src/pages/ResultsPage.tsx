import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  AppPage,
  DifficultyLevel,
  Question,
  QuizAttempt,
  StudentProgress,
} from '../types/curriculum';
import { getTopicContent } from '../data/topics';
import { RichMathText } from '../components/TranslatedText';

interface ResultsPageProps {
  progress: StudentProgress;
  selectedAttemptId: string | null;
  onSelectAttempt: (id: string) => void;
  onNavigate: (page: AppPage, topicId?: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  progress,
  selectedAttemptId,
  onSelectAttempt,
  onNavigate,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect'>('all');

  const activeAttempt: QuizAttempt | undefined = useMemo(() => {
    if (progress.quizAttempts.length === 0) return undefined;
    if (selectedAttemptId) {
      const found = progress.quizAttempts.find((a) => a.id === selectedAttemptId);
      if (found) return found;
    }
    return progress.quizAttempts[0];
  }, [progress.quizAttempts, selectedAttemptId]);

  const questionLookup = useMemo(() => {
    const map = new Map<string, Question>();
    if (!activeAttempt) return map;
    const content = getTopicContent(activeAttempt.topicId);
    if (!content) return map;
    [...content.assessmentQuestions, ...content.practiceQuestions].forEach((q) =>
      map.set(q.id, q)
    );
    return map;
  }, [activeAttempt]);

  if (!activeAttempt) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#0F172A]">Results and Progress</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          No knowledge check or diagnostic assessment has been submitted yet. Complete a 10-question assessment to view your accuracy breakdown and review explanations.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('quiz', 'alg-linear-one-var')}
            className="px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700"
          >
            Start 10-Question Assessment
          </button>
          <button
            type="button"
            onClick={() => onNavigate('practice', 'alg-linear-one-var')}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Practice Exercises
          </button>
        </div>
      </div>
    );
  }

  const incorrectCount = activeAttempt.totalQuestions - activeAttempt.correctCount;
  const needsAdditionalPractice =
    activeAttempt.percentage < 70 ||
    activeAttempt.breakdownByDifficulty['medium-hard'].correct < 2;

  const displayedResults =
    filterMode === 'incorrect'
      ? activeAttempt.resultsByQuestion.filter((r) => !r.isCorrect)
      : activeAttempt.resultsByQuestion;

  const diffOrder: Array<{ key: DifficultyLevel; label: string }> = [
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'medium-hard', label: 'Medium-Hard' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Attempt History Selector if multiple */}
      {progress.quizAttempts.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Recent Attempts:</span>
          {progress.quizAttempts.slice(0, 6).map((att) => (
            <button
              key={att.id}
              type="button"
              onClick={() => onSelectAttempt(att.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                att.id === activeAttempt.id
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {att.topicTitle} ({att.correctCount}/{att.totalQuestions})
            </button>
          ))}
        </div>
      )}

      {/* Main Score Overview */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs text-slate-500">
              {activeAttempt.mode === 'demo-diagnostic'
                ? 'Teacher Demo Diagnostic'
                : 'Knowledge Check Results'}{' '}
              · {new Date(activeAttempt.timestamp).toLocaleString()}
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mt-1">
              {activeAttempt.topicTitle}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-6">
              <div>
                <div className="text-xs text-slate-500">Score</div>
                <div className="text-3xl font-bold font-mono-tabular text-[#0F172A]">
                  {activeAttempt.correctCount}/{activeAttempt.totalQuestions}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Accuracy</div>
                <div className="text-3xl font-bold font-mono-tabular text-blue-600">
                  {activeAttempt.percentage}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Correct / Incorrect</div>
                <div className="text-lg font-semibold font-mono-tabular text-slate-700 mt-1">
                  <span className="text-emerald-700">{activeAttempt.correctCount} correct</span>
                  {' · '}
                  <span className="text-rose-700">{incorrectCount} incorrect</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {incorrectCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilterMode(filterMode === 'incorrect' ? 'all' : 'incorrect')
                }
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-[#0F172A] hover:bg-slate-50"
              >
                {filterMode === 'incorrect'
                  ? 'Show All Questions'
                  : 'Review Incorrect Answers'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('quiz', activeAttempt.topicId)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('curriculum')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Performance by Difficulty Visualization */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          {diffOrder.map(({ key, label }) => {
            const stats = activeAttempt.breakdownByDifficulty[key];
            const pct =
              stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return (
              <div
                key={key}
                className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200"
              >
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>{label}</span>
                  <span className="font-mono-tabular font-semibold text-[#0F172A]">
                    {stats.correct}/{stats.total} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pct >= 70
                        ? 'bg-emerald-600'
                        : pct >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendation Banner */}
        <div className="mt-5 p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-start gap-3 text-sm">
          {needsAdditionalPractice ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-slate-700">
                <strong className="text-[#0F172A]">Recommended Next Step: </strong>
                Review the step-by-step explanations below for{' '}
                <strong>{activeAttempt.topicTitle}</strong> and complete additional practice questions before moving on.
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-slate-700">
                <strong className="text-[#0F172A]">Topic Mastered: </strong>
                You scored {activeAttempt.percentage}% on {activeAttempt.topicTitle}. Continue to the next SAT Math domain topic.
              </div>
            </>
          )}
        </div>
      </section>

      {/* Detailed Question-by-Question Review */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">
            {filterMode === 'incorrect'
              ? `Incorrect Answers (${displayedResults.length})`
              : 'Question-by-Question Review'}
          </h2>
        </div>

        {displayedResults.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-emerald-700 font-medium">
            Perfect score — no incorrect answers to review.
          </div>
        ) : (
          <div className="space-y-4">
            {displayedResults.map((res, idx) => {
              const q = questionLookup.get(res.questionId);
              if (!q) return null;
              return (
                <div
                  key={res.questionId}
                  className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono-tabular text-slate-500">
                      Item {idx + 1} · {q.difficulty}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        res.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {res.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-base font-medium text-[#0F172A]">
                    <RichMathText text={q.question} />
                  </div>

                  <div className="flex flex-wrap gap-6 text-xs font-mono-tabular pt-1">
                    <div>
                      <span className="text-slate-500">Your Answer: </span>
                      <span
                        className={`font-semibold ${
                          res.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {res.userAnswer || '(blank)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Correct Answer: </span>
                      <span className="font-semibold text-emerald-700">
                        {res.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-sm text-slate-700 space-y-1.5">
                    <div>
                      <span className="font-semibold text-[#0F172A]">Explanation: </span>
                      <RichMathText text={q.explanation} />
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-amber-700">Common mistake: </span>
                      <RichMathText text={q.commonMistake} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
