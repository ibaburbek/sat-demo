import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Presentation,
  RotateCcw,
  CheckCircle2,
  User,
} from 'lucide-react';
import { AppPage, StudentProgress } from '../types/curriculum';
import { CURRICULUM_TOPICS, SAT_DOMAINS, getTopicById } from '../data/curriculumStructure';
import { TOPIC_CONTENT_MAP } from '../data/topics';
import { TranslatedText } from '../components/TranslatedText';

interface DashboardPageProps {
  progress: StudentProgress;
  onNavigate: (page: AppPage, topicId?: string) => void;
  onUpdateName: (name: string) => void;
  onResetProgress: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  progress,
  onNavigate,
  onUpdateName,
  onResetProgress,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(progress.studentName);
  const [confirmReset, setConfirmReset] = useState(false);

  const completeTopics = CURRICULUM_TOPICS.filter((t) => t.status === 'complete');
  const totalPracticeAvailable = completeTopics.reduce(
    (sum, t) => sum + (TOPIC_CONTENT_MAP[t.id]?.practiceQuestions.length ?? 0),
    0
  );

  const practicedCount = Object.values(progress.completedPracticeByTopic).reduce(
    (sum, topicMap) => sum + Object.keys(topicMap).length,
    0
  );
  const practicedCorrect = Object.values(progress.completedPracticeByTopic).reduce(
    (sum, topicMap) =>
      sum + Object.values(topicMap).filter((item) => item.isCorrect).length,
    0
  );

  const completedTopicsCount = progress.completedTopicIds.length;
  const overallProgressPct =
    completeTopics.length > 0
      ? Math.round((completedTopicsCount / completeTopics.length) * 100)
      : 0;

  const lastTopic = getTopicById(progress.lastVisitedTopicId) ?? CURRICULUM_TOPICS[0];

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(nameDraft.trim());
    setEditingName(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-blue-700 mb-2">
              Digital SAT Mathematics · English–Russian Vocabulary Support
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] text-balance">
              SAT MATH LAB
            </h1>
            <p className="text-base md:text-lg text-slate-600 mt-2.5 leading-relaxed">
              <TranslatedText text="Master the concepts. Understand the language. Solve with confidence." />
            </p>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              <TranslatedText text="Hover over or tap any underlined English word or phrase to view its Russian translation. Practice original SAT-style questions, check your answers, and download printable graph-paper worksheets." />
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('topic', lastTopic.id)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onNavigate('quiz', lastTopic.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span>Start Diagnostic</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('demo')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Presentation className="w-4 h-4 text-slate-600" />
                <span>Teacher Demo Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student Profile Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-400" />
            {editingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Enter student name"
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium bg-[#0F172A] text-white rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Student:</span>
                <span className="font-medium text-[#0F172A]">
                  {progress.studentName || 'Not set'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(progress.studentName);
                    setEditingName(true);
                  }}
                  className="text-xs text-blue-600 hover:underline ml-1"
                >
                  {progress.studentName ? 'Edit' : 'Set name'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Last topic: <strong className="text-slate-700 font-medium">{lastTopic.title}</strong>
            </span>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Progress Summary (Empty states until actual results exist) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Overall Learning Progress</div>
          {completedTopicsCount === 0 && practicedCount === 0 ? (
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-tabular text-[#0F172A]">0%</div>
              <p className="text-xs text-slate-500 mt-1">
                Complete a knowledge check with at least 70% to mark a topic mastered.
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-tabular text-[#0F172A]">
                {overallProgressPct}%
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${overallProgressPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {completedTopicsCount} of {completeTopics.length} active modules completed
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Practice Exercises Answered</div>
          {practicedCount === 0 ? (
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-tabular text-[#0F172A]">
                0 / {totalPracticeAvailable}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                No practice questions submitted yet. Start with Linear Equations.
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-tabular text-[#0F172A]">
                {practicedCount} / {totalPracticeAvailable}
              </div>
              <p className="text-xs text-slate-600 mt-1 font-mono-tabular">
                {practicedCorrect} correct ({Math.round((practicedCorrect / practicedCount) * 100)}% accuracy)
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Recent Assessment Results</div>
          {progress.quizAttempts.length === 0 ? (
            <div className="mt-2">
              <div className="text-sm font-medium text-slate-700">No quiz attempts recorded</div>
              <p className="text-xs text-slate-500 mt-1">
                Take a 10-question Knowledge Check to record your score and see topic diagnostics.
              </p>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {progress.quizAttempts.slice(0, 2).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                >
                  <span className="font-medium text-[#0F172A] truncate pr-2">
                    {attempt.topicTitle}
                  </span>
                  <span className="font-mono-tabular font-semibold text-blue-700 shrink-0">
                    {attempt.correctCount}/{attempt.totalQuestions} ({attempt.percentage}%)
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="text-xs font-medium text-blue-600 hover:underline pt-0.5"
              >
                View all results
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Four Official SAT Math Domains */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Four Digital SAT Math Domains
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Aligned with the current College Board Digital SAT framework.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('curriculum')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
          >
            <BookOpen className="w-4 h-4" />
            <span>Full Curriculum (44 Topics)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAT_DOMAINS.map((domain) => {
            const domainTopics = CURRICULUM_TOPICS.filter(
              (t) => t.domainId === domain.id
            );
            const activeInDomain = domainTopics.filter(
              (t) => t.status === 'complete'
            );
            const completedInDomain = domainTopics.filter((t) =>
              progress.completedTopicIds.includes(t.id)
            );

            return (
              <div
                key={domain.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{domain.satWeight}</span>
                    <span aria-hidden="true">·</span>
                    <span>{domainTopics.length} Topics</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mt-1.5">
                    {domain.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    <TranslatedText text={domain.description} />
                  </p>

                  {activeInDomain.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-medium text-slate-500">
                        Available Interactive Modules
                      </div>
                      {activeInDomain.map((topic) => {
                        const isDone = progress.completedTopicIds.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => onNavigate('topic', topic.id)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#F8FAFC] hover:bg-blue-50/70 border border-slate-200/80 text-left transition-colors"
                          >
                            <span className="text-sm font-medium text-[#0F172A] flex items-center gap-2">
                              {isDone && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              <span>{topic.title}</span>
                            </span>
                            <span className="text-xs text-blue-600 font-medium shrink-0">
                              Open →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {completedInDomain.length}/{domainTopics.length} topics completed
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('curriculum')}
                    className="font-medium text-slate-700 hover:text-blue-600"
                  >
                    Browse domain
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reset Progress Confirmation Modal */}
      {confirmReset && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 id="reset-dialog-title" className="text-lg font-semibold text-[#0F172A]">
              Reset All Learning Progress?
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              This will permanently clear your completed practice answers, quiz scores, marked questions, and student name from this browser.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
              >
                Yes, Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
