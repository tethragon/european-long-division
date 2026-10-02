/**
 * Μηχανή Game Mode & Επιλογής Ασκήσεων
 */

import { DifficultyLevel } from '../types/division';
import { GameCurriculumScope } from '../types/gameMode';
import { generateRandomProblem } from './divisionEngine';

export interface GeneratedGameProblem {
  dividend: string;
  divisor: string;
  levelId: DifficultyLevel;
  levelLabel: string;
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Ακέραιοι',
  intermediate_zero: 'Ενδιάμεσο Μηδέν',
  decimal_quotient: 'Δεκαδικό Πηλίκο',
  decimal_dividend: 'Δεκαδικός Διαιρετέος',
  decimal_both: 'Δεκαδικός με Δεκαδικό',
  custom: 'Προσαρμοσμένη',
};

/**
 * Επιλέγει ένα τυχαίο επίπεδο σύμφωνα με το επιλεγμένο scope του Game Mode
 */
export function getRandomLevelForScope(
  scope: GameCurriculumScope,
  currentLevel: DifficultyLevel
): DifficultyLevel {
  const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  switch (scope) {
    case 'integers':
      // Μόνο ακέραιοι (Δ' - Ε' Δημοτικού)
      return randChoice<DifficultyLevel>(['easy', 'intermediate_zero']);

    case 'decimals_basic':
      // Ακέραιοι + Δεκαδικά χωρίς μετατόπιση στον διαιρέτη (Ε' - ΣΤ' Δημοτικού)
      return randChoice<DifficultyLevel>(['easy', 'intermediate_zero', 'decimal_quotient', 'decimal_dividend']);

    case 'all_cases':
      // Όλες οι περιπτώσεις (ΣΤ' Δημοτικού)
      return randChoice<DifficultyLevel>(['easy', 'intermediate_zero', 'decimal_quotient', 'decimal_dividend', 'decimal_both']);

    case 'current_tab':
    default:
      if (currentLevel === 'custom') {
        return 'easy';
      }
      return currentLevel;
  }
}

/**
 * Παράγει μια νέα άσκηση για το Game Mode
 */
export function generateGameProblem(
  scope: GameCurriculumScope,
  currentLevel: DifficultyLevel
): GeneratedGameProblem {
  const chosenLevel = getRandomLevelForScope(scope, currentLevel);
  const randomTier = Math.floor(Math.random() * 3); // 0, 1, 2
  const problemPair = generateRandomProblem(chosenLevel, randomTier);

  return {
    dividend: problemPair.dividend,
    divisor: problemPair.divisor,
    levelId: chosenLevel,
    levelLabel: LEVEL_LABELS[chosenLevel] || 'Διαίρεση',
  };
}
