import { useState, useEffect } from 'react';

/**
 * useGsapCounter
 * Non-animated instant numerical renderer for CAMPUS OS.
 * Immediately displays the target numerical value with 0ms tweening latency.
 *
 * @param {number} targetValue - The target number to display
 * @param {number} _duration - Obsolete duration parameter maintained for interface compatibility
 * @param {boolean} trigger - When data is ready
 */
export function useGsapCounter(targetValue, _duration = 0, trigger = true) {
  const [displayValue, setDisplayValue] = useState(
    trigger && targetValue !== undefined && targetValue !== null ? targetValue : 0
  );

  useEffect(() => {
    if (!trigger || targetValue === undefined || targetValue === null) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }
    setDisplayValue(targetValue);
  }, [targetValue, trigger]);

  if (trigger && targetValue !== undefined && targetValue !== null) {
    return targetValue;
  }
  return displayValue;
}

export default useGsapCounter;
