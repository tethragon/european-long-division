/**
 * Γραμμή Αφαίρεσης για κάθε βήμα της Ευρωπαϊκής διαίρεσης:
 * - Γινόμενο (με πρόσημο πλην - )
 * - Οριζόντια γραμμή αφαίρεσης
 * - Υπόλοιπο
 * - Ψηφίο που κατεβαίνει (με animation)
 * Χρησιμοποιεί αυστηρό σύστημα στηλών (-1, 0, 1, ...) για τέλεια ευθυγράμμιση με τον Διαιρετέο.
 */

import React, { useRef, useEffect } from 'react';
import { DivisionStep, UserInputStepState, SubStep } from '../../types/division';
import { BringDownAnimation } from './BringDownAnimation';
import { ArrowDown, Check } from 'lucide-react';

interface SubtractionRowProps {
  step: DivisionStep;
  stepIndex: number;
  stepState?: UserInputStepState;
  activeStepIndex: number;
  activeSubStep: SubStep;
  totalCols: number;
  zeroSteps?: DivisionStep[];
  allStepStates?: UserInputStepState[];
  onProductDigitChange: (digitIdx: number, val: string) => void;
  onRemainderDigitChange: (digitIdx: number, val: string) => void;
  onValidateProduct: () => void;
  onValidateRemainder: () => void;
  onTriggerBringDown: () => void;
  focusedCellId: string | null;
  setFocusedCellId: (id: string | null) => void;
}

