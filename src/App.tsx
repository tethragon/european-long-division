/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDivision } from './hooks/useDivision';
import { useGameMode } from './hooks/useGameMode';
import { DivisionBoard } from './components/EuropeanGrid/DivisionBoard';
import { LevelSelector } from './components/Controls/LevelSelector';
import { PedagogicalGuide } from './components/Controls/PedagogicalGuide';
import { MultiplesHelper } from './components/Controls/MultiplesHelper';
import { VerificationCard } from './components/Controls/VerificationCard';
import { CustomProblemModal } from './components/Controls/CustomProblemModal';
import { TheoryGuideModal } from './components/Controls/TheoryGuideModal';
import { AppInfoModal } from './components/Controls/AppInfoModal';
import { GameHud } from './components/Game/GameHud';
import { GameSetupModal } from './components/Game/GameSetupModal';
import { GameCompletedModal } from './components/Game/GameCompletedModal';
import { GameNextCard } from './components/Game/GameNextCard';
import { useMobileKeyboardScroll } from './hooks/useMobileKeyboardScroll';
import { BookOpen, Sparkles, Calculator, Award, GraduationCap, Info, Trophy } from 'lucide-react';

export default function App() {
  const { keyboardSpacer } = useMobileKeyboardScroll();
  const {
    problem,
    level,
    setLevel,
    currentTier,
    sessionMistakes,
    dividendInput,
    divisorInput,
    activeStepIndex,
    activeSubStep,
    shiftUserState,
    stepStates,
    feedback,
    focusedCellId,
    setFocusedCellId,
    showMultiplesHelper,
    setShowMultiplesHelper,
    isCompleted,
    selectShiftMultiplier,
    setEnteredShiftDividend,
    setEnteredShiftDivisor,
    validateShiftInputs,
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
    setGameModeInfo,
  } = useDivision();

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGameSetupModalOpen, setIsGameSetupModalOpen] = useState(false);

  // Cheat Code (Testing): 5 συνεχόμενα πατήματα του πλήκτρου '*' (ή 5 γρήγορα taps στο λογότυπο)
  // λύνουν αμέσως και ορθά τη διαίρεση σε ΟΛΑ τα modes (Game Mode, Εξάσκηση & Δική μου Άσκηση).
  const starPressCountRef = useRef<number>(0);
  const starPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerInstantSolve = useCallback(() => {
    instantSolveCurrent();
  }, [instantSolveCurrent]);

  useEffect(() => {
    const handleKeyDownStar = (e: KeyboardEvent) => {
      // Δεν ενεργοποιείται όταν κάποιο παράθυρο (modal) είναι ανοιχτό
      if (isCustomModalOpen || isTheoryModalOpen || isInfoModalOpen || isGameSetupModalOpen) {
        return;
      }

      const isStarKey =
        e.key === '*' ||
        e.key === 'Multiply' ||
        e.code === 'NumpadMultiply' ||
        e.keyCode === 106;

      if (isStarKey) {
        e.preventDefault();
        e.stopPropagation();

        starPressCountRef.current += 1;
        if (starPressTimerRef.current) {
          clearTimeout(starPressTimerRef.current);
        }

        if (starPressCountRef.current >= 5) {
          starPressCountRef.current = 0;
          triggerInstantSolve();
        } else {
          starPressTimerRef.current = setTimeout(() => {
            starPressCountRef.current = 0;
          }, 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownStar, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDownStar, true);
      if (starPressTimerRef.current) {
        clearTimeout(starPressTimerRef.current);
      }
    };
  }, [
    triggerInstantSolve,
    isCustomModalOpen,
    isTheoryModalOpen,
    isInfoModalOpen,
    isGameSetupModalOpen,
  ]);

  // Υποστήριξη και για οθόνες αφής/κινητά (όπου δεν υπάρχει πλήκτρο *):
  // 5 γρήγορα taps στο λογότυπο του καπέλου (Top Bar) ενεργοποιούν επίσης την αυτόματη επίλυση
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = () => {
    if (isCustomModalOpen || isTheoryModalOpen || isInfoModalOpen || isGameSetupModalOpen) return;

    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) {
      clearTimeout(logoTapTimerRef.current);
    }

    if (logoTapCountRef.current >= 5) {
      logoTapCountRef.current = 0;
      triggerInstantSolve();
    } else {
      logoTapTimerRef.current = setTimeout(() => {
        logoTapCountRef.current = 0;
      }, 2000);
    }
  };

  // Hook διαχείρισης Game Mode
  const {
    gameSession,
    totalScorePercent,
    startGame,
    recordProblemCompletion,
    advanceToNextProblem,
    exitGame,
  } = useGameMode();

  // Συγχρονισμός κατάστασης Game Mode στο useDivision ώστε τα μηνύματα ολοκλήρωσης
  // να προσαρμόζονται κατάλληλα (π.χ. «Επόμενη Άσκηση» αντί για «Νέα Άσκηση»)
  useEffect(() => {
    setGameModeInfo({
      isActive: gameSession.isActive,
      isLastProblem: gameSession.currentIndex + 1 >= gameSession.settings.totalProblems,
    });
  }, [gameSession.isActive, gameSession.currentIndex, gameSession.settings.totalProblems, setGameModeInfo]);

  // Καταγραφή ολοκλήρωσης άσκησης στο Game Mode
  const lastRecordedIndexRef = useRef<number | null>(null);
  const hasSentFinalScormScoreRef = useRef<boolean>(false);

  useEffect(() => {
    if (!gameSession.isActive) {
      lastRecordedIndexRef.current = null;
      hasSentFinalScormScoreRef.current = false;
      return;
    }

    if (isCompleted && lastRecordedIndexRef.current !== gameSession.currentIndex) {
      lastRecordedIndexRef.current = gameSession.currentIndex;
      recordProblemCompletion(problem, sessionMistakes);
    }
  }, [
    isCompleted,
    gameSession.isActive,
    gameSession.currentIndex,
    problem,
    sessionMistakes,
    recordProblemCompletion,
  ]);

  // 📡 Αυτόματη άμεση αποστολή βαθμολογίας στο eFront LMS μόλις ολοκληρωθεί
  // η τελευταία άσκηση της πρόκλησης, ΧΩΡΙΣ να απαιτείται το πάτημα του κουμπιού
  // "Δες τα Τελικά Αποτελέσματα" από τον μαθητή!
  useEffect(() => {
    if (!gameSession.isActive) return;

    const allProblemsCompleted =
      gameSession.results.length >= gameSession.settings.totalProblems &&
      gameSession.results.length > 0;

    if (allProblemsCompleted && !hasSentFinalScormScoreRef.current) {
      hasSentFinalScormScoreRef.current = true;
      try {
        if (window.parent && window.parent !== window) {
          const perfectCount = gameSession.results.filter((r) => r.scorePercent >= 80).length;
          window.parent.postMessage(
            {
              type: 'MATH_DIVISION_GAME_COMPLETED',
              score: Math.round(totalScorePercent),
              passed: totalScorePercent >= 50,
              totalProblems: gameSession.settings.totalProblems,
              perfectCount,
              scope: gameSession.settings.scope,
            },
            '*'
          );
        }
      } catch {
        // Safe cross-origin ignore
      }
    }
  }, [
    gameSession.isActive,
    gameSession.results,
    gameSession.settings.totalProblems,
    gameSession.settings.scope,
    totalScorePercent,
  ]);

  // Πληκτρολόγιο: Όταν ολοκληρωθεί μια άσκηση (σε Game Mode, Εξάσκηση ή Δική μου Άσκηση),
  // το πάτημα του Enter προχωράει στην επόμενη άσκηση (ή ανοίγει την εισαγωγή νέας διαίρεσης)
  useEffect(() => {
    if (!isCompleted) return;

    let canTrigger = false;
    const timer = setTimeout(() => {
      canTrigger = true;
    }, 200);

    const handleEnterOnComplete = (e: KeyboardEvent) => {
      if (!canTrigger) return;
      if (
        isCustomModalOpen ||
        isTheoryModalOpen ||
        isInfoModalOpen ||
        isGameSetupModalOpen ||
        gameSession.isFinished
      ) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (gameSession.isActive) {
          advanceToNextProblem(level, loadProblem);
        } else if (level === 'custom') {
          setIsCustomModalOpen(true);
        } else {
          selectLevelAndGenerate(level);
        }
      }
    };

    window.addEventListener('keydown', handleEnterOnComplete);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleEnterOnComplete);
    };
  }, [
    gameSession.isActive,
    isCompleted,
    isCustomModalOpen,
    isTheoryModalOpen,
    isInfoModalOpen,
    isGameSetupModalOpen,
    gameSession.isFinished,
    advanceToNextProblem,
    selectLevelAndGenerate,
    level,
    loadProblem,
  ]);

  // Πληκτρολόγιο: Όταν είναι ενεργό το υπο-βήμα 'bring_down', το πάτημα του Enter
  // εκτελεί το κατέβασμα του ψηφίου.
  // Χρησιμοποιούμε μικρό χρονικό φράγμα (150ms) ώστε να μην καταναλωθεί
  // το ίδιο πάτημα Enter που μόλις επικύρωσε το υπόλοιπο!
  React.useEffect(() => {
    if (activeSubStep !== 'bring_down') return;

    let canTrigger = false;
    const timer = setTimeout(() => {
      canTrigger = true;
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canTrigger) return;
      if (isCustomModalOpen || isTheoryModalOpen || isInfoModalOpen || isGameSetupModalOpen) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        completeBringDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSubStep, completeBringDown, isCustomModalOpen, isTheoryModalOpen, isInfoModalOpen, isGameSetupModalOpen]);

  const currentStep = problem.steps[activeStepIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 1. TOP BAR (Strict 3-zone Top Bar Contract) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div
          onClick={handleLogoTap}
          className="flex items-center gap-2 cursor-pointer select-none active:opacity-80 transition-opacity"
          title="Κάθετη Διαίρεση"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Κάθετη Διαίρεση
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setIsTheoryModalOpen(true)}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Κανόνες & Θεωρία</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMultiplesHelper(!showMultiplesHelper)}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-500" />
            <span>Πρόχειρο Προπαίδειας</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Δική μου Άσκηση</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Info */}
        <div className="flex items-center gap-2">
          {/* Κουμπί Game Mode */}
          <button
            type="button"
            onClick={() => setIsGameSetupModalOpen(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              gameSession.isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-white ring-2 ring-amber-300'
                : 'bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95'
            }`}
            title="Έναρξη Παιχνιδιού με Σκορ %"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-950" />
            <span>Game Mode 🏆</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (gameSession.isActive) {
                if (window.confirm('Είστε σε Game Mode. Θέλετε να δημιουργήσετε νέα τυχαία άσκηση και να διακόψετε το παιχνίδι;')) {
                  exitGame();
                  selectLevelAndGenerate(level);
                }
              } else {
                selectLevelAndGenerate(level);
              }
            }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">Νέα Άσκηση</span>
            <span className="sm:hidden">Νέα</span>
          </button>

          {/* Κουμπί Πληροφοριών & Στοιχείων Έκδοσης */}
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/60 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            title="Πληροφορίες Εφαρμογής & Έκδοση"
            aria-label="Πληροφορίες εφαρμογής"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. ΚΥΡΙΟ ΠΕΡΙΕΧΟΜΕΝΟ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-5">
        {/* Αν είναι ενεργό το Game Mode, εμφανίζουμε την HUD μπάρα προόδου */}
        {gameSession.isActive ? (
          <GameHud
            session={gameSession}
            totalScorePercent={totalScorePercent}
            onExit={exitGame}
          />
        ) : (
          <LevelSelector
            currentLevel={level}
            currentTier={currentTier}
            onSelectLevel={selectLevelAndGenerate}
            onNewRandom={() => selectLevelAndGenerate(level)}
            onRestart={restartCurrent}
            onOpenCustom={() => setIsCustomModalOpen(true)}
          />
        )}

        {/* Παιδαγωγικός Οδηγός & Feedback */}
        <PedagogicalGuide
          currentStep={currentStep}
          activeStepIndex={activeStepIndex}
          totalSteps={problem.steps.length}
          activeSubStep={activeSubStep}
          feedback={feedback}
          onGiveHint={giveHintOrAutoFill}
          onToggleMultiples={() => setShowMultiplesHelper(!showMultiplesHelper)}
          showMultiples={showMultiplesHelper}
          effectiveDivisor={problem.effectiveDivisor}
        />

        {/* Κάρτα Ολοκλήρωσης & Επαλήθευσης (εμφανίζεται όταν τελειώσει η διαίρεση) */}
        {isCompleted && (
          gameSession.isActive ? (
            <GameNextCard
              problem={problem}
              session={gameSession}
              onNext={() => advanceToNextProblem(level, loadProblem)}
            />
          ) : (
            <VerificationCard
              problem={problem}
              onNextProblem={() => {
                if (level === 'custom') {
                  setIsCustomModalOpen(true);
                } else {
                  selectLevelAndGenerate(level);
                }
              }}
            />
          )
        )}

        {/* Κύριος Χώρος Εργασίας (Πίνακας + Βοηθητικό Πρόχειρο) */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Ευρωπαϊκός Πίνακας Διαίρεσης */}
          <div className="flex-1 w-full min-w-0">
            <DivisionBoard
              problem={problem}
              stepStates={stepStates}
              activeStepIndex={activeStepIndex}
              activeSubStep={activeSubStep}
              shiftUserState={shiftUserState}
              onSelectMultiplier={selectShiftMultiplier}
              onEnteredDividendChange={setEnteredShiftDividend}
              onEnteredDivisorChange={setEnteredShiftDivisor}
              onValidateShift={validateShiftInputs}
              onQuotientChange={setQuotientDigit}
              onValidateQuotient={validateQuotient}
              onProductDigitChange={setProductDigit}
              onValidateProduct={validateProduct}
              onRemainderDigitChange={setRemainderDigit}
              onValidateRemainder={validateRemainder}
              onTriggerBringDown={completeBringDown}
              focusedCellId={focusedCellId}
              setFocusedCellId={setFocusedCellId}
            />
          </div>

          {/* Πλευρικό Πρόχειρο Προπαίδειας Διαιρέτη */}
          {showMultiplesHelper && (
            <div className="w-full lg:w-auto">
              <MultiplesHelper
                divisor={problem.effectiveDivisor}
                currentChunk={currentStep?.currentChunk}
                onClose={() => setShowMultiplesHelper(false)}
                onSelectMultiplier={(mult) => {
                  if (activeSubStep === 'quotient') {
                    setQuotientDigit(mult.toString());
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Δυναμικό κενό κύλισης μόνο σε κινητά όταν ανοίγει το αριθμητικό πληκτρολόγιο */}
        <div
          aria-hidden="true"
          style={{ height: keyboardSpacer > 0 ? `${keyboardSpacer}px` : 0 }}
          className="pointer-events-none w-full shrink-0"
        />

        {/* Οδηγίες Χρήσης & Πληκτρολογίου */}
        <footer className="mt-auto pt-6 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>Συντομεύσεις:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">
              Enter
            </kbd>
            <span>Έλεγχος</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">
              ← / →
            </kbd>
            <span>Πλοήγηση</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <span>Ευρωπαϊκή Μέθοδος Κάθετης Διαίρεσης</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium cursor-pointer"
            >
              Πληροφορίες & Έκδοση
            </button>
          </div>
        </footer>
      </main>

      {/* Παράθυρα (Modals) */}
      <CustomProblemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={(dividend, divisor) => {
          setLevel('custom');
          loadProblem(dividend, divisor);
        }}
        initialDividend={dividendInput}
        initialDivisor={divisorInput}
      />

      <TheoryGuideModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
      />

      <AppInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Παράθυρο Έναρξης Game Mode */}
      <GameSetupModal
        isOpen={isGameSetupModalOpen}
        currentLevel={level}
        onClose={() => setIsGameSetupModalOpen(false)}
        onStart={(settings) => startGame(settings, level, loadProblem)}
      />

      {/* Παράθυρο Τελικών Αποτελεσμάτων Game Mode */}
      <GameCompletedModal
        isOpen={gameSession.isFinished}
        session={gameSession}
        totalScorePercent={totalScorePercent}
        onPlayAgain={() => {
          exitGame();
          setIsGameSetupModalOpen(true);
        }}
        onExit={exitGame}
      />
    </div>
  );
}
