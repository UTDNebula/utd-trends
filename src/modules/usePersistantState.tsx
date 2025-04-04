import { useEffect, useState } from 'react';

export default function usePersistantState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((old: T) => T)) => void] {
  const [state, setInternalState] = useState<T>(initialValue);

  useEffect(() => {
    function setFromStorage() {
      const value = localStorage.getItem(key);
      if (!value) return;
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch {
        setInternalState(initialValue);
        return;
      }
      setInternalState(parsed);
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

  const setState = (value: T | ((old: T) => T)) => {
    setInternalState((old: T) => {
      const newValue =
        typeof value === 'function' ? (value as (old: T) => T)(old) : value;

      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  };

  return [state, setState];
}
