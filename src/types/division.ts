/**
 * Τύποι δεδομένων για την εκπαιδευτική εφαρμογή κάθετης διαίρεσης
 * Ευρωπαϊκή μέθοδος - ΣΤ' Δημοτικού
 */

export type DifficultyLevel = 
  | 'easy'           // Ακέραιοι χωρίς υπόλοιπο (2ψήφιος/3ψήφιος με 1ψήφιο/2ψήφιο)
  | 'intermediate_zero' // Ακέραιοι με ενδιάμεσο μηδέν στο πηλίκο
  | 'decimal_quotient'  // Ακέραιος με ακέραιο που δίνει δεκαδικό πηλίκο
  | 'decimal_dividend'  // Δεκαδικός με ακέραιο
  | 'decimal_both'      // Δεκαδικός με δεκαδικό (μετατόπιση υποδιαστολής)
  | 'custom';           // Προσαρμοσμένη διαίρεση από τον μαθητή

export type SubStep = 
  | 'shift_multiplier' // Ο μαθητής επιλέγει με τι πρέπει να πολλαπλασιάσουμε (π.χ. ×10, ×100, ×1000)
  | 'shift_inputs'     // Ο μαθητής πληκτρολογεί τον νέο Διαιρετέο και τον νέο Διαιρέτη
  | 'quotient'         // Ο μαθητής εισάγει το ψηφίο του πηλίκου
  | 'product'          // Ο μαθητής εισάγει το γινόμενο (πηλίκο × διαιρέτης)
  | 'remainder'        // Ο μαθητής εισάγει το υπόλοιπο της αφαίρεσης
  | 'bring_down'       // Κατέβασμα του επόμενου ψηφίου
  | 'completed';       // Η διαίρεση ολοκληρώθηκε

export interface ShiftUserState {
  selectedMultiplier: number | null;
  enteredDividend: string;
  enteredDivisor: string;
  isMultiplierValidated: boolean;
  isShiftValidated: boolean;
}

export interface StepDigitInfo {
  digit: string;
  sourceIndex?: number;
  isVirtualZero?: boolean; // Μηδενικό που προστέθηκε για δεκαδική επέκταση
}

export interface DivisionStep {
  stepIndex: number;
  // Τρέχον τμήμα του διαιρετέου
  currentChunk: number;
  chunkDigitsStr: string;
  // Θέση του τμήματος στον διαιρετέο (για οπτική επισήμανση)
  chunkStartIndex: number;
  chunkEndIndex: number;
  
  // Ψηφίο πηλίκου
  quotientDigit: number;
  isDecimalPointPlacedHere: boolean; // Μπήκε υποδιαστολή στο πηλίκο σε αυτό το βήμα;
  
  // Γινόμενο (quotientDigit * divisor)
  product: number;
  productDigitsStr: string;
  
  // Υπόλοιπο (currentChunk - product)
  remainder: number;
  remainderDigitsStr: string;
  
  // Ψηφίο που κατεβαίνει
  broughtDownDigit: string | null;
  broughtDownFromIndex: number | null;
  isBroughtDownZero: boolean;
  
  // Επόμενο τμήμα που προκύπτει
  nextChunk: number | null;
  
  // Στοίχιση στηλών (για την τοποθέτηση των κελιών κάτω από τα σωστά ψηφία)
  // columnEndIndex: σε ποια στήλη του διαιρετέου στοιχίζεται το δεξιότερο ψηφίο
  columnEndIndex: number;
  
  // Ένδειξη αν αυτό το βήμα περιλαμβάνει αφαίρεση (γραμμή αφαίρεσης/υπολοίπου κάτω από τον διαιρετέο).
  // Τα αρχικά μηδενικά πριν την πρώτη αφαίρεση (όπως στο 0,012 : 5) απλώς μεγαλώνουν την αγκύλη
  // στον αρχικό διαιρετέο χωρίς να κατεβαίνουν σε από κάτω γραμμή (hasSubtraction = false).
  hasSubtraction: boolean;
  
  // Επεξηγήσεις για τον μαθητή
  hints: {
    quotientPrompt: string;      // π.χ. "Πόσες φορές χωράει το 25 στο 87;"
    productPrompt: string;       // π.χ. "Πολλαπλασίασε: 3 × 25 = 75"
    remainderPrompt: string;     // π.χ. "Αφαίρεσε: 87 - 75 = 12"
    bringDownPrompt: string;     // π.χ. "Κατέβασε το ψηφίο 5 δίπλα στο υπόλοιπο 12"
    detailedExplanation: string;
  };
}

export interface ShiftInfo {
  wasShifted: boolean;
  shiftMultiplier: number;
  originalDividend: string;
  originalDivisor: string;
  shiftedDividend: string;
  shiftedDivisor: string;
  explanation: string;
}

export interface DivisionProblem {
  id: string;
  originalDividendStr: string;
  originalDivisorStr: string;
  baseDividendStr?: string; // Ο διαιρετέος πριν από τυχόν προσθήκη μηδενικών για σχηματισμό αρχικού τμήματος
  effectiveDividendStr: string;
  effectiveDivisor: number;
  dividendDecimalIndex: number | null; // Θέση της υποδιαστολής στο effectiveDividendStr
  shiftInfo: ShiftInfo;
  steps: DivisionStep[];
  quotientStr: string;
  finalRemainder: number;
  isExact: boolean;
  maxDecimalReached: boolean;
  isTerminating?: boolean;
}

export interface UserInputStepState {
  quotientDigit: string;
  productDigits: string[];
  remainderDigits: string[];
  isQuotientValidated: boolean;
  isProductValidated: boolean;
  isRemainderValidated: boolean;
  isBroughtDown: boolean;
}
