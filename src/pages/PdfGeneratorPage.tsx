import React, { useMemo, useState } from 'react';
import { FileDown, KeyRound, CheckCircle2 } from 'lucide-react';
import { DifficultyLevel } from '../types/curriculum';
import { CURRICULUM_TOPICS, getTopicById } from '../data/curriculumStructure';
import { getTopicContent } from '../data/topics';
import { generatePracticePdf, formatLatexForPdf } from '../utils/pdfGenerator';

interface PdfGeneratorPageProps {
  initialTopicId: string;
  defaultStudentName: string;
}

export const PdfGeneratorPage: React.FC<PdfGeneratorPageProps> = ({
  initialTopicId,
  defaultStudentName,
}) => {
  const completeTopics = CURRICULUM_TOPICS.filter((t) => t.status === 'complete');
  const validInitial =
    getTopicById(initialTopicId)?.status === 'complete'
      ? initialTopicId
      : completeTopics[0].id;

  const [selectedTopicId, setSelectedTopicId] = useState(validInitial);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [dateStr, setDateStr] = useState(() => new Date().toLocaleDateString('en-US'));
  const [downloadedMsg, setDownloadedMsg] = useState<string | null>(null);

  const topic = getTopicById(selectedTopicId) ?? completeTopics[0];
  const content = getTopicContent(topic.id)!;

  const selectedQuestions = useMemo(() => {
    if (difficulty === 'all') return content.practiceQuestions;
    return content.practiceQuestions.filter((q) => q.difficulty === difficulty);
  }, [content.practiceQuestions, difficulty]);

  const handleGenerate = (mode: 'worksheet' | 'answer-key') => {
    generatePracticePdf({
      topicTitle: topic.title,
      domainName: topic.domainName,
      studentName,
      dateStr,
      difficultyFilter: difficulty,
      questions: selectedQuestions,
      mode,
    });
    setDownloadedMsg(
      mode === 'worksheet'
        ? `Student Worksheet PDF downloaded (${selectedQuestions.length} questions with 5 mm graph-paper grids).`
        : `Teacher Answer Key PDF downloaded (${selectedQuestions.length} solutions).`
    );
    setTimeout(() => setDownloadedMsg(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            PDF Worksheet Generator
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Generate print-ready A4 SAT Math worksheets directly in your browser. Every question in the Student Worksheet includes a 5 mm squared notebook working grid below it and never splits across pages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Select Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              {completeTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.domainName} — {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Difficulty Selection
            </label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as DifficultyLevel | 'all')
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Questions (22)</option>
              <option value="easy">Easy Only (6)</option>
              <option value="medium">Medium Only (10)</option>
              <option value="medium-hard">Medium-Hard Only (6)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Student Name (Optional on Worksheet)
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Leave blank for handwritten line"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date Field
            </label>
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Download Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleGenerate('worksheet')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Practice as PDF (Student Worksheet)</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerate('answer-key')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-slate-600" />
            <span>Download Teacher Answer Key PDF</span>
          </button>
        </div>

        {downloadedMsg && (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadedMsg}</span>
          </div>
        )}
      </div>

      {/* Sample Layout Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Worksheet Page Layout Preview (A4 · 5 mm Squared Grid)
          </h2>
          <span className="text-xs text-slate-500 font-mono-tabular">
            {selectedQuestions.length} questions selected
          </span>
        </div>

        {selectedQuestions[0] && (
          <div className="border border-slate-300 rounded-lg p-5 bg-white space-y-3 max-w-2xl">
            <div className="text-[11px] font-semibold text-blue-700">
              Question 1 | {selectedQuestions[0].difficulty} |{' '}
              {selectedQuestions[0].type === 'spr' ? 'Grid-In (SPR)' : 'Multiple Choice'}
            </div>
            <div className="text-sm text-[#0F172A]">
              1. {formatLatexForPdf(selectedQuestions[0].question)}
            </div>
            {selectedQuestions[0].choices && (
              <div className="pl-3 space-y-1 text-xs text-slate-700">
                {selectedQuestions[0].choices.map((c) => (
                  <div key={c}>{formatLatexForPdf(c)}</div>
                ))}
              </div>
            )}
            {/* Visual representation of the 5mm squared notebook grid */}
            <div
              className="w-full h-28 border border-slate-300 rounded-sm relative overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            >
              <span className="absolute top-1 left-2 text-[10px] text-slate-400">
                Work area (5 mm grid)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
