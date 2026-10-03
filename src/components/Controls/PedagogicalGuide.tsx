/**
 * Παιδαγωγικός Οδηγός & Βοηθός Καθοδήγησης
 * Παρέχει σαφείς, ενθαρρυντικές οδηγίες στα Ελληνικά για κάθε υπο-βήμα.
 */

import React from 'react';
import { SubStep, DivisionStep } from '../../types/division';
import { FeedbackState } from '../../hooks/useDivision';
import { Lightbulb, HelpCircle, CheckCircle2, AlertCircle, BookOpen, Wand2, Check } from 'lucide-react';

interface PedagogicalGuideProps {
  currentStep?: DivisionStep;
  activeStepIndex: number;
  totalSteps: number;
  activeSubStep: SubStep;
  feedback: FeedbackState;
  onGiveHint: () => void;
  onToggleMultiples: () => void;
  showMultiples: boolean;
  effectiveDivisor: number;
}

const SUBSTEP_LABELS: Record<SubStep, { name: string; number: number }> = {
  shift_multiplier: { name: 'Επιλογή Πολλαπλασιαστή', number: 0 },
  shift_inputs: { name: 'Μετατροπή Διαιρετέου & Διαιρέτη', number: 0 },
  quotient: { name: 'Ψηφίο Πηλίκου', number: 1 },
  product: { name: 'Πολλαπλασιασμός (Γινόμενο)', number: 2 },
  remainder: { name: 'Αφαίρεση (Υπόλοιπο)', number: 3 },
  bring_down: { name: 'Κατέβασμα Ψηφίου', number: 4 },
  completed: { name: 'Ολοκληρώθηκε!', number: 4 },
};

export const PedagogicalGuide: React.FC<PedagogicalGuideProps> = ({
  currentStep,
  activeStepIndex,
  totalSteps,
  activeSubStep,
  feedback,
  onGiveHint,
  onToggleMultiples,
  showMultiples,
  effectiveDivisor,
}) => {
  const currentSubStepInfo = SUBSTEP_LABELS[activeSubStep];

  return (
    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        {/* Στάδιο & Βήμα */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
              activeSubStep === 'completed' ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}
          >
            {activeSubStep === 'completed' ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              activeStepIndex + 1
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              {activeSubStep === 'completed' ? (
                <>
                  <span>Ολοκληρώθηκαν και τα {totalSteps} βήματα</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700">
                    ✨ Επιτυχής Ολοκλήρωση
                  </span>
                </>
              ) : activeSubStep === 'shift_multiplier' || activeSubStep === 'shift_inputs' ? (
                <>
                  <span className="font-semibold text-indigo-700">Προετοιμασία</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentSubStepInfo.name}</span>
                </>
              ) : (
                <>
                  <span>Βήμα {activeStepIndex + 1} από {totalSteps}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-indigo-700">
                    Μέρος {currentSubStepInfo.number}/4: {currentSubStepInfo.name}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-sm md:text-base font-bold text-slate-900 mt-0.5">
              {activeSubStep === 'shift_multiplier' && 'Επίλεξε με ποιον αριθμό (10, 100, 1.000) πρέπει να πολλαπλασιάσουμε:'}
              {activeSubStep === 'shift_inputs' && 'Υπολόγισε και συμπλήρωσε τον νέο Διαιρετέο και τον νέο Διαιρέτη:'}
              {activeSubStep === 'quotient' && currentStep?.hints.quotientPrompt}
              {activeSubStep === 'product' && currentStep?.hints.productPrompt}
              {activeSubStep === 'remainder' && currentStep?.hints.remainderPrompt}
              {activeSubStep === 'bring_down' && currentStep?.hints.bringDownPrompt}
              {activeSubStep === 'completed' && 'Η διαίρεση ολοκληρώθηκε επιτυχώς!'}
            </h2>
          </div>
        </div>

        {/* Εργαλεία Βοήθειας (Multiples & Hint) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMultiples}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showMultiples
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Εμφάνιση προπαίδειας του διαιρέτη"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Προπαίδεια ({effectiveDivisor})</span>
          </button>

          {activeSubStep !== 'completed' && (
            <button
              type="button"
              onClick={onGiveHint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 rounded-lg transition-all shadow-xs"
              title="Πάρε μια χρήσιμη υπόδειξη ή συμπλήρωσε το τρέχον βήμα"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Βοήθεια / Υπόδειξη</span>
            </button>
          )}
        </div>
      </div>

      {/* Ζωντανή Ανατροφοδότηση (Feedback Message) */}
      <div className="mt-3 flex items-start gap-2.5">
        {feedback.status === 'success' && (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        )}
        {feedback.status === 'error' && (
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
        )}
        {feedback.status === 'hint' && (
          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        )}
        {feedback.status === 'idle' && (
          <HelpCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
        )}

        <div
          className={`text-xs md:text-sm font-medium ${
            feedback.status === 'success'
              ? 'text-emerald-800'
              : feedback.status === 'error'
              ? 'text-rose-800'
              : feedback.status === 'hint'
              ? 'text-amber-800'
              : 'text-slate-700'
          }`}
        >
          {feedback.message}
        </div>
      </div>
    </div>
  );
};