export const SubtractionRow: React.FC<SubtractionRowProps> = ({
  step,
  stepIndex,
  stepState,
  activeStepIndex,
  activeSubStep,
  totalCols,
  zeroSteps = [],
  allStepStates = [],
  onProductDigitChange,
  onRemainderDigitChange,
  onValidateProduct,
  onValidateRemainder,
  onTriggerBringDown,
  focusedCellId,
  setFocusedCellId,
}) => {
  const isCurrentStep = stepIndex === activeStepIndex;
  const isProductActive = isCurrentStep && activeSubStep === 'product';
  const isRemainderActive = isCurrentStep && activeSubStep === 'remainder';
  const isStepBringDownActive = isCurrentStep && activeSubStep === 'bring_down';
  const activeZeroStep = zeroSteps.find(
    (zs) => zs.stepIndex === activeStepIndex && activeSubStep === 'bring_down'
  );
  const isBringDownActive = isStepBringDownActive || !!activeZeroStep;

  const productInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const remainderInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const bringDownBtnRef = useRef<HTMLButtonElement | null>(null);

  const colEnd = step.columnEndIndex;
  const productLen = step.productDigitsStr.length;
  const productStartCol = colEnd - productLen + 1;

  const remainderLen = step.remainderDigitsStr.length;
  const remainderStartCol = colEnd - remainderLen + 1;
  const chunkLen = step.chunkDigitsStr.length;
  const chunkStartCol = colEnd - chunkLen + 1;
  const lineStartCol = Math.min(productStartCol, remainderStartCol, chunkStartCol);
  const minusCol = lineStartCol - 1; // Μπορεί να είναι -1, 0, 1, κλπ.
  const bringDownCol = colEnd + 1;

  // Auto-focus στο κατάλληλο κελί ή κουμπί
  useEffect(() => {
    if (isProductActive) {
      const emptyIdx = stepState?.productDigits.findIndex((d) => d === '') ?? 0;
      const targetIdx = emptyIdx >= 0 ? emptyIdx : 0;
      productInputRefs.current[targetIdx]?.focus();
      productInputRefs.current[targetIdx]?.select();
    } else if (isRemainderActive) {
      const emptyIdx = stepState?.remainderDigits.findIndex((d) => d === '') ?? 0;
      const targetIdx = emptyIdx >= 0 ? emptyIdx : 0;
      remainderInputRefs.current[targetIdx]?.focus();
      remainderInputRefs.current[targetIdx]?.select();
    } else if (isBringDownActive) {
      const timer = setTimeout(() => {
        bringDownBtnRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProductActive, isRemainderActive, isBringDownActive, stepIndex]);

  // Χειρισμός πλήκτρων πλοήγησης (auto-tabbing, βέλη, Enter)
  const handleProductKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight' && idx < productLen - 1) {
      productInputRefs.current[idx + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      productInputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'Backspace' && !stepState?.productDigits[idx] && idx > 0) {
      productInputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onValidateProduct();
    }
  };

  const handleRemainderKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight' && idx < remainderLen - 1) {
      remainderInputRefs.current[idx + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      remainderInputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'Backspace' && !stepState?.remainderDigits[idx] && idx > 0) {
      remainderInputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onValidateRemainder();
    }
  };

  // Αν το βήμα δεν περιλαμβάνει αφαίρεση (όπως τα αρχικά μηδενικά στο 0,012 : 5),
  // δεν κατεβαίνουμε σε από κάτω γραμμή (παραμένει μόνο η αγκύλη στον αρχικό διαιρετέο)
  if (!step.hasSubtraction) {
    return null;
  }

  const isZeroQuotient = step.quotientDigit === 0;

  // Αν το ψηφίο πηλίκου είναι 0 και δεν υπάρχει άλλο ψηφίο για κατέβασμα (τελικό βήμα),
  // δεν σχεδιάζουμε περιττή κενή γραμμή
  if (isZeroQuotient && step.broughtDownDigit === null) {
    return null;
  }

  // Στήλες από -1 (πρόσημο πλην) έως totalCols - 1
  const allColIndices: number[] = [];
  for (let c = -1; c < totalCols; c++) {
    allColIndices.push(c);
  }

  return (
    <div className="flex flex-col my-1 font-mono-numbers">
      {/* 1. ΣΕΙΡΑ ΓΙΝΟΜΕΝΟΥ (ΑΦΑΙΡΕΤΕΟΣ) - Παρακάμπτεται όταν το ψηφίο πηλίκου είναι 0 */}
      {!isZeroQuotient && (
        <div className="flex items-center gap-1 h-10">
          {allColIndices.map((col) => {
            // Πρόσημο πλην (−) στην κατάλληλη στήλη (ακριβώς αριστερά του γινομένου)
            if (col === minusCol) {
              return (
                <div
                  key={`prod-minus-${col}`}
                  className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center font-bold text-rose-600 text-lg md:text-xl select-none"
                >
                  −
                </div>
              );
            }

            // Ψηφία Γινομένου
            if (col >= productStartCol && col <= colEnd) {
              const digitIdx = col - productStartCol;
              const isCellCompleted = stepState?.isProductValidated;
              const enteredVal = stepState?.productDigits[digitIdx] || '';
              const cellId = `product-${stepIndex}-${digitIdx}`;

              return (
                <div key={cellId} className="w-8 h-8 md:w-9 md:h-9 shrink-0 relative">
                  {isCellCompleted ? (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg md:text-xl rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      {step.productDigitsStr[digitIdx]}
                    </div>
                  ) : isProductActive ? (
                    <input
                      ref={(el) => {
                        productInputRefs.current[digitIdx] = el;
                      }}
                      id={cellId}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={enteredVal}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(-1);
                        onProductDigitChange(digitIdx, clean);
                        if (clean && digitIdx < productLen - 1) {
                          productInputRefs.current[digitIdx + 1]?.focus();
                        }
                      }}
                      onKeyDown={(e) => handleProductKeyDown(e, digitIdx)}
                      onFocus={() => setFocusedCellId(cellId)}
                      placeholder="·"
                      className="w-full h-full text-center font-bold text-lg md:text-xl rounded-lg bg-white text-indigo-950 border-2 border-indigo-600 focus:outline-hidden focus:ring-3 focus:ring-indigo-300 shadow-sm scroll-m-24"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 rounded-lg bg-slate-50/50 border border-dashed border-slate-200">
                      ·
                    </div>
                  )}
                </div>
              );
            }

            // Κενός χώρος στις υπόλοιπες στήλες
            return <div key={`prod-space-${col}`} className="w-8 h-8 md:w-9 md:h-9 shrink-0" />;
          })}

          {/* Κουμπί ελέγχου γινομένου */}
          {isProductActive && (
            <button
              type="button"
              onClick={onValidateProduct}
              className="ml-2 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs flex items-center gap-1 font-sans shrink-0 cursor-pointer"
              title="Έλεγχος γινομένου (Enter)"
            >
              Έλεγχος <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. ΟΡΙΖΟΝΤΙΑ ΓΡΑΜΜΗ ΑΦΑΙΡΕΣΗΣ - Παρακάμπτεται όταν το ψηφίο πηλίκου είναι 0 */}
      {!isZeroQuotient && (
        <div className="flex items-center gap-1 my-0.5">
          {allColIndices.map((col) => {
            const isLineCol = col >= lineStartCol && col <= colEnd;
            return (
              <div
                key={`line-col-${col}`}
                className="w-8 md:w-9 h-2 shrink-0 relative flex items-center justify-center"
              >
                {isLineCol && (
                  <div className="absolute inset-x-[-2px] h-0.5 bg-slate-700 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. ΣΕΙΡΑ ΥΠΟΛΟΙΠΟΥ & ΚΑΤΕΒΑΣΜΑ ΨΗΦΙΟΥ */}
      <div className="flex items-center gap-1 h-10">
        {allColIndices.map((col) => {
          // Ψηφία Υπολοίπου
          if (col >= remainderStartCol && col <= colEnd) {
            const digitIdx = col - remainderStartCol;
            const isCellCompleted = stepState?.isRemainderValidated;
            const enteredVal = stepState?.remainderDigits[digitIdx] || '';
            const cellId = `remainder-${stepIndex}-${digitIdx}`;

            return (
              <div key={cellId} className="w-8 h-8 md:w-9 md:h-9 shrink-0 relative">
                {isCellCompleted ? (
                  <div className="w-full h-full flex items-center justify-center font-bold text-lg md:text-xl rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300">
                    {step.remainderDigitsStr[digitIdx]}
                  </div>
                ) : isRemainderActive ? (
                  <input
                    ref={(el) => {
                      remainderInputRefs.current[digitIdx] = el;
                    }}
                    id={cellId}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={enteredVal}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(-1);
                      onRemainderDigitChange(digitIdx, clean);
                      if (clean && digitIdx < remainderLen - 1) {
                        remainderInputRefs.current[digitIdx + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => handleRemainderKeyDown(e, digitIdx)}
                    onFocus={() => setFocusedCellId(cellId)}
                    placeholder="·"
                    className="w-full h-full text-center font-bold text-lg md:text-xl rounded-lg bg-white text-indigo-950 border-2 border-indigo-600 focus:outline-hidden focus:ring-3 focus:ring-indigo-300 shadow-sm scroll-m-24"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 rounded-lg bg-slate-50/50 border border-dashed border-slate-200">
                    ·
                  </div>
                )}
              </div>
            );
          }

          // Ψηφίο που κατεβαίνει από το κύριο βήμα (ακριβώς στη στήλη bringDownCol)
          if (col === bringDownCol && step.broughtDownDigit !== null) {
            return (
              <div
                key={`bring-down-cell-${col}`}
                className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center"
              >
                {stepState?.isBroughtDown ? (
                  <BringDownAnimation
                    digit={step.broughtDownDigit}
                    isVirtualZero={step.isBroughtDownZero}
                  />
                ) : isStepBringDownActive ? (
                  <button
                    ref={bringDownBtnRef}
                    type="button"
                    onClick={onTriggerBringDown}
                    className="w-full h-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg shadow-sm animate-pulse transition-all cursor-pointer"
                    title={`Κατέβασε το ψηφίο ${step.isBroughtDownZero ? '0' : step.broughtDownDigit}`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 rounded-lg bg-slate-50/50 border border-dashed border-slate-200">
                    ·
                  </div>
                )}
              </div>
            );
          }

          // Ψηφίο που κατεβαίνει από ενδιάμεσο μηδενικό βήμα (zeroSteps)
          const matchedZeroStep = zeroSteps.find(
            (zs) => zs.columnEndIndex + 1 === col && zs.broughtDownDigit !== null
          );
          if (matchedZeroStep && matchedZeroStep.broughtDownDigit !== null) {
            const isZBroughtDown = allStepStates[matchedZeroStep.stepIndex]?.isBroughtDown;
            const isZActive = activeStepIndex === matchedZeroStep.stepIndex && activeSubStep === 'bring_down';

            return (
              <div
                key={`bring-down-zero-${matchedZeroStep.stepIndex}-${col}`}
                className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center"
              >
                {isZBroughtDown ? (
                  <BringDownAnimation
                    digit={matchedZeroStep.broughtDownDigit}
                    isVirtualZero={matchedZeroStep.isBroughtDownZero}
                  />
                ) : isZActive ? (
                  <button
                    ref={bringDownBtnRef}
                    type="button"
                    onClick={onTriggerBringDown}
                    className="w-full h-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg shadow-sm animate-pulse transition-all cursor-pointer"
                    title={`Κατέβασε το ψηφίο ${matchedZeroStep.isBroughtDownZero ? '0' : matchedZeroStep.broughtDownDigit}`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 rounded-lg bg-slate-50/50 border border-dashed border-slate-200">
                    ·
                  </div>
                )}
              </div>
            );
          }

          // Κενός χώρος στις υπόλοιπες στήλες
          return <div key={`rem-space-${col}`} className="w-8 h-8 md:w-9 md:h-9 shrink-0" />;
        })}

        {/* Κουμπί ελέγχου υπολοίπου */}
        {isRemainderActive && (
          <button
            type="button"
            onClick={onValidateRemainder}
            className="ml-2 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs flex items-center gap-1 font-sans shrink-0 cursor-pointer"
            title="Έλεγχος υπολοίπου (Enter)"
          >
            Έλεγχος <Check className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Επεξηγηματικό κουμπί για κατέβασμα ψηφίου όταν είναι ενεργό από το κύριο βήμα */}
        {isStepBringDownActive && step.broughtDownDigit !== null && (
          <button
            ref={bringDownBtnRef}
            type="button"
            onClick={onTriggerBringDown}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onTriggerBringDown();
              }
            }}
            className="ml-2 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-hidden rounded-lg shadow-sm flex items-center gap-1.5 animate-pulse font-sans shrink-0 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Κατέβασε το {step.isBroughtDownZero ? '0' : step.broughtDownDigit}
          </button>
        )}

        {/* Επεξηγηματικό κουμπί για κατέβασμα ψηφίου όταν είναι ενεργό από ενδιάμεσο μηδενικό */}
        {activeZeroStep && activeZeroStep.broughtDownDigit !== null && (
          <button
            ref={bringDownBtnRef}
            type="button"
            onClick={onTriggerBringDown}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onTriggerBringDown();
              }
            }}
            className="ml-2 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-hidden rounded-lg shadow-sm flex items-center gap-1.5 animate-pulse font-sans shrink-0 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Κατέβασε το {activeZeroStep.isBroughtDownZero ? '0' : activeZeroStep.broughtDownDigit}
          </button>
        )}
      </div>
    </div>
  );
};
