import { useEffect, useRef, useState } from 'react';

export default function usePersistantState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((old: T) => T)) => void] {
  const [state, internalSetState] = useState<T>(initialValue);

  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    function setFromStorage() {
      const value = localStorage.getItem(key);
      if (!value) return;
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch {
        internalSetState(initialValueRef.current);
        return;
      }
      internalSetState(parsed);
    }
    setFromStorage();

    // Update when another tab changes localStorage
    function handleChange(event: StorageEvent) {
      if (event.key === key) {
        setFromStorage();
      }
    }
    window.addEventListener('storage', handleChange);
    return () => window.removeEventListener('storage', handleChange);
  }, [key]);

  const setState = (value: T | ((prev: T) => T)) => {
    internalSetState((prev: T) => {
      const newValue =
        typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;

      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  };

  return [state, setState];
}
