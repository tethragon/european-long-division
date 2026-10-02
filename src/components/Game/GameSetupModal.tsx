/**
 * Παράθυρο Ρύθμισης & Έναρξης Game Mode
 */

import React, { useState } from 'react';
import { Trophy, X, Sparkles, Check, BookOpen, Layers } from 'lucide-react';
import { DifficultyLevel } from '../../types/division';
import { GameCurriculumScope, GameSettings } from '../../types/gameMode';

interface GameSetupModalProps {
  isOpen: boolean;
  currentLevel: DifficultyLevel;
  onClose: () => void;
  onStart: (settings: GameSettings) => void;
}

interface ScopeOption {
  id: GameCurriculumScope;
  title: string;
  gradeBadge: string;
  description: string;
  badgeColor: string;
}

const SCOPE_OPTIONS: ScopeOption[] = [
  {
    id: 'integers',
    title: 'Ακέραιες Διαιρέσεις — Padawan',
    gradeBadge: 'Δ\' - Ε\' Δημοτικού',
    description: 'Ευκλείδειες διαιρέσεις ακεραίων, τέλειες ή με υπόλοιπο & ενδιάμεσα μηδενικά (χωρίς δεκαδικά).',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'decimals_basic',
    title: 'Με Δεκαδικά — Master',
    gradeBadge: 'Ε\' - ΣΤ\' Δημοτικού',
    description: 'Ακέραιοι, συνέχιση σε δεκαδικό πηλίκο και δεκαδικός διαιρετέος (με ακέραιο διαιρέτη).',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: 'all_cases',
    title: 'Όλες οι Περιπτώσεις — Grand Master',
    gradeBadge: 'ΣΤ\' Δημοτικού',
    description: 'Πλήρης ύλη: περιλαμβάνει και δεκαδικό διαιρέτη με μετατόπιση υποδιαστολής (×10, ×100).',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'current_tab',
    title: 'Τρέχουσα Κατηγορία — Sentinel',
    gradeBadge: 'Εστιασμένη Εξάσκηση',
    description: 'Ασκήσεις αποκλειστικά από την καρτέλα που έχετε ήδη επιλεγμένη επάνω.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
];

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  currentLevel,
  onClose,
  onStart,
}) => {
  const [selectedScope, setSelectedScope] = useState<GameCurriculumScope>('integers');
  const [problemCount, setProblemCount] = useState<number>(5);

  if (!isOpen) return null;

  const handleStart = () => {
    onStart({
      scope: selectedScope,
      totalProblems: problemCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight">
                Game Mode · Πρόκληση Σκορ
              </h2>
              <p className="text-amber-100 text-xs">
                Δοκίμασε τις δυνάμεις σου και πέτυχε το υψηλότερο ποσοστό %!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
            title="Κλείσιμο"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-6">
          {/* 1. Επιλογή Είδους Διαιρέσεων / Ύλης */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              1. Επίλεξε Ύλη / Είδος Διαιρέσεων:
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {SCOPE_OPTIONS.map((opt) => {
                const isSelected = selectedScope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedScope(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm md:text-base">
                          {opt.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${opt.badgeColor}`}>
                          {opt.gradeBadge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Πλήθος Ασκήσεων */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              2. Πλήθος Ασκήσεων στο Σετ:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { count: 3, label: '3 Ασκήσεις', sub: 'Σύντομο' },
                { count: 5, label: '5 Ασκήσεις', sub: 'Προτεινόμενο' },
                { count: 10, label: '10 Ασκήσεις', sub: 'Πλήρες Τεστ' },
              ].map((item) => {
                const isSelected = problemCount === item.count;
                return (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setProblemCount(item.count)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm md:text-base">{item.label}</div>
                    <div className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {item.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Ακύρωση
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Έναρξη Πρόκλησης!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
