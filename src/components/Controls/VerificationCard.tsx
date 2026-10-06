/**
 * Κάρτα Επαλήθευσης Διαίρεσης
 * - Τέλεια διαίρεση: Δ = δ · π
 * - Ακέραια ατελής διαίρεση (Ευκλείδεια): Δ = δ · π + υ (με υ < δ)
 * - Μη περατούμενη / περιοδική διαίρεση (π.χ. 1:3 = 0,333...):
 *   Προσέγγιση χιλιοστού (Δ : δ ≈ π). Δεν εφαρμόζεται η κλασική ταυτότητα με ακέραιο υπόλοιπο.
 */

import React from 'react';
import { DivisionProblem } from '../../types/division';
import { Award, Check, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationCardProps {
  problem: DivisionProblem;
  onNextProblem: () => void;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  problem,
  onNextProblem,
}) => {
  const isExact = problem.isExact;
  // Μη περατούμενη δεκαδική διαίρεση (περιοδική που συνεχίζεται επ' άπειρον)
  const isNonTerminating = !isExact && problem.maxDecimalReached;
  const isIntegerWithRemainder = !isExact && !isNonTerminating;

  // Υπολογισμός γινομένου για παιδαγωγικό έλεγχο στις μη περατούμενες διαιρέσεις
  const divisorNum = parseFloat(problem.originalDivisorStr.replace(',', '.'));
  const quotientNum = parseFloat(problem.quotientStr.replace(',', '.'));
  const productNum = divisorNum * quotientNum;
  const productFormatted = Number(productNum.toFixed(4)).toString().replace('.', ',');

  // Πραγματικό δεκαδικό υπόλοιπο στη θέση του τελευταίου δεκαδικού ψηφίου
  const decPart = problem.quotientStr.split(',')[1] || '';
  const decimalPlaces = decPart.length;
  const actualDecimalRemainderStr = decimalPlaces > 0
    ? `0,${'0'.repeat(Math.max(0, decimalPlaces - 1))}${problem.finalRemainder}`
    : `${problem.finalRemainder}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`w-full border-2 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 ${
        isNonTerminating
          ? 'bg-gradient-to-br from-amber-50/90 to-orange-50/60 border-amber-300'
          : 'bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border-emerald-300'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md ${
            isNonTerminating ? 'bg-amber-600' : 'bg-emerald-600'
          }`}
        >
          {isNonTerminating ? <Sparkles className="w-7 h-7" /> : <Award className="w-7 h-7" />}
        </div>
        <div>
          {/* 1. ΤΕΛΕΙΑ ΔΙΑΙΡΕΣΗ (Υπόλοιπο 0) */}
          {isExact && (
            <>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Εξαιρετική Δουλειά!
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                  Τέλεια Διαίρεση (υ = 0)
                </span>
              </div>

              <div className="mt-2 text-xs md:text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Μαθηματική Επαλήθευση: </span>
                <span className="font-serif italic font-medium">Δ = δ · π</span>
              </div>

              <div className="mt-1 font-mono-numbers text-sm md:text-base font-bold text-emerald-950 flex items-center flex-wrap gap-1.5">
                <span>{problem.originalDividendStr}</span>
                <span>=</span>
                <span>{problem.originalDivisorStr}</span>
                <span>×</span>
                <span>{problem.quotientStr}</span>
                <Check className="w-4 h-4 text-emerald-600 ml-1 inline" />
              </div>
            </>
          )}

          {/* 2. ΑΚΕΡΑΙΑ ΑΤΕΛΗΣ ΔΙΑΙΡΕΣΗ (Ευκλείδεια) */}
          {isIntegerWithRemainder && (
            <>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Εξαιρετική Δουλειά!
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-md border border-indigo-200">
                  Ατελής Ακέραια Διαίρεση
                </span>
              </div>

              <div className="mt-2 text-xs md:text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Ταυτότητα Ευκλείδειας Διαίρεσης: </span>
                <span className="font-serif italic font-medium">Δ = δ · π + υ (με υ &lt; δ)</span>
              </div>

              <div className="mt-1 font-mono-numbers text-sm md:text-base font-bold text-indigo-950 flex items-center flex-wrap gap-1.5">
                <span>{problem.originalDividendStr}</span>
                <span>=</span>
                <span>{problem.originalDivisorStr}</span>
                <span>×</span>
                <span>{problem.quotientStr}</span>
                <span>+</span>
                <span>{problem.finalRemainder}</span>
                <Check className="w-4 h-4 text-emerald-600 ml-1 inline" />
              </div>
            </>
          )}

          {/* 3. ΜΗ ΠΕΡΑΤΟΥΜΕΝΗ / ΠΕΡΙΟΔΙΚΗ ΔΕΚΑΔΙΚΗ ΔΙΑΙΡΕΣΗ */}
          {isNonTerminating && (
            <>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Πολύ Καλή Προσπάθεια!
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                  Μη Περατούμενη (Περιοδική)
                </span>
              </div>

              <div className="mt-1.5 text-xs md:text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Προσέγγιση 3 δεκαδικών ψηφίων (χιλιοστού): </span>
                <span className="text-slate-600">Η διαίρεση συνεχίζεται επ' άπειρον, άρα το πηλίκο είναι προσεγγιστικό.</span>
              </div>

              <div className="mt-1.5 font-mono-numbers text-sm md:text-base font-bold text-amber-950 flex items-center flex-wrap gap-1.5">
                <span>{problem.originalDividendStr}</span>
                <span>:</span>
                <span>{problem.originalDivisorStr}</span>
                <span className="text-amber-800 text-lg px-0.5">≈</span>
                <span>{problem.quotientStr}</span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-amber-200/80 text-xs text-slate-700 space-y-1">
                <div className="flex items-center flex-wrap gap-1">
                  <span className="font-semibold text-slate-800">Έλεγχος γινομένου:</span>
                  <span className="font-mono-numbers font-medium text-slate-900">
                    {problem.originalDivisorStr} × {problem.quotientStr} = {productFormatted} ≈ {problem.originalDividendStr}
                  </span>
                </div>
                <div className="text-[11px] text-amber-900/80 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 inline" />
                  <span>
                    Στις μη περατούμενες διαιρέσεις <strong>δεν εφαρμόζεται</strong> η ταυτότητα Δ = δ · π + υ.
                    {actualDecimalRemainderStr !== `${problem.finalRemainder}` && (
                      <span> (Πραγματικό δεκαδικό υπόλοιπο στο χιλιοστό: <strong className="font-mono-numbers">{actualDecimalRemainderStr}</strong>).</span>
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onNextProblem}
        className={`w-full md:w-auto px-5 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
          isNonTerminating
            ? 'bg-amber-600 hover:bg-amber-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>Επόμενη Διαίρεση</span>
      </button>
    </motion.div>
  );
};
