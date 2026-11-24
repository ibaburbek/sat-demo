import React, { useMemo, useState } from 'react';
import { Search, Plus, CheckCircle2 } from 'lucide-react';
import { VocabEntry } from '../types/curriculum';
import { useVocabulary } from '../components/TranslatedText';

const CATEGORY_LABELS: Array<{ id: VocabEntry['category'] | 'all'; label: string }> = [
  { id: 'all', label: 'All Terms' },
  { id: 'equations', label: 'Equations' },
  { id: 'algebra', label: 'Algebra' },
  { id: 'functions', label: 'Functions & Graphs' },
  { id: 'word-problems', label: 'Word Problems' },
  { id: 'core-math', label: 'Core Math' },
  { id: 'geometry', label: 'Geometry' },
  { id: 'data-stats', label: 'Data & Stats' },
  { id: 'test-instructions', label: 'Test Phrasing' },
];

export const GlossaryPage: React.FC = () => {
  const { vocabulary, addCustomVocab } = useVocabulary();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<VocabEntry['category'] | 'all'>('all');
  const [eng, setEng] = useState('');
  const [rus, setRus] = useState('');
  const [exp, setExp] = useState('');
  const [newCat, setNewCat] = useState<VocabEntry['category']>('algebra');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vocabulary
      .filter((v) => {
        if (category !== 'all' && v.category !== category) return false;
        if (!q) return true;
        return (
          v.english.toLowerCase().includes(q) ||
          v.russian.toLowerCase().includes(q) ||
          (v.explanation ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.english.localeCompare(b.english));
  }, [vocabulary, search, category]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eng.trim() || !rus.trim()) return;
    addCustomVocab({
      english: eng.trim(),
      russian: rus.trim(),
      explanation: exp.trim() || undefined,
      category: newCat,
    });
    setEng('');
    setRus('');
    setExp('');
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              English–Russian SAT Math Glossary
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {vocabulary.length} mathematical words and phrases. Multi-word phrases (such as "at least" or "infinitely many solutions") are automatically matched as complete units in tooltips across the platform.
            </p>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search English term, Russian translation, or explanation..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_LABELS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Teacher Translation */}
      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Teacher Tool: Add Missing Translation</span>
          </h2>
          {addedFeedback && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Added to active dictionary
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            required
            value={eng}
            onChange={(e) => setEng(e.target.value)}
            placeholder="English word or phrase"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            required
            value={rus}
            onChange={(e) => setRus(e.target.value)}
            placeholder="Russian translation"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            placeholder="Simple explanation (optional)"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
          <select
            value={newCat}
            onChange={(e) => setNewCat(e.target.value as VocabEntry['category'])}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
          >
            {CATEGORY_LABELS.filter((c) => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800"
          >
            Add Entry
          </button>
        </div>
      </form>

      {/* Vocabulary Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-[#F8FAFC] border-b border-slate-200 text-xs text-slate-500 font-mono-tabular">
          Showing {filtered.length} of {vocabulary.length} entries
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
            >
              <div className="md:col-span-4 font-semibold text-sm text-[#0F172A]">
                {item.english}
                {item.isCustom && (
                  <span className="ml-2 text-[11px] font-normal text-blue-600">
                    (custom)
                  </span>
                )}
              </div>
              <div className="md:col-span-4 text-sm font-medium text-blue-700">
                {item.russian}
              </div>
              <div className="md:col-span-4 text-xs text-slate-500">
                {item.explanation || item.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
