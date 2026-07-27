import { useState, useEffect } from 'react';

/**
 * Custom React hook for debouncing fast-changing values (e.g. search input fields).
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default 350ms)
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
