import { useEffect, useState } from 'react';

export default function usePersistantState<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [state, setInternalState] = useState<T>(initialValue);

  useEffect(() => {
    function setFromStorage() {
      const value = localStorage.getItem(key);
      if (!value) return;
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        setInternalState(initialValue);
        return;
      }
      setInternalState(parsed);
    }
    setFromStorage();

    // Update when another tab changes localStorage
    function handleChange(event) {
      if (event.key === key) {
        setFromStorage();
      }
    }
    window.addEventListener('storage', handleChange);
    return () => window.removeEventListener('storage', handleChange);
  }, [key]);

  const setState = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    setInternalState(value);
  };

  return [state, setState];
}
