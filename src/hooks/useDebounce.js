import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value.
 * @param {any} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {any} The debounced value.
 */
export default function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set up a timer to update the debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called on every re-render.
      // This is the crucial part: it clears the previous timer before starting a new one.
      // This ensures that the debounced value is only updated after the user stops typing for the duration of the delay.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-run the effect if the value or delay changes
  );

  return debouncedValue;
}
