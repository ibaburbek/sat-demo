import React, { useState } from 'react';
import { CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { AppPage, DomainId, StudentProgress } from '../types/curriculum';
import { CURRICULUM_TOPICS, SAT_DOMAINS } from '../data/curriculumStructure';
import { TranslatedText } from '../components/TranslatedText';

interface CurriculumPageProps {
  progress: StudentProgress;
  onSelectTopic: (topicId: string, targetPage?: AppPage) => void;
}

export const CurriculumPage: React.FC<CurriculumPageProps> = ({
  progress,
  onSelectTopic,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete'>('all');

  const visibleDomains =
    selectedDomain === 'all'
      ? SAT_DOMAINS
      : SAT_DOMAINS.filter((d) => d.id === selectedDomain);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">SAT Math Curriculum</h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-3xl">
          <TranslatedText text="Organized into the four official Digital SAT Math domains. Three foundational modules include complete interactive theory, 22 practice questions, 10-question assessments, and PDF worksheets. Additional topics show structured curriculum outlines." />
        </p>

        {/* Domain & Status Filters */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedDomain === 'all'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              All Domains (44)
            </button>
            {SAT_DOMAINS.map((dom) => (
              <button
                key={dom.id}
                type="button"
                onClick={() => setSelectedDomain(dom.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedDomain === dom.id
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {dom.shortName}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Show All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('complete')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'complete'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Ready Modules (3)
            </button>
          </div>
        </div>
      </div>

      {/* Domain Sections */}
      <div className="space-y-6">
        {visibleDomains.map((domain) => {
          const topics = CURRICULUM_TOPICS.filter((t) => {
            if (t.domainId !== domain.id) return false;
            if (statusFilter === 'complete') return t.status === 'complete';
            return true;
          });

          if (topics.length === 0) return null;

          return (
            <section
              key={domain.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">{domain.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{domain.satWeight}</p>
                </div>
                <span className="text-xs text-slate-500 font-mono-tabular">
                  {topics.length} topics shown
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {topics.map((topic) => {
                  const isComplete = topic.status === 'complete';
                  const isMastered = progress.completedTopicIds.includes(topic.id);
                  const practicedCount = Object.keys(
                    progress.completedPracticeByTopic[topic.id] ?? {}
                  ).length;

                  return (
                    <div
                      key={topic.id}
                      className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono-tabular">
                            {String(topic.order).padStart(2, '0')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{topic.difficulty}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {topic.estimatedMinutes} min
                          </span>
                          <span aria-hidden="true">·</span>
                          {isComplete ? (
                            <span className="text-blue-700 font-medium">
                              Full Interactive Lesson + 32 Questions
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Curriculum Outline (Exercises Planned)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isMastered && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <h3 className="text-base font-semibold text-[#0F172A]">
                            {topic.title}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                          <TranslatedText text={topic.shortDescription} />
                        </p>

                        {isComplete && practicedCount > 0 && (
                          <div className="text-xs text-emerald-700 font-medium pt-0.5">
                            Practiced: {practicedCount}/22 questions
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isComplete ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onSelectTopic(topic.id, 'topic')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              <span>Study Lesson</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectTopic(topic.id, 'practice')}
                              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                            >
                              Practice (22)
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectTopic(topic.id, 'quiz')}
                              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                            >
                              Quiz (10)
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectTopic(topic.id, 'topic')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>View Scope</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
