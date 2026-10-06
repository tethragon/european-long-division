/**
 * Εκπαιδευτικός Οδηγός Θεωρίας: Τα 4 Βήματα της Κάθετης Διαίρεσης
 * Προσαρμοσμένο για μαθητές ΣΤ' Δημοτικού
 */

import React from 'react';
import { X, BookOpen, ArrowRight, Lightbulb } from 'lucide-react';

interface TheoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryGuideModal: React.FC<TheoryGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Οδηγός Κάθετης Διαίρεσης (Ευρωπαϊκή Μέθοδος)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 text-xs md:text-sm text-slate-700 leading-relaxed">
          {/* Ο Κύκλος των 4 Βημάτων */}
          <div>
            <h4 className="font-bold text-indigo-900 text-sm mb-2">
              Τα 4 Βασικά Βήματα σε κάθε κύκλο:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-800">1. Διαιρώ (Πηλίκο):</span>
                <p className="text-slate-600 mt-0.5">
                  Επιλέγω το κατάλληλο τμήμα από τον διαιρετέο και βρίσκω πόσες φορές χωράει ο διαιρέτης.
                </p>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-800">2. Πολλαπλασιάζω (Γινόμενο):</span>
                <p className="text-slate-600 mt-0.5">
                  Πολλαπλασιάζω το ψηφίο του πηλίκου με τον διαιρέτη και γράφω το γινόμενο κάτω από το τμήμα.
                </p>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-800">3. Αφαιρώ (Υπόλοιπο):</span>
                <p className="text-slate-600 mt-0.5">
                  Αφαιρώ το γινόμενο από το τμήμα για να βρω το υπόλοιπο (πρέπει να είναι πάντα μικρότερο από τον διαιρέτη).
                </p>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-800">4. Κατεβάζω ψηφίο:</span>
                <p className="text-slate-600 mt-0.5">
                  Κατεβάζω το επόμενο ψηφίο του διαιρετέου δίπλα στο υπόλοιπο και επαναλαμβάνω τον κύκλο!
                </p>
              </div>
            </div>
          </div>

          {/* Ειδικοί Κανόνες για Δεκαδικούς */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Κανόνες για Δεκαδικούς Αριθμούς</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 text-xs">
              <li>
                <strong>Δεκαδικός Διαιρέτης:</strong> Δεν διαιρούμε ποτέ με δεκαδικό! Μετακινούμε την υποδιαστολή προς τα δεξιά και στους δύο αριθμούς (πολλαπλασιάζουμε με 10, 100, 1.000...) μέχρι ο διαιρέτης να γίνει ακέραιος.
              </li>
              <li>
                <strong>Υποδιαστολή στον Διαιρετέο:</strong> Μόλις φτάσουμε στην υποδιαστολή του διαιρετέου, βάζουμε αμέσως υποδιαστολή (κόμμα) στο πηλίκο.
              </li>
              <li>
                <strong>Συνέχιση Ατελούς Διαίρεσης:</strong> Όταν τελειώσουν τα ψηφία και υπάρχει υπόλοιπο, βάζουμε κόμμα στο πηλίκο και προσθέτουμε 0 δεξιά από το υπόλοιπο.
              </li>
              <li>
                <strong>Μηδέν στο Πηλίκο:</strong> Όταν ο διαιρέτης δεν χωράει (0 φορές), γράφουμε 0 στο πηλίκο, παρακάμπτουμε την περιττή αφαίρεση (− 0) και κατεβάζουμε αμέσως το επόμενο ψηφίο!
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Κατάλαβα, πάμε για εξάσκηση!
          </button>
        </div>
      </div>
    </div>
  );
};
