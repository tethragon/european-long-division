/**
 * Παράθυρο Επιβράβευσης & Τελικών Αποτελεσμάτων Game Mode
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Flame, RotateCcw, Home, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameSession } from '../../types/gameMode';

interface GameCompletedModalProps {
  isOpen: boolean;
  session: GameSession;
  totalScorePercent: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

const SCOPE_RANK_NAMES: Record<string, string> = {
  integers: 'Padawan',
  decimals_basic: 'Master',
  all_cases: 'Grand Master',
  current_tab: 'Sentinel',
};

export const GameCompletedModal: React.FC<GameCompletedModalProps> = ({
  isOpen,
  session,
  totalScorePercent,
  onPlayAgain,
  onExit,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Ρίψη κομφετί αν το σκορ είναι καλό!
      if (totalScorePercent >= 70) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore if canvas not supported
        }
      }
    }
  }, [isOpen, totalScorePercent]);

  if (!isOpen) return null;

  const rankName = SCOPE_RANK_NAMES[session.settings.scope] || 'Padawan';

  // Μετάλλιο & Τίτλος ανάλογα με το τελικό ποσοστό
  let medalEmoji = '🥇';
  let medalTitle = `Αριστούχος — ${rankName}!`;
  let medalBadge = 'Χρυσό Μετάλλιο';
  let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  let medalSubtitle = `Η Δύναμη είναι πανίσχυρη μαζί σου! Ολοκλήρωσες και τις ${session.settings.totalProblems} διαιρέσεις της πρόκλησης.`;

  if (totalScorePercent >= 90) {
    medalEmoji = '🥇';
    medalTitle = `Αριστούχος — ${rankName}!`;
    medalBadge = 'Χρυσό Μετάλλιο';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    medalSubtitle = `Η Δύναμη είναι πανίσχυρη μαζί σου! Ολοκλήρωσες και τις ${session.settings.totalProblems} διαιρέσεις της πρόκλησης.`;
  } else if (totalScorePercent >= 75) {
    medalEmoji = '🥈';
    medalTitle = `Εξαιρετική Επίδοση — ${rankName}!`;
    medalBadge = 'Αργυρό Μετάλλιο';
    badgeColor = 'bg-slate-200 text-slate-800 border-slate-400';
    medalSubtitle = `Πολύ δυνατή προσπάθεια! Ολοκλήρωσες και τις ${session.settings.totalProblems} διαιρέσεις της πρόκλησης.`;
  } else if (totalScorePercent >= 60) {
    medalEmoji = '🥉';
    medalTitle = `Πολύ Καλή Προσπάθεια!`;
    medalBadge = 'Χάλκινο Μετάλλιο';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    medalSubtitle = `Καλή εξάσκηση ως ${rankName}! Συνέχισε έτσι για να φτάσεις στην κορυφή.`;
  } else {
    medalEmoji = '🎖️';
    medalTitle = 'Μπράβο για την Προσπάθεια!';
    medalBadge = 'Έπαινος Συμμετοχής';
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
    medalSubtitle = `Κάθε προσπάθεια σε κάνει πιο δυνατό. Συνέχισε την εξάσκηση!`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Banner κορυφής */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl select-none">
            🏆
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-5xl mb-2 animate-bounce">{medalEmoji}</span>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${badgeColor}`}>
              {medalBadge}
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mb-1">
              {medalTitle}
            </h2>
            <p className="text-indigo-200 text-xs">
              {medalSubtitle}
            </p>

            {/* Μεγάλο Ποσοστό % */}
            <div className="mt-4 px-6 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-baseline gap-2">
              <span className="text-xs uppercase font-bold text-amber-300">
                Τελικο Σκορ
              </span>
              <span className="text-4xl md:text-5xl font-black font-mono-numbers text-amber-400">
                {totalScorePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Αναλυτικά Στατιστικά & Λίστα Ασκήσεων */}
        <div className="p-5 md:p-6 space-y-4 max-h-[40vh] overflow-y-auto">
          {/* Μικρές κάρτες highlights */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-0.5">Ασκήσεις</div>
              <div className="text-lg font-bold text-slate-900">
                {session.results.length} / {session.settings.totalProblems}
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col items-center">
              <div className="text-xs text-amber-800 font-semibold mb-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Μέγιστο Σερί
              </div>
              <div className="text-lg font-bold text-amber-900">
                {session.maxStreak} συνεχόμενα
              </div>
            </div>
          </div>

          {/* Λίστα ανά άσκηση */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Αναλυση Ανα Ασκηση:
            </h4>
            <div className="space-y-1.5">
              {session.results.map((res, idx) => (
                <div
                  key={`res-${idx}`}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-mono-numbers font-semibold text-slate-800">
                      {res.dividend} : {res.divisor}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono-numbers">
                    <span className="text-slate-500 text-[11px]">
                      {res.mistakesCount === 0 ? 'Χωρίς λάθος ✨' : `${res.mistakesCount} βοήθειες/λάθη`}
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                      res.scorePercent >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : res.scorePercent >= 75
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {res.scorePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onExit}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Ελεύθερη Εξάσκηση</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Νέα Πρόκληση!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
