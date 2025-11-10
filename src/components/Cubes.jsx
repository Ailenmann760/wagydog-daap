import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './Cubes.css';

const Cubes = ({
  gridSize = 10,
  cubeSize,
  maxAngle = 38,
  radius = 3,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = '1px solid rgba(75, 225, 195, 0.35)',
  faceColor = 'rgba(124, 92, 255, 0.28)',
  shadow = '0 22px 48px rgba(8, 12, 24, 0.55)',
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#4be1c3',
  rippleSpeed = 2,
}) => {
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const idleTimerRef = useRef(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef(null);

  const colGap =
    typeof cellGap === 'number'
      ? `${cellGap}px`
      : cellGap?.col !== undefined
        ? `${cellGap.col}px`
        : '5%';
  const rowGap =
    typeof cellGap === 'number'
      ? `${cellGap}px`
      : cellGap?.row !== undefined
        ? `${cellGap.row}px`
        : '5%';

  const enterDur = duration.enter;
  const leaveDur = duration.leave;
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mediaQuery = window.matchMedia('(max-width: 640px)');

    const updateViewportState = () => {
      setIsCompactViewport(mediaQuery.matches);
    };

    updateViewportState();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewportState);
      return () => mediaQuery.removeEventListener('change', updateViewportState);
    }

    mediaQuery.addListener(updateViewportState);
    return () => mediaQuery.removeListener(updateViewportState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionPreference = () => {
      setPrefersReducedMotion(reduceMotionQuery.matches);
    };

    updateMotionPreference();

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', updateMotionPreference);
      return () => reduceMotionQuery.removeEventListener('change', updateMotionPreference);
    }

    reduceMotionQuery.addListener(updateMotionPreference);
    return () => reduceMotionQuery.removeListener(updateMotionPreference);
  }, []);

  const effectiveGridSize = useMemo(() => {
    if (!isCompactViewport) return gridSize;
    const cappedSize = Math.min(gridSize, 9);
    return Math.max(4, cappedSize);
  }, [gridSize, isCompactViewport]);

  const effectiveRadius = useMemo(() => {
    if (!isCompactViewport) return radius;
    const scaled = radius * 0.8;
    if (!Number.isFinite(scaled) || scaled <= 0) return 2.25;
    return Math.max(1.2, Math.min(scaled, radius));
  }, [radius, isCompactViewport]);

  const effectiveMaxAngle = useMemo(() => {
    if (!isCompactViewport) return maxAngle;
    return Math.min(maxAngle, 26);
  }, [maxAngle, isCompactViewport]);

  const effectiveColGap = useMemo(() => {
    if (!isCompactViewport) return colGap;
    return '2.5%';
  }, [colGap, isCompactViewport]);

  const effectiveRowGap = useMemo(() => {
    if (!isCompactViewport) return rowGap;
    return '2.5%';
  }, [rowGap, isCompactViewport]);

  const shouldAutoAnimate = useMemo(
    () => autoAnimate && !prefersReducedMotion && !isCompactViewport,
    [autoAnimate, prefersReducedMotion, isCompactViewport],
  );

  const allowRipple = useMemo(
    () => rippleOnClick && !prefersReducedMotion && !isCompactViewport,
    [rippleOnClick, prefersReducedMotion, isCompactViewport],
  );

  const cells = useMemo(
    () => Array.from({ length: effectiveGridSize }),
    [effectiveGridSize],
  );

  const tiltAt = useCallback(
    (rowCenter, colCenter) => {
      if (!sceneRef.current) return;
      sceneRef.current.querySelectorAll('.cube').forEach((cube) => {
        const r = Number.parseFloat(cube.dataset.row);
        const c = Number.parseFloat(cube.dataset.col);
        const dist = Math.hypot(r - rowCenter, c - colCenter);

        if (dist <= effectiveRadius) {
          const pct = 1 - dist / effectiveRadius;
          const angle = pct * effectiveMaxAngle;
          gsap.to(cube, {
            duration: enterDur,
            ease: easing,
            overwrite: true,
            rotateX: -angle,
            rotateY: angle,
          });
        } else {
          gsap.to(cube, {
            duration: leaveDur,
            ease: 'power3.out',
            overwrite: true,
            rotateX: 0,
            rotateY: 0,
          });
        }
      });
    },
      [effectiveRadius, effectiveMaxAngle, enterDur, leaveDur, easing],
  );

  const onPointerMove = useCallback(
    (event) => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / effectiveGridSize;
      const cellH = rect.height / effectiveGridSize;
      const colCenter = (event.clientX - rect.left) / cellW;
      const rowCenter = (event.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [effectiveGridSize, tiltAt],
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll('.cube').forEach((cube) =>
      gsap.to(cube, {
        duration: leaveDur,
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out',
      }),
    );
  }, [leaveDur]);

  const onTouchMove = useCallback(
    (event) => {
      event.preventDefault();
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / effectiveGridSize;
      const cellH = rect.height / effectiveGridSize;

      const touch = event.touches[0];
      const colCenter = (touch.clientX - rect.left) / cellW;
      const rowCenter = (touch.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
      [effectiveGridSize, tiltAt],
  );

  const onTouchStart = useCallback(() => {
    userActiveRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    resetAll();
  }, [resetAll]);

  const onClick = useCallback(
    (event) => {
        if (!allowRipple || !sceneRef.current) return;

      const rect = sceneRef.current.getBoundingClientRect();
        const cellW = rect.width / effectiveGridSize;
        const cellH = rect.height / effectiveGridSize;

      const clientX =
        event.clientX ?? (event.touches && event.touches[0]?.clientX);
      const clientY =
        event.clientY ?? (event.touches && event.touches[0]?.clientY);

      if (clientX == null || clientY == null) return;

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings = {};
      sceneRef.current.querySelectorAll('.cube').forEach((cube) => {
        const r = Number.parseFloat(cube.dataset.row);
        const c = Number.parseFloat(cube.dataset.col);
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cube);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) =>
            Array.from(cube.querySelectorAll('.cube-face')),
          );

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: 'power3.out',
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: 'power3.out',
          });
        });
    },
      [allowRipple, effectiveGridSize, faceColor, rippleColor, rippleSpeed],
  );

  useEffect(() => {
      if (!shouldAutoAnimate || !sceneRef.current) {
        if (simRAFRef.current != null) {
          cancelAnimationFrame(simRAFRef.current);
          simRAFRef.current = null;
        }
        return undefined;
      }

    simPosRef.current = {
        x: Math.random() * effectiveGridSize,
        y: Math.random() * effectiveGridSize,
    };
    simTargetRef.current = {
        x: Math.random() * effectiveGridSize,
        y: Math.random() * effectiveGridSize,
    };
    const speed = 0.02;

    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = {
              x: Math.random() * effectiveGridSize,
              y: Math.random() * effectiveGridSize,
          };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };

    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      if (simRAFRef.current != null) {
        cancelAnimationFrame(simRAFRef.current);
      }
    };
    }, [shouldAutoAnimate, effectiveGridSize, tiltAt]);

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return undefined;

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', resetAll);
    element.addEventListener('click', onClick);

    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', resetAll);
      element.removeEventListener('click', onClick);

      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current != null) clearTimeout(idleTimerRef.current);
    };
    }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

    const sceneStyle = {
      gridTemplateColumns: cubeSize
        ? `repeat(${effectiveGridSize}, ${cubeSize}px)`
        : `repeat(${effectiveGridSize}, 1fr)`,
      gridTemplateRows: cubeSize
        ? `repeat(${effectiveGridSize}, ${cubeSize}px)`
        : `repeat(${effectiveGridSize}, 1fr)`,
      columnGap: effectiveColGap,
      rowGap: effectiveRowGap,
    };
    const wrapperStyle = {
      '--cube-face-border': borderStyle,
      '--cube-face-bg': faceColor,
      '--cube-face-shadow':
        shadow === true
          ? '0 0 6px rgba(0,0,0,.5)'
          : shadow || 'none',
      ...(cubeSize
        ? {
            width: `${effectiveGridSize * cubeSize}px`,
            height: `${effectiveGridSize * cubeSize}px`,
          }
        : {}),
    };

    return (
      <div className="default-animation" style={wrapperStyle}>
        <div
          ref={sceneRef}
          className="default-animation--scene"
          style={sceneStyle}
        >
          {cells.map((_, r) =>
            cells.map((__, c) => (
              <div
                key={`${r}-${c}`}
                className="cube"
                data-row={r}
                data-col={c}
              >
                <div className="cube-face cube-face--top" />
                <div className="cube-face cube-face--bottom" />
                <div className="cube-face cube-face--left" />
                <div className="cube-face cube-face--right" />
                <div className="cube-face cube-face--front" />
                <div className="cube-face cube-face--back" />
              </div>
            )),
          )}
        </div>
      </div>
    );
};

export default Cubes;
