import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import CloseIcon from '@mui/icons-material/Close';
import { Backdrop, Button, IconButton, Popover } from '@mui/material';
import React, { useEffect, useState } from 'react';

type TutorialPopupProps = {
  element: Element;
  open: boolean;
  incrementStep: () => void;
  close: () => void;
  title: string;
  buttonText: string;
  children: ReactJSXElement;
};

const TutorialPopup = ({
  element,
  open,
  incrementStep,
  close,
  title,
  buttonText,
  children,
}: TutorialPopupProps) => {
  useEffect(() => {
    if (open) {
      element.classList.add('tutorial-raise');
    } else {
      element.classList.remove('tutorial-raise');
    }
    return () => element.classList.remove('tutorial-raise');
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={element}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      className="pointer-events-auto"
      disableScrollLock={true}
      marginThreshold={null}
    >
      <div
        className="p-2 flex flex-col items-start min-w-32"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex w-full items-center gap-2 pl-2">
          <p className="text-lg font-bold">{title}</p>
          <IconButton onClick={close} className="ml-auto">
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

type StepContent = { title: string; content: ReactJSXElement };

const tutorialText: { [key: string]: StepContent } = {
  'step-1': {
    title: 'hey',
    content: (
      <>
        <p className="font-semibold">Hi</p>
        <p>Bye</p>
      </>
    ),
  },
  'step-2': {
    title: 'howdyyyyyyyyy',
    content: (
      <>
        <p className="font-semibold">Hello</p>
        <p>Goodbye</p>
        <p className="font-semibold">Hello</p>
        <p>Goodbye</p>
      </>
    ),
  },
};

type TutorialProps = {
  open: boolean;
  close: () => void;
};

const Tutorial = ({ open, close }: TutorialProps) => {
  type Step = {
    id: string;
    element: Element;
    tutorial: StepContent;
  };
  const [steps, setSteps] = useState<Step[]>([]);
  const [place, setPlace] = useState(0);

  useEffect(() => {
    // For each element, set anchor based on `data-tutorial-id`
    const elements = document.querySelectorAll('[data-tutorial-id]');
    const newSteps: Step[] = [];
    elements.forEach((el) => {
      const id = el.getAttribute('data-tutorial-id') as string;
      newSteps.push({
        id: id,
        element: el,
        tutorial: tutorialText[id],
      });
    });
    newSteps.sort((a, b) => Number(a.id) - Number(b.id));
    setSteps(newSteps);
    setPlace(0);
  }, [open]);

  return (
    <>
      <Backdrop sx={(theme) => ({ zIndex: theme.zIndex.modal })} open={open} />
      {steps.map(({ element, tutorial: { title, content } }, index) => (
        <TutorialPopup
          key={index}
          element={element}
          open={open && place === index}
          incrementStep={() => {
            if (place === steps.length - 1) {
              close();
              return;
            }
            setPlace(place + 1);
          }}
          close={close}
          title={title}
          buttonText={index === steps.length - 1 ? 'Done' : 'Next'}
        >
          {content}
        </TutorialPopup>
      ))}
    </>
  );
};

export default Tutorial;
