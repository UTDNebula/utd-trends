'use client';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react';

export const ChosenSemesterContext = createContext<{
  chosenSemesters: string[] | undefined;
  setChosenSemesters: Dispatch<SetStateAction<string[] | undefined>>;
}>({ chosenSemesters: [], setChosenSemesters: (_) => _ });

export default function ChosenSemesterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [chosenSemesters, setChosenSemesters] = useState<string[] | undefined>(
    undefined,
  );
  return (
    <ChosenSemesterContext.Provider
      value={{ chosenSemesters, setChosenSemesters }}
    >
      {children}
    </ChosenSemesterContext.Provider>
  );
}
