import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileDown,
  KeyRound,
} from 'lucide-react';
import {
  AppPage,
  DifficultyLevel,
  Question,
  StudentProgress,
} from '../types/curriculum';
import { CURRICULUM_TOPICS, getTopicById } from '../data/curriculumStructure';
import { getTopicContent } from '../data/topics';
import { checkQuestionAnswer } from '../utils/sprValidation';
import { generatePracticePdf } from '../utils/pdfGenerator';
import { RichMathText, TranslatedText } from '../components/TranslatedText';

interface PracticePageProps {
  topicId: string;
  progress: StudentProgress;
  onSelectTopic: (topicId: string) => void;
  onSubmitAnswer: (
    topicId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean,
    correctAnswer: string
  ) => void;
  onToggleReview: (questionId: string) => void;
  onResetQuestion: (topicId: string, questionId: string) => void;
  onNavigate: (page: AppPage, topicId?: string) => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  topicId,
  progress,
  onSelectTopic,
  onSubmitAnswer,
  onToggleReview,
  onResetQuestion,
  onNavigate,
}) => {
  const completeTopics = CURRICULUM_TOPICS.filter((t) => t.status === 'complete');
  const activeTopic =
    getTopicById(topicId)?.status === 'complete'
      ? getTopicById(topicId)!
      : completeTopics[0];
  const content = getTopicContent(activeTopic.id)!;

  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState('');

  const filteredQuestions: Question[] = useMemo(() => {
    if (difficultyFilter === 'all') return content.practiceQuestions;
    return content.practiceQuestions.filter((q) => q.difficulty === difficultyFilter);
  }, [content.practiceQuestions, difficultyFilter]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTopic.id, difficultyFilter]);

  const currentQuestion = filteredQuestions[currentIndex] ?? filteredQuestions[0];
  const savedRecord =
    progress.completedPracticeByTopic[activeTopic.id]?.[currentQuestion.id];

  useEffect(() => {
    setDraftAnswer(savedRecord?.answer ?? '');
  }, [currentQuestion.id, savedRecord?.answer]);

  const isMarked = progress.markedForReview.includes(currentQuestion.id);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draftAnswer.trim()) return;
    const correct = checkQuestionAnswer(currentQuestion, draftAnswer);
    onSubmitAnswer(
      activeTopic.id,
      currentQuestion.id,
      draftAnswer.trim(),
      correct,
      currentQuestion.correctAnswer
    );
  };

  const handleReset = () => {
    setDraftAnswer('');
    onResetQuestion(activeTopic.id, currentQuestion.id);
  };

  const handleDownloadPdf = (mode: 'worksheet' | 'answer-key') => {
    generatePracticePdf({
      topicTitle: activeTopic.title,
      domainName: activeTopic.domainName,
      studentName: progress.studentName,
      dateStr: new Date().toLocaleDateString('en-US'),
      difficultyFilter,
      questions: filteredQuestions,
      mode,
    });
  };

  const diffLabel = (d: DifficultyLevel) =>
    d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Medium-Hard';

  const sourceLabel =
    currentQuestion.sourceType === 'historical-sat' && currentQuestion.sourceReference
      ? `Historical SAT (${currentQuestion.sourceReference})`
      : currentQuestion.sourceType === 'official-practice' && currentQuestion.sourceReference
      ? `Official Practice (${currentQuestion.sourceReference})`
      : 'SAT-style practice';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Controls & PDF Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">{activeTopic.domainName}</div>
            <h1 className="text-xl font-bold text-[#0F172A]">
              Practice Exercises: {activeTopic.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf('worksheet')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Practice as PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadPdf('answer-key')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Teacher Answer Key PDF</span>
            </button>
          </div>
        </div>

        {/* Topic Switcher & Difficulty Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
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

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'All (22)' },
                { id: 'easy', label: 'Easy (6)' },
                { id: 'medium', label: 'Medium (10)' },
                { id: 'medium-hard', label: 'Medium-Hard (6)' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDifficultyFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  difficultyFilter === f.id
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Grid Navigator */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2.5 text-xs text-slate-500">
          <span>
            Question Navigator ({currentIndex + 1} of {filteredQuestions.length})
          </span>
          <span>Click any number to jump</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredQuestions.map((q, idx) => {
            const rec = progress.completedPracticeByTopic[activeTopic.id]?.[q.id];
            const marked = progress.markedForReview.includes(q.id);
            const active = idx === currentIndex;

            let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
            if (rec?.isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
            } else if (rec && !rec.isCorrect) {
              btnStyle = 'bg-rose-50 border-rose-300 text-rose-800';
            }
            if (active) {
              btnStyle += ' ring-2 ring-blue-600 ring-offset-1 font-bold';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-9 h-9 rounded-md border text-xs font-mono-tabular transition-colors ${btnStyle}`}
                title={`Question ${idx + 1} (${diffLabel(q.difficulty)})`}
              >
                {idx + 1}
                {marked && (
                  <span
                    aria-label="Marked for review"
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-mono-tabular font-semibold text-[#0F172A]">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>Difficulty: {diffLabel(currentQuestion.difficulty)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {currentQuestion.type === 'spr'
                ? 'Student-Produced Response (Grid-In)'
                : 'Multiple Choice'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{sourceLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleReview(currentQuestion.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                isMarked
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-base md:text-lg font-medium text-[#0F172A] leading-relaxed">
          <RichMathText text={currentQuestion.question} />
        </div>

        {/* Answer Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.choices ? (
            <div className="space-y-2.5">
              {currentQuestion.choices.map((choice) => {
                const letter = choice.trim().charAt(0).toUpperCase();
                const selected = draftAnswer.toUpperCase() === letter;
                const isRevealed = Boolean(savedRecord);
                const isCorrectChoice =
                  currentQuestion.correctAnswer.toUpperCase() === letter;

                let optionClass =
                  'border-slate-200 bg-white hover:bg-slate-50 text-[#0F172A]';
                if (isRevealed) {
                  if (isCorrectChoice) {
                    optionClass =
                      'border-emerald-500 bg-emerald-50/70 text-emerald-950';
                  } else if (selected && !isCorrectChoice) {
                    optionClass = 'border-rose-400 bg-rose-50/70 text-rose-950';
                  }
                } else if (selected) {
                  optionClass = 'border-blue-600 bg-blue-50/60 text-blue-950';
                }

                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setDraftAnswer(letter)}
                    className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm md:text-base transition-colors flex items-start gap-3 ${optionClass}`}
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
                <TranslatedText text="Enter your numerical answer (integer, decimal, or fraction like 3/4):" />
              </label>
              <input
                type="text"
                value={draftAnswer}
                onChange={(e) => setDraftAnswer(e.target.value)}
                placeholder="e.g., 8 or -6 or 3/4"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 font-mono-tabular text-base text-[#0F172A] focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!draftAnswer.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Check Answer
            </button>
            {savedRecord && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                  savedRecord.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {savedRecord.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>
                      Incorrect — Correct Answer: {currentQuestion.correctAnswer}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
        </form>

        {/* Detailed Explanation After Submission */}
        {savedRecord && (
          <div className="pt-5 border-t border-slate-200 space-y-4">
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2.5">
              <div className="text-xs font-semibold text-blue-700">
                Step-by-Step Solution
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                <RichMathText text={currentQuestion.explanation} />
              </p>
              <div className="pt-2 border-t border-slate-200/80 text-sm text-slate-700">
                <span className="font-semibold text-emerald-700">
                  Why the correct answer works:{' '}
                </span>
                <RichMathText text={currentQuestion.whyCorrect} />
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-sm text-slate-700">
                <span className="font-semibold text-amber-700">Common mistake: </span>
                <RichMathText text={currentQuestion.commonMistake} />
              </div>
            </div>
          </div>
        )}

        {/* Prev / Next Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex < filteredQuestions.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => Math.min(filteredQuestions.length - 1, i + 1))
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-slate-800"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('quiz', activeTopic.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              <span>Take 10-Question Knowledge Check</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
