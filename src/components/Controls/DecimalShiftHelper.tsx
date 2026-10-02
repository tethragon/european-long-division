/**
 * Διαδραστικός Βοηθός Μετατροπής Δεκαδικού Διαιρέτη (Decimal Shift Helper)
 * Επιτρέπει στον μαθητή να βλέπει την αρχική διαίρεση, να επιλέγει τον πολλαπλασιαστή (×10, ×100, ×1000)
 * και να πληκτρολογεί ο ίδιος τον νέο Διαιρετέο και τον νέο Διαιρέτη πριν ξεκινήσει η κάθετη διαίρεση.
 */

import React, { useRef, useEffect, useState } from 'react';
import { ShiftInfo, ShiftUserState, SubStep } from '../../types/division';
import { ArrowRight, Sparkles, Check, HelpCircle, AlertCircle, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DecimalShiftHelperProps {
  shiftInfo: ShiftInfo;
  shiftUserState: ShiftUserState;
  activeSubStep: SubStep;
  onSelectMultiplier: (mult: number) => void;
  onEnteredDividendChange: (val: string) => void;
  onEnteredDivisorChange: (val: string) => void;
  onValidateShift: () => void;
}

export const DecimalShiftHelper: React.FC<DecimalShiftHelperProps> = ({
  shiftInfo,
  shiftUserState,
  activeSubStep,
  onSelectMultiplier,
  onEnteredDividendChange,
  onEnteredDivisorChange,
  onValidateShift,
}) => {
  const dividendInputRef = useRef<HTMLInputElement>(null);
  const divisorInputRef = useRef<HTMLInputElement>(null);
  const customMultiplierInputRef = useRef<HTMLInputElement>(null);

  const [customMultiplierStr, setCustomMultiplierStr] = useState<string>('');

  // Αυτόματο focus στο input του νέου διαιρετέου
  useEffect(() => {
    if (activeSubStep === 'shift_inputs') {
      dividendInputRef.current?.focus();
    }
  }, [activeSubStep]);

  const decimalCount = Math.round(Math.log10(shiftInfo.shiftMultiplier));
  const isShiftMode = activeSubStep === 'shift_multiplier' || activeSubStep === 'shift_inputs';
  const hasMoreThanThreeDecimals = decimalCount > 3 || shiftInfo.shiftMultiplier > 1000;

  // Υποβολή πληκτρολογημένου πολλαπλασιαστή (αποδοχή με ή χωρίς τελεία χιλιάδων)
  const handleCustomMultiplierSubmit = () => {
    const clean = customMultiplierStr
      .trim()
      .replace(/\s+/g, '')
      .replace(/\./g, '') // Αποδοχή τελείας χιλιάδων (π.χ. 10.000 -> 10000)
      .replace(/,/g, '')
      .replace(/×/g, '');
    const multNum = parseInt(clean, 10);
    if (!isNaN(multNum) && multNum > 0) {
      onSelectMultiplier(multNum);
    }
  };

  return (
    <div className="w-full bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-4 md:p-5 mb-5 shadow-xs">
      {/* 1. ΕΜΦΑΝΙΣΗ ΑΡΧΙΚΗΣ ΔΙΑΙΡΕΣΗΣ & ΜΕΤΑΤΡΟΠΗΣ (Πάντα ορατή) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200/70">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Αρχική Διαίρεση:
          </span>
          <span className="font-mono-numbers text-base md:text-lg font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
            {shiftInfo.originalDividend} : {shiftInfo.originalDivisor}
          </span>
        </div>

        {/* Βέλος μετατροπής & νέες τιμές */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
            <span>Πολλαπλασιασμός</span>
            <span className="font-mono-numbers">× {shiftInfo.shiftMultiplier}</span>
          </div>

          <ArrowRight className="w-4 h-4 text-indigo-500 hidden sm:inline shrink-0" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
              Νέα Διαίρεση:
            </span>
            <span className="font-mono-numbers text-base md:text-lg font-bold text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs">
              {shiftUserState.isShiftValidated
                ? `${shiftInfo.shiftedDividend} : ${shiftInfo.shiftedDivisor}`
                : '? : ?'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ΔΙΑΔΡΑΣΤΙΚΟ ΣΤΑΔΙΟ ΜΕΤΑΤΡΟΠΗΣ (Όταν ο μαθητής βρίσκεται στο βήμα 0) */}
      <AnimatePresence mode="wait">
        {activeSubStep === 'shift_multiplier' && (
          <motion.div
            key="stage-multiplier"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="pt-3.5 flex flex-col gap-3"
          >
            <div className="text-xs md:text-sm text-slate-700">
              <span className="font-bold text-indigo-950">Βήμα 1ο: </span>
              Ο διαιρέτης <strong className="font-mono-numbers text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200">{shiftInfo.originalDivisor}</strong> έχει{' '}
              <strong>{decimalCount} δεκαδικό{decimalCount > 1 ? 'α' : 'ο'} ψηφί{decimalCount > 1 ? 'α' : 'ο'}</strong>.
              Για να γίνει ακέραιος, με τι πρέπει να πολλαπλασιάσουμε και τους δύο αριθμούς;
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {[10, 100, 1000].map((mult) => (
                <button
                  key={`mult-btn-${mult}`}
                  type="button"
                  onClick={() => onSelectMultiplier(mult)}
                  className="px-4 py-2 text-sm font-mono-numbers font-bold text-indigo-900 bg-white hover:bg-indigo-600 hover:text-white border-2 border-indigo-300 hover:border-indigo-600 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  × {mult.toLocaleString('el-GR')}
                </button>
              ))}

              {/* Πλαίσιο Ελεύθερης Πληκτρολόγησης αν ο διαιρέτης έχει > 3 δεκαδικά ψηφία */}
              {hasMoreThanThreeDecimals && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">ή</span>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCustomMultiplierSubmit();
                    }}
                    className="flex items-center gap-1.5 bg-white pl-3 pr-1.5 py-1 rounded-xl border-2 border-indigo-500 focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-300 shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-1 text-indigo-700">
                      <PenLine className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="text-sm font-bold font-mono-numbers">×</span>
                    </div>

                    <input
                      ref={customMultiplierInputRef}
                      type="text"
                      value={customMultiplierStr}
                      onChange={(e) => setCustomMultiplierStr(e.target.value)}
                      placeholder="π.χ. 10.000"
                      title="Πληκτρολόγησε τον πολλαπλασιαστή (με ή χωρίς τελεία χιλιάδων)"
                      className="w-28 text-sm font-mono-numbers font-bold text-indigo-950 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal"
                    />

                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Έλεγχος</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubStep === 'shift_inputs' && (
          <motion.div
            key="stage-inputs"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="pt-3.5 flex flex-col gap-3"
          >
            <div className="text-xs md:text-sm text-slate-700">
              <span className="font-bold text-indigo-950">Βήμα 2ο: </span>
              Σωστά! Πολλαπλασιάζουμε με το <strong>× {shiftUserState.selectedMultiplier}</strong> (μετακίνηση υποδιαστολής κατά {decimalCount} θέση προς τα δεξιά).
              Πληκτρολόγησε τον νέο Διαιρετέο και τον νέο Διαιρέτη για να τοποθετηθούν στα κελιά:
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onValidateShift();
              }}
              className="flex items-center gap-3 flex-wrap"
            >
              {/* Είσοδος Νέου Διαιρετέου */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-indigo-300 shadow-xs">
                <span className="text-xs font-bold text-slate-600">
                  {shiftInfo.originalDividend} × {shiftUserState.selectedMultiplier} =
                </span>
                <input
                  ref={dividendInputRef}
                  type="text"
                  value={shiftUserState.enteredDividend}
                  onChange={(e) => onEnteredDividendChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      divisorInputRef.current?.focus();
                    }
                  }}
                  placeholder={shiftInfo.shiftedDividend}
                  className="w-24 text-center font-mono-numbers font-bold text-base text-indigo-950 focus:outline-hidden"
                />
              </div>

              {/* Είσοδος Νέου Διαιρέτη */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-indigo-300 shadow-xs">
                <span className="text-xs font-bold text-slate-600">
                  {shiftInfo.originalDivisor} × {shiftUserState.selectedMultiplier} =
                </span>
                <input
                  ref={divisorInputRef}
                  type="text"
                  value={shiftUserState.enteredDivisor}
                  onChange={(e) => onEnteredDivisorChange(e.target.value)}
                  placeholder={shiftInfo.shiftedDivisor}
                  className="w-20 text-center font-mono-numbers font-bold text-base text-indigo-950 focus:outline-hidden"
                />
              </div>

              {/* Κουμπί Επιβεβαίωσης & Έναρξης */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onValidateShift();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Τοποθέτηση & Έναρξη</span>
                <Check className="w-3.5 h-3.5" />
              </button>

              {/* Κουμπί Αυτόματης Συμπλήρωσης */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onEnteredDividendChange(shiftInfo.shiftedDividend);
                  onEnteredDivisorChange(shiftInfo.shiftedDivisor);
                }}
                className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-100/80 hover:bg-indigo-200/90 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Αυτόματη συμπλήρωση των υπολογισμών"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Αυτόματη Συμπλήρωση</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
