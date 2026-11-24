import { AnimatePresence, motion } from 'framer-motion';

/** The rolling words themselves: one line, the next sliding up into place. Decorative. */
export function RollingWord({ item, className = '', ...rest }) {
  return (
    <span aria-hidden="true" className={`relative block h-[1.15em] overflow-hidden ${className}`} {...rest}>
      <AnimatePresence initial={false}>
        <motion.span
          key={item.phrase}
          lang={item.code}
          initial={{ y: '70%', opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ y: '-70%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
          className="absolute inset-x-0 block whitespace-nowrap"
        >
          {item.phrase}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
