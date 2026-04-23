'use client';

import { FiltersContext } from '@/app/dashboard/FilterContext';
import { useSharedState } from '@/app/SharedStateProvider';
import { useAvailabilityUrlSync } from '@/modules/useAvailabilityUrlSync';
import type { SearchResult } from '@/types/SearchQuery';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Button,
  Chip,
  Grid,
  Skeleton,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { use } from 'react';
import AvailabilityFilterChip from './Chips/AvailabilityFilterChip';
import MinLetterGradeFilterChip from './Chips/MinLetterGradeFilterChip';
import MinRatingFilterChip from './Chips/MinRatingFilterChip';
import SectionTypeFilterChip from './Chips/SectionTypeFilterChip';
import SemesterFilterChip from './Chips/SemesterFilterChip';
import {
  clearAllFilters,
  type FilterBarChipProps,
  type FilterDefaultsType,
} from './utils';

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
    <Grid container spacing={{ xs: 1, md: 2 }} className="mb-4 sm:m-0">
      {ChipSkeleton} {/* Min Letter Grade */}
      {ChipSkeleton} {/* Min Rating */}
      {ChipSkeleton} {/* Semesters */}
      {ChipSkeleton} {/* Section Types */}
      {ChipSkeleton} {/* Availability */}
    </Grid>
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

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

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

  const filterChipType: FilterBarChipProps['type'] = smallScreen
    ? 'delete'
    : 'popover';

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

  const dirtyFieldsCount = Object.values(defaultChecks).filter(
    (check) => !check,
  ).length;

  return (
    <Grid container spacing={1} data-tutorial-id="filters">
      {!smallScreen && (
        <span className="h-8 mx-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400 select-none text-nowrap">
          Filters:
        </span>
      )}
      {smallScreen && (
        <Chip
          label="Filters"
          icon={<TuneIcon fontSize="small" />}
          variant="outlined"
          onClick={handleOpenModal}
          className="border-[var(--mui-palette-divider)]"
        />
      )}
      {smallScreen && dirtyFieldsCount <= 0 && (
        <span className="relative">
          <span className="absolute h-full ml-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400 italic select-none text-nowrap">
            No filters selected
          </span>
        </span>
      )}
      <AnimatePresence>
        {[
          <MinLetterGradeFilterChip
            type={filterChipType}
            dirty={!defaultChecks.minGPA}
            disableAutoDirty
            key="minLetterGrade"
            chosenSectionTypes={chosenSectionTypes}
            chosenSemesters={chosenSemesters}
            minGPA={minGPA}
            minRating={minRating}
            sectionTypes={sectionTypes}
            semFilteredResults={semFilteredResults}
            semesters={semesters}
          />,
          <MinRatingFilterChip
            type={filterChipType}
            dirty={!defaultChecks.minRating}
            disableAutoDirty
            key="minRating"
            chosenSectionTypes={chosenSectionTypes}
            chosenSemesters={chosenSemesters}
            minGPA={minGPA}
            minRating={minRating}
            semFilteredResults={semFilteredResults}
          />,
          <SemesterFilterChip
            type={filterChipType}
            dirty={!defaultChecks.chosenSemesters}
            disableAutoDirty
            key="semester"
            semesters={semesters}
            chosenSemesters={chosenSemesters}
            setChosenSemesters={setChosenSemesters}
          />,
          <SectionTypeFilterChip
            type={filterChipType}
            dirty={!defaultChecks.chosenSectionTypes}
            disableAutoDirty
            key="sectionType"
            sectionTypes={sectionTypes}
            chosenSectionTypes={chosenSectionTypes}
            setChosenSectionTypes={setChosenSectionTypes}
          />,
          <AvailabilityFilterChip
            type={filterChipType}
            dirty={!defaultChecks.availability}
            disableAutoDirty
            key="availability"
            enabled={filterNextSem}
            semester={effectiveTeachingSemester}
            availableSemesters={availableSemesters}
          />,
        ].map((chip) => (
          <motion.div
            key={chip.key}
            layout
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.1 }}
            className="empty:hidden" // If chip is empty (i.e. filter not enabled), then hide
          >
            {chip}
          </motion.div>
        ))}
        {!smallScreen && dirtyFieldsCount > 1 && (
          <motion.div
            layout
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.1 }}
            className="flex items-center"
          >
            <Button
              size="small"
              color="inherit"
              className="rounded-full normal-case whitespace-nowrap min-h-8 text-neutral-600 dark:text-neutral-400"
              onClick={handleClearAllFilters}
            >
              Reset {dirtyFieldsCount} filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
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
          {/* TODO: Add filter panels */}
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 px-5 pb-5">
          <Button
            onClick={handleClearAllFilters}
            color="warning"
            className={`rounded-full normal-case ${dirtyFieldsCount <= 0 ? 'invisible' : ''}`}
            disabled={dirtyFieldsCount <= 0}
          >
            {dirtyFieldsCount
              ? `Reset ${dirtyFieldsCount} filter${dirtyFieldsCount === 1 ? '' : 's'}`
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
    </Grid>
  );
}
