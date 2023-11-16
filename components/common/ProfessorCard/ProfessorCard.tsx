// Only problem is there's a black sillhoute that appears
// Because of the smaller professor card. Most likely due to the css element.
// Need api key

import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';

type ProfessorCardProps = {
  name: string;
  department: string;
  professorRating: number;
  averageDifficulty: number;
  takingAgain: number;
  numRatings: number;
  //numEvaluation: number; (Need to include percentage for evalution)
};

export const ProfessorCard = (props: ProfessorCardProps) => {
  return (
    <Box
      className="flex flex-col items-center justify-center p-4"
      style={{
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        maxWidth: '300px',
      }}
    >
      {/* Average rating at the top */}
      <Box className="flex flex-col items-center justify-center mb-2">
        <Typography
          className="text-lg font-semibold"
          style={{ color: 'black' }}
        >
          Average Rating:
        </Typography>
        <Typography className="text-3xl" style={{ color: 'black' }}>
          {props.professorRating.toFixed(1)} / 5
        </Typography>
      </Box>

      {/* Number of ratings */}
      <Box className="flex flex-col items-center justify-center mb-2">
        <Link
          href={`https://www.ratemyprofessors.com/search/professors/?q=${encodeURIComponent(
            props.name,
          )}`}
          target="_blank"
        >
          <Typography
            className="text-md"
            style={{ color: 'black', textDecoration: 'underline' }}
          >
            Based on {props.numRatings} ratings
          </Typography>
        </Link>
      </Box>

      {/* Professor's name */}
      <Box
        className="flex flex-col items-center justify-center mb-4"
        style={{ textAlign: 'center', width: '100%' }}
      >
        <Typography
          className="text-3xl font-bold"
          style={{ color: 'black', textAlign: 'center', lineHeight: '1.25em' }}
        >
          {props.name}
        </Typography>
      </Box>

      {/* Course Evaluation */}
      <Box className="flex flex-col items-center justify-center mb-4">
        <Typography style={{ color: 'black', fontSize: '1em' }}>
          55% of students took
        </Typography>
        <Typography style={{ color: 'black', fontSize: '1em' }}>
          the Course Evaluation
        </Typography>
      </Box>

      {/* Difficulty and Taking Again boxes side by side */}
      <Box className="flex justify-between items-center w-full">
        {/* Difficulty label */}
        <Box className="flex flex-col items-center">
          <Box className="border border-neutral-400 p-2">
            <Typography style={{ color: 'black', fontSize: '1.25em' }}>
              {props.averageDifficulty.toFixed(1)}
            </Typography>
          </Box>
          <Typography style={{ color: 'black', fontSize: '0.8em' }}>
            Difficulty
          </Typography>
        </Box>

        {/* Taking Again label */}
        <Box className="flex flex-col items-center">
          <Box className="border border-neutral-400 p-2">
            <Typography style={{ color: 'black', fontSize: '1.25em' }}>
              {props.takingAgain.toFixed(0)}%
            </Typography>
          </Box>
          <Typography style={{ color: 'black', fontSize: '0.8em' }}>
            Would Take Again
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfessorCard;
