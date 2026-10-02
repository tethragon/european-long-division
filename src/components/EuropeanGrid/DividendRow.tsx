/**
 * Εμφάνιση του Διαιρετέου (Dividend) στην κορυφή της Ευρωπαϊκής διάταξης
 * Χρησιμοποιεί αυστηρό σύστημα στηλών (ίδιο με τις γραμμές αφαίρεσης) για τέλεια ευθυγράμμιση.
 */

import React from 'react';
import { motion } from 'motion/react';

interface DividendRowProps {
  dividendStr: string;
  activeChunkStart?: number;
  activeChunkEnd?: number;
  highlightActive?: boolean;
  totalCols: number;
}

interface DigitItem {
  char: string;
  colIndex: number;
  hasCommaAfter: boolean;
}

export const DividendRow: React.FC<DividendRowProps> = ({
  dividendStr,
  activeChunkStart = 0,
  activeChunkEnd = 0,
  highlightActive = true,
  totalCols,
}) => {
  // Ανάλυση χαρακτήρων και αντιστοίχιση ψηφίων σε στήλες (εξαιρώντας το κόμμα από την αρίθμηση στηλών)
  const digits: DigitItem[] = [];
  const chars = dividendStr.split('');
  let currentDigitCol = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === ',') {
      if (digits.length > 0) {
        digits[digits.length - 1].hasCommaAfter = true;
      }
    } else {
      digits.push({
        char,
        colIndex: currentDigitCol,
        hasCommaAfter: false,
      });
      currentDigitCol++;
    }
  }

  // Στήλες από -1 (στήλη προσήμου πλην) έως totalCols - 1
  const allColIndices: number[] = [];
  for (let c = -1; c < totalCols; c++) {
    allColIndices.push(c);
  }

  return (
    <div className="flex items-center gap-1 font-mono-numbers">
      {allColIndices.map((col) => {
        // Στήλη -1: Κενό placeholder ίσου πλάτους με τη στήλη του πρόσημου πλην
        if (col === -1) {
          return <div key="div-col-minus" className="w-8 h-8 md:w-9 md:h-9 shrink-0" />;
        }

        // Στήλες ψηφίων (0, 1, 2, ...)
        const digitItem = digits.find((d) => d.colIndex === col);

        if (!digitItem) {
          // Κενή στήλη αν totalCols ξεπερνά τα αρχικά ψηφία (π.χ. σε δεκαδική επέκταση)
          return <div key={`div-empty-${col}`} className="w-8 h-8 md:w-9 md:h-9 shrink-0" />;
        }

        const isPartOfActiveChunk =
          highlightActive &&
          col >= activeChunkStart &&
          col <= activeChunkEnd;

        return (
          <div key={`div-digit-${col}`} className="relative flex flex-col items-center shrink-0">
            {/* Οπτικό ενιαίο τόξο / καπελάκι (arc) για το τμήμα που χωρίζει ο μαθητής */}
            {isPartOfActiveChunk && (
              <div
                className="absolute -top-2 inset-x-[-2px] h-1.5 flex justify-center pointer-events-none z-10"
              >
                <div
                  className={`h-full w-full border-t-2 border-indigo-500 ${
                    col === activeChunkStart ? 'border-l-2 rounded-tl-xs' : ''
                  } ${
                    col === activeChunkEnd ? 'border-r-2 rounded-tr-xs' : ''
                  }`}
                />
              </div>
            )}

            {/* Κελί ψηφίου */}
            <div
              className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-bold text-lg md:text-xl rounded-lg transition-colors duration-200 ${
                digitItem.char === '?'
                  ? 'bg-slate-50 text-slate-400 border border-dashed border-slate-300'
                  : isPartOfActiveChunk
                  ? 'bg-indigo-50 text-indigo-950 border border-indigo-300 ring-2 ring-indigo-200/60'
                  : 'bg-white text-slate-800 border border-slate-300 shadow-2xs'
              }`}
            >
              {digitItem.char}
            </div>

            {/* Ανεξάρτητο span για την υποδιαστολή (κόμμα) - τοποθετείται στο δεξί περιθώριο του κελιού χωρίς να αλλοιώνει το grid */}
            {digitItem.hasCommaAfter && (
              <span
                className="absolute -right-2 bottom-0 text-2xl font-bold text-indigo-700 pointer-events-none select-none z-10"
                title="Υποδιαστολή (κόμμα)"
              >
                ,
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
