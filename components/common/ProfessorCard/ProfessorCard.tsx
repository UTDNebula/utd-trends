import { Box, Typography } from '@mui/material';
import React from 'react';

type ProfessorCardProps = {
  name: string;
  department: string;
  professorRating: number;
  averageDifficulty: number;
  takingAgain: number;
  numRatings: number;
};

export const ProfessorCard = (props: ProfessorCardProps) => {
  return (
    <>
      <Box className="flex flex-col md:flex-row w-full h-1/6">
        <Box className="basis-1/2 flex flex-row items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-inherit p-2">
          <Typography className="text-2xl text-center">{props.name}</Typography>
        </Box>
        <Box className="basis-1/2 flex flex-row items-center justify-center border-b-2 md:border-b-0 border-neutral-400 bg-inherit p-2">
          <Typography className="text-2xl text-center">
            {props.department}
          </Typography>
        </Box>
      </Box>
      <Box className="flex flex-col md:flex-row w-full h-4/6">
        <Box className="flex flex-col justify-between items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-primary-light w-full">
          <Typography className="text-3xl text-neutral-600 dark:text-neutral-200 text-center font-semibold mt-4 lg:mb-8">
            Average Difficulty
          </Typography>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 mb-8 text-5xl text-neutral-600 font-bold"
            sx={{
              backgroundColor: getColorForRating(6 - props.averageDifficulty),
            }}
          >
            {props.averageDifficulty}
          </Box>
        </Box>
        <Box className="flex flex-col justify-between items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-primary-light w-full">
          <Typography className="text-3xl text-neutral-600 dark:text-neutral-200 text-center font-semibold mt-4 lg:mb-8">
            Average Rating
          </Typography>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 md:mb-8 text-5xl text-neutral-600 font-bold"
            sx={{ backgroundColor: getColorForRating(props.professorRating) }}
          >
            {props.professorRating}
          </Box>
        </Box>
        <Box className="flex flex-col justify-between items-center border-b-2 md:border-b-0 border-neutral-400 bg-primary-light w-full">
          <Typography className="text-3xl text-neutral-600 dark:text-neutral-200 text-center font-semibold mt-4 lg:mb-8">
            Would Take Again
          </Typography>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 mb-8 text-5xl text-neutral-600 font-bold"
            sx={{
              backgroundColor: getColorForRating(
                Math.ceil(props.takingAgain * (5 / 100.0)),
              ),
            }}
          >
            {Math.ceil(props.takingAgain)}%
          </Box>
        </Box>
      </Box>
      <Box className="flex flex-row justify-center md:justify-start w-full h-1/6">
        <Typography className="text-2xl text-neutral-600 dark:text-neutral-200 text-center md:text-left font-semibold ml-8 my-4">
          Based on {props.numRatings} ratings
        </Typography>
      </Box>
    </>
  );
};

function getColorForRating(rating: number): string {
  if (rating < 1.7) {
    return '#ec5353';
  } else if (rating >= 1.7 && rating < 2.7) {
    return '#ecb653';
  } else if (rating >= 2.7 && rating < 4) {
    return '#f4ee5a';
  } else {
    //if (rating > 3.9) {
    return '#75f340';
  }
}

export default ProfessorCard;
