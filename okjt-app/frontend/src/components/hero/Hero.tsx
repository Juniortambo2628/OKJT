import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroConfig } from '../../config';
import TypeWriter from './TypeWriter';
import ScrollProgress from './ScrollProgress';
import SlideLinks from './SlideLinks';
import TrustedClientsCarousel from './TrustedClientsCarousel';
import TestimonialBubble from './TestimonialBubble';
import { heroSlidesApi } from '../../api/client';
import type { AdminHeroSlide } from '../../types';

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { slides: defaultSlides, scrollSensitivity } = heroConfig;
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    // Load dynamic slides from backend if available
    const loadSlides = async () => {
      try {
        const data: AdminHeroSlide[] = await heroSlidesApi.getPublic();
        if (data.length > 0) {
           const mapped = data
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((s) => ({
              text: s.text,
              image: s.image_url || '',
              label: s.label,
              subtitle: s.subtitle || undefined,
              overlay_opacity: s.overlay_opacity,
              testimonial_text: s.testimonial_text || undefined,
              testimonial_author: s.testimonial_author || undefined,
              testimonial_company: s.testimonial_company || undefined,
            } as any));
          setSlides(mapped);
        }
      } catch {
        // Ignore and keep defaults
      }
    };
    loadSlides();
  }, []);
  const totalSlides = slides.length + 1; // +1 for intro slide

  const goToSlide = useCallback((index: number, dir: 'forward' | 'backward') => {
    if (isAnimating || index === currentIndex) return;
    if (index < 0 || index >= totalSlides) return;
    
    setIsAnimating(true);
    setDirection(dir);
    setCurrentIndex(index);
    // Reset progress to 0 for index 0 (welcome slide) to ensure visibility
    setSlideProgress(index === 0 ? 0 : (dir === 'forward' ? 0 : 1));
    
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, currentIndex, totalSlides]);

  // Handle wheel events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating) return;
      
      const delta = e.deltaY;
      const stepMagnitude = Math.min(0.15, Math.abs(delta) / scrollSensitivity);
      
      if (delta > 0) {
        // Scrolling down
        if (currentIndex === 0) {
          // On intro slide, go to first numbered slide
          goToSlide(1, 'forward');
          return;
        }
        
        if (currentIndex >= totalSlides - 1) {
          setSlideProgress(1);
          return;
        }
        
        const newProgress = Math.min(1, slideProgress + stepMagnitude);
        setSlideProgress(newProgress);
        
        if (newProgress >= 1) {
          goToSlide(currentIndex + 1, 'forward');
        }
      } else {
        // Scrolling up
        if (currentIndex <= 0) {
          setSlideProgress(0);
          return;
        }
        
        const newProgress = Math.max(0, slideProgress - stepMagnitude);
        setSlideProgress(newProgress);
        
        if (newProgress <= 0) {
          goToSlide(currentIndex - 1, 'backward');
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, slideProgress, isAnimating, goToSlide, scrollSensitivity, totalSlides]);

  // Handle touch events
  useEffect(() => {
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      // Also record X to prevent accidental swipes during horizontal interactions
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      const threshold = 50; // Minimum swipe distance in pixels
      
      if (Math.abs(diff) < threshold) return;

      if (diff > 0) {
        // Swiped Up (Next)
        if (currentIndex < totalSlides - 1) {
          goToSlide(currentIndex + 1, 'forward');
        }
      } else {
        // Swiped Down (Prev)
        if (currentIndex > 0) {
          goToSlide(currentIndex - 1, 'backward');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, isAnimating, goToSlide, totalSlides]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIndex < totalSlides - 1) {
          goToSlide(currentIndex + 1, 'forward');
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          goToSlide(currentIndex - 1, 'backward');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToSlide, totalSlides]);

  const currentSlide: any = currentIndex === 0 ? null : slides[currentIndex - 1];
  const bgImage =
    currentIndex === 0
      ? (heroConfig as any).welcomeImage || (slides[0]?.image ?? '')
      : currentSlide?.image;
  const bgOpacity =
    currentIndex === 0
      ? (currentSlide?.overlay_opacity ?? 0.35)
      : (currentSlide?.overlay_opacity ?? 0.4);
  const parallaxOffset = (0.5 - slideProgress) * 30; // slight parallax
  const slideNumber = currentIndex > 0 ? String(currentIndex).padStart(2, '0') : '';

  // Calculate progress-based widths for CSS custom properties
  const progressWidth = `${slideProgress * 90}vw`;
  const backProgressWidth = `${(1 - slideProgress) * 90}vw`;
  const backProgressLeft = `${slideProgress * 90}vw`;
  const numberTranslateX = `${slideProgress * 90}vw`;

  return (
    <section ref={containerRef} className="hero-section hero-gold-bg">
      <div className="hero-gold-overlay" />

      {/* Trusted Clients Carousel - Below Header */}
      <TrustedClientsCarousel />

      {/* Background image per slide */}
      {bgImage && (
        <div
          className="hero-slide-background"
          style={{
            backgroundImage: `url(${bgImage})`,
            opacity: bgOpacity,
            transform: `translateY(${parallaxOffset}px)`,
          }}
        />
      )}
      
      {currentIndex > 0 && (
        <>
          <div 
            className="hero-line"
            style={{ '--progress-width': progressWidth } as React.CSSProperties}
          />
          <div
            className="hero-line-back"
            style={{ 
              '--progress-width': backProgressWidth,
              '--progress-left': backProgressLeft 
            } as React.CSSProperties}
          />
        </>
      )}

      {/* Slide Number */}
      <AnimatePresence mode="wait">
        {currentIndex > 0 && (
          <motion.div
            key={slideNumber}
            className="hero-number"
            style={{ 
              '--number-opacity': 0.1 + slideProgress * 0.2,
              '--number-scale': 4 - slideProgress * 3,
              '--number-translate': numberTranslateX
            } as React.CSSProperties}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {slideNumber}.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Label - Large background text */}
      {currentIndex > 0 && currentSlide && (
        <div className="center-label">
          {currentSlide.label}
        </div>
      )}

      {/* Slides */}
      <AnimatePresence mode="wait">
        {currentIndex === 0 ? (
          // Intro Slide - Legacy Style
          <motion.div
            key="intro"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - slideProgress }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="intro-content">
              <motion.div
                className="intro-title-wrap"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* C:\ in black box */}
                <span className="path-prefix">C:\</span>
                {/* OKJTech in frosted white box */}
                <span className="title-main">
                  <span className="title-text">OKJTech\..</span>
                </span>
              </motion.div>
              
              {/* Vertical line */}
              <motion.div 
                className="intro-line"
                initial={{ height: 0 }}
                animate={{ height: 120 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              
              {/* Scroll text */}
              <motion.p
                className="intro-subtitle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                scroll to explore directory
              </motion.p>
            </div>
          </motion.div>
        ) : (
          // Content Slides
          <motion.div
            key={currentIndex}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, x: direction === 'forward' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'forward' ? -50 : 50 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className={`slide-content ${currentIndex === 0 ? '' : 'slide-content-dark'}`}>
              {/* Main Title with Typewriter Effect */}
              <h2 className="slide-title">
                <TypeWriter 
                  text={currentSlide?.text || ''} 
                  key={`title-${currentIndex}`}
                />
              </h2>
              
              {/* Subtitle */}
              {currentSlide?.subtitle && (
                <motion.p
                  className="slide-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <TypeWriter 
                    text={currentSlide.subtitle} 
                    delay={1000}
                    key={`subtitle-${currentIndex}`}
                  />
                </motion.p>
              )}
              
              {/* CTA for Bookings slide */}
              {currentSlide?.label === 'Bookings' && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Link to="/contact" className="cta-button-dark">
                    Make Enquiry
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonial Bubble */}
      <AnimatePresence mode="wait">
        {currentIndex > 0 && currentSlide?.testimonial_text && (
          <TestimonialBubble
            key={`testimonial-${currentIndex}`}
            text={currentSlide.testimonial_text}
            author={currentSlide.testimonial_author || 'Client'}
            company={currentSlide.testimonial_company}
          />
        )}
      </AnimatePresence>

      {/* Scroll Progress Indicator */}
      <ScrollProgress 
        progress={slideProgress} 
        direction={direction}
        isVisible={currentIndex > 0}
      />


      {/* Mobile Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 md:hidden z-20 pointer-events-none">
        <button
          onClick={() => currentIndex > 0 ? goToSlide(currentIndex - 1, 'backward') : null}
          className={`p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => currentIndex < totalSlides - 1 ? goToSlide(currentIndex + 1, 'forward') : null}
          className={`p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto transition-all ${currentIndex >= totalSlides - 1 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
          disabled={currentIndex >= totalSlides - 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide Links - Legacy Style with numbers */}
      <div className="hidden md:block">
        <SlideLinks
          slides={slides}
          currentIndex={currentIndex}
          onSlideClick={(index) => goToSlide(index, index > currentIndex ? 'forward' : 'backward')}
        />
      </div>
    </section>
  );
}

