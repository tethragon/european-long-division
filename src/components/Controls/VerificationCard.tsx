/**
 * Κάρτα Επαλήθευσης Διαίρεσης (Ταυτότητα Ευκλείδειας Διαίρεσης)
 * Δ = δ · π + υ  (Διαιρετέος = Διαιρέτης × Πηλίκο + Υπόλοιπο)
 */

import React from 'react';
import { DivisionProblem } from '../../types/division';
import { Award, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationCardProps {
  problem: DivisionProblem;
  onNextProblem: () => void;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  problem,
  onNextProblem,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border-2 border-emerald-300 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Award className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Εξαιρετική Δουλειά!
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
              {problem.isExact ? 'Τέλεια Διαίρεση' : 'Ατελής Διαίρεση'}
            </span>
          </div>

          {/* Μαθηματική Επαλήθευση */}
          <div className="mt-2 text-xs md:text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Μαθηματική Επαλήθευση: </span>
            <span className="font-serif italic font-medium">Δ = δ · π + υ</span>
          </div>

          <div className="mt-1 font-mono-numbers text-sm md:text-base font-bold text-emerald-950 flex items-center flex-wrap gap-1.5">
            <span>{problem.originalDividendStr}</span>
            <span>=</span>
            <span>{problem.originalDivisorStr}</span>
            <span>×</span>
            <span>{problem.quotientStr}</span>
            {problem.finalRemainder > 0 && (
              <>
                <span>+</span>
                <span>{problem.finalRemainder}</span>
              </>
            )}
            <Check className="w-4 h-4 text-emerald-600 ml-1 inline" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNextProblem}
        className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Επόμενη Διαίρεση</span>
      </button>
    </motion.div>
  );
};
