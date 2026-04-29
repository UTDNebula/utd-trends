'use client';

import { FiltersContext } from '@/app/dashboard/FilterContext';
import { useSharedState } from '@/app/SharedStateProvider';
import { clearAllFilters, type FilterDefaultsType } from '@/modules/filters';
import { useAvailabilityUrlSync } from '@/modules/useAvailabilityUrlSync';
import type { SearchResult } from '@/types/SearchQuery';
import TuneIcon from '@mui/icons-material/Tune';
import { Button, Chip, Grid, Skeleton, SwipeableDrawer } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { use } from 'react';
import { getFilterChipsArray } from './FilterChips';
import FilterPanels from './FilterPanels';

export function LoadingFilters() {
  const ChipSkeleton = (
    <Skeleton
      variant="rectangular"
      className="rounded-full"
      height={32}
      width={128}
    />
  );

  return (
    <>
      <Grid container spacing={1} className="max-md:hidden">
        <span className="h-8 mx-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400 select-none text-nowrap">
          Filters:
        </span>
        {ChipSkeleton} {/* Min Letter Grade */}
        {ChipSkeleton} {/* Min Rating */}
        {ChipSkeleton} {/* Semesters */}
        {ChipSkeleton} {/* Section Types */}
        {ChipSkeleton} {/* Availability */}
      </Grid>
      <Grid container spacing={1} className="md:hidden">
        <Chip
          label="Filters"
          icon={<TuneIcon fontSize="small" />}
          variant="outlined"
          className="border-[var(--mui-palette-divider)]"
        />
        {ChipSkeleton}
      </Grid>
    </>
  );
}

/**
 * This component returns a set of filters with which to sort results.
 */
