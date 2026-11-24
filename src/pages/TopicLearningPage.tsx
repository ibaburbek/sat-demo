import React, { useMemo, useState } from 'react';
import {
  Clock,
  Copy,
  Check,
  PenTool,
  ClipboardCheck,
  FileDown,
  Search,
  Plus,
  BookOpen,
} from 'lucide-react';
import { AppPage, TopicMetadata, VocabEntry } from '../types/curriculum';
import { CURRICULUM_TOPICS, getTopicById } from '../data/curriculumStructure';
import { getTopicContent } from '../data/topics';
import { MathFormula } from '../components/MathRenderer';
import { RichMathText, TranslatedText, useVocabulary } from '../components/TranslatedText';
import { LinearEquationVisualizer } from '../components/visualizations/LinearEquationVisualizer';
import { SystemsVisualizer } from '../components/visualizations/SystemsVisualizer';
import { QuadraticVisualizer } from '../components/visualizations/QuadraticVisualizer';

interface TopicLearningPageProps {
  topicId: string;
  onSelectTopic: (topicId: string) => void;
  onNavigate: (page: AppPage, topicId?: string) => void;
}

export const TopicLearningPage: React.FC<TopicLearningPageProps> = ({
  topicId,
  onSelectTopic,
  onNavigate,
}) => {
  const topic: TopicMetadata = getTopicById(topicId) ?? CURRICULUM_TOPICS[0];
  const content = getTopicContent(topic.id);
  const { vocabulary, addCustomVocab } = useVocabulary();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vocabSearch, setVocabSearch] = useState('');
  const [showAddVocab, setShowAddVocab] = useState(false);
  const [newEng, setNewEng] = useState('');
  const [newRus, setNewRus] = useState('');
  const [newExp, setNewExp] = useState('');

  const completeTopics = CURRICULUM_TOPICS.filter((t) => t.status === 'complete');

  const topicVocabList = useMemo(() => {
    const query = vocabSearch.trim().toLowerCase();
    const base = vocabulary.filter((v) => {
      if (!query) {
        return (
          v.category === 'equations' ||
          v.category === 'algebra' ||
          v.category === 'functions' ||
          v.category === 'test-instructions'
        );
      }
      return (
        v.english.toLowerCase().includes(query) ||
        v.russian.toLowerCase().includes(query)
      );
    });
    return base.slice(0, query ? 40 : 18);
  }, [vocabulary, vocabSearch]);

  const handleCopyFormula = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleAddTranslation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEng.trim() || !newRus.trim()) return;
    const entry: Omit<VocabEntry, 'id' | 'isCustom'> = {
      english: newEng.trim(),
      russian: newRus.trim(),
      explanation: newExp.trim() || undefined,
      category: 'algebra',
      topicId: topic.id,
    };
    addCustomVocab(entry);
    setNewEng('');
    setNewRus('');
    setNewExp('');
    setShowAddVocab(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Topic Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Active Modules:</span>
          {completeTopics.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTopic(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                t.id === topic.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigate('curriculum')}
          className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
        >
          All 44 Topics
        </button>
      </div>

      {/* Planned Topic Notice if not one of the 3 initial complete modules */}
      {!content && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{topic.domainName}</span>
            <span aria-hidden="true">·</span>
            <span>{topic.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>Estimated {topic.estimatedMinutes} min</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{topic.title}</h1>
          <p className="text-base text-slate-600 leading-relaxed">
            <TranslatedText text={topic.shortDescription} />
          </p>
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-sm text-slate-700">
            This curriculum module is currently listed as a structured syllabus outline. Full interactive theory, 22 practice questions, 10-question assessment, and PDF worksheet generation are currently available for:
            <div className="mt-3 flex flex-wrap gap-2">
              {completeTopics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTopic(t.id)}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Open {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {content && (
        <>
          {/* SECTION A: LEARNING OBJECTIVES */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span>{topic.domainName}</span>
              <span aria-hidden="true">·</span>
              <span>Difficulty: {topic.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {topic.estimatedMinutes} min study time
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
              {topic.title}
            </h1>

            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              <RichMathText text={content.objectives.intro} />
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A] mb-2.5">
                  What You Will Learn
                </h2>
                <ul className="space-y-2 text-sm text-slate-700">
                  {content.objectives.whatYouWillLearn.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="font-mono-tabular text-xs font-semibold text-blue-600 mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span className="leading-relaxed">
                        <RichMathText text={obj} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#0F172A] mb-2">
                    Prerequisites
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {content.objectives.prerequisites.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400">•</span>
                        <span>
                          <TranslatedText text={p} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('practice', topic.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Practice (22 Questions)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('quiz', topic.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>10-Question Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('pdf', topic.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download Practice as PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: THEORY AND EXPLANATION */}
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Theory and Step-by-Step Examples
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                <TranslatedText text="Clear explanations written in simple English. Hover or tap underlined words for Russian translations." />
              </p>
            </div>

            <div className="space-y-5">
              {content.theory.map((concept) => (
                <article
                  key={concept.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {concept.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm leading-relaxed">
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 mb-1">
                          Definition
                        </span>
                        <p className="text-slate-700">
                          <RichMathText text={concept.definition} />
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 mb-1">
                          Mathematical Rule
                        </span>
                        <p className="text-slate-700">
                          <RichMathText text={concept.rule} />
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 mb-1">
                          When to Use
                        </span>
                        <p className="text-slate-700">
                          <RichMathText text={concept.whenToUse} />
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {concept.formula && (
                        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center overflow-x-auto">
                          <MathFormula latex={concept.formula} displayMode />
                        </div>
                      )}

                      <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2.5">
                        <div className="text-xs font-semibold text-blue-700">
                          Worked Example: {concept.example.title}
                        </div>
                        <div className="text-sm font-medium text-[#0F172A]">
                          <RichMathText text={concept.example.problem} />
                        </div>
                        <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
                          {concept.example.steps.map((step, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              <RichMathText text={step} />
                            </li>
                          ))}
                        </ol>
                        <div className="pt-2 border-t border-slate-200 text-sm font-semibold text-emerald-700">
                          Answer: <RichMathText text={concept.example.finalAnswer} />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION C: FORMULA CARDS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0F172A]">Key Formula Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {content.formulas.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-[#0F172A]">
                        {card.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopyFormula(card.id, card.copyText)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 shrink-0"
                        title="Copy formula"
                      >
                        {copiedId === card.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center overflow-x-auto mb-3">
                      <MathFormula latex={card.formulaLatex} />
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {card.variables.map((v, vIdx) => (
                        <li key={vIdx} className="flex items-start gap-2">
                          <span className="font-mono-tabular font-semibold text-blue-700 shrink-0">
                            <MathFormula latex={v.symbol} />:
                          </span>
                          <span>
                            <TranslatedText text={v.meaning} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {card.note && (
                    <p className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                      <TranslatedText text={card.note} />
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION D: INTERACTIVE VISUALIZATION */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F172A]">
              Interactive Visualization
            </h2>
            {content.visualizationType === 'linear-equation' && (
              <LinearEquationVisualizer />
            )}
            {content.visualizationType === 'systems' && <SystemsVisualizer />}
            {content.visualizationType === 'quadratic' && <QuadraticVisualizer />}
          </section>

          {/* SECTION E: ENGLISH–RUSSIAN VOCABULARY SUPPORT */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  English–Russian Vocabulary Support
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search any mathematical English term or add a custom translation for your student.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVocab(!showAddVocab)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Translation</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('glossary')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Full Glossary ({vocabulary.length})</span>
                </button>
              </div>
            </div>

            {showAddVocab && (
              <form
                onSubmit={handleAddTranslation}
                className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    English Word / Phrase
                  </label>
                  <input
                    type="text"
                    required
                    value={newEng}
                    onChange={(e) => setNewEng(e.target.value)}
                    placeholder="e.g., at least"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Russian Translation
                  </label>
                  <input
                    type="text"
                    required
                    value={newRus}
                    onChange={(e) => setNewRus(e.target.value)}
                    placeholder="e.g., не менее"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Simple Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    placeholder="e.g., means >= "
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Save Term
                </button>
              </form>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                placeholder="Search vocabulary in English or Russian..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topicVocabList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-[#F8FAFC]"
                >
                  <div className="text-sm font-semibold text-[#0F172A]">
                    {item.english}
                  </div>
                  <div className="text-sm text-blue-700 font-medium mt-0.5">
                    {item.russian}
                  </div>
                  {item.explanation && (
                    <div className="text-xs text-slate-500 mt-1 leading-snug">
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Next-Step Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">
                Ready to test your skills on {topic.title}?
              </div>
              <div className="text-xs text-slate-500">
                Complete the 22 practice questions or take the 10-question Knowledge Check.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('practice', topic.id)}
                className="px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Practice Exercises
              </button>
              <button
                type="button"
                onClick={() => onNavigate('quiz', topic.id)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
              >
                Take 10-Question Quiz
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
