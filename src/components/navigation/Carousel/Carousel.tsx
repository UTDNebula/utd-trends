'use client';

import { Collapse, useMediaQuery } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import { TabNavMenu } from '@/components/navigation/TabNavMenu/TabNavMenu';

interface CarouselProps {
  names: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Variants represent the different keyframes that the children are in during the animation
 * On enter, On Center, and On Exit
 *
 */
const variants = {
  enter: (dir: number) => {
    return {
      x: dir > 0 ? 500 : -500, // velocity in x direction
      opacity: 0, // child opacity
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
export default function Carousel({ names, children }: CarouselProps) {
  // The card currently being displayed
  const [currentCard, setCurrentCard] = useState(0);
  // The Direction that the card is moving in
  const [direction, setDirection] = useState(0);

  const { compare } = useSharedState();
  const lastCompareLength = useRef(compare.length);

  useEffect(() => {
    /**
     * On each re-render, ensure currentCard is within valid bounds
     */
    if (Array.isArray(children) && currentCard >= children.length) {
      // If currentCard is out of bounds, reset it to 0
      setCurrentCard(0);
    }
  }, [currentCard, children]);

  /**
   * Turn
   * This function slides the active component back and forth based upon whether it is fed a positive or negative value
   * @param displacement a positive value will cause the card to move right, negative value cause card to move left
   */
  const turn = (displacement: number) => {
    setDirection(displacement);
    setCurrentCard((prevCard) => {
      const newCard = prevCard + displacement;
      if (Array.isArray(children)) {
        return Math.max(0, Math.min(newCard, children.length - 1));
      }
      return newCard;
    });
  };

  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(!isSmallScreen), [isSmallScreen]);
  useEffect(() => {
    if (compare.length !== lastCompareLength.current) {
      if (lastCompareLength.current <= compare.length) {
        setDirection(1);
        setCurrentCard(Array.isArray(children) ? children.length - 1 : 0);
      }
      if (lastCompareLength.current == 1 && compare.length == 0) {
        setDirection(-1);
        setCurrentCard(0);
      }
      lastCompareLength.current = compare.length;
    }
  }, [compare.length, children]);

  return (
    <>
      <TabNavMenu
        value={currentCard}
        options={Array.isArray(names) ? names : [names]}
        turner={turn}
        compareLength={compare.length}
        open={open}
        setOpen={setOpen}
      />
      <Collapse in={open}>
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
              {Array.isArray(children)
                ? children.map((child, index) => (
                    <div
                      key={index}
                      className={index === currentCard ? 'block' : 'hidden'}
                    >
                      {child}
                    </div>
                  ))
                : children}
            </motion.div>
          </div>
        </AnimatePresence>
      </Collapse>
    </>
  );
}
