import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import React, { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {TabNavMenu} from "../navigation/tabNavMenu";

type CarouselProps = {
  children: ReactJSXElement[];
};

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
export const Carousel: FC<CarouselProps> = (props: CarouselProps) => {
  //The card currently being displayed
  const [currentCard, setCard] = useState(0);
  //The Direction that the card is moving in
  const [direction, setDir] = useState(0);

  /**
   * Turn
   * This function slides the active component back and forth based upon whether it is fed a positive or negative value
   * @param newDir a positive value will cause the card to move right, negative value cause card to move left
   */
  const turn = (newDir: number) => {
    //set direction
    setDir(newDir);
    //check for edges of arrayay
    if (currentCard === 0 && newDir < 0) {
      setCard(props.children.length - 1);
    } else if (currentCard === props.children.length - 1 && newDir > 0) {
      setCard(0);
    } else {
      //otherwise just add the direction (1 or -1 should be used for a single move)
      setCard(currentCard + newDir);
    }
  };

  return (
    <>
      <TabNavMenu value={currentCard} setValue={setCard}/>
      <div className="relative p-10 pt-0" style={{ height: '90%' }}>
        <AnimatePresence>
          <div className="h-full">
            <motion.div
              className="h-full"
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
              <div className="w-full h-max lg:h-full rounded-md ">
                {props.children[currentCard]}
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default Carousel;
