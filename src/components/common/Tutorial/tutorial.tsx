import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton, Popover, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

type TutorialPopupProps = {
  anchorEl: Element;
  open: boolean;
  children: ReactJSXElement;
  incrementStep: () => void;
  close: () => void;
  buttonText: string;
};

const TutorialPopup = ({
  element,
  open,
  children,
  incrementStep,
  close,
  buttonText,
}: TutorialPopupProps) => {
  return (
    ///TODO: scroll into view on open
    <Popover
      open={open}
      anchorEl={element}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      className="pointer-events-auto"
    >
      <div className="p-2" role="dialog" aria-modal="true">
        <IconButton onClick={close}>
          <CloseIcon />
        </IconButton>
        {children}
        <Button onClick={incrementStep}>{buttonText}</Button>
      </div>
    </Popover>
  );
};

const tutorialText: { [key: string]: ReactJSXElement } = {
  'step-1': (
    <>
      <Typography>Hi</Typography>
      <Typography>Bye</Typography>
    </>
  ),
  'step-2': (
    <>
      <Typography>Hello</Typography>
      <Typography>Goodbye</Typography>
    </>
  ),
};

type TutorialProps = {
  open: boolean;
  close: () => void;
};

const Tutorial = ({ open, close }: TutorialProps) => {
  type Step = {
    id: string;
    element: Element;
    tutorial: ReactJSXElement;
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
      {steps.map(({ element, tutorial }, index) => (
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
          buttonText={index === steps.length - 1 ? 'Done' : 'Next'}
        >
          {tutorial}
        </TutorialPopup>
      ))}
    </>
  );
};

export default Tutorial;
