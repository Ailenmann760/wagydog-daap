import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import './TrueFocus.css';

const TrueFocus = ({
  sentence = 'True Focus',
  manualMode = false,
  blurAmount = 5,
  borderColor = 'green',
  glowColor = 'rgba(0, 255, 0, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const viewportQuery = window.matchMedia('(max-width: 640px)');

    const updateViewport = () => {
      setIsCompactViewport(viewportQuery.matches);
    };

    updateViewport();

    if (typeof viewportQuery.addEventListener === 'function') {
      viewportQuery.addEventListener('change', updateViewport);
      return () => viewportQuery.removeEventListener('change', updateViewport);
    }

    viewportQuery.addListener(updateViewport);
    return () => viewportQuery.removeListener(updateViewport);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotion = () => {
      setPrefersReducedMotion(motionQuery.matches);
    };

    updateMotion();

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', updateMotion);
      return () => motionQuery.removeEventListener('change', updateMotion);
    }

    motionQuery.addListener(updateMotion);
    return () => motionQuery.removeListener(updateMotion);
  }, []);

  useEffect(() => {
    if (manualMode || prefersReducedMotion || words.length <= 1) return undefined;

    const cadenceMultiplier = isCompactViewport ? 1.35 : 1;
    const cycleMs = (animationDuration + pauseBetweenAnimations) * cadenceMultiplier * 1000;
    if (!Number.isFinite(cycleMs) || cycleMs <= 0) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, cycleMs);

    return () => clearInterval(interval);
  }, [
    animationDuration,
    pauseBetweenAnimations,
    manualMode,
    words.length,
    prefersReducedMotion,
    isCompactViewport,
  ]);

  const effectiveBlurAmount = useMemo(
    () => (isCompactViewport ? Math.min(blurAmount, 4) : blurAmount),
    [blurAmount, isCompactViewport],
  );

  const effectiveAnimationDuration = useMemo(
    () => (isCompactViewport ? Math.min(animationDuration, 0.35) : animationDuration),
    [animationDuration, isCompactViewport],
  );

  const updateFocusRect = useCallback(() => {
    if (currentIndex == null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: Math.max(activeRect.width, 1),
      height: Math.max(activeRect.height, 1),
    });
  }, [currentIndex]);

  useEffect(() => {
    updateFocusRect();
  }, [updateFocusRect, words.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let resizeRaf = null;

    const handleResize = () => {
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        updateFocusRect();
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize, { passive: true });
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
    };
  }, [updateFocusRect]);

  const handleMouseEnter = (index) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  return (
    <span className="focus-container" ref={containerRef}>
        {words.map((word, index) => {
          const isActive = index === currentIndex;
          return (
            <span
              key={index}
              ref={(el) => (wordRefs.current[index] = el)}
              className={`focus-word ${manualMode ? 'manual' : ''} ${
                isActive && !manualMode ? 'active' : ''
              }`}
              style={{
                filter: isActive ? 'blur(0px)' : `blur(${effectiveBlurAmount}px)`,
                '--border-color': borderColor,
                '--glow-color': glowColor,
                transition: `filter ${effectiveAnimationDuration}s ease`,
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {word}
            </span>
          );
        })}

        <motion.span
          className="focus-frame"
          animate={{
            x: focusRect.x,
            y: focusRect.y,
            width: focusRect.width,
            height: focusRect.height,
            opacity: currentIndex >= 0 ? 1 : 0,
          }}
          transition={{
            duration: effectiveAnimationDuration,
          }}
          style={{
            '--border-color': borderColor,
            '--glow-color': glowColor,
          }}
        >
          <span className="corner top-left" />
          <span className="corner top-right" />
          <span className="corner bottom-left" />
          <span className="corner bottom-right" />
        </motion.span>
    </span>
  );
};

export default TrueFocus;
