/**
 * React Hook για τη διαχείριση της ροής και της κατάστασης της κάθετης διαίρεσης
 * Υποστηρίζει έλεγχο βήμα-βήμα, αυτόματη πλοήγηση (auto-tabbing), μετατόπιση υποδιαστολής
 * και παιδαγωγική καθοδήγηση για μαθητές ΣΤ' Δημοτικού.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { DivisionProblem, DivisionStep, SubStep, UserInputStepState, DifficultyLevel, ShiftUserState } from '../types/division';
import { solveDivision, generateRandomProblem, validateAndNormalizeNumber } from '../engine/divisionEngine';

export interface FeedbackState {
  status: 'idle' | 'success' | 'error' | 'hint';
  message: string;
  errorCount: number;
}

export interface GameModeInfo {
  isActive: boolean;
  isLastProblem?: boolean;
}

export function useDivision(initialDividend?: string, initialDivisor?: string) {
  const [level, setLevel] = useState<DifficultyLevel>('easy');

  // Αρχική διαίρεση: αν δεν δοθεί ρητά, παράγουμε αμέσως τυχαία άσκηση του επιπέδου 'easy'
  const initialData = useMemo(() => {
    if (initialDividend && initialDivisor) {
      return { dividend: initialDividend, divisor: initialDivisor };
    }
    return generateRandomProblem('easy', 0);
  }, []);

  const [dividendInput, setDividendInput] = useState<string>(initialData.dividend);
  const [divisorInput, setDivisorInput] = useState<string>(initialData.divisor);
  
  // Βαθμίδα δυσκολίας ανά επίπεδο (0: Βασικό, 1: Μεσαίο, 2: Προχωρημένο)
  const [currentTier, setCurrentTier] = useState<number>(0);
  const tierByLevelRef = useRef<Record<string, number>>({});

  // Μετρητής λαθών & υποδείξεων για την τρέχουσα άσκηση (για mastery level-up)
  const [sessionMistakes, setSessionMistakes] = useState<number>(0);
  const sessionMistakesRef = useRef<number>(0);

  // Πληροφορίες Game Mode για προσαρμογή των μηνυμάτων ολοκλήρωσης
  const gameModeInfoRef = useRef<GameModeInfo>({ isActive: false, isLastProblem: false });
  const setGameModeInfo = useCallback((info: GameModeInfo) => {
    gameModeInfoRef.current = info;
  }, []);

  const registerMistake = useCallback(() => {
    sessionMistakesRef.current += 1;
    setSessionMistakes(sessionMistakesRef.current);
  }, []);

  // Προ-υπολογισμένη λύση από τη μηχανή
  const [problem, setProblem] = useState<DivisionProblem>(() => 
    solveDivision(initialData.dividend, initialData.divisor)
  );

  // Κατάσταση μετατόπισης υποδιαστολής αν ο διαιρέτης είναι δεκαδικός
  const [shiftUserState, setShiftUserState] = useState<ShiftUserState>(() => ({
    selectedMultiplier: null,
    enteredDividend: '',
    enteredDivisor: '',
    isMultiplierValidated: false,
    isShiftValidated: !problem.shiftInfo.wasShifted,
  }));

  // Τρέχον βήμα και υπο-βήμα
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeSubStep, setActiveSubStep] = useState<SubStep>(() => 
    problem.shiftInfo.wasShifted ? 'shift_multiplier' : 'quotient'
  );
  
  // Κατάσταση εισόδων του χρήστη για κάθε βήμα
  const [stepStates, setStepStates] = useState<UserInputStepState[]>(() => {
    return problem.steps.map(() => ({
      quotientDigit: '',
      productDigits: [],
      remainderDigits: [],
      isQuotientValidated: false,
      isProductValidated: false,
      isRemainderValidated: false,
      isBroughtDown: false,
    }));
  });

  // Ανατροφοδότηση (Feedback) & Hints
  const [feedback, setFeedback] = useState<FeedbackState>(() => ({
    status: 'idle',
    message: problem.shiftInfo.wasShifted 
      ? 'Πρώτο Βήμα: Ο διαιρέτης είναι δεκαδικός. Με ποιον αριθμό πρέπει να πολλαπλασιάσουμε για να γίνει ακέραιος;'
      : 'Ξεκίνα βρίσκοντας το πρώτο ψηφίο του πηλίκου!',
    errorCount: 0,
  }));

  // Ενεργό κελί για focus
  const [focusedCellId, setFocusedCellId] = useState<string | null>('quotient-0');

  // Multiples table toggle (βοηθητικό πρόχειρο προπαίδειας διαιρέτη)
  const [showMultiplesHelper, setShowMultiplesHelper] = useState<boolean>(false);

  // Επανεκκίνηση καταστάσεων όταν αλλάζει το πρόβλημα
  const initStepStates = useCallback((prob: DivisionProblem) => {
    return prob.steps.map((step) => {
      const prodLen = step.productDigitsStr.length;
      const remLen = step.remainderDigitsStr.length;
      return {
        quotientDigit: '',
        productDigits: new Array(prodLen).fill(''),
        remainderDigits: new Array(remLen).fill(''),
        isQuotientValidated: false,
        isProductValidated: false,
        isRemainderValidated: false,
        isBroughtDown: false,
      };
    });
  }, []);

  // Φόρτωση νέου προβλήματος
  const loadProblem = useCallback((dividend: string, divisor: string) => {
    try {
      const newProblem = solveDivision(dividend, divisor);
      setProblem(newProblem);
      setDividendInput(dividend);
      setDivisorInput(divisor);
      setActiveStepIndex(0);
      setStepStates(initStepStates(newProblem));

      // Επαναφορά μετρητή λαθών για το νέο πρόβλημα
      sessionMistakesRef.current = 0;
      setSessionMistakes(0);

      if (newProblem.shiftInfo.wasShifted) {
        setActiveSubStep('shift_multiplier');
        setShiftUserState({
          selectedMultiplier: null,
          enteredDividend: '',
          enteredDivisor: '',
          isMultiplierValidated: false,
          isShiftValidated: false,
        });
        setFeedback({
          status: 'idle',
          message: `Ο διαιρέτης (${newProblem.shiftInfo.originalDivisor}) είναι δεκαδικός. Με τι πρέπει να πολλαπλασιάσουμε για να γίνει ακέραιος;`,
          errorCount: 0,
        });
      } else {
        setActiveSubStep('quotient');
        setShiftUserState({
          selectedMultiplier: null,
          enteredDividend: '',
          enteredDivisor: '',
          isMultiplierValidated: true,
          isShiftValidated: true,
        });
        setFeedback({
          status: 'idle',
          message: 'Βρες πόσες φορές χωράει ο διαιρέτης στο πρώτο τμήμα.',
          errorCount: 0,
        });
        setFocusedCellId('quotient-0');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Σφάλμα κατά τον υπολογισμό.';
      setFeedback({
        status: 'error',
        message: errorMsg,
        errorCount: 1,
      });
    }
  }, [initStepStates]);

  // Επιλογή επιπέδου και δημιουργία τυχαίας άσκησης με Mastery Level-Up:
  // Αν η τρέχουσα άσκηση ολοκληρώθηκε χωρίς λάθη (sessionMistakes === 0), ανεβαίνουμε βαθμίδα!
  // Αν έγιναν λάθη ή δεν ολοκληρώθηκε, παραμένουμε στην ίδια βαθμίδα με νέα άσκηση.
  const selectLevelAndGenerate = useCallback((targetLevel: DifficultyLevel) => {
    const isCompletedNow = activeSubStep === 'completed';
    const wasFlawless = isCompletedNow && sessionMistakesRef.current === 0;

    let targetTier = tierByLevelRef.current[targetLevel] ?? 0;

    if (targetLevel === level && wasFlawless) {
      if (targetTier < 2) {
        targetTier += 1;
        tierByLevelRef.current[targetLevel] = targetTier;
      }
    }

    setCurrentTier(targetTier);
    setLevel(targetLevel);

    if (targetLevel !== 'custom') {
      const { dividend, divisor } = generateRandomProblem(targetLevel, targetTier);
      loadProblem(dividend, divisor);
    }
  }, [activeSubStep, level, loadProblem]);

  // Επαναφορά της τρέχουσας άσκησης από την αρχή
  const restartCurrent = useCallback(() => {
    setActiveStepIndex(0);
    setStepStates(initStepStates(problem));
    sessionMistakesRef.current = 0;
    setSessionMistakes(0);

    if (problem.shiftInfo.wasShifted) {
      setActiveSubStep('shift_multiplier');
      setShiftUserState({
        selectedMultiplier: null,
        enteredDividend: '',
        enteredDivisor: '',
        isMultiplierValidated: false,
        isShiftValidated: false,
      });
      setFeedback({
        status: 'idle',
        message: 'Η άσκηση επανεκκινήθηκε. Ξεκίνα με τη μετατροπή του διαιρέτη σε ακέραιο!',
        errorCount: 0,
      });
    } else {
      setActiveSubStep('quotient');
      setShiftUserState({
        selectedMultiplier: null,
        enteredDividend: '',
        enteredDivisor: '',
        isMultiplierValidated: true,
        isShiftValidated: true,
      });
      setFeedback({
        status: 'idle',
        message: 'Η άσκηση επανεκκινήθηκε. Καλή επιτυχία!',
        errorCount: 0,
      });
      setFocusedCellId('quotient-0');
    }
  }, [problem, initStepStates]);

  // =========================================================================
  // ΕΝΕΡΓΕΙΕΣ ΜΕΤΑΤΟΠΙΣΗΣ ΥΠΟΔΙΑΣΤΟΛΗΣ (SHIFT STEP)
  // =========================================================================

  // 1. Επιλογή πολλαπλασιαστή (×10, ×100, ×1000)
  const selectShiftMultiplier = useCallback((multiplier: number) => {
    if (multiplier === problem.shiftInfo.shiftMultiplier) {
      setShiftUserState(prev => ({
        ...prev,
        selectedMultiplier: multiplier,
        isMultiplierValidated: true,
      }));
      setActiveSubStep('shift_inputs');
      setFeedback({
        status: 'success',
        message: `Μπράβο! Αφού ο διαιρέτης (${problem.shiftInfo.originalDivisor}) έχει ${problem.shiftInfo.shiftMultiplier === 10 ? '1 δεκαδικό ψηφίο' : `${Math.round(Math.log10(problem.shiftInfo.shiftMultiplier))} δεκαδικά ψηφία`}, πολλαπλασιάζουμε και τους δύο αριθμούς με το ${multiplier.toLocaleString('el-GR')}. Τώρα γράψε τον νέο Διαιρετέο και τον νέο Διαιρέτη!`,
        errorCount: 0,
      });
    } else {
      const decimals = Math.round(Math.log10(problem.shiftInfo.shiftMultiplier));
      const requiredStr = problem.shiftInfo.shiftMultiplier.toLocaleString('el-GR');

      if (multiplier > problem.shiftInfo.shiftMultiplier) {
        // Εκδοχή 2: Επιλογή μεγαλύτερου πολλαπλασίου από το απαραίτητο
        registerMistake();
        setFeedback(prev => ({
          ...prev,
          status: 'error',
          message: `Περισσότερο από όσο χρειάζεται! Ο διαιρέτης (${problem.shiftInfo.originalDivisor}) έχει ${
            decimals === 1 ? 'μόνο 1 δεκαδικό ψηφίο' : `${decimals} δεκαδικά ψηφία`
          }, άρα αρκεί το × ${requiredStr}. Επιλέγουμε πάντα το μικρότερο απαραίτητο πολλαπλάσιο για ευκολότερους υπολογισμούς.`,
          errorCount: prev.errorCount + 1,
        }));
      } else {
        // Επιλογή μικρότερου πολλαπλασίου
        registerMistake();
        setFeedback(prev => ({
          ...prev,
          status: 'error',
          message: `Δεν είναι αρκετό: ο διαιρέτης (${problem.shiftInfo.originalDivisor}) παραμένει δεκαδικός. Έχει ${
            decimals === 1 ? '1 δεκαδικό ψηφίο' : `${decimals} δεκαδικά ψηφία`
          }, επομένως χρειαζόμαστε πολλαπλασιασμό με το × ${requiredStr} για να γίνει ακέραιος.`,
          errorCount: prev.errorCount + 1,
        }));
      }
    }
  }, [problem.shiftInfo, registerMistake]);

  // 2. Ενημέρωση πληκτρολογημένου νέου διαιρετέου
  const setEnteredShiftDividend = useCallback((val: string) => {
    setShiftUserState(prev => ({ ...prev, enteredDividend: val }));
  }, []);

  // 3. Ενημέρωση πληκτρολογημένου νέου διαιρέτη
  const setEnteredShiftDivisor = useCallback((val: string) => {
    setShiftUserState(prev => ({ ...prev, enteredDivisor: val }));
  }, []);

  // Βοηθητική σύγκριση δεκαδικών τιμών (ανοχή σε κόμμα/τελεία, κενά και δεκαδικά μηδενικά)
  const compareDecimalStrings = (input: string, expected: string): boolean => {
    const cleanInput = input.trim().replace(/\s+/g, '').replace(/\./g, ',');
    const cleanExpected = expected.trim().replace(/\s+/g, '').replace(/\./g, ',');
    if (cleanInput === cleanExpected) return true;

    const validIn = validateAndNormalizeNumber(cleanInput);
    const validExp = validateAndNormalizeNumber(cleanExpected);
    if (validIn.isValid && validExp.isValid) {
      return Math.abs(validIn.numValue - validExp.numValue) < 1e-6;
    }
    return false;
  };

  // 4. Επικύρωση νέου διαιρετέου & νέου διαιρέτη
  const validateShiftInputs = useCallback(() => {
    const enteredDiv = shiftUserState.enteredDividend.trim();
    const enteredDis = shiftUserState.enteredDivisor.trim();

    const expectedDiv = problem.shiftInfo.shiftedDividend;
    const expectedDis = problem.shiftInfo.shiftedDivisor;

    // Αν ο μαθητής πάτησε απευθείας "Τοποθέτηση & Έναρξη" χωρίς να γράψει:
    // Τοποθετούμε αυτόματα τις σωστές τιμές και ξεκινάμε τη διαίρεση χωρίς να μπλοκάρει!
    if (!enteredDiv && !enteredDis) {
      registerMistake();
      setShiftUserState(prev => ({
        ...prev,
        enteredDividend: expectedDiv,
        enteredDivisor: expectedDis,
        isShiftValidated: true,
      }));
      setActiveSubStep('quotient');
      setFeedback({
        status: 'success',
        message: `Υπολογίστηκαν και τοποθετήθηκαν: Διαιρετέος ${expectedDiv} και Διαιρέτης ${expectedDis}. Ξεκινάμε την κάθετη διαίρεση!`,
        errorCount: 0,
      });
      setFocusedCellId('quotient-0');
      return;
    }

    // Αν συμπλήρωσε μόνο το ένα από τα δύο
    if (!enteredDiv || !enteredDis) {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: !enteredDiv 
          ? `Συμπλήρωσε και τον νέο Διαιρετέο (${problem.shiftInfo.originalDividend} × ${problem.shiftInfo.shiftMultiplier}).`
          : `Συμπλήρωσε και τον νέο Διαιρέτη (${problem.shiftInfo.originalDivisor} × ${problem.shiftInfo.shiftMultiplier}).`,
        errorCount: prev.errorCount + 1,
      }));
      return;
    }

    const isDivCorrect = compareDecimalStrings(enteredDiv, expectedDiv);
    const isDisCorrect = compareDecimalStrings(enteredDis, expectedDis);

    if (isDivCorrect && isDisCorrect) {
      setShiftUserState(prev => ({
        ...prev,
        enteredDividend: expectedDiv,
        enteredDivisor: expectedDis,
        isShiftValidated: true,
      }));
      setActiveSubStep('quotient');
      setFeedback({
        status: 'success',
        message: `Εξαιρετικά! Ο νέος διαιρετέος είναι ${expectedDiv} και ο νέος διαιρέτης είναι ${expectedDis}. Τώρα ξεκινάμε κανονικά την κάθετη διαίρεση!`,
        errorCount: 0,
      });
      setFocusedCellId('quotient-0');
    } else if (!isDivCorrect && !isDisCorrect) {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: `Έλεγξε και τους δύο πολλαπλασιασμούς: μετακίνησε την υποδιαστολή κατά ${Math.log10(problem.shiftInfo.shiftMultiplier)} θέσεις δεξιά.`,
        errorCount: prev.errorCount + 1,
      }));
    } else if (!isDivCorrect) {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: `Ο διαιρέτης είναι σωστός, αλλά έλεγξε τον διαιρετέο: ${problem.shiftInfo.originalDividend} × ${problem.shiftInfo.shiftMultiplier} = ${expectedDiv}.`,
        errorCount: prev.errorCount + 1,
      }));
    } else {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: `Ο διαιρετέος είναι σωστός, αλλά έλεγξε τον διαιρέτη: ${problem.shiftInfo.originalDivisor} × ${problem.shiftInfo.shiftMultiplier} = ${expectedDis}.`,
        errorCount: prev.errorCount + 1,
      }));
    }
  }, [shiftUserState, problem.shiftInfo, registerMistake]);

  // =========================================================================
  // ΕΝΕΡΓΕΙΕΣ ΚΑΘΕΤΗΣ ΔΙΑΙΡΕΣΗΣ (STEP BY STEP)
  // =========================================================================

  const currentStep = problem.steps[activeStepIndex] as DivisionStep | undefined;
  const isCompleted = activeSubStep === 'completed' || activeStepIndex >= problem.steps.length;

  // Ενημέρωση ψηφίου πηλίκου
  const setQuotientDigit = useCallback((val: string) => {
    if (!currentStep) return;
    const clean = val.replace(/\D/g, '').slice(-1); // Μόνο ένα ψηφίο
    setStepStates(prev => {
      const next = [...prev];
      if (next[activeStepIndex]) {
        next[activeStepIndex] = { ...next[activeStepIndex], quotientDigit: clean };
      }
      return next;
    });
  }, [currentStep, activeStepIndex]);

  // Ενημέρωση ψηφίου γινομένου
  const setProductDigit = useCallback((index: number, val: string) => {
    if (!currentStep) return;
    const clean = val.replace(/\D/g, '').slice(-1);
    setStepStates(prev => {
      const next = [...prev];
      if (next[activeStepIndex]) {
        const prod = [...next[activeStepIndex].productDigits];
        prod[index] = clean;
        next[activeStepIndex] = { ...next[activeStepIndex], productDigits: prod };
      }
      return next;
    });
  }, [currentStep, activeStepIndex]);

  // Ενημέρωση ψηφίου υπολοίπου
  const setRemainderDigit = useCallback((index: number, val: string) => {
    if (!currentStep) return;
    const clean = val.replace(/\D/g, '').slice(-1);
    setStepStates(prev => {
      const next = [...prev];
      if (next[activeStepIndex]) {
        const rem = [...next[activeStepIndex].remainderDigits];
        rem[index] = clean;
        next[activeStepIndex] = { ...next[activeStepIndex], remainderDigits: rem };
      }
      return next;
    });
  }, [currentStep, activeStepIndex]);

  // 1. Επικύρωση Ψηφίου Πηλίκου
  const validateQuotient = useCallback(() => {
    if (!currentStep) return;
    const currentInput = stepStates[activeStepIndex]?.quotientDigit;
    if (!currentInput) {
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: 'Πληκτρολόγησε ένα ψηφίο για το πηλίκο.',
        errorCount: prev.errorCount + 1,
      }));
      return;
    }

    const expectedDigit = currentStep.quotientDigit.toString();
    if (currentInput === expectedDigit) {
      setStepStates(prev => {
        const next = [...prev];
        next[activeStepIndex] = { ...next[activeStepIndex], isQuotientValidated: true };
        return next;
      });
      setActiveSubStep('product');
      setFeedback({
        status: 'success',
        message: `Μπράβο! Σωστά, χωράει ${expectedDigit} φορές. Τώρα γράψε το γινόμενο ${expectedDigit} × ${problem.effectiveDivisor}.`,
        errorCount: 0,
      });
      setFocusedCellId(`product-${activeStepIndex}-0`);
    } else {
      registerMistake();
      const inputNum = parseInt(currentInput, 10);
      const isTooBig = inputNum * problem.effectiveDivisor > currentStep.currentChunk;
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: isTooBig 
          ? `Το ${currentInput} είναι πολύ μεγάλο (${currentInput} × ${problem.effectiveDivisor} = ${inputNum * problem.effectiveDivisor} > ${currentStep.currentChunk}). Δοκίμασε μικρότερο ψηφίο.`
          : `Όχι ακριβώς. Δες πόσες φορές χωράει το ${problem.effectiveDivisor} στο ${currentStep.currentChunk}.`,
        errorCount: prev.errorCount + 1,
      }));
    }
  }, [currentStep, stepStates, activeStepIndex, problem.effectiveDivisor, registerMistake]);

  // 2. Επικύρωση Γινομένου
  const validateProduct = useCallback(() => {
    if (!currentStep) return;
    const currentDigits = stepStates[activeStepIndex]?.productDigits || [];
    const enteredProduct = currentDigits.join('');
    const expectedProduct = currentStep.productDigitsStr;

    if (enteredProduct.length < expectedProduct.length) {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: `Συμπλήρωσε όλα τα ψηφία του γινομένου (${expectedProduct.length} ψηφί${expectedProduct.length > 1 ? 'α' : 'ο'}).`,
        errorCount: prev.errorCount + 1,
      }));
      return;
    }

    if (enteredProduct === expectedProduct) {
      setStepStates(prev => {
        const next = [...prev];
        next[activeStepIndex] = { ...next[activeStepIndex], isProductValidated: true };
        return next;
      });
      setActiveSubStep('remainder');
      setFeedback({
        status: 'success',
        message: `Πολύ ωραία! Τώρα εκτέλεσε την αφαίρεση: ${currentStep.currentChunk} - ${currentStep.product} = ;`,
        errorCount: 0,
      });
      setFocusedCellId(`remainder-${activeStepIndex}-0`);
    } else {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: `Έλεγξε τον πολλαπλασιασμό: ${currentStep.quotientDigit} × ${problem.effectiveDivisor} = ${currentStep.product}.`,
        errorCount: prev.errorCount + 1,
      }));
    }
  }, [currentStep, stepStates, activeStepIndex, problem.effectiveDivisor, registerMistake]);

  // 3. Επικύρωση Υπολοίπου
  const validateRemainder = useCallback(() => {
    if (!currentStep) return;
    const currentDigits = stepStates[activeStepIndex]?.remainderDigits || [];
    const enteredRemainder = currentDigits.join('');
    const expectedRemainder = currentStep.remainderDigitsStr;

    if (enteredRemainder.length < expectedRemainder.length) {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: 'Συμπλήρωσε όλα τα ψηφία του υπολοίπου.',
        errorCount: prev.errorCount + 1,
      }));
      return;
    }

    if (enteredRemainder === expectedRemainder) {
      setStepStates(prev => {
        const next = [...prev];
        next[activeStepIndex] = { ...next[activeStepIndex], isRemainderValidated: true };
        return next;
      });

      if (currentStep.broughtDownDigit !== null) {
        setActiveSubStep('bring_down');
        setFeedback({
          status: 'success',
          message: currentStep.isBroughtDownZero
            ? `Σωστό υπόλοιπο (${expectedRemainder})! Πάτα "Κατέβασε ψηφίο" για να κατέβει το 0 και να συνεχιστεί η διαίρεση.`
            : `Σωστό υπόλοιπο (${expectedRemainder})! Πάτα "Κατέβασε ψηφίο" για να κατέβει το ${currentStep.broughtDownDigit}.`,
          errorCount: 0,
        });
      } else {
        setActiveSubStep('completed');
        const mistakes = sessionMistakesRef.current;
        const isFlawless = mistakes === 0;
        const isGame = gameModeInfoRef.current.isActive;
        const isLastGameProb = !!gameModeInfoRef.current.isLastProblem;

        let completionMsg = '';
        if (problem.isExact) {
          completionMsg = `Συγχαρητήρια! Η διαίρεση ολοκληρώθηκε τέλεια με πηλίκο ${problem.quotientStr} και υπόλοιπο 0!`;
        } else if (problem.maxDecimalReached || problem.quotientStr.includes(',')) {
          completionMsg = `Μπράβο! Η διαίρεση δεν τελειώνει (περιοδική) — ολοκληρώθηκε με προσέγγιση 3 δεκαδικών: πηλίκο ≈ ${problem.quotientStr}!`;
        } else {
          completionMsg = `Συγχαρητήρια! Η διαίρεση ολοκληρώθηκε με πηλίκο ${problem.quotientStr} και υπόλοιπο ${problem.finalRemainder}!`;
        }

        const mistakeWord = mistakes === 1 ? 'διόρθωση' : 'διορθώσεις';
        const verb = mistakes === 1 ? 'Έγινε' : 'Έγιναν';

        if (isGame) {
          if (isFlawless) {
            completionMsg += isLastGameProb
              ? ` 🌟 Άριστα, κανένα λάθος (100%)! Πάτα «Δες τα Τελικά Αποτελέσματα» (ή πάτα Enter)!`
              : ` 🌟 Άριστα, κανένα λάθος (100%)! Πάτα «Επόμενη Άσκηση» (ή πάτα Enter) για να συνεχίσεις!`;
          } else {
            completionMsg += isLastGameProb
              ? ` (${verb} ${mistakes} ${mistakeWord}. Πάτα «Δες τα Τελικά Αποτελέσματα» για να ολοκληρώσεις το παιχνίδι).`
              : ` (${verb} ${mistakes} ${mistakeWord}. Πάτα «Επόμενη Άσκηση» (ή πάτα Enter) για να συνεχίσεις το παιχνίδι).`;
          }
        } else if (level !== 'custom') {
          if (isFlawless) {
            if (currentTier < 2) {
              completionMsg += ` 🌟 Άριστα, κανένα λάθος! Πατώντας «Νέα Άσκηση» ξεκλειδώνεις τη Βαθμίδα ${currentTier + 2} (${'⭐'.repeat(currentTier + 2)})!`;
            } else {
              completionMsg += ` 🏆 Άριστα! Κατέκτησες και την 3η Βαθμίδα (⭐⭐⭐) χωρίς κανένα λάθος!`;
            }
          } else {
            completionMsg += ` (${verb} ${mistakes} ${mistakeWord}. Λύσε την επόμενη άσκηση χωρίς λάθη για να ανέβεις βαθμίδα).`;
          }
        }

        setFeedback({
          status: 'success',
          message: completionMsg,
          errorCount: 0,
        });
      }
    } else {
      registerMistake();
      setFeedback(prev => ({
        ...prev,
        status: 'error',
        message: `Έλεγξε την αφαίρεση: ${currentStep.currentChunk} - ${currentStep.product} = ${currentStep.remainder}.`,
        errorCount: prev.errorCount + 1,
      }));
    }
  }, [currentStep, stepStates, activeStepIndex, problem, currentTier, level, registerMistake]);

  // 4. Κατέβασμα Ψηφίου & Μετάβαση στο επόμενο βήμα
  const completeBringDown = useCallback(() => {
    if (!currentStep || currentStep.broughtDownDigit === null) return;

    setStepStates(prev => {
      const next = [...prev];
      next[activeStepIndex] = { ...next[activeStepIndex], isBroughtDown: true };
      return next;
    });

    const nextIndex = activeStepIndex + 1;
    if (nextIndex < problem.steps.length) {
      setActiveStepIndex(nextIndex);
      setActiveSubStep('quotient');
      const nextStepObj = problem.steps[nextIndex];
      setFeedback({
        status: 'idle',
        message: `Το ψηφίο κατέβηκε! Νέο τμήμα προς διαίρεση: ${nextStepObj.currentChunk}. Πόσες φορές χωράει το ${problem.effectiveDivisor};`,
        errorCount: 0,
      });
      setFocusedCellId(`quotient-${nextIndex}`);
    } else {
      setActiveSubStep('completed');
    }
  }, [currentStep, activeStepIndex, problem]);

  // Υπόδειξη / Αυτόματη συμπλήρωση τρέχοντος υπο-βήματος
  const giveHintOrAutoFill = useCallback(() => {
    if (isCompleted) return;

    // Η χρήση υπόδειξης καταγράφεται ως βοήθεια (δεν μετράει ως άριστη επίλυση χωρίς βοήθεια)
    registerMistake();

    if (activeSubStep === 'shift_multiplier') {
      selectShiftMultiplier(problem.shiftInfo.shiftMultiplier);
      return;
    }

    if (activeSubStep === 'shift_inputs') {
      setShiftUserState(prev => ({
        ...prev,
        enteredDividend: problem.shiftInfo.shiftedDividend,
        enteredDivisor: problem.shiftInfo.shiftedDivisor,
      }));
      setFeedback({
        status: 'hint',
        message: `Υπόδειξη: ${problem.shiftInfo.originalDividend} × ${problem.shiftInfo.shiftMultiplier} = ${problem.shiftInfo.shiftedDividend} και ${problem.shiftInfo.originalDivisor} × ${problem.shiftInfo.shiftMultiplier} = ${problem.shiftInfo.shiftedDivisor}. Πάτα "Έλεγχος"!`,
        errorCount: 0,
      });
      return;
    }

    if (!currentStep) return;

    if (activeSubStep === 'quotient') {
      const qDigit = currentStep.quotientDigit.toString();
      setQuotientDigit(qDigit);
      setFeedback({
        status: 'hint',
        message: `Υπόδειξη: Το ${problem.effectiveDivisor} χωράει ${qDigit} φορές στο ${currentStep.currentChunk}. (${qDigit} × ${problem.effectiveDivisor} = ${currentStep.product}).`,
        errorCount: 0,
      });
    } else if (activeSubStep === 'product') {
      const prodStr = currentStep.productDigitsStr;
      for (let i = 0; i < prodStr.length; i++) {
        setProductDigit(i, prodStr[i]);
      }
      setFeedback({
        status: 'hint',
        message: `Υπόδειξη: ${currentStep.quotientDigit} × ${problem.effectiveDivisor} = ${currentStep.product}.`,
        errorCount: 0,
      });
    } else if (activeSubStep === 'remainder') {
      const remStr = currentStep.remainderDigitsStr;
      for (let i = 0; i < remStr.length; i++) {
        setRemainderDigit(i, remStr[i]);
      }
      setFeedback({
        status: 'hint',
        message: `Υπόδειξη: ${currentStep.currentChunk} - ${currentStep.product} = ${currentStep.remainder}.`,
        errorCount: 0,
      });
    } else if (activeSubStep === 'bring_down') {
      completeBringDown();
    }
  }, [
    isCompleted,
    activeSubStep,
    problem.shiftInfo,
    problem.effectiveDivisor,
    currentStep,
    selectShiftMultiplier,
    setQuotientDigit,
    setProductDigit,
    setRemainderDigit,
    completeBringDown,
    registerMistake,
  ]);

  // Cheat / Testing function: άμεση και ορθή επίλυση ολόκληρης της διαίρεσης
  const instantSolveCurrent = useCallback(() => {
    if (problem.shiftInfo.wasShifted) {
      setShiftUserState({
        selectedMultiplier: problem.shiftInfo.shiftMultiplier,
        enteredDividend: problem.shiftInfo.shiftedDividend,
        enteredDivisor: problem.shiftInfo.shiftedDivisor,
        isMultiplierValidated: true,
        isShiftValidated: true,
      });
    }

    setStepStates(
      problem.steps.map((step) => ({
        quotientDigit: step.quotientDigit.toString(),
        productDigits: step.productDigitsStr.split(''),
        remainderDigits: step.remainderDigitsStr.split(''),
        isQuotientValidated: true,
        isProductValidated: true,
        isRemainderValidated: true,
        isBroughtDown: true,
      }))
    );

    setActiveStepIndex(Math.max(0, problem.steps.length - 1));
    setActiveSubStep('completed');
    setFocusedCellId(null);
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    let completionMsg = '';
    if (problem.isExact) {
      completionMsg = `Συγχαρητήρια! Η διαίρεση ολοκληρώθηκε τέλεια με πηλίκο ${problem.quotientStr} και υπόλοιπο 0!`;
    } else if (problem.maxDecimalReached || problem.quotientStr.includes(',')) {
      completionMsg = `Μπράβο! Η διαίρεση δεν τελειώνει (περιοδική) — ολοκληρώθηκε με προσέγγιση 3 δεκαδικών: πηλίκο ≈ ${problem.quotientStr}!`;
    } else {
      completionMsg = `Συγχαρητήρια! Η διαίρεση ολοκληρώθηκε με πηλίκο ${problem.quotientStr} και υπόλοιπο ${problem.finalRemainder}!`;
    }

    const isGame = gameModeInfoRef.current.isActive;
    const isLastGameProb = !!gameModeInfoRef.current.isLastProblem;
    if (isGame) {
      completionMsg += isLastGameProb
        ? ' 🌟 Πάτα «Δες τα Τελικά Αποτελέσματα» (ή πάτα Enter)!'
        : ' 🌟 Πάτα «Επόμενη Άσκηση» (ή πάτα Enter) για να συνεχίσεις!';
    } else {
      completionMsg += ' 🌟 Πάτα «Επόμενη Διαίρεση» (ή πάτα Enter)!';
    }

    setFeedback({
      status: 'success',
      message: `✨ Αυτόματη Επίλυση: ${completionMsg}`,
      errorCount: 0,
    });
  }, [problem]);

  // Προπαίδεια του διαιρέτη για το βοηθητικό πρόχειρο (1x έως 9x)
  const divisorMultiples = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 9; i++) {
      list.push({ multiplier: i, result: i * problem.effectiveDivisor });
    }
    return list;
  }, [problem.effectiveDivisor]);

  return {
    problem,
    level,
    setLevel,
    currentTier,
    sessionMistakes,
    dividendInput,
    divisorInput,
    setDividendInput,
    setDivisorInput,
    activeStepIndex,
    activeSubStep,
    shiftUserState,
    stepStates,
    feedback,
    focusedCellId,
    setFocusedCellId,
    showMultiplesHelper,
    setShowMultiplesHelper,
    divisorMultiples,
    isCompleted,
    setGameModeInfo,
    // Actions μετατόπισης δεκαδικών
    selectShiftMultiplier,
    setEnteredShiftDividend,
    setEnteredShiftDivisor,
    validateShiftInputs,
    // Actions κάθετης διαίρεσης
    setQuotientDigit,
    setProductDigit,
    setRemainderDigit,
    validateQuotient,
    validateProduct,
    validateRemainder,
    completeBringDown,
    giveHintOrAutoFill,
    instantSolveCurrent,
    loadProblem,
    selectLevelAndGenerate,
    restartCurrent,
  };
}
