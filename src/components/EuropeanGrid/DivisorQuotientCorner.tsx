/**
 * Η δεξιά γωνία της Ευρωπαϊκής διαίρεσης:
 * Ο Διαιρέτης στην κορυφή μέσα στην ορθή γωνία (κάθετη γραμμή αριστερά, οριζόντια κάτω).
 * Ακριβώς κάτω από την οριζόντια γραμμή γράφεται το Πηλίκο με ξεχωριστά spans για τα κόμματα.
 * Υποστηρίζει απόκρυψη/ερωτηματικά (?) του διαιρέτη μέχρι ο μαθητής να επιλέξει πολλαπλασιαστή.
 */

import React, { useRef, useEffect } from 'react';
import { DivisionProblem, UserInputStepState, SubStep, ShiftUserState } from '../../types/division';
import { Check, ArrowRight } from 'lucide-react';

interface DivisorQuotientCornerProps {
  problem: DivisionProblem;
  stepStates: UserInputStepState[];
  activeStepIndex: number;
  activeSubStep: SubStep;
  shiftUserState?: ShiftUserState;
  onQuotientChange: (val: string) => void;
  onValidateQuotient: () => void;
  focusedCellId: string | null;
  setFocusedCellId: (id: string | null) => void;
}

export const DivisorQuotientCorner: React.FC<DivisorQuotientCornerProps> = ({
  problem,
  stepStates,
  activeStepIndex,
  activeSubStep,
  shiftUserState,
  onQuotientChange,
  onValidateQuotient,
  focusedCellId,
  setFocusedCellId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus στο ενεργό κελί πηλίκου όταν είναι η σειρά του
  useEffect(() => {
    if (activeSubStep === 'quotient' && focusedCellId === `quotient-${activeStepIndex}`) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [activeStepIndex, activeSubStep, focusedCellId]);

  const isShiftPending = problem.shiftInfo.wasShifted && (!shiftUserState || !shiftUserState.isShiftValidated);

  // Καθορισμός χαρακτήρων διαιρέτη προς εμφάνιση
  let divisorChars: { char: string; isPending: boolean }[] = [];

  if (isShiftPending) {
    if (activeSubStep === 'shift_multiplier') {
      // Κατά το βήμα επιλογής πολλαπλασιαστή, εμφανίζονται κενά κελιά με ?
      const length = problem.shiftInfo.shiftedDivisor.length || 2;
      divisorChars = Array.from({ length }, () => ({ char: '?', isPending: true }));
    } else {
      // Κατά το βήμα πληκτρολόγησης, εμφανίζεται αυτό που γράφει ο μαθητής (ή ?)
      const entered = shiftUserState?.enteredDivisor || '';
      if (entered.length > 0) {
        divisorChars = entered.split('').map((char) => ({ char, isPending: true }));
      } else {
        const length = problem.shiftInfo.shiftedDivisor.length || 2;
        divisorChars = Array.from({ length }, () => ({ char: '?', isPending: true }));
      }
    }
  } else {
    // Επικυρωμένος διαιρέτης
    divisorChars = problem.shiftInfo.shiftedDivisor.split('').map((char) => ({ char, isPending: false }));
  }

  return (
    <div className="flex flex-col items-start min-w-[140px] md:min-w-[180px]">
      {/* 1. Επάνω τμήμα: Διαιρέτης με αριστερή κάθετη και κάτω οριζόντια γραμμή */}
      <div className="w-full border-l-2 border-b-2 border-slate-700 pl-3 md:pl-4 pb-2">
        {/* Ετικέτα Διαιρέτη (ίδιο ακριβώς ύψος και περιθώριο με τον Διαιρετέο) */}
        <div className="h-5 flex items-center mb-2.5 text-xs uppercase font-bold tracking-wider text-slate-500">
          Διαιρέτης
        </div>

        {/* Ψηφία Διαιρέτη (στην ίδια ακριβώς οριζόντια ευθεία με τον Διαιρετέο) */}
        <div className="flex items-center gap-1 font-mono-numbers">
          {divisorChars.map((item, i) => {
            if (item.char === ',') {
              return (
                <span
                  key={`div-comma-${i}`}
                  className="inline-flex items-end justify-center w-2 text-xl font-bold text-indigo-700 select-none"
                >
                  ,
                </span>
              );
            }
            return (
              <span
                key={`div-char-${i}`}
                className={`w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center font-bold text-lg md:text-xl rounded-lg transition-colors ${
                  item.isPending
                    ? item.char === '?'
                      ? 'bg-slate-50 text-slate-400 border border-dashed border-slate-300'
                      : 'bg-indigo-50/50 text-indigo-800 border border-dashed border-indigo-400'
                    : 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                }`}
                title={item.isPending ? 'Ο διαιρέτης θα τοποθετηθεί μετά τη μετατροπή' : undefined}
              >
                {item.char}
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. Κάτω τμήμα: Πηλίκο με αριστερή κάθετη γραμμή (συνέχεια της γωνίας) */}
      <div className="w-full border-l-2 border-slate-700 pl-3 md:pl-4 pt-2">
        <div className="flex items-center justify-between mb-1 h-5">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Πηλίκο
          </span>
          {activeSubStep === 'quotient' && (
            <button
              type="button"
              onClick={onValidateQuotient}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs cursor-pointer"
              title="Έλεγχος ψηφίου πηλίκου (Enter)"
            >
              Έλεγχος <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Κελιά ψηφίων του πηλίκου */}
        <div className="flex items-center flex-wrap gap-1">
          {problem.steps.map((step, idx) => {
            const stepState = stepStates[idx];
            const isActive = idx === activeStepIndex && activeSubStep === 'quotient';
            const isCompleted = stepState?.isQuotientValidated;
            const isUpcoming = idx > activeStepIndex;
            const cellId = `quotient-${idx}`;

            return (
              <React.Fragment key={`quotient-cell-group-${idx}`}>
                {/* Κελί ψηφίου πηλίκου */}
                <div className="relative">
                  {isCompleted ? (
                    // Επικυρωμένο σωστό ψηφίο
                    <div
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-mono-numbers font-bold text-lg md:text-xl rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
                      title={`Ψηφίο πηλίκου: ${step.quotientDigit}`}
                    >
                      {step.quotientDigit}
                    </div>
                  ) : isActive ? (
                    // Ενεργό input για τον μαθητή
                    <input
                      ref={inputRef}
                      id={cellId}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={stepState?.quotientDigit || ''}
                      onChange={(e) => onQuotientChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onValidateQuotient();
                        }
                      }}
                      onFocus={() => setFocusedCellId(cellId)}
                      placeholder="?"
                      aria-label={`Ψηφίο πηλίκου βήματος ${idx + 1}`}
                      className="w-8 h-8 md:w-9 md:h-9 text-center font-mono-numbers font-bold text-lg md:text-xl rounded-lg bg-white text-indigo-900 border-2 border-indigo-600 focus:outline-hidden focus:ring-3 focus:ring-indigo-300 shadow-sm transition-all scroll-m-24"
                    />
                  ) : (
                    // Μελλοντικό κελί
                    <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-mono-numbers text-slate-300 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                      {isUpcoming ? '·' : (stepState?.quotientDigit || '·')}
                    </div>
                  )}
                </div>

                {/* Ανεξάρτητο span για την υποδιαστολή (κόμμα) στο πηλίκο */}
                {step.isDecimalPointPlacedHere && (
                  <span
                    className="inline-flex items-end justify-center w-2 h-8 pb-1 text-2xl font-bold text-indigo-700 select-none animate-bounce"
                    title="Υποδιαστολή στο πηλίκο"
                  >
                    ,
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
