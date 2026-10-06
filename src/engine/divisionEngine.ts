/**
 * Αλγοριθμική Μηχανή Κάθετης Διαίρεσης (Ευρωπαϊκή Μέθοδος)
 * Προ-υπολογίζει με ακρίβεια κάθε βήμα της διαίρεσης για μαθητές ΣΤ' Δημοτικού
 */

import { DivisionProblem, DivisionStep, ShiftInfo } from '../types/division';

/**
 * Αυστηρός και ασφαλής έλεγχος εγκυρότητας αριθμητικής εισόδου.
 * Αποδέχεται μόνο καθαρούς θετικούς αριθμούς (ακέραιους ή δεκαδικούς με 1 κόμμα ή τελεία).
 * Απορρίπτει: γράμματα (π.χ. '12a'), πολλαπλές υποδιαστολές ('1,2,3', '1.2.3'),
 * αρνητικούς αριθμούς ('-5'), κενά σύμβολα, κλπ.
 */
export function validateAndNormalizeNumber(
  rawInput: string,
  fieldName: string = 'αριθμός'
): { isValid: boolean; normalized: string; numValue: number; error?: string } {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Παρακαλώ συμπληρώστε το πεδίο (${fieldName}).`,
    };
  }

  // Αφαίρεση εξωτερικών και ενδιάμεσων κενών
  const trimmed = rawInput.trim().replace(/\s+/g, '');
  if (!trimmed) {
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Το πεδίο (${fieldName}) δεν μπορεί να είναι κενό.`,
    };
  }

  // Έλεγχος για αρνητικούς αριθμούς
  if (trimmed.startsWith('-')) {
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Το πεδίο (${fieldName}) δεν μπορεί να είναι αρνητικός αριθμός.`,
    };
  }

  // Μετατροπή τελείας σε κόμμα για ενιαία αντιμετώπιση
  const withComma = trimmed.replace(/\./g, ',');

  // Έλεγχος για πολλαπλές υποδιαστολές (π.χ. 1,2,3 ή 1.2.3)
  const commaCount = (withComma.match(/,/g) || []).length;
  if (commaCount > 1) {
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Ο ${fieldName} περιέχει περισσότερες από μία υποδιαστολές (${trimmed}).`,
    };
  }

  // Αυστηρός έλεγχος επιτρεπόμενων χαρακτήρων: ΜΟΝΟ ψηφία 0-9 και προαιρετικά 1 κόμμα
  if (!/^[0-9]+(,[0-9]+)?$/.test(withComma)) {
    // Ειδική περίπτωση: αρχίζει με κόμμα, π.χ. ,5 -> 0,5
    if (/^,[0-9]+$/.test(withComma)) {
      const fixed = `0${withComma}`;
      const num = Number(fixed.replace(',', '.'));
      return { isValid: true, normalized: fixed, numValue: num };
    }
    // Ειδική περίπτωση: τελειώνει με κόμμα, π.χ. 5, -> 5
    if (/^[0-9]+,$/.test(withComma)) {
      const fixed = withComma.slice(0, -1);
      const num = Number(fixed);
      return { isValid: true, normalized: fixed, numValue: num };
    }
    if (withComma === ',') {
      return {
        isValid: false,
        normalized: '',
        numValue: 0,
        error: `Εισαγάγατε μόνο υποδιαστολή χωρίς ψηφία.`,
      };
    }
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Ο ${fieldName} περιέχει μη έγκυρους χαρακτήρες (${trimmed}). Επιτρέπονται μόνο αριθμητικά ψηφία (0-9).`,
    };
  }

  // Αφαίρεση περιττών αρχικών μηδενικών από το ακέραιο μέρος (π.χ. 007 -> 7, 00,5 -> 0,5)
  const parts = withComma.split(',');
  const intPart = parts[0].replace(/^0+(?=\d)/, '') || '0';
  const normalized = parts.length > 1 ? `${intPart},${parts[1]}` : intPart;

  // Αυστηρός έλεγχος μετατροπής μέσω Number() (ΟΧΙ parseFloat)
  const numValue = Number(normalized.replace(',', '.'));
  if (isNaN(numValue) || !isFinite(numValue)) {
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Μη έγκυρη αριθμητική τιμή στο πεδίο (${fieldName}).`,
    };
  }

  // Έλεγχος μέγιστου ορίου
  if (numValue > 999999) {
    return {
      isValid: false,
      normalized: '',
      numValue: 0,
      error: `Ο ${fieldName} είναι υπερβολικά μεγάλος (επιτρέπονται αριθμοί έως 999.999).`,
    };
  }

  return {
    isValid: true,
    normalized,
    numValue,
  };
}

/**
 * Καθαρίζει, ελέγχει και μορφοποιεί αριθμητικό string
 */
