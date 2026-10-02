/**
 * Τύποι δεδομένων για το Game Mode
 */

import { DifficultyLevel } from './division';

export type GameCurriculumScope = 
  | 'integers'       // Ακέραιοι (Δ' - Ε' Δημοτικού: easy + intermediate_zero)
  | 'decimals_basic' // Με Δεκαδικά (Ε' - ΣΤ' Δημοτικού: easy + intermediate_zero + decimal_quotient + decimal_dividend)
  | 'all_cases'      // Όλες οι Περιπτώσεις (ΣΤ' Δημοτικού: όλοι οι τύποι)
  | 'current_tab';   // Μόνο το τρέχον είδος

export interface GameSettings {
  scope: GameCurriculumScope;
  totalProblems: number;
}

export interface ProblemResult {
  problemIndex: number;
  dividend: string;
  divisor: string;
  earnedPoints: number;
  possiblePoints: number;
  scorePercent: number;
  mistakesCount: number;
}

export interface GameSession {
  isActive: boolean;
  settings: GameSettings;
  currentIndex: number;
  results: ProblemResult[];
  earnedPointsTotal: number;
  possiblePointsTotal: number;
  currentStreak: number;
  maxStreak: number;
  isFinished: boolean;
}
