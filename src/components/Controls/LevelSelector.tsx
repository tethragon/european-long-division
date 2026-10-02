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
  example: string;
}

const LEVELS: LevelOption[] = [
  {
    id: 'easy',
    label: 'Ακέραιοι',
    example: '875 : 25',
  },
  {
    id: 'intermediate_zero',
    label: 'Ενδιάμεσο Μηδέν',
    example: '618 : 6',
  },
  {
    id: 'decimal_quotient',
    label: 'Δεκαδικό Πηλίκο',
    example: '45 : 4',
  },
  {
    id: 'decimal_dividend',
    label: 'Δεκαδικός Διαιρετέος',
    example: '37,5 : 5',
  },
  {
    id: 'decimal_both',
    label: 'Δεκαδικός με Δεκαδικό',
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
  const currentLevelOption = LEVELS.find((lvl) => lvl.id === currentLevel);

  return (
    <div className="w-full flex flex-col gap-3 pb-4 border-b border-slate-200">
      {/* 1. Επίπεδα: Ισόποσο Πλέγμα 6 στηλών (Grid 6) χωρίς περιττά badges για μέγιστη ευρυχωρία */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-full">
        {LEVELS.map((lvl) => {
          const isSelected = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onSelectLevel(lvl.id)}
              className={`flex items-center justify-center px-3 py-2 text-xs md:text-[13px] rounded-xl transition-all cursor-pointer select-none text-center ${
                isSelected
                  ? 'bg-white text-indigo-950 font-bold shadow-xs ring-1 ring-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
              title={`Παράδειγμα: ${lvl.example}`}
            >
              <span className="truncate">{lvl.label}</span>
            </button>
          );
        })}

        {/* Custom Tab */}
        <button
          type="button"
          onClick={onOpenCustom}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs md:text-[13px] rounded-xl transition-all cursor-pointer select-none text-center ${
            currentLevel === 'custom'
              ? 'bg-white text-indigo-700 font-bold shadow-xs ring-1 ring-slate-200/90'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
          }`}
          title="Εισαγωγή δικής σου διαίρεσης"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">Δική μου Διαίρεση</span>
        </button>
      </div>

      {/* 2. Υπο-μπάρα: Επεξήγηση / Παράδειγμα & Ενέργειες */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-0.5">
        {/* Αριστερά: Επεξηγηματικό παράδειγμα ενεργού επιπέδου */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Τύπος διαίρεσης:</span>
          {currentLevelOption ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span>{currentLevelOption.label}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-indigo-700 font-semibold bg-indigo-50/90 border border-indigo-100 px-2 py-0.5 rounded-md">
                {currentLevelOption.example}
              </span>
            </span>
          ) : (
            <span className="font-mono text-indigo-700 font-semibold bg-indigo-50/90 border border-indigo-100 px-2 py-0.5 rounded-md">
              Προσαρμοσμένη διαίρεση
            </span>
          )}
        </div>

        {/* Δεξιά: Βαθμίδα & Κουμπιά ενεργειών */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
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
    </div>
  );
};