export default function Filters({
  searchResultsPromise,
}: {
  searchResultsPromise: Promise<SearchResult[]>;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { setTeachingSemester, availableSemesters, effectiveTeachingSemester } =
    useSharedState();
  const searchResults = use(searchResultsPromise);
  const semesters = use(FiltersContext).semesters;
  const chosenSemesters = use(FiltersContext).chosenSemesters;
  const setChosenSemesters = use(FiltersContext).setChosenSemesters;
  const chosenSectionTypes = use(FiltersContext).chosenSectionTypes;
  const setChosenSectionTypes = use(FiltersContext).setChosenSectionTypes;
  const sectionTypes = use(FiltersContext).sectionTypes;

  const searchParams = useSearchParams();
  const pathname = usePathname();

  let minGPA = searchParams.get('minGPA') ?? '';
  if (Array.isArray(minGPA)) {
    minGPA = minGPA[0]; // if minGPA is an array, make it a string
  }
  let minRating = searchParams.get('minRating') ?? '';
  if (Array.isArray(minRating)) {
    minRating = minRating[0]; // if minRating is an array, make it a string
  }
  const { rawAvailability, availabilitySemester } = useAvailabilityUrlSync({
    pathname,
    searchParams,
    availableSemesters,
    effectiveTeachingSemester,
    setTeachingSemester,
  });
  const filterNextSem = rawAvailability !== null;

  const semFilteredResults = searchResults.filter((result) => {
    const semesterToFilter = availabilitySemester || effectiveTeachingSemester;
    const availableThisSemester =
      filterNextSem &&
      semesterToFilter &&
      result.sections.some(
        (section) => section.academic_session.name === semesterToFilter,
      );
    const hasChosenSectionTypes = result.grades.some((section) =>
      section.data.some((s) => chosenSectionTypes.includes(s.type)),
    );
    return (
      (result.grades.length === 0 &&
        chosenSemesters.length === semesters.length &&
        chosenSectionTypes.length === sectionTypes.length) ||
      (result.grades.some((s) => chosenSemesters.includes(s._id)) &&
        hasChosenSectionTypes) ||
      availableThisSemester
    );
  });

  const [openModal, setOpenModal] = React.useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleClearAllFilters = () =>
    clearAllFilters(defaults, {
      setChosenSemesters,
      setChosenSectionTypes,
    });

  const defaults: FilterDefaultsType = {
    minGPA: '',
    minRating: '',
    chosenSemesters: semesters,
    chosenSectionTypes: sectionTypes,
    availability: availableSemesters[0],
  };

  const defaultChecks = {
    minGPA: minGPA === defaults.minGPA,
    minRating: minRating === defaults.minRating,
    chosenSemesters: chosenSemesters.length === defaults.chosenSemesters.length,
    chosenSectionTypes:
      chosenSectionTypes.length === defaults.chosenSectionTypes.length,
    availability:
      effectiveTeachingSemester === defaults.availability &&
      filterNextSem === Boolean(defaults.availability),
  };

  const changedFiltersCount = Object.values(defaultChecks).filter(
    (check) => !check,
  ).length;

  function FilterBarFactory(filterChipType: 'delete' | 'popover') {
    const filterChipsArray = getFilterChipsArray({
      filterChipType,
      defaultChecks,
      data: {
        availableSemesters,
        chosenSectionTypes,
        chosenSemesters,
        effectiveTeachingSemester,
        filterNextSem,
        minGPA,
        minRating,
        sectionTypes,
        semesters,
        semFilteredResults,
        setChosenSectionTypes,
        setChosenSemesters,
      },
    });

    return (
      <Grid
        container
        spacing={1}
        data-tutorial-id="filters"
        className="overflow-x-clip"
      >
        <span className="h-8 mx-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400 select-none text-nowrap max-md:hidden">
          Filters:
        </span>
        <Chip
          label="Filters"
          icon={<TuneIcon fontSize="small" />}
          variant="outlined"
          onClick={handleOpenModal}
          className="border-[var(--mui-palette-divider)] md:hidden"
        />
        {changedFiltersCount <= 0 && (
          <span className="relative md:hidden">
            <span className="absolute h-full ml-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400 italic select-none text-nowrap">
              No filters selected
            </span>
          </span>
        )}
        <AnimatePresence>
          {filterChipsArray.map((chip) => (
            <motion.div
              key={chip.key}
              layout
              initial={mounted ? { opacity: 0, x: 16 } : false} // Ensures filter bar loads instantly when page loads, so Framer Motion doesn't wait for page to finish loading
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.1 }}
              className="empty:hidden" // If chip is empty (i.e. filter not enabled), then hide
            >
              {chip}
            </motion.div>
          ))}
          {changedFiltersCount >= 1 && (
            <motion.div
              layout
              initial={mounted ? { opacity: 0, x: 16 } : false} // Ensures filter bar loads instantly when page loads, so Framer Motion doesn't wait for page to finish loading
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.1 }}
              className="flex items-center max-md:hidden"
            >
              <Button
                size="small"
                color="inherit"
                className="rounded-full normal-case whitespace-nowrap min-h-8 px-4 text-neutral-600 dark:text-neutral-400"
                onClick={handleClearAllFilters}
              >
                Reset {changedFiltersCount} filter
                {changedFiltersCount === 1 ? '' : 's'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="max-md:hidden">{FilterBarFactory('popover')}</div>
      {/* Mobile */}
      <div className="md:hidden">{FilterBarFactory('delete')}</div>
      <SwipeableDrawer
        open={openModal}
        onOpen={handleOpenModal}
        onClose={handleCloseModal}
        anchor="bottom"
        slotProps={{
          paper: {
            elevation: 0,
            className:
              'bg-white dark:bg-neutral-900 rounded-t-2xl max-w-120 mx-auto',
          },
        }}
      >
        <div className="relative overflow-auto max-h-[calc(100dvh-6rem)] px-2 pt-5">
          <FilterPanels
            data={{
              chosenSectionTypes,
              chosenSemesters,
              minGPA,
              minRating,
              sectionTypes,
              semesters,
              semFilteredResults,
              setChosenSectionTypes,
              setChosenSemesters,
              availableSemesters,
              enabled: filterNextSem,
              semester: effectiveTeachingSemester,
            }}
          />
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 px-5 pb-5">
          <Button
            onClick={handleClearAllFilters}
            color="warning"
            className={`rounded-full normal-case ${changedFiltersCount <= 0 ? 'invisible' : ''}`}
            disabled={changedFiltersCount <= 0}
          >
            {changedFiltersCount
              ? `Reset ${changedFiltersCount} filter${changedFiltersCount === 1 ? '' : 's'}`
              : 'Reset all'}
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseModal}
            className="rounded-full normal-case"
          >
            OK
          </Button>
        </div>
      </SwipeableDrawer>
    </>
  );
}
