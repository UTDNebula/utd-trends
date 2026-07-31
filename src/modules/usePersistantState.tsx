import { useEffect, useRef, useState } from 'react';

export default function usePersistantState<T>(
  key: string,
  initialValue: T,
  useDefaultValue = false,
  defaultValue: T = initialValue,
): [T, (value: T | ((old: T) => T)) => void] {
  const [state, internalSetState] = useState<T>(initialValue);

  const initialValueRef = useRef(initialValue);
  const defaultValueRef = useRef(defaultValue);
  useEffect(() => {
    function setFromStorage() {
      let value: string | null;
      try {
        value = localStorage.getItem(key);
      } catch {
        value = null;
      }
      if (!value) {
        if (useDefaultValue) {
          internalSetState(defaultValueRef.current);
        }
        return;
      }
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
  }, [key, useDefaultValue]);

  const setState = (value: T | ((prev: T) => T)) => {
    internalSetState((prev: T) => {
      const newValue =
        typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;

      const serializedValue = JSON.stringify(newValue);
      try {
        localStorage.setItem(key, serializedValue);
      } catch {
        return newValue;
      }
      return newValue;
    });
  };

  return [state, setState];
}
