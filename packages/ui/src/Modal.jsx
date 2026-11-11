import Overlay from './Overlay.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

/**
 * Generic, reusable modal dialog.
 *
 * Renders a dimmed <Overlay> with a centered, scrollable panel. The panel is
 * transparent so the child content (which typically already is a styled card)
 * provides its own chrome; a floating close button sits at the top-right.
 *
 * @param {boolean} [showClose=true] - The floating close button; turn it off
 *   when the content has its own.
 * @param {string} [className] - Extra classes for the panel (e.g. its own
 *   background, or a height).
 */
export default function Modal({ open, onClose, children, maxWidth = 'lg', label, showClose = true, className = '' }) {
  const widthClass = MAX_WIDTHS[maxWidth] || MAX_WIDTHS.lg;

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          onClose={onClose}
          zIndex={9998}
          className="flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${widthClass} my-auto`}
          >
            {showClose && (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-surface shadow-lg border border-tone-200 flex items-center justify-center text-tone-500 hover:text-tone-800 hover:bg-tone-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className={`max-h-[88vh] overflow-y-auto rounded-2xl ${className}`.trim()}>
              {children}
            </div>
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
