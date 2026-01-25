import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  minDuration?: number;
}

export default function Preloader({ minDuration = 1500 }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const elapsed = Date.now() - startTime;
        const targetProgress = Math.min(100, (elapsed / minDuration) * 100);
        return Math.min(100, prev + (targetProgress - prev) * 0.1);
      });
    }, 50);

    // Check if page is fully loaded
    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsLoaded(true);
          setTimeout(() => setIsVisible(false), 500);
        }, 300);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener('load', handleLoad);
    };
  }, [minDuration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <motion.div
            className="preloader-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1, 0.95, 1],
              opacity: 1,
            }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="/images/logo.png" 
              alt="OKJTech" 
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Progress Bar */}
          <div className="preloader-progress">
            <div className="preloader-progress-bar">
              <motion.div
                className="preloader-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <motion.div 
              className="text-center mt-4 text-gray-500 text-sm font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Math.round(progress)}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

