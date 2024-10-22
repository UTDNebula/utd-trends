import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { TabNavMenu } from '../../navigation/tabNavMenu/tabNavMenu';

interface CarouselProps {
  names: string[] | string;
  children: ReactJSXElement[] | ReactJSXElement;
  compareLength: number;
}

/**
 * Variants represent the different keyframes that the children are in during the animation
 * On enter, On Center, and On Exit
 */
const variants = {
  enter: (dir: number) => {
    return {
      x: dir > 0 ? 500 : -500, //velocity in x direction
      opacity: 0, //child opacity
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => {
    return {
      x: dir < 0 ? 500 : -500,
      opacity: 0,
    };
  },
};

/**
 * This is Sliding Carousel Component that takes in child components that can be
 * toggled between by way of using arrow buttons.
 * @param props the props passed from the parent component
 * @returns
 */
export const Carousel = ({ names, children, compareLength }: CarouselProps) => {
  //The card currently being displayed
  const [currentCard, setCard] = useState(0);
  //The Direction that the card is moving in
  const [direction, setDir] = useState(0);

  /**
   * Turn
   * This function slides the active component back and forth based upon whether it is fed a positive or negative value
   * @param displacement a positive value will cause the card to move right, negative value cause card to move left
   */
  const turn = (displacement: number) => {
    //set direction
    // console.log("displacement=",displacement);
    setDir(displacement);
    setCard(currentCard + displacement);
  };

  return (
    <>
      <TabNavMenu
        value={currentCard}
        options={Array.isArray(names) ? names : [names]}
        turner={turn}
        compareLength={compareLength}
      />
      <AnimatePresence>
        <div className="p-4 lg:p-6">
          <motion.div
            key={currentCard}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {Array.isArray(children) ? children[currentCard] : children}
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default Carousel;
