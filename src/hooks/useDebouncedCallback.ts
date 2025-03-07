import { useCallback, useEffect, useRef } from 'react';

export const useDebouncedCallback = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return debouncedFunction;
};