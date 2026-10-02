/**
 * Hook διαχείρισης συνεδρίας Game Mode
 */

import { useState, useCallback, useMemo } from 'react';
import { DifficultyLevel, DivisionProblem } from '../types/division';
import { GameCurriculumScope, GameSettings, ProblemResult, GameSession } from '../types/gameMode';
import { generateGameProblem, GeneratedGameProblem } from '../engine/gameEngine';

export function useGameMode() {
  const [session, setSession] = useState<GameSession>({
    isActive: false,
    settings: {
      scope: 'integers',
      totalProblems: 5,
    },
    currentIndex: 0,
    results: [],
    earnedPointsTotal: 0,
    possiblePointsTotal: 0,
    currentStreak: 0,
    maxStreak: 0,
    isFinished: false,
  });

  const [currentProblemInfo, setCurrentProblemInfo] = useState<GeneratedGameProblem | null>(null);

  /**
   * Έναρξη νέου παιχνιδιού
   */
  const startGame = useCallback((
    settings: GameSettings,
    currentLevel: DifficultyLevel,
    loadProblemCallback: (dividend: string, divisor: string) => void
  ) => {
    const firstProblem = generateGameProblem(settings.scope, currentLevel);
    setCurrentProblemInfo(firstProblem);

    setSession({
      isActive: true,
      settings,
      currentIndex: 0,
      results: [],
      earnedPointsTotal: 0,
      possiblePointsTotal: 0,
      currentStreak: 0,
      maxStreak: 0,
      isFinished: false,
    });

    loadProblemCallback(firstProblem.dividend, firstProblem.divisor);
  }, []);

  /**
   * Καταγραφή ολοκλήρωσης μιας διαίρεσης στο Game Mode
   */
  const recordProblemCompletion = useCallback((
    problem: DivisionProblem,
    sessionMistakes: number
  ) => {
    setSession(prev => {
      if (!prev.isActive || prev.isFinished) return prev;

      // Υπολογισμός συνολικών ενεργειών της συγκεκριμένης διαίρεσης
      const shiftActions = problem.shiftInfo.wasShifted ? 2 : 0;
      const stepActions = problem.steps.length * 3; // πηλίκο, γινόμενο, υπόλοιπο
      const bringDownActions = Math.max(0, problem.steps.length - 1);
      const totalDecisions = Math.max(3, shiftActions + stepActions + bringDownActions);

      // Βαθμολογία με βάση τα λάθη / υποδείξεις
      // Κάθε λάθος αφαιρεί 0.6 πόντους από το σύνολο (επιεικής, παιδαγωγική προσέγγιση)
      const penalty = sessionMistakes * 0.6;
      const earned = Math.max(1, Number((totalDecisions - penalty).toFixed(1)));
      const possible = totalDecisions;
      const problemScore = Math.min(100, Math.max(10, Math.round((earned / possible) * 100)));

      // Ενημέρωση σερί
      const isPerfect = sessionMistakes === 0;
      const newStreak = isPerfect ? prev.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);

      const result: ProblemResult = {
        problemIndex: prev.currentIndex,
        dividend: problem.originalDividendStr,
        divisor: problem.originalDivisorStr,
        earnedPoints: earned,
        possiblePoints: possible,
        scorePercent: problemScore,
        mistakesCount: sessionMistakes,
      };

      const newResults = [...prev.results, result];
      const newEarnedTotal = prev.earnedPointsTotal + earned;
      const newPossibleTotal = prev.possiblePointsTotal + possible;

      return {
        ...prev,
        results: newResults,
        earnedPointsTotal: newEarnedTotal,
        possiblePointsTotal: newPossibleTotal,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
      };
    });
  }, []);

  /**
   * Μετάβαση στην επόμενη άσκηση του σετ
   */
  const advanceToNextProblem = useCallback((
    currentLevel: DifficultyLevel,
    loadProblemCallback: (dividend: string, divisor: string) => void
  ) => {
    setSession(prev => {
      if (!prev.isActive) return prev;

      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.settings.totalProblems) {
        // Τέλος του παιχνιδιού!
        return {
          ...prev,
          isFinished: true,
        };
      }

      // Παραγωγή επόμενης άσκησης
      const nextProb = generateGameProblem(prev.settings.scope, currentLevel);
      setCurrentProblemInfo(nextProb);
      loadProblemCallback(nextProb.dividend, nextProb.divisor);

      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  }, []);

  /**
   * Τερματισμός / Έξοδος από το Game Mode
   */
  const exitGame = useCallback(() => {
    setSession({
      isActive: false,
      settings: {
        scope: 'integers',
        totalProblems: 5,
      },
      currentIndex: 0,
      results: [],
      earnedPointsTotal: 0,
      possiblePointsTotal: 0,
      currentStreak: 0,
      maxStreak: 0,
      isFinished: false,
    });
    setCurrentProblemInfo(null);
  }, []);

  /**
   * Υπολογισμός τρέχοντος συνολικού σκορ %
   */
  const totalScorePercent = useMemo(() => {
    if (session.results.length === 0) return 100;
    if (session.possiblePointsTotal === 0) return 100;
    return Math.min(100, Math.max(0, Math.round((session.earnedPointsTotal / session.possiblePointsTotal) * 100)));
  }, [session.results.length, session.earnedPointsTotal, session.possiblePointsTotal]);

  return {
    gameSession: session,
    currentProblemInfo,
    totalScorePercent,
    startGame,
    recordProblemCompletion,
    advanceToNextProblem,
    exitGame,
  };
}
