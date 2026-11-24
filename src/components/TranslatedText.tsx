import React, { createContext, useContext, useMemo, useState, useRef, useEffect } from 'react';
import { VocabEntry } from '../types/curriculum';
import { MathFormula } from './MathRenderer';

interface VocabularyContextValue {
  vocabulary: VocabEntry[];
  translationsEnabled: boolean;
  setTranslationsEnabled: (v: boolean) => void;
  addCustomVocab: (entry: Omit<VocabEntry, 'id' | 'isCustom'>) => void;
  customEntries: VocabEntry[];
}

export const VocabularyContext = createContext<VocabularyContextValue>({
  vocabulary: [],
  translationsEnabled: true,
  setTranslationsEnabled: () => {},
  addCustomVocab: () => {},
  customEntries: [],
});

export function useVocabulary() {
  return useContext(VocabularyContext);
}

interface Segment {
  text: string;
  entry?: VocabEntry;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenizeWithVocabulary(
  text: string,
  sortedEntries: VocabEntry[],
  lookupMap: Map<string, VocabEntry>,
  combinedRegex: RegExp | null
): Segment[] {
  if (!text || !combinedRegex || sortedEntries.length === 0) {
    return [{ text }];
  }

  const segments: Segment[] = [];
  let lastIndex = 0;

  combinedRegex.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchText = match[0];
    const start = match.index;

    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start) });
    }

    const entry = lookupMap.get(matchText.toLowerCase());
    segments.push({
      text: matchText,
      entry,
    });

    lastIndex = start + matchText.length;
    if (match[0].length === 0) {
      combinedRegex.lastIndex++;
    }
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}

interface VocabTokenProps {
  text: string;
  entry: VocabEntry;
}

const VocabToken: React.FC<VocabTokenProps> = ({ text, entry }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`${text}: ${entry.russian}`}
        className="inline text-inherit font-inherit p-0 m-0 bg-transparent border-0 cursor-help underline decoration-blue-400/75 decoration-dotted underline-offset-[3px] hover:bg-blue-50/80 hover:text-blue-900 rounded-[2px] transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        {text}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-max max-w-[260px] rounded-lg bg-[#0F172A] text-white px-3 py-2 text-left shadow-lg border border-slate-700 pointer-events-auto"
        >
          <span className="block text-[11px] font-medium text-blue-300 leading-tight">
            {entry.english}
          </span>
          <span className="block text-[13px] font-semibold text-white mt-0.5 leading-snug">
            {entry.russian}
          </span>
          {entry.explanation && (
            <span className="block text-[11px] text-slate-300 mt-1 leading-snug">
              {entry.explanation}
            </span>
          )}
          <span
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#0F172A]"
          />
        </span>
      )}
    </span>
  );
};

interface TranslatedTextProps {
  text: string;
  className?: string;
}

/**
 * Translates English words & multi-word phrases into Russian via hover (desktop)
 * and tap (mobile), matching longer phrases before individual words.
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({ text, className }) => {
  const { vocabulary, translationsEnabled } = useVocabulary();

  const { sortedEntries, lookupMap, combinedRegex } = useMemo(() => {
    if (!translationsEnabled || vocabulary.length === 0) {
      return {
        sortedEntries: [] as VocabEntry[],
        lookupMap: new Map<string, VocabEntry>(),
        combinedRegex: null as RegExp | null,
      };
    }

    // Sort longest phrases first so "at least" always matches before "at" and "least"
    const sorted = [...vocabulary].sort(
      (a, b) => b.english.length - a.english.length
    );

    const map = new Map<string, VocabEntry>();
    for (const item of sorted) {
      map.set(item.english.toLowerCase(), item);
    }

    const pattern = sorted.map((item) => escapeRegex(item.english)).join('|');
    const regex = new RegExp(`(?<![a-zA-Z0-9])(?:${pattern})(?![a-zA-Z0-9])`, 'gi');

    return { sortedEntries: sorted, lookupMap: map, combinedRegex: regex };
  }, [vocabulary, translationsEnabled]);

  const segments = useMemo(() => {
    if (!translationsEnabled) return [{ text }];
    return tokenizeWithVocabulary(text, sortedEntries, lookupMap, combinedRegex);
  }, [text, translationsEnabled, sortedEntries, lookupMap, combinedRegex]);

  if (!translationsEnabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.entry ? (
          <VocabToken key={`${i}-${seg.entry.id}`} text={seg.text} entry={seg.entry} />
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </span>
  );
};

interface RichMathTextProps {
  text: string;
  className?: string;
}

/**
 * Splits text into KaTeX math blocks ($...$ and $$...$$) and prose blocks.
 * Math expressions are rendered with KaTeX and NEVER passed to vocabulary translation.
 * Prose segments are passed through <TranslatedText />.
 */
export const RichMathText: React.FC<RichMathTextProps> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    const tokens: Array<{ type: 'text' | 'inline-math' | 'display-math'; value: string }> = [];
    // Match $$...$$ or $...$ (ignoring escaped \$)
    const mathRegex = /(\$\$[\s\S]+?\$\$|(?<!\\)\$[^$\n]+?\$)/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = mathRegex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        tokens.push({
          type: 'text',
          value: text.slice(lastIdx, m.index).replace(/\\\$/g, '$'),
        });
      }
      const raw = m[0];
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        tokens.push({ type: 'display-math', value: raw.slice(2, -2) });
      } else {
        tokens.push({ type: 'inline-math', value: raw.slice(1, -1) });
      }
      lastIdx = m.index + raw.length;
    }

    if (lastIdx < text.length) {
      tokens.push({
        type: 'text',
        value: text.slice(lastIdx).replace(/\\\$/g, '$'),
      });
    }

    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.type === 'display-math') {
          return <MathFormula key={idx} latex={part.value} displayMode />;
        }
        if (part.type === 'inline-math') {
          return <MathFormula key={idx} latex={part.value} />;
        }
        return <TranslatedText key={idx} text={part.value} />;
      })}
    </span>
  );
};
