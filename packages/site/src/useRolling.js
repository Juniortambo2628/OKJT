import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Steps through `phrases` every `interval` ms. Pauses while `paused`; holds on
 * the first phrase for people who ask for reduced motion.
 */
export default function useRolling(phrases, { interval = 2800 } = {}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const still = useReducedMotion();

  useEffect(() => {
    if (still || paused || hovered) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => clearInterval(timer);
  }, [still, paused, hovered, interval, phrases.length]);

  const hold = { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
  return { item: phrases[index], paused, still, toggle: () => setPaused((v) => !v), hold };
}
