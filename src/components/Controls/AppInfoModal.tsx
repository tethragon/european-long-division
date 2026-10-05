/**
 * Καλαίσθητο Modal Πληροφοριών Εφαρμογής & Στοιχείων Έκδοσης
 */

import React from 'react';
import { X, Info, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

// ============================================================================
// 📌 ΡΥΘΜΙΣΗ ΣΤΟΙΧΕΙΩΝ ΕΚΔΟΣΗΣ & ΔΗΜΙΟΥΡΓΟΥ (APP VERSION & ARCHITECT CONFIG)
// Μπορείτε να αλλάξετε εύκολα τον αριθμό έκδοσης ή το όνομα παρακάτω:
// ============================================================================
export const APP_VERSION = 'v. 0.8'; // <-- 👈 ΑΛΛΑΞΤΕ ΤΗΝ ΕΚΔΟΣΗ ΕΔΩ (π.χ. 'v. 0.2', 'v. 1.0')
export const PROGRAM_ARCHITECT = 'George Petrakis';
// ============================================================================

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-sm w-full p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200 relative text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Κουμπί Κλεισίματος */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Κλείσιμο παραθύρου"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Κεντρικό Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>

        {/* Τίτλος & Περιγραφή */}
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Κάθετη Διαίρεση
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Ευρωπαϊκή Μέθοδος
        </p>

        {/* Διαχωριστική γραμμή */}
        <div className="w-full my-5 border-t border-slate-100" />

        {/* Στοιχεία Δημιουργού */}
        <div className="flex flex-col items-center gap-1 w-full bg-slate-50/80 border border-slate-200/60 rounded-2xl py-3.5 px-4">
          <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
            Program Architect
          </span>
          <span className="text-base font-bold text-slate-900 tracking-tight">
            {PROGRAM_ARCHITECT}
          </span>

          {/* Έκδοση */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-200/90 text-xs font-mono-numbers font-semibold text-indigo-700 shadow-2xs">
            <span className="text-[11px] font-sans text-slate-500">έκδοση</span>
            <span className="font-bold text-indigo-900">{APP_VERSION}</span>
          </div>
        </div>

        {/* Κουμπί επιβεβαίωσης / κλεισίματος */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Εντάξει
        </button>
      </div>
    </div>
  );
};
