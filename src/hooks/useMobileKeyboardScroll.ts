/**
 * Hook για έξυπνο αυτόματο scroll και dynamic spacer σε smartphones/tablets
 * όταν εμφανίζεται το εικονικό πληκτρολόγιο.
 * 
 * ΕΓΓΥΗΣΗ: Στον υπολογιστή (desktop/laptop με ποντίκι) δεν εκτελείται καμία ενέργεια
 * και δεν επηρεάζει απολύτως τίποτα.
 */

import { useState, useEffect, useRef } from 'react';

export function useMobileKeyboardScroll() {
  const [keyboardSpacer, setKeyboardSpacer] = useState<number>(0);
  const blurTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Έλεγχος αν η συσκευή είναι κινητό / οθόνη αφής
    const isMobileDevice = () => {
      if (typeof window === 'undefined') return false;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth <= 1024;
      return hasTouch && isNarrow;
    };

    if (!isMobileDevice()) {
      return;
    }

    const scrollIntoSmartView = (el: HTMLElement, delay = 260) => {
      if (!el || !isMobileDevice()) return;

      setTimeout(() => {
        try {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        } catch {
          el.scrollIntoView(true);
        }
      }, delay);
    };

    // 1. Ακρόαση όταν ένα input παίρνει focus
    const handleFocusIn = (e: FocusEvent) => {
      if (!isMobileDevice()) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (!isInput) return;

      if (blurTimerRef.current) {
        window.clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }

      // Προσθήκη ασφαλούς κενού στο κάτω μέρος για να έχει περιθώριο κύλισης η σελίδα
      // ακόμη κι αν το κελί είναι πολύ χαμηλά στον πίνακα
      const approxKeyboardHeight = Math.min(340, Math.round(window.innerHeight * 0.44));
      setKeyboardSpacer(approxKeyboardHeight);

      // Scroll στο κέντρο του ορατού χώρου
      scrollIntoSmartView(target, 280);
    };

    // 2. Ακρόαση όταν φεύγει το focus (blur)
    const handleFocusOut = (e: FocusEvent) => {
      if (!isMobileDevice()) return;

      // Μικρή καθυστέρηση για την περίπτωση που ο μαθητής πάει αμέσως στο επόμενο κελί
      blurTimerRef.current = window.setTimeout(() => {
        const active = document.activeElement;
        const stillInInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!stillInInput) {
          setKeyboardSpacer(0);
        }
      }, 150);
    };

    // 3. Σύγχρονη υποστήριξη Window VisualViewport API (iOS Safari & Android Chrome)
    const visualViewport = window.visualViewport;
    const handleViewportResize = () => {
      if (!isMobileDevice() || !visualViewport) return;

      const windowH = window.innerHeight;
      const viewportH = visualViewport.height;
      const diff = windowH - viewportH;

      if (diff > 120) {
        // Το εικονικό πληκτρολόγιο είναι ανοιχτό
        setKeyboardSpacer(Math.round(diff + 24));
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          scrollIntoSmartView(active, 80);
        }
      } else {
        // Το πληκτρολόγιο έκλεισε
        const active = document.activeElement;
        const stillInInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!stillInInput) {
          setKeyboardSpacer(0);
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    if (visualViewport) {
      visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleViewportResize);
      }
      if (blurTimerRef.current) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  return { keyboardSpacer };
}
