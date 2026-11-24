import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  GraduationCap,
  PenTool,
  ClipboardCheck,
  BarChart3,
  FileDown,
  Presentation,
  Languages,
  Menu,
  X,
} from 'lucide-react';
import { AppPage } from '../types/curriculum';
import { useVocabulary } from './TranslatedText';

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  activeTopicTitle: string;
  studentName: string;
}

const NAV_ITEMS: Array<{
  id: AppPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'curriculum', label: 'SAT Curriculum', icon: BookOpen },
  { id: 'topic', label: 'Topic Lesson', icon: GraduationCap },
  { id: 'practice', label: 'Practice Exercises', icon: PenTool },
  { id: 'quiz', label: 'Knowledge Check', icon: ClipboardCheck },
  { id: 'results', label: 'Results & Progress', icon: BarChart3 },
  { id: 'pdf', label: 'PDF Worksheets', icon: FileDown },
  { id: 'demo', label: 'Teacher Demo Mode', icon: Presentation },
  { id: 'glossary', label: 'EN–RU Glossary', icon: Languages },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  activeTopicTitle,
  studentName,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { translationsEnabled, setTranslationsEnabled } = useVocabulary();

  const handleSelect = (page: AppPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="text-left focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
        >
          <span className="block text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
            SAT MATH LAB
          </span>
          <span className="block text-xs text-slate-500 mt-0.5 truncate max-w-[205px]">
            {studentName ? studentName : 'Digital SAT Prep'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Topic & Translation Toggle */}
      <div className="p-4 border-t border-slate-100 space-y-3 bg-[#F8FAFC]">
        <div className="text-xs">
          <div className="text-slate-500">Current Topic</div>
          <div className="font-medium text-[#0F172A] truncate mt-0.5" title={activeTopicTitle}>
            {activeTopicTitle}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTranslationsEnabled(!translationsEnabled)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>EN → RU Tooltips</span>
          <span className={translationsEnabled ? 'text-blue-600 font-semibold' : 'text-slate-400'}>
            {translationsEnabled ? 'On' : 'Off'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile Top Bar (<= 15% height) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="text-base font-bold tracking-tight text-[#0F172A] whitespace-nowrap"
        >
          SAT MATH LAB
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTranslationsEnabled(!translationsEnabled)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700"
          >
            RU: {translationsEnabled ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
