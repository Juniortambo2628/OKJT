
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@okjt/ui';

export default function AdminTutorial({ steps, onComplete, isRestarted = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState(null);
  const [boxHeight, setBoxHeight] = useState(360);
  const boxRef = useRef(null);

  // Re-measure the card each step so vertical clamping uses its real height.
  useLayoutEffect(() => {
    if (boxRef.current) setBoxHeight(boxRef.current.offsetHeight);
  }, [currentStep, isVisible, coords]);

  useEffect(() => {
    const isCompleted = localStorage.getItem('admin-tutorial-complete');
    if (!isCompleted || isRestarted) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRestarted]);

  useEffect(() => {
    if (isVisible) {
      // First, try to scroll the element into view instantly
      const step = steps[currentStep];
      const el = document.getElementById(step.target);
      if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }

      // Then update coordinates after a small frame delay to ensure scroll finished (even if synchronous)
      const timer = requestAnimationFrame(() => {
        updateCoords();
      });
      
      window.addEventListener('resize', updateCoords);
      return () => {
          window.removeEventListener('resize', updateCoords);
          cancelAnimationFrame(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute coords only when visibility or step changes
  }, [isVisible, currentStep]);

  const updateCoords = () => {
    const step = steps[currentStep];
    const el = document.getElementById(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Only set coords if they are valid numbers
      if (!isNaN(rect.top) && !isNaN(rect.left)) {
        setCoords({
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height
        });
      }
    } else {
      setCoords(null);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('admin-tutorial-complete', 'true');
    if (onComplete) onComplete();
  };

  const getBoxStyle = () => {
    if (!coords) {
      return { style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }, placement: null };
    }

    const margin = 16;
    const gap = 24;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const boxW = Math.min(384, vw - margin * 2);
    const boxH = boxHeight || 360;
    const isMobile = vw < 768;

    // On mobile the sidebar is often an overlay/drawer, so prefer a
    // centred card near the target rather than off to the side.
    const preferRight = step.position === 'right' && !isMobile;

    let left;
    let top;
    let placement;

    if (preferRight) {
      left = coords.right + gap;
      if (left + boxW > vw - margin) {
        left = coords.left - gap - boxW;
        placement = 'left';
      } else {
        placement = 'right';
      }
      top = coords.top + (coords.height / 2) - (boxH / 2);
    } else {
      left = coords.left + (coords.width / 2) - (boxW / 2);
      top = coords.bottom + gap;
      placement = 'bottom';
      // If the card would overflow the bottom, place it above the target,
      // or pin it inside the viewport as a last resort.
      if (top + boxH > vh - margin) {
        const above = coords.top - gap - boxH;
        if (above >= margin) {
          top = above;
          placement = 'top';
        } else {
          top = Math.max(margin, vh - margin - boxH);
        }
      }
    }

    // Final clamps keep the card fully on screen on both axes.
    left = Math.min(Math.max(margin, left), vw - margin - boxW);
    top = Math.min(Math.max(margin, top), vh - margin - boxH);

    return { style: { top, left, width: boxW }, placement };
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  const { style: boxStyle, placement } = getBoxStyle();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop with spotlight effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
        onClick={handleComplete}
        style={{
            clipPath: coords ? `polygon(0% 0%, 0% 100%, ${coords.left - 4}px 100%, ${coords.left - 4}px ${coords.top - 4}px, ${coords.right + 4}px ${coords.top - 4}px, ${coords.right + 4}px ${coords.bottom + 4}px, ${coords.left - 4}px ${coords.bottom + 4}px, ${coords.left - 4}px 100%, 100% 100%, 100% 0%)` : 'none'
        }}
      />

      <motion.div
        layout
        ref={boxRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={boxStyle}
        className="absolute w-[calc(100%-48px)] max-w-sm max-h-[calc(100vh-32px)] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border-2 border-accent/30"
      >
        <div className="h-1.5 w-full bg-tone-100">
          <motion.div 
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6 pb-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                {currentStep === steps.length - 1 ? (
                    <Trophy className="w-5 h-5 text-accent" />
                ) : (
                    <span className="text-accent font-bold text-base">{currentStep + 1}</span>
                )}
                </div>
                {currentStep === 0 && (
                    <span className="bg-accent/10 text-accent text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">New Feature</span>
                )}
            </div>
            <button aria-label="Close tour" 
              onClick={handleComplete}
              className="p-1.5 hover:bg-tone-50 rounded-lg text-tone-300 hover:text-tone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-[100px]"
            >
              <h3 className="text-xl font-semibold text-body mb-2 flex items-center gap-2">
                {step.title}
                {currentStep === 0 && <Sparkles className="w-4 h-4 text-accent" />}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {step.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-tone-100 bg-white rounded-b-3xl">
            <div className="flex gap-1.5">
              <Button
                size="icon"
                icon={ChevronLeft}
                aria-label="Previous step"
                onClick={handleBack}
                disabled={currentStep === 0}
              />
              <Button variant="secondary" onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}
                <ChevronRight />
              </Button>
            </div>
            
            <button 
              onClick={handleComplete}
              className="text-xs text-tone-400 hover:text-accent transition-colors font-medium px-2"
            >
              Skip Tour
            </button>
        </div>
        
        {/* Triangle pointer */}
        {coords && placement === 'right' && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-[8px] border-y-transparent border-r-[8px] border-r-white" />
        )}
        {coords && placement === 'left' && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-y-[8px] border-y-transparent border-l-[8px] border-l-white" />
        )}
        {coords && placement === 'bottom' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-x-[8px] border-x-transparent border-b-[8px] border-b-white" />
        )}
        {coords && placement === 'top' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[8px] border-x-transparent border-t-[8px] border-t-white" />
        )}
      </motion.div>
    </div>
  );
}
