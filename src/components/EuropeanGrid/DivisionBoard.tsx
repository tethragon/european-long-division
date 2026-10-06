/**
 * Ο Κύριος Πίνακας της Κάθετης Διαίρεσης (Ευρωπαϊκή Μέθοδος)
 * Συνθέτει τον Διαιρετέο και τις αφαιρέσεις (αριστερά) με τον Διαιρέτη και το Πηλίκο (δεξιά).
 * Περιλαμβάνει διαδραστικό βοηθό μετατροπής δεκαδικού διαιρέτη και εμφανή ένδειξη της αρχικής διαίρεσης.
 */

import React from 'react';
import { DivisionProblem, UserInputStepState, SubStep, ShiftUserState } from '../../types/division';
import { DividendRow } from './DividendRow';
import { DivisorQuotientCorner } from './DivisorQuotientCorner';
import { SubtractionRow } from './SubtractionRow';
import { DecimalShiftHelper } from '../Controls/DecimalShiftHelper';
import { CheckCircle2 } from 'lucide-react';

interface DivisionBoardProps {
  problem: DivisionProblem;
  stepStates: UserInputStepState[];
  activeStepIndex: number;
  activeSubStep: SubStep;
  shiftUserState: ShiftUserState;
  onSelectMultiplier: (mult: number) => void;
  onEnteredDividendChange: (val: string) => void;
  onEnteredDivisorChange: (val: string) => void;
  onValidateShift: () => void;
  onQuotientChange: (val: string) => void;
  onValidateQuotient: () => void;
  onProductDigitChange: (digitIdx: number, val: string) => void;
  onValidateProduct: () => void;
  onRemainderDigitChange: (digitIdx: number, val: string) => void;
  onValidateRemainder: () => void;
  onTriggerBringDown: () => void;
  focusedCellId: string | null;
  setFocusedCellId: (id: string | null) => void;
}

