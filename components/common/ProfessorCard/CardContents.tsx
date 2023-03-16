import React, { FC } from 'react';
import { Box } from '@mui/material';

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
      <div className="flex flex-col md:flex-row w-full h-1/6">
        <div className="basis-1/2 flex flex-row items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-inherit p-2">
          <h1 className="text-2xl text-center">{props.name}</h1>
        </div>
        <div className="basis-1/2 flex flex-row items-center justify-center border-b-2 md:border-b-0 border-neutral-400 bg-inherit p-2">
          <h1 className="text-2xl text-center">
            Department of {props.department} at University of Texas at Dallas
          </h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full h-4/6">
        <div className="flex flex-col justify-between items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-primary-light w-full">
          <h2 className="text-3xl text-neutral-600 text-center font-semibold mt-4 lg:mb-8">
            Average Difficulty
          </h2>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 mb-8 text-5xl text-neutral-600 font-bold"
            sx={{ backgroundColor: getColorForRating(props.averageDifficulty) }}
          >
            {props.averageDifficulty}
          </Box>
        </div>
        <div className="flex flex-col justify-between items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-400 bg-primary-light w-full">
          <h2 className="text-3xl text-neutral-600 text-center font-semibold mt-4 lg:mb-8">
            Average Rating
          </h2>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 md:mb-8 text-5xl text-neutral-600 font-bold"
            sx={{ backgroundColor: getColorForRating(props.professorRating) }}
          >
            {props.professorRating}
          </Box>
        </div>
        <div className="flex flex-col justify-between items-center border-b-2 md:border-b-0 border-neutral-400 bg-primary-light w-full">
          <h2 className="text-3xl text-neutral-600 text-center font-semibold mt-4 lg:mb-8">
            Percentage Taking Again
          </h2>
          <Box
            className="h-32 w-32 border-2 border-neutral-400 flex items-center justify-center my-4 md:mt-0 mb-8 text-5xl text-neutral-600 font-bold"
            sx={{
              backgroundColor: getColorForRating(Math.ceil(props.takingAgain)),
            }}
          >
            {Math.ceil(props.takingAgain)}%
          </Box>
        </div>
      </div>
      <div className="flex flex-row justify-center md:justify-start w-full h-1/6">
        <h2 className="text-2xl text-neutral-600 text-center md:text-left font-semibold ml-8 my-4">
          Based on {props.numRatings} ratings
        </h2>
      </div>
      {/*<div*/}
      {/*  className=".profcard-container"*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    top: '-20px',*/}
      {/*    left: '-250px',*/}
      {/*    width: '0%',*/}
      {/*    paddingBottom: '520px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <div*/}
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
      {/*  ></div>*/}
      {/*</div>*/}
      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    top: '-510px',*/}
      {/*    left: '-0%',*/}
      {/*    height: '100px',*/}
      {/*    fontSize: '45px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <h1>{props.name}</h1>*/}
      {/*</div>*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    top: '-610px',*/}
      {/*    left: '66%',*/}
      {/*    height: '100px',*/}
      {/*    fontSize: '24px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <h1>Department of {props.department}</h1>*/}
      {/*  <h1>at The University of Texas at Dallas</h1>*/}
      {/*</div>*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '70px',*/}
      {/*    height: '0px',*/}
      {/*    left: '47%',*/}
      {/*    top: '-670px',*/}
      {/*    border: '2px solid #BDBDBD',*/}
      {/*    transform: 'rotate(-90deg)',*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '9%',*/}
      {/*    top: '-355px',*/}
      {/*    border: '2px solid #BDBDBD',*/}
      {/*    transform: 'rotate(-90deg)',*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'relative',*/}
      {/*    width: '530px',*/}
      {/*    height: '0px',*/}
      {/*    left: '45%',*/}
      {/*    top: '-360px',*/}
      {/*    border: '2px solid #BDBDBD',*/}
      {/*    transform: 'rotate(-90deg)',*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*/!*Average Difficulty*!/*/}
      {/*<div*/}
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
      {/*  <h2> Average Difficulty </h2>*/}
      {/*</div>*/}

      {/*/!*Average Rating*!/*/}
      {/*<div*/}
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
      {/*  <h2> Rating </h2>*/}
      {/*</div>*/}

      {/*/!*Percent Taking Again*!/*/}
      {/*<div*/}
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
      {/*  <h2> Percent Taking Again </h2>*/}
      {/*</div>*/}

      {/*/!*Square 1*!/*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '250px',*/}
      {/*    height: '250px',*/}
      {/*    left: '80%',*/}
      {/*    top: '40%',*/}
      {/*    border: '4px solid #BDBDBD',*/}
      {/*    backgroundColor: props.colorCode[0],*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*/!*Square 2*!/*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '250px',*/}
      {/*    height: '250px',*/}
      {/*    left: '220%',*/}
      {/*    top: '40%',*/}
      {/*    border: '4px solid #BDBDBD',*/}
      {/*    backgroundColor: props.colorCode[1],*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*/!*Square 3*!/*/}

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '250px',*/}
      {/*    height: '250px',*/}
      {/*    left: '360%',*/}
      {/*    top: '40%',*/}
      {/*    border: '4px solid #BDBDBD',*/}
      {/*    backgroundColor: props.colorCode[2],*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*/!*Average difficulty Numbers*!/*/}
      {/*<div*/}
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
      {/*  <h2> 2.1 </h2>*/}
      {/*</div>*/}

      {/*/!*Average Rating Number*!/*/}
      {/*<div*/}
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
      {/*  <h2> 4.2 </h2>*/}
      {/*</div>*/}

      {/*/!*Percent Taking Again Numbers*!/*/}
      {/*<div*/}
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
      {/*  <h2> 80% </h2>*/}
      {/*</div>*/}
    </>
  );
};

function getColorForRating(rating: number): string {
  if (rating < 1.7) {
    return '#ec5353';
  } else if (rating > 1.6 && rating < 2.7) {
    return '#ecb653';
  } else if (rating > 2.6 && rating < 4) {
    return '#f4ee5a';
  } else {
    //if (rating > 3.9) {
    return '#75f340';
  }
}

export default CardContents;
