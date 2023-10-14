import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import React, { FC } from 'react';

interface CardContentProps {
  name: string;
  department: string;
  professorRating: number;
  averageDifficulty: number;
  takingAgain: number;
  numRatings: number;
}

export const CardContents: FC<CardContentProps> = (props: CardContentProps) => {
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
          <Typography className="text-3xl text-neutral-600 text-center font-semibold mt-4 lg:mb-8">
            Average Difficulty
          </Typography>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 mb-8 text-5xl text-neutral-600 font-bold"
            sx={{
              backgroundColor: getColorForRating(5 - props.averageDifficulty),
            }}
          >
            {props.averageDifficulty}
          </Box>
        </Box>
        <Box className="flex flex-col justify-between items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-primary-light w-full">
          <Typography className="text-3xl text-neutral-600 text-center font-semibold mt-4 lg:mb-8">
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
          <Typography className="text-3xl text-neutral-600 text-center font-semibold mt-4 lg:mb-8">
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
        <Link
          href={`https://www.ratemyprofessors.com/search/teachers?query=${encodeURIComponent(
            props.name,
          )}&sid=U2Nob29sLTEyNzM=`}
        >
          <a
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            <Typography className="text-2xl text-center md:text-left font-semibold ml-8 my-4">
              Based on {props.numRatings} ratings
            </Typography>
          </a>
        </Link>
      </Box>
      {/*<Box*/}
      {/*  className=".profcard-container"*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    top: '-20px',*/}
      {/*    left: '-250px',*/}
      {/*    width: '0%',*/}
      {/*    paddingBottom: '520px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Box*/}
      {/*    style={{*/}
      {/*      position: 'absolute',*/}
      {/*      top: '120px',*/}
      {/*      left: '0%',*/}
      {/*      height: '534px',*/}
      {/*      width: '1900px',*/}
      {/*      borderRadius: '5px',*/}
      {/*      backgroundColor: '#BCC9FD',*/}
      {/*      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',*/}
      {/*    }}*/}
      {/*  ></Box>*/}
      {/*</Box>*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    top: '-510px',*/}
      {/*    left: '-0%',*/}
      {/*    height: '100px',*/}
      {/*    fontSize: '45px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography>{props.name}</Typography>*/}
      {/*</Box>*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    top: '-610px',*/}
      {/*    left: '66%',*/}
      {/*    height: '100px',*/}
      {/*    fontSize: '24px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography>Department of {props.department}</Typography>*/}
      {/*  <Typography>at The University of Texas at Dallas</Typography>*/}
      {/*</Box>*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '70px',*/}
      {/*    height: '0px',*/}
      {/*    left: '47%',*/}
      {/*    top: '-670px',*/}
      {/*    border: '2px solid #BDBDBD',*/}
      {/*    transform: 'rotate(-90deg)',*/}
      {/*  }}*/}
      {/*></Box>*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '9%',*/}
      {/*    top: '-355px',*/}
      {/*    border: '2px solid #BDBDBD',*/}
      {/*    transform: 'rotate(-90deg)',*/}
      {/*  }}*/}
      {/*></Box>*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '45%',*/}
      {/*    top: '-360px',*/}
      {/*    border: '2px solid #BDBDBD',*/}
      {/*    transform: 'rotate(-90deg)',*/}
      {/*  }}*/}
      {/*></Box>*/}

      {/*/!*Average Difficulty*!/*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '3%',*/}
      {/*    top: '-560px',*/}
      {/*    fontSize: '35px',*/}
      {/*    color: 'gray',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography> Average Difficulty </Typography>*/}
      {/*</Box>*/}

      {/*/!*Average Rating*!/*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '45%',*/}
      {/*    top: '-560px',*/}
      {/*    fontSize: '35px',*/}
      {/*    color: 'gray',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography> Rating </Typography>*/}
      {/*</Box>*/}

      {/*/!*Percent Taking Again*!/*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '71%',*/}
      {/*    top: '-560px',*/}
      {/*    fontSize: '35px',*/}
      {/*    color: 'gray',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography> Percent Taking Again </Typography>*/}
      {/*</Box>*/}

      {/*/!*Square 1*!/*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '250px',*/}
      {/*    height: '250px',*/}
      {/*    left: '80%',*/}
      {/*    top: '40%',*/}
      {/*    border: '4px solid #BDBDBD',*/}
      {/*    backgroundColor: props.colorCode[0],*/}
      {/*  }}*/}
      {/*></Box>*/}

      {/*/!*Square 2*!/*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '250px',*/}
      {/*    height: '250px',*/}
      {/*    left: '220%',*/}
      {/*    top: '40%',*/}
      {/*    border: '4px solid #BDBDBD',*/}
      {/*    backgroundColor: props.colorCode[1],*/}
      {/*  }}*/}
      {/*></Box>*/}

      {/*/!*Square 3*!/*/}

      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '250px',*/}
      {/*    height: '250px',*/}
      {/*    left: '360%',*/}
      {/*    top: '40%',*/}
      {/*    border: '4px solid #BDBDBD',*/}
      {/*    backgroundColor: props.colorCode[2],*/}
      {/*  }}*/}
      {/*></Box>*/}

      {/*/!*Average difficulty Numbers*!/*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '18%',*/}
      {/*    top: '-380px',*/}
      {/*    fontSize: '35px',*/}
      {/*    color: 'black',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography> 2.1 </Typography>*/}
      {/*</Box>*/}

      {/*/!*Average Rating Number*!/*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '48%',*/}
      {/*    top: '-380px',*/}
      {/*    fontSize: '35px',*/}
      {/*    color: 'black',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography> 4.2 </Typography>*/}
      {/*</Box>*/}

      {/*/!*Percent Taking Again Numbers*!/*/}
      {/*<Box*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '83%',*/}
      {/*    top: '-380px',*/}
      {/*    fontSize: '35px',*/}
      {/*    color: 'black',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography> 80% </Typography>*/}
      {/*</Box>*/}
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

export default CardContents;
