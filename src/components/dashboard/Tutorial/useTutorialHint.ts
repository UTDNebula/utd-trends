'use client';

import usePersistantState from '@/modules/usePersistantState';

const cacheIndex = 0; //Increment this to open the popup for all users on next deployment

export default function useTutorialHint(): [boolean, () => void] {
  const [tutorialState, setTutorialState] = usePersistantState('tutorialHint', {
    value: 'opened',
    cacheIndex: cacheIndex,
  });

  let tutorialHint = false;
  if (tutorialState !== null && tutorialState.value !== 'opened') {
    tutorialHint = true;
  }

  const setTutorialHint = () => {
    setTutorialState({
      value: 'opened',
      cacheIndex: cacheIndex,
    });
  };

  return [tutorialHint, setTutorialHint];
}
