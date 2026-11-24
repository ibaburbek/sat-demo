import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  DifficultyLevel,
  QuizAttempt,
  TeacherLanguage,
} from '../types/curriculum';
import { CURRICULUM_TOPICS, getTopicById } from '../data/curriculumStructure';
import { getTopicContent } from '../data/topics';
import { checkQuestionAnswer } from '../utils/sprValidation';
import { MathFormula } from '../components/MathRenderer';
import { RichMathText, TranslatedText } from '../components/TranslatedText';

interface TeacherDemoPageProps {
  initialTopicId: string;
  onSaveDiagnosticAttempt: (attempt: QuizAttempt) => void;
}

const DEMO_UI_COPY: Record<
  TeacherLanguage,
  {
    title: string;
    subtitle: string;
    phases: Array<{ title: string; timeRange: string; guide: string }>;
    startBtn: string;
    pauseBtn: string;
    resetBtn: string;
    showExp: string;
    hideExp: string;
  }
> = {
  en: {
    title: 'SAT Math Diagnostic — 30-Minute Trial Lesson',
    subtitle:
      'Run a structured 30-minute live demo lesson with timer, bilingual vocabulary, guided practice, and a 10-question diagnostic.',
    phases: [
      {
        title: '1. Intro & Background',
        timeRange: '0–3 min',
        guide:
          'Ask the student about their current math grade, target SAT score, and comfort level with English word problems.',
      },
      {
        title: '2. Math Vocabulary & Concepts',
        timeRange: '3–8 min',
        guide:
          'Introduce key English math phrases using hover/tap Russian translations and review the main formulas together.',
      },
      {
        title: '3. Guided Practice (7 Questions)',
        timeRange: '8–18 min',
        guide:
          'Solve 7 progressive questions together. Toggle explanations on/off as you coach the student.',
      },
      {
        title: '4. Diagnostic Assessment (10 Qs)',
        timeRange: '18–27 min',
        guide:
          'Let the student complete the 10-question diagnostic independently while recording answers.',
      },
      {
        title: '5. Results & Study Plan',
        timeRange: '27–30 min',
        guide:
          'Review accuracy by difficulty level and discuss next weekly study goals with the student or parent.',
      },
    ],
    startBtn: 'Start 30m Timer',
    pauseBtn: 'Pause',
    resetBtn: 'Reset Session',
    showExp: 'Show Solution',
    hideExp: 'Hide Solution',
  },
  kz: {
    title: 'SAT Math Диагностикасы — 30 минуттық сынақ сабағы',
    subtitle:
      'Таймер, ағылшын–орыс математикалық терминдері, бірлескен жаттығу және 10 сұрақтық диагностикамен 30 минуттық сабақ өткізіңіз.',
    phases: [
      {
        title: '1. Танысу және деңгейді анықтау',
        timeRange: '0–3 мин',
        guide:
          'Оқушының математика бойынша ағымдағы бағасын, мақсатты SAT ұпайын және ағылшынша мәтіндік есептерді түсіну деңгейін сұраңыз.',
      },
      {
        title: '2. Терминдер және негізгі формулалар',
        timeRange: '3–8 мин',
        guide:
          'Ағылшын тіліндегі математикалық сөз тіркестерін орысша аудармасымен түсіндіріп, негізгі формулаларды қайталаңыз.',
      },
      {
        title: '3. Бірлескен практика (7 есеп)',
        timeRange: '8–18 мин',
        guide:
          'Оқушымен бірге 7 деңгейлі есепті шығарыңыз. Қажет кезде шешу жолын ашып көрсетіңіз.',
      },
      {
        title: '4. Диагностикалық тест (10 сұрақ)',
        timeRange: '18–27 мин',
        guide:
          'Оқушы 10 сұрақтан тұратын диагностиканы өз бетімен орындасын; жауаптар автоматты тексеріледі.',
      },
      {
        title: '5. Нәтижелер және оқу жоспары',
        timeRange: '27–30 мин',
        guide:
          'Қиындық деңгейі бойынша дәлдікті талдап, келесі сабақтарға арналған жоспарды ұсыныңыз.',
      },
    ],
    startBtn: 'Таймерді бастау',
    pauseBtn: 'Кідірту',
    resetBtn: 'Қайта бастау',
    showExp: 'Шешімін көрсету',
    hideExp: 'Шешімін жасыру',
  },
  ru: {
    title: 'Диагностика SAT Math — 30-минутный пробный урок',
    subtitle:
      'Проведите структурированный 30-минутный урок с таймером, переводом терминов, совместной практикой и диагностикой из 10 вопросов.',
    phases: [
      {
        title: '1. Знакомство и цели',
        timeRange: '0–3 мин',
        guide:
          'Узнайте текущий уровень ученика по математике, целевой балл SAT и опыт решения задач на английском.',
      },
      {
        title: '2. Словарь и ключевые формулы',
        timeRange: '3–8 мин',
        guide:
          'Разберите ключевые английские термины с помощью всплывающих подсказок и повторите формулы темы.',
      },
      {
        title: '3. Совместная практика (7 задач)',
        timeRange: '8–18 мин',
        guide:
          'Решите 7 задач разной сложности вместе с учеником. При необходимости открывайте пошаговое решение.',
      },
      {
        title: '4. Диагностический тест (10 вопросов)',
        timeRange: '18–27 мин',
        guide:
          'Предложите ученику самостоятельно решить 10 вопросов для точной оценки уровня.',
      },
      {
        title: '5. Итоги и рекомендации',
        timeRange: '27–30 мин',
        guide:
          'Обсудите процент выполнения по уровням сложности и дальнейший план подготовки.',
      },
    ],
    startBtn: 'Запустить таймер',
    pauseBtn: 'Пауза',
    resetBtn: 'Сбросить урок',
    showExp: 'Показать решение',
    hideExp: 'Скрыть решение',
  },
};

