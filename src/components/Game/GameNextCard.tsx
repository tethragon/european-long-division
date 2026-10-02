/**
 * Κάρτα Ολοκλήρωσης Μεμονωμένης Άσκησης στο Game Mode
 */

import React from 'react';
import { ArrowRight, Trophy, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { DivisionProblem } from '../../types/division';
import { GameSession, ProblemResult } from '../../types/gameMode';

interface GameNextCardProps {
  problem: DivisionProblem;
  session: GameSession;
  onNext: () => void;
}

export const GameNextCard: React.FC<GameNextCardProps> = ({
  problem,
  session,
  onNext,
}) => {
  const currentNum = session.currentIndex + 1;
  const totalNum = session.settings.totalProblems;
  const isLast = currentNum >= totalNum;

  // Βρίσκουμε το αποτέλεσμα της τρέχουσας άσκησης αν έχει καταγραφεί
  const currentResult: ProblemResult | undefined = session.results[session.currentIndex];
  const problemScore = currentResult ? currentResult.scorePercent : 100;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-400 rounded-3xl p-5 md:p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Αριστερά: Μήνυμα Επιτυχίας & Σκορ */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Άσκηση {currentNum} από {totalNum} Ολοκληρώθηκε!
              </span>
              {session.currentStreak > 1 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {session.currentStreak} σερί
                </span>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-black text-slate-900 mt-0.5">
              Σκορ Άσκησης: <span className="text-emerald-700 font-mono-numbers">{problemScore}%</span>
            </h3>

            <p className="text-xs text-slate-600 mt-0.5 font-mono-numbers">
              {problem.originalDividendStr} : {problem.originalDivisorStr}{' '}
              {(!problem.isExact && (problem.maxDecimalReached || problem.quotientStr.includes(','))) ? '≈' : '='}{' '}
              {problem.quotientStr}
              {problem.isExact && ' (τέλεια)'}
              {!problem.isExact && !problem.quotientStr.includes(',') && ` (υπόλοιπο: ${problem.finalRemainder})`}
              {!problem.isExact && problem.quotientStr.includes(',') && ` (προσέγγιση χιλιοστού)`}
            </p>
          </div>
        </div>

        {/* Δεξιά: Κουμπί για την επόμενη άσκηση */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            {isLast ? (
              <>
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Δες τα Τελικά Αποτελέσματα!</span>
              </>
            ) : (
              <>
                <span>Επόμενη Άσκηση ({currentNum + 1}/{totalNum})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-emerald-800/60 rounded text-emerald-100 font-mono border border-emerald-500/50">
              Enter
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
