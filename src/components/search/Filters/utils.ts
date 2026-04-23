import { setParams } from '@/modules/searchParams';
import type { Dispatch, SetStateAction } from 'react';

export type FilterDefaultsType = {
  minGPA: string;
  minRating: string;
  chosenSemesters: string[];
  chosenSectionTypes: string[];
  availability: string;
};

export function clearAllFilters(
  defaults: FilterDefaultsType,
  mutators: {
    setChosenSemesters: Dispatch<SetStateAction<string[]>>;
    setChosenSectionTypes: Dispatch<SetStateAction<string[]>>;
  },
) {
  setParams((params) => {
    const setOrDelete = (name: string, value: string) => {
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
    };
    setOrDelete('minGPA', defaults.minGPA);
    setOrDelete('minRating', defaults.minRating);
    setOrDelete('availability', defaults.availability);
  });
  mutators.setChosenSemesters(defaults.chosenSemesters);
  mutators.setChosenSectionTypes(defaults.chosenSectionTypes);
}

export type FilterBarChipProps = {
  type?: 'delete' | 'popover';
  dirty?: boolean;
  /**
   * By default, the filter bar chips will automatically determine if they're dirty or not. This prop disables that.
   */
  disableAutoDirty?: boolean;
};