export const TeacherDemoPage: React.FC<TeacherDemoPageProps> = ({
  initialTopicId,
  onSaveDiagnosticAttempt,
}) => {
  const completeTopics = CURRICULUM_TOPICS.filter((t) => t.status === 'complete');
  const validInitial =
    getTopicById(initialTopicId)?.status === 'complete'
      ? initialTopicId
      : completeTopics[0].id;

  const [teacherLang, setTeacherLang] = useState<TeacherLanguage>('en');
  const [selectedTopicId, setSelectedTopicId] = useState(validInitial);
  const [studentName, setStudentName] = useState('');
  const [studentBackground, setStudentBackground] = useState('');
  const [phaseIdx, setPhaseIdx] = useState(0);

  // 30-minute timer (1800 seconds)
  const [secondsLeft, setSecondsLeft] = useState(1800);
  const [timerRunning, setTimerRunning] = useState(false);

  // Guided practice state (7 questions: 2 easy, 3 medium, 2 medium-hard)
  const [guidedIdx, setGuidedIdx] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [guidedChecked, setGuidedChecked] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);

  // Diagnostic state (10 assessment questions)
  const [diagIdx, setDiagIdx] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, string>>({});
  const [diagSubmitted, setDiagSubmitted] = useState<QuizAttempt | null>(null);

  const topic = getTopicById(selectedTopicId) ?? completeTopics[0];
  const content = getTopicContent(topic.id)!;
  const copy = DEMO_UI_COPY[teacherLang];

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const guidedQuestions = useMemo(() => {
    const easy = content.practiceQuestions.filter((q) => q.difficulty === 'easy').slice(0, 2);
    const med = content.practiceQuestions.filter((q) => q.difficulty === 'medium').slice(0, 3);
    const hard = content.practiceQuestions
      .filter((q) => q.difficulty === 'medium-hard')
      .slice(0, 2);
    return [...easy, ...med, ...hard];
  }, [content.practiceQuestions]);

  const diagnosticQuestions = content.assessmentQuestions;

  const handleResetDemo = () => {
    setTimerRunning(false);
    setSecondsLeft(1800);
    setPhaseIdx(0);
    setGuidedIdx(0);
    setGuidedAnswers({});
    setGuidedChecked({});
    setShowSolution(false);
    setDiagIdx(0);
    setDiagAnswers({});
    setDiagSubmitted(null);
  };

  const handleChangeTopic = (newId: string) => {
    setSelectedTopicId(newId);
    handleResetDemo();
  };

  const formatClock = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const submitDiagnostic = () => {
    const breakdown: Record<DifficultyLevel, { total: number; correct: number }> = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      'medium-hard': { total: 0, correct: 0 },
    };

    const resultsByQuestion = diagnosticQuestions.map((q) => {
      const userAnswer = (diagAnswers[q.id] ?? '').trim();
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
    const percentage = Math.round((correctCount / diagnosticQuestions.length) * 100);

    const attempt: QuizAttempt = {
      id: `demo-${Date.now()}`,
      topicId: topic.id,
      topicTitle: `${topic.title} (Demo)`,
      timestamp: new Date().toISOString(),
      mode: 'demo-diagnostic',
      totalQuestions: diagnosticQuestions.length,
      correctCount,
      percentage,
      answers: diagAnswers,
      resultsByQuestion,
      breakdownByDifficulty: breakdown,
    };

    setDiagSubmitted(attempt);
    onSaveDiagnosticAttempt(attempt);
    setPhaseIdx(4);
  };

  const currentGuidedQ = guidedQuestions[guidedIdx];
  const currentDiagQ = diagnosticQuestions[diagIdx];

  const guidedCorrectCount = guidedQuestions.filter(
    (q) => guidedChecked[q.id] && checkQuestionAnswer(q, guidedAnswers[q.id] ?? '')
  ).length;
  const guidedAttemptedCount = Object.keys(guidedChecked).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Teacher Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-blue-700 mb-1">
              Teacher Demo Mode · No Registration Required
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#0F172A]">
              {copy.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1">{copy.subtitle}</p>
          </div>

          {/* Language Toggle (EN / KZ / RU) + Live Timer */}
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'en', label: 'English' },
                  { id: 'kz', label: 'Қазақша' },
                  { id: 'ru', label: 'Русский' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setTeacherLang(lang.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    teacherLang === lang.id
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2">
              <span className="font-mono-tabular text-lg font-bold text-[#0F172A] min-w-[60px]">
                {formatClock(secondsLeft)}
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700"
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>{copy.pauseBtn}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{copy.startBtn}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                title={copy.resetBtn}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Topic Selection + 5 Lesson Phases */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Lesson Topic:</span>
            {completeTopics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleChangeTopic(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  t.id === topic.id
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Phase Lesson Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {copy.phases.map((p, idx) => (
            <button
              key={p.title}
              type="button"
              onClick={() => setPhaseIdx(idx)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                phaseIdx === idx
                  ? 'border-blue-600 bg-blue-50/70'
                  : 'border-slate-200 bg-[#F8FAFC] hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-mono-tabular text-blue-700 font-semibold">
                {p.timeRange}
              </div>
              <div className="text-xs font-semibold text-[#0F172A] mt-0.5 leading-snug">
                {p.title}
              </div>
            </button>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700">
          <strong className="text-[#0F172A]">Teacher Guide: </strong>
          {copy.phases[phaseIdx].guide}
        </div>
      </div>

      {/* PHASE 1: INTRO & STUDENT BACKGROUND */}
      {phaseIdx === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0F172A]">
            {copy.phases[0].title} ({copy.phases[0].timeRange})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name for this session"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Student Background / Target Score Notes
              </label>
              <input
                type="text"
                value={studentBackground}
                onChange={(e) => setStudentBackground(e.target.value)}
                placeholder="e.g., Grade 10, strong algebra, struggles with English wording"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2">
            <div className="text-xs font-semibold text-slate-600">
              Selected Lesson Objectives: {topic.title}
            </div>
            <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
              {content.objectives.whatYouWillLearn.map((obj, i) => (
                <li key={i}>
                  <RichMathText text={obj} />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPhaseIdx(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700"
            >
              <span>Next: Vocabulary & Concepts</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: VOCABULARY & BASIC CONCEPTS */}
      {phaseIdx === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A]">
              {copy.phases[1].title} ({copy.phases[1].timeRange})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.formulas.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2"
              >
                <div className="text-sm font-semibold text-[#0F172A]">{card.title}</div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-center overflow-x-auto">
                  <MathFormula latex={card.formulaLatex} />
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {card.variables.map((v, i) => (
                    <li key={i}>
                      <MathFormula latex={v.symbol} />: <TranslatedText text={v.meaning} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Core Concept Walkthrough (Hover/Tap for Russian)
            </h3>
            {content.theory.slice(0, 2).map((concept) => (
              <div
                key={concept.id}
                className="p-4 rounded-lg border border-slate-200 space-y-2 text-sm"
              >
                <div className="font-semibold text-[#0F172A]">{concept.title}</div>
                <p className="text-slate-700">
                  <RichMathText text={concept.rule} />
                </p>
                <div className="text-xs text-blue-700 font-medium">
                  Example: <RichMathText text={concept.example.problem} /> →{' '}
                  <RichMathText text={concept.example.finalAnswer} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setPhaseIdx(0)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => setPhaseIdx(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700"
            >
              <span>Next: Guided Practice (7 Qs)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: GUIDED PRACTICE (7 QUESTIONS) */}
      {phaseIdx === 2 && currentGuidedQ && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {copy.phases[2].title}
              </h2>
              <div className="text-xs text-slate-500">
                Question {guidedIdx + 1} of {guidedQuestions.length} ·{' '}
                {currentGuidedQ.difficulty} · Recorded: {guidedCorrectCount}/
                {guidedAttemptedCount}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSolution((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {showSolution ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{copy.hideExp}</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{copy.showExp}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-1.5">
            {guidedQuestions.map((gq, i) => (
              <button
                key={gq.id}
                type="button"
                onClick={() => {
                  setGuidedIdx(i);
                  setShowSolution(false);
                }}
                className={`w-9 h-9 rounded-md border text-xs font-mono-tabular ${
                  i === guidedIdx
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                    : guidedChecked[gq.id]
                    ? checkQuestionAnswer(gq, guidedAnswers[gq.id] ?? '')
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="text-base md:text-lg font-medium text-[#0F172A] leading-relaxed">
            <RichMathText text={currentGuidedQ.question} />
          </div>

          {currentGuidedQ.type === 'multiple-choice' && currentGuidedQ.choices ? (
            <div className="space-y-2">
              {currentGuidedQ.choices.map((c) => {
                const letter = c.trim().charAt(0).toUpperCase();
                const selected = (guidedAnswers[currentGuidedQ.id] ?? '') === letter;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setGuidedAnswers((prev) => ({
                        ...prev,
                        [currentGuidedQ.id]: letter,
                      }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm flex items-start gap-3 ${
                      selected
                        ? 'border-blue-600 bg-blue-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono-tabular font-semibold">{letter}.</span>
                    <span>
                      <RichMathText text={c.replace(/^[A-D]\.\s*/, '')} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={guidedAnswers[currentGuidedQ.id] ?? ''}
              onChange={(e) =>
                setGuidedAnswers((prev) => ({
                  ...prev,
                  [currentGuidedQ.id]: e.target.value,
                }))
              }
              placeholder="Student numeric answer"
              className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-slate-300 font-mono-tabular text-sm"
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!(guidedAnswers[currentGuidedQ.id] ?? '').trim()}
              onClick={() => {
                setGuidedChecked((prev) => ({
                  ...prev,
                  [currentGuidedQ.id]: true,
                }));
                setShowSolution(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Record & Check Answer
            </button>

            {guidedChecked[currentGuidedQ.id] && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                  checkQuestionAnswer(
                    currentGuidedQ,
                    guidedAnswers[currentGuidedQ.id] ?? ''
                  )
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {checkQuestionAnswer(
                  currentGuidedQ,
                  guidedAnswers[currentGuidedQ.id] ?? ''
                ) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect (Answer: {currentGuidedQ.correctAnswer})</span>
                  </>
                )}
              </span>
            )}
          </div>

          {showSolution && (
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-sm text-slate-700 space-y-1.5">
              <div className="text-xs font-semibold text-blue-700">
                Explanation (Correct: {currentGuidedQ.correctAnswer})
              </div>
              <p>
                <RichMathText text={currentGuidedQ.explanation} />
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => {
                if (guidedIdx > 0) {
                  setGuidedIdx((i) => i - 1);
                  setShowSolution(false);
                } else {
                  setPhaseIdx(1);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            {guidedIdx < guidedQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setGuidedIdx((i) => i + 1);
                  setShowSolution(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium"
              >
                <span>Next Guided Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPhaseIdx(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700"
              >
                <span>Start 10-Question Diagnostic</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* PHASE 4: 10-QUESTION DIAGNOSTIC ASSESSMENT */}
      {phaseIdx === 3 && currentDiagQ && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[#0F172A]">
              {copy.phases[3].title}
            </h2>
            <span className="text-xs font-mono-tabular text-slate-500">
              Question {diagIdx + 1} of 10 ({currentDiagQ.difficulty})
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {diagnosticQuestions.map((dq, i) => (
              <button
                key={dq.id}
                type="button"
                onClick={() => setDiagIdx(i)}
                className={`w-9 h-9 rounded-md border text-xs font-mono-tabular ${
                  i === diagIdx
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                    : (diagAnswers[dq.id] ?? '').trim()
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="text-base md:text-lg font-medium text-[#0F172A] leading-relaxed">
            <RichMathText text={currentDiagQ.question} />
          </div>

          {currentDiagQ.type === 'multiple-choice' && currentDiagQ.choices ? (
            <div className="space-y-2">
              {currentDiagQ.choices.map((c) => {
                const letter = c.trim().charAt(0).toUpperCase();
                const selected = (diagAnswers[currentDiagQ.id] ?? '') === letter;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setDiagAnswers((prev) => ({
                        ...prev,
                        [currentDiagQ.id]: letter,
                      }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm flex items-start gap-3 ${
                      selected
                        ? 'border-blue-600 bg-blue-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono-tabular font-semibold">{letter}.</span>
                    <span>
                      <RichMathText text={c.replace(/^[A-D]\.\s*/, '')} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={diagAnswers[currentDiagQ.id] ?? ''}
              onChange={(e) =>
                setDiagAnswers((prev) => ({
                  ...prev,
                  [currentDiagQ.id]: e.target.value,
                }))
              }
              placeholder="Enter numeric answer"
              className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-slate-300 font-mono-tabular text-sm"
            />
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              disabled={diagIdx === 0}
              onClick={() => setDiagIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {diagIdx < diagnosticQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setDiagIdx((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitDiagnostic}
                className="px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700"
              >
                Finish & View Summary
              </button>
            )}
          </div>
        </div>
      )}

      {/* PHASE 5: FINAL PERFORMANCE SUMMARY */}
      {phaseIdx === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                30-Minute Diagnostic Summary · {topic.title}
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-0.5">
                {studentName ? `${studentName} — ` : ''}Trial Lesson Report
              </h2>
              {studentBackground && (
                <p className="text-xs text-slate-600 mt-1">
                  Notes: {studentBackground}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Demo Session</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="text-xs font-medium text-slate-500">
                Guided Practice (Phase 3)
              </div>
              <div className="text-2xl font-bold font-mono-tabular text-[#0F172A] mt-1">
                {guidedCorrectCount} / {guidedQuestions.length}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {guidedAttemptedCount} questions attempted during coaching
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="text-xs font-medium text-slate-500">
                10-Question Diagnostic (Phase 4)
              </div>
              {diagSubmitted ? (
                <>
                  <div className="text-2xl font-bold font-mono-tabular text-blue-700 mt-1">
                    {diagSubmitted.correctCount} / {diagSubmitted.totalQuestions} (
                    {diagSubmitted.percentage}%)
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono-tabular">
                    Easy: {diagSubmitted.breakdownByDifficulty.easy.correct}/
                    {diagSubmitted.breakdownByDifficulty.easy.total} · Medium:{' '}
                    {diagSubmitted.breakdownByDifficulty.medium.correct}/
                    {diagSubmitted.breakdownByDifficulty.medium.total} · Med-Hard:{' '}
                    {diagSubmitted.breakdownByDifficulty['medium-hard'].correct}/
                    {diagSubmitted.breakdownByDifficulty['medium-hard'].total}
                  </div>
                </>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-slate-600">
                    Diagnostic not yet submitted.
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhaseIdx(3)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Go to Phase 4 Diagnostic →
                  </button>
                </div>
              )}
            </div>
          </div>

          {diagSubmitted && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Diagnostic Item Breakdown
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {diagSubmitted.resultsByQuestion.map((res, idx) => (
                  <div
                    key={res.questionId}
                    className="px-4 py-2.5 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono-tabular text-slate-700">
                      Q{idx + 1} ({res.difficulty})
                    </span>
                    <span className="font-mono-tabular text-slate-600">
                      Student: <strong>{res.userAnswer || '—'}</strong> · Key:{' '}
                      <strong>{res.correctAnswer}</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        res.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {res.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
