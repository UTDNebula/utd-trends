import { Badge, Tab, Tabs } from '@mui/material';
import React from 'react';

/**
 * Props type used by the TabNavMenu component
 */
type TabNavMenuProps = {
  value: number;
  // Turning animation of the carousel is handled by the parent, and this method is
  // responsible for playing the animation and setting the value to the correct new value
  turner: (displacement: number) => void;
  options: string[];
  compareLength: number;
};

/**
 * This component returns a full-width bar with a Tabs component centered. There are two tabs, one for the Grades view
 * and one for the Detailed view. This is connected to the parent component with the value and setValue functions,
 * which are held by the parent and passed to this component to be manipulated by the Tabs component.
 */
export const TabNavMenu = (props: TabNavMenuProps) => {
  return (
    <Tabs
      value={props.value}
      onChange={(event, newValue) => props.turner(newValue - props.value)}
      aria-label="Tab switcher"
      className="w-full grid grid-flow-row justify-center shadow dark:shadow-lg"
    >
      {props.options.map((option, index) => (
        <Tab
          key={index}
          className="text-lg text-gray-600 dark:text-gray-200 normal-case"
          value={index}
          label={
            index === props.options.length - 1 && props.compareLength ? (
              <div className="flex items-center gap-4">
                {option}
                <Badge badgeContent={props.compareLength} color="primary" />
              </div>
            ) : (
              option
            )
          }
        />
      ))}
    </Tabs>
  );
};
