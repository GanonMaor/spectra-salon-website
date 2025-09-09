import { useEffect, useState } from 'react';

interface CountUpOptions {
  duration?: number;
  decimals?: number;
  startOnView?: boolean;
}

export function useCountUp(
  end: number,
  options: CountUpOptions = {}
) {
  const { duration = 2000, decimals = 0, startOnView = false } = options;
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!hasStarted) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    let animationFrameId: number;
    let startTime: number | undefined;

    // Easing function (ease-out cubic)
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = easedProgress * end;
      
      setValue(parseFloat(currentValue.toFixed(decimals)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, decimals, hasStarted]);

  return { value, start: () => setHasStarted(true) };
}

// Hook for multiple counters
export function useMultiCountUp(
  targets: number[],
  options: CountUpOptions = {}
) {
  const { duration = 2000, startOnView = false } = options;
  const [values, setValues] = useState(targets.map(() => 0));
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!hasStarted) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setValues(targets);
      return;
    }

    let animationFrameId: number;
    let startTime: number | undefined;

    // Easing function (ease-out cubic)
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      setValues(targets.map(target => Math.round(target * easedProgress)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [JSON.stringify(targets), duration, hasStarted]);

  return { values, start: () => setHasStarted(true) };
}
