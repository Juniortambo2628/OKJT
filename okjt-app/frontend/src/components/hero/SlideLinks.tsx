import { motion } from 'framer-motion';
import type { HeroSlide } from '../../types';

interface SlideLinksProps {
  slides: HeroSlide[];
  currentIndex: number;
  onSlideClick: (index: number) => void;
}

export default function SlideLinks({ slides, currentIndex, onSlideClick }: SlideLinksProps) {
  return (
    <motion.nav
      className="slide-links-nav"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {slides.map((slide, index) => {
        const slideIndex = index + 1;
        const isActive = currentIndex === slideIndex;
        
        return (
          <button
            key={slide.label}
            className={`slide-link-item ${isActive ? 'active' : ''}`}
            onClick={() => onSlideClick(slideIndex)}
            title={slide.label}
          >
            <span className="slide-link-number">{slideIndex}</span>
            <span className="slide-link-label">{slide.label}</span>
          </button>
        );
      })}
    </motion.nav>
  );
}