export const DivisionBoard: React.FC<DivisionBoardProps> = ({
  problem,
  stepStates,
  activeStepIndex,
  activeSubStep,
  shiftUserState,
  onSelectMultiplier,
  onEnteredDividendChange,
  onEnteredDivisorChange,
  onValidateShift,
  onQuotientChange,
  onValidateQuotient,
  onProductDigitChange,
  onValidateProduct,
  onRemainderDigitChange,
  onValidateRemainder,
  onTriggerBringDown,
  focusedCellId,
  setFocusedCellId,
}) => {
  const currentStep = problem.steps[activeStepIndex];
  const isFinished = activeSubStep === 'completed';

  // Υπολογισμός συνολικών στηλών για το grid (διαιρετέος + ψηφία που κατεβαίνουν)
  const numDividendDigits = problem.effectiveDividendStr.replace(/,/g, '').length;
  const maxStepCol = problem.steps.reduce((max, s) => {
    const stepMax = s.columnEndIndex + (s.broughtDownDigit !== null ? 1 : 0);
    return Math.max(max, stepMax);
  }, numDividendDigits - 1);
  const totalCols = Math.max(numDividendDigits, maxStepCol + 1);

  const isShiftPending = problem.shiftInfo.wasShifted && !shiftUserState.isShiftValidated;

  // Ο διαιρετέος εμφανίζει αρχικά τα βασικά ψηφία του baseDividendStr (π.χ. 0,024).
  // Όταν ένα βήμα απαιτήσει προσθήκη μηδενικού (όπως το 0,0240 στο 4ο βήμα του 0,024 : 40)
  // ή όταν ολοκληρωθεί η άσκηση, αποκαλύπτονται δυναμικά τα προστιθέμενα μηδενικά!
  const baseDigitsCount = (problem.baseDividendStr || problem.effectiveDividendStr).replace(/,/g, '').length;
  const revealedDigitsCount = isFinished
    ? numDividendDigits
    : Math.max(baseDigitsCount, (currentStep ? currentStep.chunkEndIndex + 1 : baseDigitsCount));

  const getRevealedDividend = (fullStr: string, count: number): string => {
    const parts = fullStr.split(',');
    const intPart = parts[0] || '0';
    const decPart = parts[1] || '';
    if (intPart.length >= count) {
      return intPart.slice(0, count);
    }
    const decDigitsNeeded = count - intPart.length;
    return `${intPart},${decPart.slice(0, decDigitsNeeded)}`;
  };

  const currentDividendStr = isShiftPending
    ? activeSubStep === 'shift_multiplier'
      ? Array.from({ length: problem.shiftInfo.shiftedDividend.replace(/,/g, '').length }, () => '?').join('')
      : (shiftUserState.enteredDividend || Array.from({ length: problem.shiftInfo.shiftedDividend.replace(/,/g, '').length }, () => '?').join(''))
    : getRevealedDividend(problem.effectiveDividendStr, revealedDigitsCount);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:p-6 overflow-x-auto">
      {/* 1. ΕΜΦΑΝΙΣΗ ΑΡΧΙΚΗΣ ΔΙΑΙΡΕΣΗΣ & ΔΙΑΔΡΑΣΤΙΚΗ ΜΕΤΑΤΡΟΠΗ (αν ο διαιρέτης είναι δεκαδικός) */}
      {problem.shiftInfo.wasShifted && (
        <DecimalShiftHelper
          shiftInfo={problem.shiftInfo}
          shiftUserState={shiftUserState}
          activeSubStep={activeSubStep}
          onSelectMultiplier={onSelectMultiplier}
          onEnteredDividendChange={onEnteredDividendChange}
          onEnteredDivisorChange={onEnteredDivisorChange}
          onValidateShift={onValidateShift}
        />
      )}

      {/* 2. ΚΥΡΙΟΣ ΕΥΡΩΠΑΪΚΟΣ ΠΙΝΑΚΑΣ ΔΙΑΙΡΕΣΗΣ */}
      <div className={`inline-flex items-start justify-start gap-4 md:gap-8 min-w-[500px] md:min-w-[620px] select-text transition-opacity duration-300 ${
        isShiftPending ? 'opacity-80' : 'opacity-100'
      }`}>
        {/* ============================================================ */}
        {/* ΑΡΙΣΤΕΡΟ ΤΜΗΜΑ: Διαιρετέος & Διαδοχικές Αφαιρέσεις */}
        {/* ============================================================ */}
        <div className="flex flex-col">
          {/* Ετικέτα Διαιρετέου (ίδιο ακριβώς ύψος και περιθώριο με τον Διαιρέτη) */}
          <div className="h-5 flex items-center mb-2.5 text-xs uppercase font-bold tracking-wider text-slate-500">
            Διαιρετέος
          </div>

          {/* 1. Γραμμή Διαιρετέου (στην ίδια ακριβώς οριζόντια ευθεία με τον Διαιρέτη) */}
          <div className="flex items-center">
            <DividendRow
              dividendStr={currentDividendStr}
              activeChunkStart={currentStep?.chunkStartIndex}
              activeChunkEnd={currentStep?.chunkEndIndex}
              highlightActive={!isFinished && !isShiftPending}
              totalCols={totalCols}
              baseDigitsCount={baseDigitsCount}
            />
          </div>

          {/* 2. Διαδοχικές Γραμμές Αφαίρεσης για κάθε βήμα */}
          {!isShiftPending && (
            <div className="flex flex-col mt-2">
              {problem.steps.map((step, idx) => {
                // Εμφανίζουμε τα βήματα μέχρι το τρέχον ενεργό
                if (idx > activeStepIndex) return null;

                return (
                  <SubtractionRow
                    key={`subtraction-row-${idx}`}
                    step={step}
                    stepIndex={idx}
                    stepState={stepStates[idx]}
                    activeStepIndex={activeStepIndex}
                    activeSubStep={activeSubStep}
                    totalCols={totalCols}
                    onProductDigitChange={onProductDigitChange}
                    onRemainderDigitChange={onRemainderDigitChange}
                    onValidateProduct={onValidateProduct}
                    onValidateRemainder={onValidateRemainder}
                    onTriggerBringDown={onTriggerBringDown}
                    focusedCellId={focusedCellId}
                    setFocusedCellId={setFocusedCellId}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* ΔΕΞΙ ΤΜΗΜΑ: Διαιρέτης & Πηλίκο (Η Ευρωπαϊκή Ορθή Γωνία) */}
        {/* ============================================================ */}
        <DivisorQuotientCorner
          problem={problem}
          stepStates={stepStates}
          activeStepIndex={activeStepIndex}
          activeSubStep={activeSubStep}
          shiftUserState={shiftUserState}
          onQuotientChange={onQuotientChange}
          onValidateQuotient={onValidateQuotient}
          focusedCellId={focusedCellId}
          setFocusedCellId={setFocusedCellId}
        />
      </div>

      {/* 3. ΤΕΛΙΚΟ ΜΗΝΥΜΑ ΕΠΙΤΥΧΙΑΣ (Πλήρες πλάτος κάτω από τον πίνακα, χωρίς να διογκώνει το αριστερό τμήμα) */}
      {isFinished && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 text-sm">
          <CheckCircle2 className={`w-4 h-4 ${problem.isExact ? 'text-emerald-600' : (!problem.isExact && (problem.maxDecimalReached || problem.quotientStr.includes(','))) ? 'text-amber-600' : 'text-indigo-600'}`} />
          {problem.isExact ? (
            <span className="text-emerald-700 font-semibold">
              Τελικό Υπόλοιπο: <strong className="font-mono-numbers text-base font-bold text-slate-900">0</strong>{' '}
              <span className="text-emerald-600 font-medium">(Τέλεια διαίρεση)</span>
            </span>
          ) : (!problem.isExact && (problem.maxDecimalReached || problem.quotientStr.includes(','))) ? (
            <span className="text-amber-800 font-semibold">
              Η διαίρεση συνεχίζεται επ' άπειρον{' '}
              <span className="text-slate-600 text-xs font-normal">
                (σταματήσαμε στα 3 δεκαδικά με υπόλοιπο {problem.finalRemainder} στο χιλιοστό)
              </span>
            </span>
          ) : (
            <span className="text-slate-800 font-semibold">
              Τελικό Υπόλοιπο:{' '}
              <strong className="font-mono-numbers text-base font-bold text-slate-900">
                {problem.finalRemainder}
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
