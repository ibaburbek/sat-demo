import React, { useMemo, useState } from 'react';
import { AppPage, QuizAttempt, StudentProgress, VocabEntry } from './types/curriculum';
import { CURRICULUM_TOPICS, getTopicById } from './data/curriculumStructure';
import {
  getMergedVocabulary,
  loadCustomVocabulary,
  loadProgress,
  recordPracticeSubmission,
  recordQuizAttempt,
  resetAllProgress,
  saveCustomVocabulary,
  saveProgress,
  updateLastVisited,
} from './utils/storage';
import { VocabularyContext } from './components/TranslatedText';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { TopicLearningPage } from './pages/TopicLearningPage';
import { PracticePage } from './pages/PracticePage';
import { KnowledgeCheckPage } from './pages/KnowledgeCheckPage';
import { ResultsPage } from './pages/ResultsPage';
import { PdfGeneratorPage } from './pages/PdfGeneratorPage';
import { TeacherDemoPage } from './pages/TeacherDemoPage';
import { GlossaryPage } from './pages/GlossaryPage';

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(() => loadProgress());
  const [currentPage, setCurrentPage] = useState<AppPage>(() => loadProgress().lastVisitedPage || 'home');
  const [activeTopicId, setActiveTopicId] = useState<string>(
    () => loadProgress().lastVisitedTopicId || 'alg-linear-one-var'
  );
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const [customEntries, setCustomEntries] = useState<VocabEntry[]>(() =>
    loadCustomVocabulary()
  );
  const [translationsEnabled, setTranslationsEnabled] = useState<boolean>(true);

  const mergedVocabulary = useMemo(
    () => getMergedVocabulary(customEntries),
    [customEntries]
  );

  const addCustomVocab = (entry: Omit<VocabEntry, 'id' | 'isCustom'>) => {
    const newEntry: VocabEntry = {
      ...entry,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    const updated = [...customEntries, newEntry];
    setCustomEntries(updated);
    saveCustomVocabulary(updated);
  };

  const activeTopicTitle =
    getTopicById(activeTopicId)?.title ?? CURRICULUM_TOPICS[0].title;

  const handleNavigate = (page: AppPage, topicId?: string) => {
    const nextTopic = topicId ?? activeTopicId;
    if (topicId) setActiveTopicId(topicId);
    setCurrentPage(page);
    setProgress((prev) => updateLastVisited(prev, page, nextTopic));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopic = (topicId: string, targetPage?: AppPage) => {
    setActiveTopicId(topicId);
    const nextPage = targetPage ?? currentPage;
    setCurrentPage(nextPage);
    setProgress((prev) => updateLastVisited(prev, nextPage, topicId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateName = (name: string) => {
    setProgress((prev) => {
      const next = { ...prev, studentName: name };
      saveProgress(next);
      return next;
    });
  };

  const handleResetProgress = () => {
    const fresh = resetAllProgress();
    setProgress(fresh);
    setSelectedAttemptId(null);
  };

  const handleSubmitPracticeAnswer = (
    topicId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean,
    correctAnswer: string
  ) => {
    setProgress((prev) =>
      recordPracticeSubmission(
        prev,
        topicId,
        questionId,
        answer,
        isCorrect,
        correctAnswer
      )
    );
  };

  const handleToggleReview = (questionId: string) => {
    setProgress((prev) => {
      const exists = prev.markedForReview.includes(questionId);
      const nextMarked = exists
        ? prev.markedForReview.filter((id) => id !== questionId)
        : [...prev.markedForReview, questionId];
      const next = { ...prev, markedForReview: nextMarked };
      saveProgress(next);
      return next;
    });
  };

  const handleResetPracticeQuestion = (topicId: string, questionId: string) => {
    setProgress((prev) => {
      const topicMap = { ...(prev.completedPracticeByTopic[topicId] ?? {}) };
      delete topicMap[questionId];
      const next: StudentProgress = {
        ...prev,
        completedPracticeByTopic: {
          ...prev.completedPracticeByTopic,
          [topicId]: topicMap,
        },
      };
      saveProgress(next);
      return next;
    });
  };

  const handleCompleteQuiz = (attempt: QuizAttempt) => {
    setProgress((prev) => recordQuizAttempt(prev, attempt));
    setSelectedAttemptId(attempt.id);
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDemoDiagnostic = (attempt: QuizAttempt) => {
    setProgress((prev) => recordQuizAttempt(prev, attempt));
    setSelectedAttemptId(attempt.id);
  };

  return (
    <VocabularyContext.Provider
      value={{
        vocabulary: mergedVocabulary,
        translationsEnabled,
        setTranslationsEnabled,
        addCustomVocab,
        customEntries,
      }}
    >
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:flex-row">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => handleNavigate(page)}
          activeTopicTitle={activeTopicTitle}
          studentName={progress.studentName}
        />

        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {currentPage === 'home' && (
            <DashboardPage
              progress={progress}
              onNavigate={handleNavigate}
              onUpdateName={handleUpdateName}
              onResetProgress={handleResetProgress}
            />
          )}

          {currentPage === 'curriculum' && (
            <CurriculumPage
              progress={progress}
              onSelectTopic={handleSelectTopic}
            />
          )}

          {currentPage === 'topic' && (
            <TopicLearningPage
              topicId={activeTopicId}
              onSelectTopic={(id) => handleSelectTopic(id, 'topic')}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'practice' && (
            <PracticePage
              topicId={activeTopicId}
              progress={progress}
              onSelectTopic={(id) => handleSelectTopic(id, 'practice')}
              onSubmitAnswer={handleSubmitPracticeAnswer}
              onToggleReview={handleToggleReview}
              onResetQuestion={handleResetPracticeQuestion}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'quiz' && (
            <KnowledgeCheckPage
              topicId={activeTopicId}
              onSelectTopic={(id) => handleSelectTopic(id, 'quiz')}
              onCompleteQuiz={handleCompleteQuiz}
            />
          )}

          {currentPage === 'results' && (
            <ResultsPage
              progress={progress}
              selectedAttemptId={selectedAttemptId}
              onSelectAttempt={(id) => setSelectedAttemptId(id)}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'pdf' && (
            <PdfGeneratorPage
              initialTopicId={activeTopicId}
              defaultStudentName={progress.studentName}
            />
          )}

          {currentPage === 'demo' && (
            <TeacherDemoPage
              initialTopicId={activeTopicId}
              onSaveDiagnosticAttempt={handleSaveDemoDiagnostic}
            />
          )}

          {currentPage === 'glossary' && <GlossaryPage />}
        </main>
      </div>
    </VocabularyContext.Provider>
  );
}
