import { motion } from 'framer-motion';

interface ScrollProgressProps {
  progress: number;
  direction: 'forward' | 'backward';
  isVisible: boolean;
}

export default function ScrollProgress({ progress, direction, isVisible }: ScrollProgressProps) {
  const percent = Math.round(progress * 100);
  const strokeDasharray = `${(progress * 360 / 360) * 232.5} 232.5`;

  if (!isVisible) return null;

  return (
    <motion.div
      className="scroll-progress-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="scroll-progress-bg" />
      <svg className="scroll-progress-arc" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="37"
          fill="none"
          className="scroll-progress-circle"
          strokeDasharray={strokeDasharray}
        />
      </svg>
      <div className="scroll-progress-center">
        <span className="scroll-progress-percent">{percent}%</span>
      </div>
      <span className="scroll-progress-label">
        {direction === 'backward' ? 'scroll up' : 'scroll'}
      </span>
    </motion.div>
  );
}
