/**
 * Βοηθητικό Πρόχειρο: Προπαίδεια του Διαιρέτη (1x έως 9x)
 * Βασικό εργαλείο που χρησιμοποιούν οι μαθητές ΣΤ' Δημοτικού για να βρίσκουν εύκολα το κατάλληλο ψηφίο πηλίκου.
 */

import React from 'react';
import { X, Check } from 'lucide-react';

interface MultiplesHelperProps {
  divisor: number;
  currentChunk?: number;
  onClose: () => void;
  onSelectMultiplier?: (multiplier: number) => void;
}

export const MultiplesHelper: React.FC<MultiplesHelperProps> = ({
  divisor,
  currentChunk,
  onClose,
  onSelectMultiplier,
}) => {
  const multiples = Array.from({ length: 9 }, (_, i) => {
    const mult = i + 1;
    const prod = mult * divisor;
    const isFit = currentChunk !== undefined ? prod <= currentChunk : false;
    return { mult, prod, isFit };
  });

  // Βρίσκουμε το μεγαλύτερο γινόμενο που χωράει στο currentChunk
  let bestFitMult = 0;
  if (currentChunk !== undefined) {
    for (const item of multiples) {
      if (item.isFit) {
        bestFitMult = item.mult;
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-md p-4 w-full md:w-72 flex flex-col shrink-0">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-700">
            Πρόχειρο Προπαίδειας
          </h3>
          <p className="text-[11px] text-slate-500">
            Πολλαπλάσια του {divisor}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Κλείσιμο πρόχειρου"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentChunk !== undefined && (
        <div className="mb-2 p-1.5 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <span>Τρέχον τμήμα:</span>
          <span className="font-mono-numbers font-bold text-slate-900">{currentChunk}</span>
        </div>
      )}

      <div className="flex flex-col gap-1 font-mono-numbers text-xs">
        {multiples.map(({ mult, prod }) => {
          const isBest = mult === bestFitMult && bestFitMult > 0;
          const isExceeded = currentChunk !== undefined && prod > currentChunk;

          return (
            <div
              key={`multiple-${mult}`}
              onClick={() => onSelectMultiplier && onSelectMultiplier(mult)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                isBest
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 ring-1 ring-emerald-300'
                  : isExceeded
                  ? 'text-slate-400 bg-slate-50/50'
                  : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{mult}</span>
                <span>×</span>
                <span>{divisor}</span>
                <span>=</span>
                <span className="font-bold">{prod}</span>
              </div>

              {isBest && (
                <span className="text-[10px] font-sans font-semibold text-emerald-700 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Χωράει!
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
