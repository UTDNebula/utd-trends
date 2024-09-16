import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import React, { useState } from 'react';

import { TabNavMenu } from '../../navigation/tabNavMenu/tabNavMenu';

interface CarouselProps {
  names: string[] | string;
  children: ReactJSXElement[] | ReactJSXElement;
}

/**
 * This is a simple Carousel Component that takes in child components that can be
 * toggled between by way of using arrow buttons.
 * @param props the props passed from the parent component
 * @returns
 */
export const Carousel = ({ names, children }: CarouselProps) => {
  //The card currently being displayed
  const [currentCard, setCard] = useState(0);

  /**
   * Turn
   * This function switches the active component back and forth based upon whether it is fed a positive or negative value
   * @param displacement a positive value will cause the card to move right, negative value cause card to move left
   */
  const turn = (displacement: number) => {
    setCard(currentCard + displacement);
  };

  return (
    <>
      <TabNavMenu
        value={currentCard}
        options={Array.isArray(names) ? names : [names]}
        turner={turn}
      />
      <div className="p-4 lg:p-6">
        {Array.isArray(children) ? children[currentCard] : children}
      </div>
    </>
  );
};

export default Carousel;
