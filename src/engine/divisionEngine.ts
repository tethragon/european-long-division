/**
 * Αλγοριθμική Μηχανή Κάθετης Διαίρεσης (Ευρωπαϊκή Μέθοδος)
 * Προ-υπολογίζει με ακρίβεια κάθε βήμα της διαίρεσης για μαθητές ΣΤ' Δημοτικού
 */

import { DivisionProblem, DivisionStep, ShiftInfo } from '../types/division';

/**
 * Καθαρίζει και μορφοποιεί αριθμητικό string (αποδοχή κόμματος ή τελείας)
 */
export function normalizeInputNumber(val: string): string {
  return val.trim().replace(/\s+/g, '').replace(/\./g, ',');
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
 * Κύρια συνάρτηση επίλυσης και δημιουργίας βημάτων κάθετης διαίρεσης
 */
export function solveDivision(
  dividendInput: string,
  divisorInput: string,
  maxDecimalPlaces: number = 3
): DivisionProblem {
  const cleanDividend = normalizeInputNumber(dividendInput);
  const cleanDivisor = normalizeInputNumber(divisorInput);

  if (!cleanDividend || !cleanDivisor) {
    throw new Error('Παρακαλώ εισάγετε έγκυρο Διαιρετέο και Διαιρέτη.');
  }

  // Έλεγχος για διαίρεση με το μηδέν
  const divisorNumCheck = parseFloat(cleanDivisor.replace(',', '.'));
  if (isNaN(divisorNumCheck) || divisorNumCheck === 0) {
    throw new Error('Ο διαιρέτης δεν μπορεί να είναι 0!');
  }

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
  let decimalPlacesCount = 0;

  // Βρίσκουμε το αρχικό τμήμα
  // Ειδική περίπτωση: αν ολόκληρο το ακέραιο μέρος είναι μικρότερο από τον διαιρέτη
  // π.χ. 3,5 : 7 -> Το 7 στο 3 χωράει 0 φορές, βάζουμε 0, στο πηλίκο
  const intVal = parseInt(integerPartStr, 10);
  if (intVal < effectiveDivisor) {
    // Παίρνουμε το ακέραιο μέρος ως πρώτο τμήμα
    currentChunk = intVal;
    chunkStartIndex = 0;
    chunkEndIndex = integerPartStr.length - 1;
    digitPointer = integerPartStr.length;

    const quotientDigit = 0;
    const product = 0;
    const remainder = currentChunk;
    
    // Αμέσως μπαίνει υποδιαστολή γιατί εξαντλήθηκε το ακέραιο μέρος
    decimalPlaced = true;
    quotientStr += '0,';

    // Επόμενο ψηφίο που κατεβαίνει
    let broughtDownDigit: string | null = null;
    let broughtDownFromIndex: number | null = null;
    let isBroughtDownZero = false;

    if (digitPointer < allDigits.length) {
      const entry = allDigits[digitPointer];
      broughtDownDigit = entry.digit;
      broughtDownFromIndex = entry.originalIndex;
      digitPointer++;
    } else {
      broughtDownDigit = '0';
      isBroughtDownZero = true;
      decimalPlacesCount++;
    }

    const nextChunk = remainder * 10 + parseInt(broughtDownDigit, 10);

    steps.push({
      stepIndex: 0,
      currentChunk,
      chunkDigitsStr: currentChunk.toString(),
      chunkStartIndex,
      chunkEndIndex,
      quotientDigit: 0,
      isDecimalPointPlacedHere: true,
      product,
      productDigitsStr: '0',
      remainder,
      remainderDigitsStr: remainder.toString(),
      broughtDownDigit,
      broughtDownFromIndex,
      isBroughtDownZero,
      nextChunk,
      columnEndIndex: chunkEndIndex,
      hints: {
        quotientPrompt: `Το ακέραιο μέρος (${currentChunk}) είναι μικρότερο από τον διαιρέτη (${effectiveDivisor}). Χωράει 0 φορές!`,
        productPrompt: `0 × ${effectiveDivisor} = 0`,
        remainderPrompt: `${currentChunk} - 0 = ${currentChunk}`,
        bringDownPrompt: `Βάζουμε υποδιαστολή (,) στο πηλίκο και κατεβάζουμε το επόμενο ψηφίο (${broughtDownDigit}).`,
        detailedExplanation: `Επειδή το ${currentChunk} είναι μικρότερο από το ${effectiveDivisor}, γράφουμε 0 στο πηλίκο, τοποθετούμε κόμμα (υποδιαστολή) και συνεχίζουμε κατεβάζοντας το επόμενο ψηφίο.`
      }
    });

    currentChunk = nextChunk;
    stepIndex++;
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
      // Δεν υπάρχουν άλλα ψηφία
      if (remainder === 0) {
        // Τέλεια διαίρεση! Ολοκληρώθηκε!
        finished = true;
      } else if (decimalPlacesCount < maxDecimalPlaces) {
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
        decimalPlacesCount++;
      } else {
        // Φτάσαμε στο μέγιστο όριο δεκαδικών
        finished = true;
      }
    }

    const nextChunk = broughtDownDigit !== null ? remainder * 10 + parseInt(broughtDownDigit, 10) : null;
    const colEnd = stepIndex === 0 && steps.length === 0 ? chunkEndIndex : Math.max(chunkEndIndex, digitPointer - 2);

    const step: DivisionStep = {
      stepIndex,
      currentChunk,
      chunkDigitsStr: currentChunk.toString(),
      chunkStartIndex,
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
      hints: {
        quotientPrompt: `Πόσες φορές χωράει το ${effectiveDivisor} στο ${currentChunk};`,
        productPrompt: `Πολλαπλασίασε: ${quotientDigit} × ${effectiveDivisor} = ${product}`,
        remainderPrompt: `Αφαίρεσε: ${currentChunk} - ${product} = ${remainder}`,
        bringDownPrompt: broughtDownDigit !== null 
          ? (isBroughtDownZero 
              ? `Το υπόλοιπο είναι ${remainder}. Προσθέτουμε 0 δεξιά για να συνεχίσουμε τη διαίρεση με δεκαδικά.`
              : `Κατεβάζουμε το ψηφίο ${broughtDownDigit} δίπλα στο υπόλοιπο ${remainder}. Νέος αριθμός: ${nextChunk}`)
          : `Το υπόλοιπο είναι ${remainder}. Η διαίρεση ολοκληρώθηκε!`,
        detailedExplanation: `Το ${effectiveDivisor} χωράει ${quotientDigit} φορές στο ${currentChunk} (${quotientDigit} × ${effectiveDivisor} = ${product}). Αφαιρούμε και βρίσκουμε υπόλοιπο ${remainder}.`
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
    effectiveDividendStr,
    effectiveDivisor,
    dividendDecimalIndex: decimalPointCharIndex,
    shiftInfo,
    steps,
    quotientStr,
    finalRemainder,
    isExact,
    maxDecimalReached: decimalPlacesCount >= maxDecimalPlaces && finalRemainder !== 0,
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
        const divisor = choice([2, 4, 5, 10, 20]);
        const intQuot = randInt(5, 35);
        const decQuot = choice([0.5, 0.2, 0.4, 0.6, 0.8]);
        const quotient = intQuot + decQuot;
        const dividend = Math.round(quotient * divisor);
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else if (tier === 1) {
        // Βαθμίδα 2: Πηλίκο με 2 δεκαδικά ψηφία (διαιρέτες 4, 20, 25, 50)
        const divisor = choice([4, 20, 25, 50]);
        const intQuot = randInt(3, 25);
        const decQuot = choice([0.25, 0.75, 0.15, 0.35, 0.45, 0.65, 0.85]);
        const quotient = intQuot + decQuot;
        const dividend = Math.round(quotient * divisor);
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      } else {
        // Βαθμίδα 3: Πηλίκο με 3 δεκαδικά ψηφία (διαιρέτες 8, 40, 125)
        const divisor = choice([8, 40, 125]);
        const intQuot = randInt(2, 18);
        const decQuot = choice([0.125, 0.375, 0.625, 0.875]);
        const quotient = intQuot + decQuot;
        const dividend = Math.round(quotient * divisor);
        return { dividend: dividend.toString(), divisor: divisor.toString() };
      }
    }

    case 'decimal_dividend': {
      // Δεκαδικός διαιρετέος με ακέραιο διαιρέτη
      if (tier === 0) {
        // Βαθμίδα 1: 1 δεκαδικό στον διαιρετέο, μονοψήφιος διαιρέτης (3-8)
        const divisor = randInt(3, 8);
        const quotientVal = randInt(12, 55) / 10;
        const dividendVal = quotientVal * divisor;
        return { dividend: formatNumberGreek(dividendVal, 1), divisor: divisor.toString() };
      } else if (tier === 1) {
        // Βαθμίδα 2: 2 δεκαδικά στον διαιρετέο, μονοψήφιος ή απλός διψήφιος διαιρέτης (4-15)
        const divisor = choice([4, 5, 6, 7, 8, 12, 15, 20, 25]);
        const quotientVal = randInt(105, 455) / 100;
        const dividendVal = quotientVal * divisor;
        return { dividend: formatNumberGreek(dividendVal, 2), divisor: divisor.toString() };
      } else {
        // Βαθμίδα 3: 2-3 δεκαδικά στον διαιρετέο, διψήφιος διαιρέτης (12-35)
        const divisor = choice([12, 14, 15, 16, 24, 25, 32]);
        const quotientVal = randInt(1125, 6250) / 1000;
        const dividendVal = quotientVal * divisor;
        return { dividend: formatNumberGreek(dividendVal, 3), divisor: divisor.toString() };
      }
    }

    case 'decimal_both': {
      // Δεκαδικός διαιρετέος με δεκαδικό διαιρέτη (απαιτεί μετατόπιση υποδιαστολής)
      if (tier === 0) {
        // Βαθμίδα 1 (Βασική - ×10):
        // Διαιρέτης με 1 δεκαδικό ψηφίο (0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.4, 2.5, 3.2, 4.5)
        const divisorVal = choice([0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.4, 2.5, 3.2, 4.5]);
        const quotientVal = choice([
          randInt(12, 45),
          randInt(12, 35) + 0.5
        ]);
        const dividendVal = divisorVal * quotientVal;
        return {
          dividend: formatNumberGreek(dividendVal, 2),
          divisor: formatNumberGreek(divisorVal, 1),
        };
      } else if (tier === 1) {
        // Βαθμίδα 2 (Μεσαία - ×100):
        // Διαιρέτης με 2 δεκαδικά ψηφία (0.25, 0.15, 0.35, 0.75, 1.25, 0.08, 0.12, 0.05, 2.25)
        // ή διψήφιος ακέραιος με δεκαδικό (12.5, 15.5)
        const divisorVal = choice([
          0.25, 0.15, 0.35, 0.75, 1.25, 0.08, 0.12, 0.05, 2.25, 12.5, 15.5
        ]);
        const quotientVal = randInt(14, 55);
        const dividendVal = divisorVal * quotientVal;
        return {
          dividend: formatNumberGreek(dividendVal, 3),
          divisor: formatNumberGreek(divisorVal, 2),
        };
      } else {
        // Βαθμίδα 3 (Προχωρημένη - ×1000):
        // Διαιρέτης με 3 δεκαδικά ψηφία (0.125, 0.025, 0.008, 0.005, 0.075, 0.016)
        const divisorVal = choice([0.125, 0.025, 0.008, 0.005, 0.075, 0.016]);
        const quotientVal = choice([
          randInt(12, 48),
          randInt(12, 32) + 0.5
        ]);
        const dividendVal = divisorVal * quotientVal;
        return {
          dividend: formatNumberGreek(dividendVal, 3),
          divisor: formatNumberGreek(divisorVal, 3),
        };
      }
    }

    default:
      return { dividend: '875', divisor: '25' };
  }
}
