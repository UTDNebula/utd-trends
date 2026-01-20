'use client';

import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Backdrop,
  Button,
  Checkbox,
  IconButton,
  Popover,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

type TutorialPopupProps = {
  element: Element;
  open: boolean;
  incrementStep: () => void;
  closeTutorial: () => void;
  title: string;
  buttonText: string;
  anchorOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  transformOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  children: React.ReactNode;
};

const TutorialPopup = ({
  element,
  open,
  incrementStep,
  closeTutorial,
  title,
  buttonText,
  anchorOrigin,
  transformOrigin,
  children,
}: TutorialPopupProps) => {
  useEffect(() => {
    if (open) {
      element.classList.add('tutorial-raise');
      if (element.tagName === 'TR' || element.tagName === 'TD') {
        element.classList.add('tutorial-table');
      }
      //Wait to scroll untill classes applies
      setTimeout(
        () => element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
        0,
      );
    } else {
      element.classList.remove('tutorial-raise');
      element.classList.remove('tutorial-table');
    }
    return () => {
      element.classList.remove('tutorial-raise');
      element.classList.remove('tutorial-table');
    };
  }, [open, element]);

  return (
    <Popover
      open={open}
      anchorEl={element}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      className="pointer-events-auto"
      disableScrollLock={true}
      marginThreshold={0}
      onClose={closeTutorial}
    >
      <div
        className="p-2 flex flex-col items-start min-w-32 max-w-96"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex w-full items-center gap-2 pl-2">
          <p className="text-lg font-bold">{title}</p>
          <IconButton onClick={closeTutorial} className="ml-auto">
            <CloseIcon />
          </IconButton>
        </div>
        <div className="p-2">{children}</div>
        <Button
          variant="contained"
          className="self-end"
          onClick={incrementStep}
        >
          {buttonText}
        </Button>
      </div>
    </Popover>
  );
};

type StepTemplate = {
  id: string;
  element?: Element;
  title: string;
  content: React.ReactNode;
  anchorOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  transformOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
};
type Step = StepTemplate & { element: Element };

const stepsTemplate: StepTemplate[] = [
  {
    id: 'search',
    title: 'Search',
    content:
      "Search for any number of courses and professors and we'll find all the combinations of classes they teach.",
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'RHS',
    title: 'Overviews and Compare',
    content: 'See an overview of your search on this side.',
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'right' },
  },
  {
    id: 'result',
    title: 'Results',
    content:
      'See the average grade for a course and Rate My Professors score here.',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'actions',
    title: 'Actions',
    content: (
      <>
        <p>Open a result for more detailed information.</p>
        <div className="flex items-center">
          <Checkbox checked={false} />
          <p>
            add an item to the <b>compare</b> tab.
          </p>
        </div>
        <div className="flex items-center">
          <Checkbox icon={<BookOutlinedIcon />} checked={false} />
          <p>
            add an item to the <b>My Planner</b> page.
          </p>
        </div>
      </>
    ),
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'filters',
    title: 'Filters',
    content: 'Use the filters to show more specific data.',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'LHS',
    title: "That's All!",
    content:
      'Try searching for a class you need to take and looking through the results.',
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformOrigin: { vertical: 'bottom', horizontal: 'left' },
  },
];

export default function Tutorial() {
  const [place, setPlace] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const open = place !== -1;
  const closeTutorial = () => setPlace(-1);
  const openTutorial = () => {
    setPlace(0);
    setTutorialHint(false);
    localStorage.setItem(
      'tutorialHint',
      JSON.stringify({
        value: 'opened',
        cacheIndex: cacheIndex,
      }),
    );

    // For each element, set anchor based on `data-tutorial-id`
    const elements =
      document.querySelectorAll<HTMLElement>('[data-tutorial-id]');
    if (!elements.length) {
      closeTutorial();
      return;
    }
    const newSteps = [...stepsTemplate];
    elements.forEach((element) => {
      if (element.offsetParent !== null) {
        const id = element.getAttribute('data-tutorial-id') as string;
        const foundStep = newSteps.findIndex((step) => step.id === id);
        if (foundStep !== -1) {
          newSteps[foundStep].element = element;
        }
      }
    });
    setSteps(
      newSteps.filter((step) => typeof step.element !== 'undefined') as Step[],
    );
  };

  const [tutorialHint, setTutorialHint] = useState(false);
  //Open if not already closed (based on localStorage)
  useEffect(() => {
    const previous = localStorage.getItem('tutorialHint');
    let ask = previous === null;
    if (previous !== null) {
      const parsed = JSON.parse(previous);
      if (parsed !== null && parsed.value !== 'opened') {
        ask = true;
      }
    }
    if (ask) {
      setTutorialHint(true);
    }
  }, []);
  const cacheIndex = 0; //Increment this to open the popup for all users on next deployment

  return (
    <>
      <div className="relative">
        <div
          className={
            tutorialHint
              ? 'absolute w-11 h-11 rounded-full bg-royal dark:bg-cornflower-300 animate-ping'
              : 'hidden'
          }
        />
        <div
          className={
            tutorialHint ? ' rounded-full bg-royal dark:bg-cornflower-300' : ''
          }
        >
          <Tooltip title="Open Tutorial">
            <IconButton
              className="aspect-square"
              size="medium"
              onClick={openTutorial}
            >
              <HelpOutlineIcon
                className={'text-3xl' + (tutorialHint ? ' text-white' : '')}
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <Backdrop sx={(theme) => ({ zIndex: theme.zIndex.modal })} open={open} />
      {steps.map(({ content, ...otherProps }, index) => (
        <TutorialPopup
          key={index}
          open={open && place === index}
          incrementStep={() => {
            if (place === steps.length - 1) {
              closeTutorial();
              return;
            }
            setPlace(place + 1);
          }}
          closeTutorial={closeTutorial}
          buttonText={index === steps.length - 1 ? 'Done' : 'Next'}
          {...otherProps}
        >
          {content}
        </TutorialPopup>
      ))}
    </>
  );
}