export function normalizeInputNumber(val: string): string {
  const result = validateAndNormalizeNumber(val);
  if (!result.isValid) {
    throw new Error(result.error || 'Μη έγκυρος αριθμός.');
  }
  return result.normalized;
}

/**
 * Υπολογίζει τα δεκαδικά ψηφία ενός αριθμητικού string με κόμμα
 */
function getDecimalCount(val: string): number {
  const parts = val.split(',');
  return parts.length > 1 ? parts[1].length : 0;
}

/**
 * Μετατοπίζει την υποδιαστολή προς τα δεξιά κατά k θέσεις
 */
function shiftDecimalRight(val: string, places: number): string {
  if (places <= 0) return val;
  const parts = val.split(',');
  let intPart = parts[0] || '0';
  let decPart = parts[1] || '';

  if (decPart.length <= places) {
    const zerosNeeded = places - decPart.length;
    const combined = intPart + decPart + '0'.repeat(zerosNeeded);
    // Αφαίρεση περιττών αρχικών μηδενικών εκτός αν είναι απλά '0'
    return combined.replace(/^0+(?=\d)/, '') || '0';
  } else {
    const newIntPart = (intPart + decPart.slice(0, places)).replace(/^0+(?=\d)/, '') || '0';
    const newDecPart = decPart.slice(places);
    return `${newIntPart},${newDecPart}`;
  }
}

/**
 * Ελέγχει με απόλυτη μαθηματική ακρίβεια αν η διαίρεση είναι περατή (τερματίζει σε πεπερασμένα
 * δεκαδικά ψηφία) ή μη περατή (περιοδική / συνεχίζεται επ' άπειρον).
 * Βασίζεται στο θεώρημα ότι ένα ανάγωγο κλάσμα A / B παράγει πεπερασμένο δεκαδικό αν και μόνο αν
 * ο παρονομαστής B (μετά την απλοποίηση με το A) έχει ως πρώτους παράγοντες ΜΟΝΟ το 2 και το 5.
 */
export function isTerminatingDivision(dividendStr: string, divisorStr: string): boolean {
  try {
    const divParts = dividendStr.replace(/\./g, ',').split(',');
    const disParts = divisorStr.replace(/\./g, ',').split(',');

    const divDec = divParts[1] ? divParts[1].length : 0;
    const disDec = disParts[1] ? disParts[1].length : 0;
    const maxDec = Math.max(divDec, disDec);

    const divInt = Math.round(Number(dividendStr.replace(',', '.')) * Math.pow(10, maxDec));
    const disInt = Math.round(Number(divisorStr.replace(',', '.')) * Math.pow(10, maxDec));

    if (disInt === 0) return false;
    if (divInt === 0) return true;

    // Εύρεση ΜΚΔ (Μέγιστος Κοινός Διαιρέτης)
    let a = Math.abs(divInt);
    let b = Math.abs(disInt);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    const gcd = a;

    let reducedDivisor = Math.abs(disInt) / gcd;

    // Αφαίρεση όλων των παραγόντων 2 και 5
    while (reducedDivisor % 2 === 0) reducedDivisor /= 2;
    while (reducedDivisor % 5 === 0) reducedDivisor /= 5;

    return reducedDivisor === 1;
  } catch {
    return false;
  }
}

/**
 * Κύρια συνάρτηση επίλυσης και δημιουργίας βημάτων κάθετης διαίρεσης
 */
