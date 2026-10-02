/**
 * Animation για το κατέβασμα του ψηφίου (Framer Motion)
 * Προσομοιώνει τη φυσική κίνηση του ψηφίου που "κατεβαίνει" από τον διαιρετέο στο υπόλοιπο
 */

import React from 'react';
import { motion } from 'motion/react';

interface BringDownAnimationProps {
  digit: string;
  isVirtualZero?: boolean;
}

export const BringDownAnimation: React.FC<BringDownAnimationProps> = ({ digit, isVirtualZero }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 1.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 22,
        duration: 0.4,
      }}
      className={`relative inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 font-mono-numbers font-bold text-lg md:text-xl rounded-md shadow-sm border ${
        isVirtualZero
          ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/50'
          : 'bg-indigo-100 text-indigo-900 border-indigo-300 ring-2 ring-indigo-300/50'
      }`}
      title={isVirtualZero ? 'Μηδενικό που προστέθηκε για δεκαδικά' : `Ψηφίο ${digit} που κατέβηκε`}
    >
      {digit}
      {isVirtualZero && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] px-1 bg-amber-500 text-white rounded font-sans font-semibold">
          δεκ.
        </span>
      )}
    </motion.div>
  );
};
