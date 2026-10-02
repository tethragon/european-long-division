/**
 * Επιλογέας Επιπέδου Δυσκολίας & Τυχαίων Ασκήσεων
 * Προσαρμοσμένο στην ύλη των μαθηματικών ΣΤ' Δημοτικού
 */

import React from 'react';
import { DifficultyLevel } from '../../types/division';
import { Sparkles, RotateCcw, PlusCircle } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel: DifficultyLevel;
  currentTier?: number;
  onSelectLevel: (lvl: DifficultyLevel) => void;
  onNewRandom: () => void;
  onRestart: () => void;
  onOpenCustom: () => void;
}

interface LevelOption {
  id: DifficultyLevel;
  label: string;
  badge: string;
  example: string;
}

const LEVELS: LevelOption[] = [
  {
    id: 'easy',
    label: 'Ακέραιοι',
    badge: 'Βασικό',
    example: '875 : 25',
  },
  {
    id: 'intermediate_zero',
    label: 'Ενδιάμεσο Μηδέν',
    badge: 'Προσοχή',
    example: '618 : 6',
  },
  {
    id: 'decimal_quotient',
    label: 'Δεκαδικό Πηλίκο',
    badge: 'Συνέχιση',
    example: '45 : 4',
  },
  {
    id: 'decimal_dividend',
    label: 'Δεκαδικός Διαιρετέος',
    badge: 'Υποδιαστολή',
    example: '37,5 : 5',
  },
  {
    id: 'decimal_both',
    label: 'Δεκαδικός με Δεκαδικό',
    badge: 'Μετατόπιση',
    example: '14,25 : 2,5',
  },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  currentTier = 0,
  onSelectLevel,
  onNewRandom,
  onRestart,
  onOpenCustom,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-200">
      {/* 1. Επίπεδα (Tabs) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
        {LEVELS.map((lvl) => {
          const isSelected = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onSelectLevel(lvl.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title={`Παράδειγμα: ${lvl.example}`}
            >
              <span>{lvl.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'
              }`}>
                {lvl.badge}
              </span>
            </button>
          );
        })}

        {/* Custom Tab */}
        <button
          type="button"
          onClick={onOpenCustom}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            currentLevel === 'custom'
              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Δική μου Διαίρεση</span>
        </button>
      </div>

      {/* 2. Κουμπιά Ενεργειών & Ένδειξη Βαθμίδας */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        {currentLevel !== 'custom' && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50/90 border border-amber-200/90 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs select-none"
            title="Λύσε τη διαίρεση χωρίς λάθη για να ξεκλειδώσεις την επόμενη βαθμίδα δυσκολίας!"
          >
            <span className="text-[11px] text-amber-800">Βαθμίδα {currentTier + 1}/3</span>
            <span className="flex items-center text-amber-500 text-xs tracking-tight">
              {'★'.repeat(currentTier + 1)}
              <span className="text-amber-200">{'★'.repeat(2 - currentTier)}</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs cursor-pointer"
          title="Επανεκκίνηση της τρέχουσας άσκησης"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Από την αρχή</span>
        </button>

        <button
          type="button"
          onClick={onNewRandom}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98 cursor-pointer"
          title="Δημιουργία νέας τυχαίας άσκησης"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>Νέα Άσκηση</span>
        </button>
      </div>
    </div>
  );
};