export function solveDivision(
  dividendInput: string,
  divisorInput: string,
  maxDecimalPlaces: number = 3
): DivisionProblem {
  const divValidation = validateAndNormalizeNumber(dividendInput, 'Διαιρετέος');
  if (!divValidation.isValid) {
    throw new Error(divValidation.error || 'Μη έγκυρος Διαιρετέος.');
  }

  const disValidation = validateAndNormalizeNumber(divisorInput, 'Διαιρέτης');
  if (!disValidation.isValid) {
    throw new Error(disValidation.error || 'Μη έγκυρος Διαιρέτης.');
  }

  if (disValidation.numValue === 0) {
    throw new Error('Ο διαιρέτης δεν μπορεί να είναι 0!');
  }

  const cleanDividend = divValidation.normalized;
  const cleanDivisor = disValidation.normalized;

  // 1. Μετατόπιση υποδιαστολής αν ο διαιρέτης έχει δεκαδικά
  const divisorDecimals = getDecimalCount(cleanDivisor);
  const wasShifted = divisorDecimals > 0;
  const shiftMultiplier = Math.pow(10, divisorDecimals);

  let effectiveDividendStr = cleanDividend;
  let effectiveDivisorStr = cleanDivisor;
  let shiftExplanation = '';

  if (wasShifted) {
    effectiveDivisorStr = shiftDecimalRight(cleanDivisor, divisorDecimals);
    effectiveDividendStr = shiftDecimalRight(cleanDividend, divisorDecimals);
    shiftExplanation = `Επειδή ο διαιρέτης (${cleanDivisor}) είναι δεκαδικός με ${divisorDecimals} δεκαδικό${divisorDecimals > 1 ? 'α' : ''} ψηφί${divisorDecimals > 1 ? 'α' : 'ο'}, πολλαπλασιάζουμε και τους δύο αριθμούς με το ${shiftMultiplier}. Έτσι έχουμε τη διαίρεση: ${effectiveDividendStr} : ${effectiveDivisorStr}`;
  }

  const shiftInfo: ShiftInfo = {
    wasShifted,
    shiftMultiplier,
    originalDividend: cleanDividend,
    originalDivisor: cleanDivisor,
    shiftedDividend: effectiveDividendStr,
    shiftedDivisor: effectiveDivisorStr,
    explanation: shiftExplanation,
  };

  const effectiveDivisor = parseInt(effectiveDivisorStr.replace(',', ''), 10);
  if (isNaN(effectiveDivisor) || effectiveDivisor === 0) {
    throw new Error('Μη έγκυρος ακέραιος διαιρέτης μετά τη μετατροπή.');
  }

  // Αποθηκεύουμε τον βασικό διαιρετέο πριν την τυχόν προσθήκη μηδενικών
  const baseDividendStr = effectiveDividendStr;

  // Αν ο διαιρετέος έχει δεκαδικά και όλα τα ψηφία του δεν επαρκούν για να σχηματίσουν
  // αρχικό τμήμα >= effectiveDivisor (π.χ. στο 0,024 : 40, όπου 24 < 40),
  // προσθέτουμε όσα μηδενικά χρειάζονται στο τέλος του διαιρετέου (π.χ. 0,024 -> 0,0240)
  // ώστε να προστεθεί 0 στον διαιρετέο και η αγκύλη να αγκαλιάζει σωστά το 2, 4 και το 0!
  let testVal = parseInt(effectiveDividendStr.replace(',', ''), 10);
  if (testVal > 0 && testVal < effectiveDivisor) {
    if (!effectiveDividendStr.includes(',')) {
      effectiveDividendStr += ',';
    }
    while (testVal < effectiveDivisor) {
      effectiveDividendStr += '0';
      testVal *= 10;
    }
    shiftInfo.shiftedDividend = effectiveDividendStr;
  }

  // Έλεγχος αν η διαίρεση είναι περατή (τερματίζει σε πεπερασμένα δεκαδικά)
  const isTerminating = isTerminatingDivision(cleanDividend, cleanDivisor);
  // Αν είναι περατή (π.χ. 0,012 : 5 = 0,0024), επιτρέπουμε να ολοκληρωθεί έως και 6 δεκαδικά
  // Αν είναι περιοδική (π.χ. 1 : 3 = 0,333...), σταματάμε στα maxDecimalPlaces (π.χ. 3 δεκαδικά)
  const allowedMaxDecimals = isTerminating ? 6 : maxDecimalPlaces;

  // Ειδική περίπτωση: Διαιρετέος 0 (π.χ. 0 : 5 = 0)
  if (divValidation.numValue === 0) {
    const singleStep: DivisionStep = {
      stepIndex: 0,
      currentChunk: 0,
      chunkDigitsStr: '0',
      chunkStartIndex: 0,
      chunkEndIndex: 0,
      quotientDigit: 0,
      isDecimalPointPlacedHere: false,
      product: 0,
      productDigitsStr: '0',
      remainder: 0,
      remainderDigitsStr: '0',
      broughtDownDigit: null,
      broughtDownFromIndex: null,
      isBroughtDownZero: false,
      nextChunk: null,
      columnEndIndex: 0,
      hasSubtraction: true,
      hints: {
        quotientPrompt: `Πόσες φορές χωράει το ${effectiveDivisor} στο 0;`,
        productPrompt: `0 × ${effectiveDivisor} = 0`,
        remainderPrompt: `0 - 0 = 0`,
        bringDownPrompt: `Η διαίρεση ολοκληρώθηκε!`,
        detailedExplanation: `Το ${effectiveDivisor} στο 0 χωράει 0 φορές. 0 × ${effectiveDivisor} = 0, υπόλοιπο 0. Το πηλίκο είναι 0.`,
      },
    };

    return {
      id: `div_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      originalDividendStr: cleanDividend,
      originalDivisorStr: cleanDivisor,
      baseDividendStr: cleanDividend,
      effectiveDividendStr: '0',
      effectiveDivisor,
      dividendDecimalIndex: null,
      shiftInfo,
      steps: [singleStep],
      quotientStr: '0',
      finalRemainder: 0,
      isExact: true,
      maxDecimalReached: false,
    };
  }

  // 2. Ανάλυση ψηφίων του effectiveDividendStr
  const dividendParts = effectiveDividendStr.split(',');
  const integerPartStr = dividendParts[0];
  const decimalPartStr = dividendParts[1] || '';

  // Δημιουργία λίστας ψηφίων με πληροφορίες θέσης
  // [ { digit: '1', index: 0, isDecimal: false }, ... ]
  type DigitEntry = { digit: string; originalIndex: number; isDecimal: boolean };
  const allDigits: DigitEntry[] = [];

  for (let i = 0; i < integerPartStr.length; i++) {
    allDigits.push({ digit: integerPartStr[i], originalIndex: i, isDecimal: false });
  }

  const decimalPointCharIndex = decimalPartStr.length > 0 ? integerPartStr.length : null;

  for (let i = 0; i < decimalPartStr.length; i++) {
    allDigits.push({ digit: decimalPartStr[i], originalIndex: integerPartStr.length + 1 + i, isDecimal: true });
  }

  // 3. Βήματα Διαίρεσης (Ευρωπαϊκή Μέθοδος)
  const steps: DivisionStep[] = [];
  let quotientStr = '';
  let digitPointer = 0; // δείκτης στο allDigits
  let currentChunk = 0;
  let chunkStartIndex = 0;
  let chunkEndIndex = 0;
  let stepIndex = 0;
  let decimalPlaced = false;

  // Βρίσκουμε το αρχικό τμήμα
  // Ειδική περίπτωση: αν ολόκληρο το ακέραιο μέρος είναι μικρότερο από τον διαιρέτη
  // π.χ. 3,5 : 7 -> Το 7 στο 3 χωράει 0 φορές, βάζουμε 0, στο πηλίκο
  const intVal = parseInt(integerPartStr, 10);
  if (intVal < effectiveDivisor) {
    // 1ο Βήμα: Το ακέραιο μέρος είναι μικρότερο από τον διαιρέτη (π.χ. στο 0,012 ή 3,5)
    // Βάζουμε 0, στο πηλίκο. Δεν κατεβαίνει τίποτα σε από κάτω γραμμή (hasSubtraction = false).
    currentChunk = intVal;
    chunkStartIndex = 0;
    chunkEndIndex = integerPartStr.length - 1;
    digitPointer = integerPartStr.length;
    decimalPlaced = true;
    quotientStr += '0,';

    steps.push({
      stepIndex,
      currentChunk,
      chunkDigitsStr: currentChunk.toString(),
      chunkStartIndex: 0,
      chunkEndIndex,
      quotientDigit: 0,
      isDecimalPointPlacedHere: true,
      product: 0,
      productDigitsStr: '0',
      remainder: currentChunk,
      remainderDigitsStr: currentChunk.toString(),
      broughtDownDigit: null,
      broughtDownFromIndex: null,
      isBroughtDownZero: false,
      nextChunk: null,
      columnEndIndex: chunkEndIndex,
      hasSubtraction: false,
      hints: {
        quotientPrompt: `Το ακέραιο μέρος (${currentChunk}) δεν χωράει το ${effectiveDivisor} (0 φορές). Βάζουμε 0, στο πηλίκο!`,
        productPrompt: `0 × ${effectiveDivisor} = 0`,
        remainderPrompt: `${currentChunk} - 0 = ${currentChunk}`,
        bringDownPrompt: `Η αγκύλη στον διαιρετέο μεγαλώνει για να πιάσει και το επόμενο ψηφίο!`,
        detailedExplanation: `Επειδή το ακέραιο μέρος (${currentChunk}) είναι μικρότερο από το ${effectiveDivisor}, γράφουμε 0, στο πηλίκο. Η αγκύλη μεγαλώνει για να συμπεριλάβει και το επόμενο ψηφίο.`,
      },
    });
    stepIndex++;

    // Αν υπάρχουν διαδοχικά δεκαδικά ψηφία που δεν επαρκούν ώστε το τμήμα να γίνει >= effectiveDivisor
    // π.χ. στο 0,012 : 5 -> το επόμενο '0' δίνει 0 < 5, το επόμενο '1' δίνει 1 < 5!
    while (digitPointer < allDigits.length) {
      const nextDigit = allDigits[digitPointer].digit;
      const tentativeChunk = currentChunk * 10 + parseInt(nextDigit, 10);
      if (tentativeChunk < effectiveDivisor) {
        currentChunk = tentativeChunk;
        chunkEndIndex = digitPointer;
        digitPointer++;
        quotientStr += '0';

        steps.push({
          stepIndex,
          currentChunk,
          chunkDigitsStr: currentChunk.toString(),
          chunkStartIndex: 0,
          chunkEndIndex,
          quotientDigit: 0,
          isDecimalPointPlacedHere: false,
          product: 0,
          productDigitsStr: '0',
          remainder: currentChunk,
          remainderDigitsStr: currentChunk.toString(),
          broughtDownDigit: null,
          broughtDownFromIndex: null,
          isBroughtDownZero: false,
          nextChunk: null,
          columnEndIndex: chunkEndIndex,
          hasSubtraction: false,
          hints: {
            quotientPrompt: `Το ${effectiveDivisor} στο ${currentChunk} δεν χωράει (0 φορές). Βάζουμε 0 στο πηλίκο!`,
            productPrompt: `0 × ${effectiveDivisor} = 0`,
            remainderPrompt: `${currentChunk} - 0 = ${currentChunk}`,
            bringDownPrompt: `Η αγκύλη στον διαιρετέο μεγαλώνει για να πιάσει και το επόμενο ψηφίο!`,
            detailedExplanation: `Επειδή το ${effectiveDivisor} δεν χωράει στο ${currentChunk}, γράφουμε 0 στο πηλίκο και μεγαλώνουμε την αγκύλη στον διαιρετέο.`,
          },
        });
        stepIndex++;
      } else {
        // Βρέθηκε τμήμα που χωράει τον διαιρέτη (π.χ. το 12 στο 0,012 ή το 35 στο 3,5)!
        currentChunk = tentativeChunk;
        chunkStartIndex = 0;
        chunkEndIndex = digitPointer;
        digitPointer++;
        break;
      }
    }
  } else {
    // Κανονική αρχή: παίρνουμε τόσα ψηφία όσα χρειάζονται ώστε chunk >= effectiveDivisor
    let initialChunkStr = '';
    chunkStartIndex = 0;

    while (digitPointer < allDigits.length) {
      initialChunkStr += allDigits[digitPointer].digit;
      digitPointer++;
      if (parseInt(initialChunkStr, 10) >= effectiveDivisor) {
        break;
      }
    }

    currentChunk = parseInt(initialChunkStr, 10);
    chunkEndIndex = digitPointer - 1;
  }

  // Κύριος βρόχος επεξεργασίας βημάτων
  let finished = false;
  let safetyCounter = 0;

  while (!finished && safetyCounter < 100) {
    safetyCounter++;

    const quotientDigit = Math.floor(currentChunk / effectiveDivisor);
    const product = quotientDigit * effectiveDivisor;
    const remainder = currentChunk - product;

    // Έλεγχος αν πρέπει να μπει υποδιαστολή στο πηλίκο σε αυτό το βήμα
    let isDecimalPlacedHere = false;
    
    // Αν δεν έχει μπει ήδη υποδιαστολή, και έχουμε ξεπεράσει το ακέραιο μέρος
    if (!decimalPlaced) {
      if (digitPointer >= integerPartStr.length) {
        // Εξαντλήθηκαν τα ακέραια ψηφία!
        decimalPlaced = true;
        isDecimalPlacedHere = true;
        quotientStr += quotientDigit.toString() + ',';
      } else {
        quotientStr += quotientDigit.toString();
      }
    } else {
      quotientStr += quotientDigit.toString();
    }

    // Κατέβασμα επόμενου ψηφίου
    let broughtDownDigit: string | null = null;
    let broughtDownFromIndex: number | null = null;
    let isBroughtDownZero = false;

    if (digitPointer < allDigits.length) {
      // Υπάρχουν κι άλλα ψηφία στον διαιρετέο
      const entry = allDigits[digitPointer];
      broughtDownDigit = entry.digit;
      broughtDownFromIndex = entry.originalIndex;
      digitPointer++;
    } else {
      // Δεν υπάρχουν άλλα ψηφία στον διαιρετέο
      const currentDecimals = quotientStr.includes(',') ? (quotientStr.split(',')[1] || '').length : 0;
      if (remainder === 0) {
        // Τέλεια διαίρεση! Ολοκληρώθηκε!
        finished = true;
      } else if (currentDecimals < allowedMaxDecimals) {
        // Συνέχιση με δεκαδικά: κατεβάζουμε 0
        if (!decimalPlaced) {
          decimalPlaced = true;
          isDecimalPlacedHere = true;
          // Αν δεν είχε μπει κόμμα, το βάζουμε τώρα
          if (!quotientStr.includes(',')) {
            quotientStr += ',';
          }
        }
        broughtDownDigit = '0';
        isBroughtDownZero = true;
      } else {
        // Φτάσαμε στο μέγιστο όριο δεκαδικών
        finished = true;
      }
    }

    const nextChunk = broughtDownDigit !== null ? remainder * 10 + parseInt(broughtDownDigit, 10) : null;
    const colEnd = steps.length === 0 ? chunkEndIndex : steps[steps.length - 1].columnEndIndex + 1;
    const chunkLen = currentChunk.toString().length;
    const stepChunkStart = colEnd - chunkLen + 1;

    const baseDigitsCount = baseDividendStr.replace(/,/g, '').length;
    const isZeroAppendedToDividend = colEnd >= baseDigitsCount && quotientDigit > 0;

    const step: DivisionStep = {
      stepIndex,
      currentChunk,
      chunkDigitsStr: currentChunk.toString(),
      chunkStartIndex: stepChunkStart,
      chunkEndIndex: colEnd,
      quotientDigit,
      isDecimalPointPlacedHere: isDecimalPlacedHere,
      product,
      productDigitsStr: product.toString(),
      remainder,
      remainderDigitsStr: remainder.toString(),
      broughtDownDigit,
      broughtDownFromIndex,
      isBroughtDownZero,
      nextChunk,
      columnEndIndex: colEnd,
      hasSubtraction: quotientDigit > 0,
      hints: {
        quotientPrompt: quotientDigit === 0
          ? `Το ${effectiveDivisor} στο ${currentChunk} δεν χωράει (0 φορές). Βάζουμε 0 στο πηλίκο!`
          : isZeroAppendedToDividend
            ? `Προστέθηκε 0 στον διαιρετέο! Η αγκύλη αγκαλιάζει το ${currentChunk}. Πόσες φορές χωράει το ${effectiveDivisor} στο ${currentChunk};`
            : `Πόσες φορές χωράει το ${effectiveDivisor} στο ${currentChunk};`,
        productPrompt: `Πολλαπλασίασε: ${quotientDigit} × ${effectiveDivisor} = ${product}`,
        remainderPrompt: `Αφαίρεσε: ${currentChunk} - ${product} = ${remainder}`,
        bringDownPrompt: broughtDownDigit !== null 
          ? (isBroughtDownZero 
              ? (quotientDigit === 0
                  ? `Βάζουμε 0 στο πηλίκο. Προσθέτουμε 0 δεξιά για να συνεχιστεί η διαίρεση.`
                  : `Το υπόλοιπο είναι ${remainder}. Προσθέτουμε 0 δεξιά για να συνεχίσουμε τη διαίρεση με δεκαδικά.`)
              : (quotientDigit === 0
                  ? `Βάζουμε 0 στο πηλίκο. Κατεβάζουμε το επόμενο ψηφίο (${broughtDownDigit}) δίπλα στο ${remainder}.`
                  : `Κατεβάζουμε το ψηφίο ${broughtDownDigit} δίπλα στο υπόλοιπο ${remainder}. Νέος αριθμός: ${nextChunk}`))
          : `Η διαίρεση ολοκληρώθηκε!`,
        detailedExplanation: quotientDigit === 0
          ? `Επειδή το ${effectiveDivisor} δεν χωράει στο ${currentChunk}, γράφουμε 0 στο πηλίκο, παρακάμπτουμε την αφαίρεση με το 0 και κατεβάζουμε αμέσως το επόμενο ψηφίο.`
          : isZeroAppendedToDividend
            ? `Επειδή εξαντλήθηκαν τα ψηφία του διαιρετέου, προσθέτουμε 0 στο τέλος του διαιρετέου. Η αγκύλη αγκαλιάζει το ${currentChunk}. Το ${effectiveDivisor} χωράει ${quotientDigit} φορές στο ${currentChunk} (${quotientDigit} × ${effectiveDivisor} = ${product}).`
            : `Το ${effectiveDivisor} χωράει ${quotientDigit} φορές στο ${currentChunk} (${quotientDigit} × ${effectiveDivisor} = ${product}). Αφαιρούμε και βρίσκουμε υπόλοιπο ${remainder}.`
      }
    };

    steps.push(step);
    stepIndex++;

    if (finished || nextChunk === null) {
      break;
    }

    // Προετοιμασία για το επόμενο βήμα
    currentChunk = nextChunk;
    chunkStartIndex = colEnd;
    chunkEndIndex = colEnd + 1;
  }

  // Αφαίρεση τυχόν τελικού κόμματος αν δεν ακολούθησαν δεκαδικά
  if (quotientStr.endsWith(',')) {
    quotientStr = quotientStr.slice(0, -1);
  }

  const finalStep = steps[steps.length - 1];
  const finalRemainder = finalStep ? finalStep.remainder : 0;
  const isExact = finalRemainder === 0;

  return {
    id: `div_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    originalDividendStr: cleanDividend,
    originalDivisorStr: cleanDivisor,
    baseDividendStr,
    effectiveDividendStr,
    effectiveDivisor,
    dividendDecimalIndex: decimalPointCharIndex,
    shiftInfo,
    steps,
    quotientStr,
    finalRemainder,
    isExact,
    maxDecimalReached: !isExact && !isTerminating,
    isTerminating,
  };
}

/**
 * Βοηθητική συνάρτηση μορφοποίησης αριθμού με κόμμα και αποφυγή float σφαλμάτων
 */
function formatNumberGreek(val: number, maxDecimals: number = 4): string {
  const cleaned = Number(val.toFixed(maxDecimals));
  return cleaned.toString().replace('.', ',');
}

/**
 * Παράγει τυχαίες ασκήσεις ανάλογα με το επιλεγμένο επίπεδο δυσκολίας και βαθμίδα (Tier 0, 1, 2)
 */
export function generateRandomProblem(level: string, tierIndex?: number): { dividend: string; divisor: string } {
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Αν δεν δοθεί tier, επιλέγουμε τυχαία (0: Βασικό, 1: Μεσαίο, 2: Προχωρημένο)
  const tier = tierIndex !== undefined ? Math.abs(tierIndex % 3) : randInt(0, 2);

  switch (level) {
    case 'easy': {
      // Ακέραιοι χωρίς υπόλοιπο
      if (tier === 0) {
        // Βαθμίδα 1: Μονοψήφιος διαιρέτης (3-9), 2ψήφιο πηλίκο (12-45)
        const divisor = randInt(3, 9);
        const quotient = randInt(12, 45);
        const dividend = divisor * quotient;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else if (tier === 1) {
        // Βαθμίδα 2: Διψήφιος διαιρέτης (12-35), 2ψήφιο πηλίκο (14-55)
        const divisor = randInt(12, 35);
        const quotient = randInt(14, 55);
        const dividend = divisor * quotient;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else {
        // Βαθμίδα 3: Διψήφιος/Τριψήφιος διαιρέτης (24-125), μεγαλύτερος διαιρετέος
        const divisor = choice([24, 25, 32, 45, 50, 75, 125]);
        const quotient = randInt(15, 85);
        const dividend = divisor * quotient;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      }
    }

    case 'intermediate_zero': {
      // Ενδιάμεσο μηδέν στο πηλίκο
      if (tier === 0) {
        // Βαθμίδα 1: Μονοψήφιος διαιρέτης (3-9), 3ψήφιο πηλίκο με μηδέν (102-409)
        const divisor = randInt(3, 9);
        const qH = randInt(1, 4);
        const qU = randInt(1, 9);
        const quotient = qH * 100 + qU; // π.χ. 103, 206
        const dividend = divisor * quotient;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else if (tier === 1) {
        // Βαθμίδα 2: Διψήφιος διαιρέτης (11-25), 3ψήφιο πηλίκο με μηδέν
        const divisor = choice([11, 12, 14, 15, 18, 20, 25]);
        const qH = randInt(1, 3);
        const qU = randInt(1, 9);
        const quotient = qH * 100 + qU;
        const dividend = divisor * quotient;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else {
        // Βαθμίδα 3: 4ψήφιο πηλίκο με πολλαπλά ενδιάμεσα μηδενικά (π.χ. 1004, 2003)
        const divisor = randInt(4, 9);
        const qTh = randInt(1, 3);
        const qU = randInt(1, 9);
        const quotient = qTh * 1000 + qU; // π.χ. 1004, 2003
        const dividend = divisor * quotient;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      }
    }

    case 'decimal_quotient': {
      // Ακέραιοι που δίνουν καθαρό δεκαδικό πηλίκο
      if (tier === 0) {
        // Βαθμίδα 1: Πηλίκο με 1 δεκαδικό ψηφίο (διαιρέτες 2, 4, 5, 10, 20)
        // Επιλογή διαιρέτη και υπολοίπου r ώστε r/divisor να έχει ακριβώς 1 δεκαδικό
        const configs: { divisor: number; remainders: number[] }[] = [
          { divisor: 2, remainders: [1] },
          { divisor: 4, remainders: [2] },
          { divisor: 5, remainders: [1, 2, 3, 4] },
          { divisor: 10, remainders: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
          { divisor: 20, remainders: [2, 6, 10, 14, 18] },
        ];
        const cfg = choice(configs);
        const divisor = cfg.divisor;
        const remainder = choice(cfg.remainders);
        const intQuot = randInt(5, 35);
        const dividend = intQuot * divisor + remainder;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else if (tier === 1) {
        // Βαθμίδα 2: Πηλίκο με 2 δεκαδικά ψηφία (διαιρέτες 4, 20, 25, 50)
        // Επιλογή διαιρέτη και υπολοίπου r ώστε r/divisor να έχει ακριβώς 2 δεκαδικά
        const configs: { divisor: number; remainders: number[] }[] = [
          { divisor: 4, remainders: [1, 3] },
          { divisor: 20, remainders: [1, 3, 7, 9, 11, 13, 17, 19] },
          { divisor: 25, remainders: [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24] },
          { divisor: 50, remainders: [1, 3, 7, 9, 11, 13, 17, 19, 21, 23, 27, 29, 31, 33, 37, 39, 41, 43, 47, 49] },
        ];
        const cfg = choice(configs);
        const divisor = cfg.divisor;
        const remainder = choice(cfg.remainders);
        const intQuot = randInt(3, 25);
        const dividend = intQuot * divisor + remainder;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else {
        // Βαθμίδα 3: Πηλίκο με 3 δεκαδικά ψηφία (διαιρέτες 8, 40, 125)
        // Επιλογή διαιρέτη και υπολοίπου r ώστε r/divisor να έχει ακριβώς 3 δεκαδικά
        const configs: { divisor: number; remainders: number[] }[] = [
          { divisor: 8, remainders: [1, 3, 5, 7] },
          { divisor: 40, remainders: [1, 3, 7, 9, 11, 13, 17, 19, 21, 23, 27, 29, 31, 33, 37, 39] },
          { divisor: 125, remainders: [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24] },
        ];
        const cfg = choice(configs);
        const divisor = cfg.divisor;
        const remainder = choice(cfg.remainders);
        const intQuot = randInt(2, 18);
        const dividend = intQuot * divisor + remainder;
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      }
    }

    case 'decimal_dividend': {
      // Δεκαδικός διαιρετέος με ακέραιο διαιρέτη
      if (tier === 0) {
        // Βαθμίδα 1: 1 δεκαδικό στον διαιρετέο, μονοψήφιος διαιρέτης (3-8)
        const divisor = randInt(3, 8);
        let Q = randInt(12, 55);
        while ((Q * divisor) % 10 === 0) Q += 1;
        const D = Q * divisor;
        return { dividend: formatNumberGreek(D / 10, 1), divisor: divisor.toString() };
      } else if (tier === 1) {
        // Βαθμίδα 2: 2 δεκαδικά στον διαιρετέο
        const divisor = choice([3, 4, 5, 6, 7, 8, 12, 15, 20, 25]);
        let Q = randInt(105, 455);
        while ((Q * divisor) % 10 === 0) Q += 1;
        const D = Q * divisor;
        return { dividend: formatNumberGreek(D / 100, 2), divisor: divisor.toString() };
      } else {
        // Βαθμίδα 3: 3 δεκαδικά στον διαιρετέο
        const divisor = choice([12, 14, 15, 16, 24, 25, 32]);
        let Q = randInt(1125, 4525);
        while ((Q * divisor) % 10 === 0) Q += 1;
        const D = Q * divisor;
        return { dividend: formatNumberGreek(D / 1000, 3), divisor: divisor.toString() };
      }
    }

    case 'decimal_both': {
      // Δεκαδικός διαιρετέος με δεκαδικό διαιρέτη (απαιτεί μετατόπιση υποδιαστολής)
      if (tier === 0) {
        // Βαθμίδα 1 (Βασική - ×10): Διαιρέτης με 1 δεκαδικό ψηφίο
        const dEff = choice([4, 5, 6, 8, 12, 15, 24, 25, 32, 45]);
        const q = randInt(12, 45);
        const DEff = dEff * q;
        return {
          dividend: formatNumberGreek(DEff / 10, 1),
          divisor: formatNumberGreek(dEff / 10, 1),
        };
      } else if (tier === 1) {
        // Βαθμίδα 2 (Μεσαία - ×100): Διαιρέτης με 2 δεκαδικά ψηφία
        const dEff = choice([5, 8, 12, 15, 25, 35, 45, 75, 125, 175, 225]);
        const q = randInt(14, 55);
        const DEff = dEff * q;
        return {
          dividend: formatNumberGreek(DEff / 100, 2),
          divisor: formatNumberGreek(dEff / 100, 2),
        };
      } else {
        // Βαθμίδα 3 (Προχωρημένη - ×1000): Διαιρέτης με 3 δεκαδικά ψηφία
        const dEff = choice([5, 8, 16, 25, 45, 75, 125]);
        const q = randInt(12, 48);
        const DEff = dEff * q;
        return {
          dividend: formatNumberGreek(DEff / 1000, 3),
          divisor: formatNumberGreek(dEff / 1000, 3),
        };
      }
    }

    default:
      return { dividend: '875', divisor: '25' };
  }
}
