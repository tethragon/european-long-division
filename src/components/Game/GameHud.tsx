/**
 * HUD Μπάρα Προόδου & Σκορ για το Game Mode
 */

import React from 'react';
import { Trophy, Flame, X, Award } from 'lucide-react';
import { GameSession } from '../../types/gameMode';

interface GameHudProps {
  session: GameSession;
  totalScorePercent: number;
  onExit: () => void;
}

const SCOPE_RANK_NAMES: Record<string, string> = {
  integers: 'Padawan',
  decimals_basic: 'Master',
  all_cases: 'Grand Master',
  current_tab: 'Sentinel',
};

export const GameHud: React.FC<GameHudProps> = ({
  session,
  totalScorePercent,
  onExit,
}) => {
  const currentNum = session.currentIndex + 1;
  const totalNum = session.settings.totalProblems;
  const rankName = SCOPE_RANK_NAMES[session.settings.scope] || 'Padawan';

  // Χρώμα σκορ ανάλογα με την επίδοση
  const scoreColorClass = 
    totalScorePercent >= 90
      ? 'bg-emerald-500 text-white'
      : totalScorePercent >= 75
      ? 'bg-indigo-600 text-white'
      : 'bg-amber-500 text-white';

  return (
    <div className="w-full bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-3 md:p-4 mb-4 shadow-md border border-indigo-700/50 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* 1. Τίτλος & Ένδειξη Game Mode */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs">
            <Trophy className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Game Mode
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-amber-200 font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
                {rankName}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300">
                {totalNum} Ασκήσεις
              </span>
            </div>
            <div className="text-sm md:text-base font-extrabold tracking-tight">
              Άσκηση {currentNum} από {totalNum}
            </div>
          </div>
        </div>

        {/* Κουμπί εξόδου για mobile */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Θέλετε να διακόψετε το Game Mode και να επιστρέψετε στην ελεύθερη εξάσκηση;')) {
              onExit();
            }
          }}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Έξοδος από το παιχνίδι"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Κουκκίδες Προόδου (Progress Dots) */}
      <div className="flex items-center gap-1.5 py-1">
        {Array.from({ length: totalNum }).map((_, idx) => {
          const isDone = idx < session.results.length;
          const isCurrent = idx === session.currentIndex;
          const res = session.results[idx];

          let dotClass = 'bg-slate-700 text-slate-400 border border-slate-600';
          if (isDone) {
            dotClass = res && res.scorePercent >= 90
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-indigo-500 text-white border-indigo-400';
          } else if (isCurrent) {
            dotClass = 'bg-amber-400 text-amber-950 border-amber-300 ring-2 ring-amber-300/40 animate-pulse';
          }

          return (
            <div
              key={`dot-${idx}`}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${dotClass}`}
              title={`Άσκηση ${idx + 1}`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {/* 3. Σκορ % & Σερί */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Combo Streak */}
        {session.currentStreak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-bounce">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{session.currentStreak} σερί!</span>
          </div>
        )}

        {/* Live Score % */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
              Ακρίβεια
            </div>
            <div className={`px-2.5 py-0.5 rounded-lg text-sm font-black font-mono-numbers ${scoreColorClass}`}>
              {totalScorePercent}%
            </div>
          </div>
        </div>

        {/* Κουμπί εξόδου για desktop */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Θέλετε να διακόψετε το Game Mode και να επιστρέψετε στην ελεύθερη εξάσκηση;')) {
              onExit();
            }
          }}
          className="hidden md:flex p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Έξοδος από το παιχνίδι"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
