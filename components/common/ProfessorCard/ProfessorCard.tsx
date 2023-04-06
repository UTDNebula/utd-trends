import React, { FC } from 'react';
import Card from '@mui/material/Card';
import { Box, Typography } from '@mui/material';
import CardContents from './CardContents';
import { Property } from 'csstype';

interface ProfessorCardProps {
  element: string;
  top?: string;
  left?: string;
  height?: string;
  width?: string;
  name?: string;
  position: Property.Position;
  text?: string;
  department?: string;
  fontSize?: string;
  professorRating?: number;
  averageDifficulty?: number;
  takingAgain?: number;
  numRatings?: number;
}

export const ProfessorCard: FC<ProfessorCardProps> = (
  props: ProfessorCardProps,
) => {
  switch (props.element) {
    case 'Background': {
      return (
        <>
          <Box
            sx={{
              position: 'relative',
              top: '90px',
              left: '200px',
              height: '50px',
              backgroundColor: '#ffffff',
            }}
          ></Box>

          <Box
            sx={{
              display: 'flex',
              position: props.position,
              top: props.top,
              left: props.left,
              height: props.height,
              width: props.width,
              backgroundColor: '#BCC9FD',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          ></Box>
        </>
      );
    }
    case 'Title': {
      return (
        <Box
          sx={{
            position: props.position,
            top: props.top,
            left: props.left,
            height: props.height,
            fontSize: props.fontSize,
          }}
        >
          <Typography className="text-2xl text-center">{props.text}</Typography>
        </Box>
      );
    }
    case 'Card':
    default: {
      return (
        <CardContents
          name={props.name as string}
          department={props.department as string}
          professorRating={props.professorRating as number}
          averageDifficulty={props.averageDifficulty as number}
          takingAgain={props.takingAgain as number}
          numRatings={props.numRatings as number}
        ></CardContents>
      );
    }
  }
};

export default ProfessorCard;
