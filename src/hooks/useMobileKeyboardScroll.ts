/**
 * Hook για έξυπνο αυτόματο scroll και dynamic spacer σε smartphones/tablets
 * όταν εμφανίζεται το εικονικό πληκτρολόγιο.
 * 
 * ΕΓΓΥΗΣΗ: Στον υπολογιστή (desktop/laptop με ποντίκι) δεν εκτελείται καμία ενέργεια
 * και δεν επηρεάζει απολύτως τίποτα.
 * 
 * Χαρακτηριστικά:
 * - Single-shot scroll: Εξαλείφει πλήρως το διπλό / σπασμωδικό σκρολάρισμα.
 * - Ακυρώνει τα περιττά timers μόλις το πληκτρολόγιο ανοίξει πλήρως (visualViewport).
 * - Επαναφέρεται άμεσα μόλις ο μαθητής αλλάξει κελί ή κατεβάσει ψηφίο.
 */

import { useState, useEffect, useRef } from 'react';

export function useMobileKeyboardScroll() {
  const [keyboardSpacer, setKeyboardSpacer] = useState<number>(0);
  const blurTimerRef = useRef<number | null>(null);
  const fallbackScrollTimerRef = useRef<number | null>(null);
  const lastScrolledElementRef = useRef<HTMLElement | null>(null);

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

    const executeScrollOnce = (el: HTMLElement) => {
      if (!el || !isMobileDevice()) return;

      // Αν έχουμε ήδη κάνει scroll για αυτό ακριβώς το στοιχείο σε αυτή την εστίαση, αγνοούμε
      if (lastScrolledElementRef.current === el) {
        return;
      }

      lastScrolledElementRef.current = el;

      // Ακυρώνουμε τυχόν εκκρεμή fallback timers
      if (fallbackScrollTimerRef.current) {
        window.clearTimeout(fallbackScrollTimerRef.current);
        fallbackScrollTimerRef.current = null;
      }

      try {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      } catch {
        el.scrollIntoView(true);
      }
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

      // Αν αλλάξαμε κελί, επιτρέπουμε νέο μοναδικό scroll
      if (lastScrolledElementRef.current !== target) {
        lastScrolledElementRef.current = null;
      }

      // Άμεση δημιουργία κενού στο κάτω μέρος ώστε να μπορεί να σκρολάρει άνετα
      const approxKeyboardHeight = Math.min(340, Math.round(window.innerHeight * 0.44));
      setKeyboardSpacer(approxKeyboardHeight);

      // Fallback timer (300ms) ΜΟΝΟ αν για κάποιο λόγο δεν πυροδοτηθεί το visualViewport resize
      if (fallbackScrollTimerRef.current) {
        window.clearTimeout(fallbackScrollTimerRef.current);
      }
      fallbackScrollTimerRef.current = window.setTimeout(() => {
        executeScrollOnce(target);
      }, 300);
    };

    // 2. Ακρόαση όταν φεύγει το focus (blur)
    const handleFocusOut = () => {
      if (!isMobileDevice()) return;

      // Μικρή καθυστέρηση για την περίπτωση που ο μαθητής πάει αμέσως στο επόμενο κελί
      blurTimerRef.current = window.setTimeout(() => {
        const active = document.activeElement;
        const stillInInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!stillInInput) {
          setKeyboardSpacer(0);
          lastScrolledElementRef.current = null;
        }
      }, 150);
    };

    // 3. Σύγχρονη υποστήριξη Window VisualViewport API (Android / POCO & iOS Safari)
    // Αυτό είναι το απόλυτα ακριβές συμβάν όταν το πληκτρολόγιο έχει ολοκληρώσει το άνοιγμα!
    const visualViewport = window.visualViewport;
    const handleViewportResize = () => {
      if (!isMobileDevice() || !visualViewport) return;

      const windowH = window.innerHeight;
      const viewportH = visualViewport.height;
      const diff = windowH - viewportH;

      if (diff > 120) {
        // Το πληκτρολόγιο είναι ορατό: ρυθμίζουμε το ακριβές κενό
        setKeyboardSpacer(Math.round(diff + 20));

        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          // Εκτελούμε το ΜΟΝΑΔΙΚΟ οριστικό scroll
          executeScrollOnce(active);
        }
      } else {
        // Το πληκτρολόγιο έκλεισε
        const active = document.activeElement;
        const stillInInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!stillInInput) {
          setKeyboardSpacer(0);
          lastScrolledElementRef.current = null;
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
      if (fallbackScrollTimerRef.current) {
        window.clearTimeout(fallbackScrollTimerRef.current);
      }
    };
  }, []);

  return { keyboardSpacer };
}
