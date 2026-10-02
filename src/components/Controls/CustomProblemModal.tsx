/**
 * Παράθυρο (Modal) για εισαγωγή προσαρμοσμένης διαίρεσης (Custom Dividend & Divisor)
 */

import React, { useState } from 'react';
import { X, Play, Calculator } from 'lucide-react';

interface CustomProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dividend: string, divisor: string) => void;
  initialDividend: string;
  initialDivisor: string;
}

export const CustomProblemModal: React.FC<CustomProblemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialDividend,
  initialDivisor,
}) => {
  const [dividend, setDividend] = useState(initialDividend);
  const [divisor, setDivisor] = useState(initialDivisor);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDiv = dividend.trim().replace(/\./g, ',');
    const cleanDis = divisor.trim().replace(/\./g, ',');

    if (!cleanDiv || !cleanDis) {
      setError('Παρακαλώ συμπληρώστε και τα δύο πεδία.');
      return;
    }

    const divisorNum = parseFloat(cleanDis.replace(',', '.'));
    if (isNaN(divisorNum) || divisorNum === 0) {
      setError('Ο διαιρέτης δεν μπορεί να είναι 0!');
      return;
    }

    const dividendNum = parseFloat(cleanDiv.replace(',', '.'));
    if (isNaN(dividendNum)) {
      setError('Μη έγκυρος διαιρετέος.');
      return;
    }

    setError(null);
    onSubmit(cleanDiv, cleanDis);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Δική μου Διαίρεση
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Εισάγετε ακέραιους ή δεκαδικούς αριθμούς (χρησιμοποιήστε κόμμα ή τελεία).
            Αν ο διαιρέτης είναι δεκαδικός, η εφαρμογή θα κάνει αυτόματα τη μετατόπιση της υποδιαστολής.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Διαιρετέος (Δ)
              </label>
              <input
                type="text"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                placeholder="π.χ. 142,5"
                className="w-full px-3 py-2 text-base font-mono-numbers font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Διαιρέτης (δ)
              </label>
              <input
                type="text"
                value={divisor}
                onChange={(e) => setDivisor(e.target.value)}
                placeholder="π.χ. 25"
                className="w-full px-3 py-2 text-base font-mono-numbers font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Έναρξη Διαίρεσης</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
