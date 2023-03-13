import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';

export function CardContents({
  top,
  left,
  height,
  width,
  name,
  position,
  text,
  department,
  fontSize,
  colorCode,
  ProfessorRating,
  avgDifficulty,
  takingAgain,
}) {
  return (
    <>
      <div
        className=".profcard-container"
        style={{
          position: 'relative',
          top: '-20px',
          left: '-250px',
          width: '0%',
          paddingBottom: '520px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '120px',
            left: '0%',
            height: '534px',
            width: '1900px',
            borderRadius: '5px',
            backgroundColor: '#BCC9FD',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        ></div>
      </div>
      <div
        style={{
          position: 'relative',
          top: '-510px',
          left: '-0%',
          height: '100px',
          fontSize: '45px',
        }}
      >
        <h1>{name}</h1>
      </div>

      <div
        style={{
          position: 'relative',
          top: '-610px',
          left: '66%',
          height: '100px',
          fontSize: '24px',
        }}
      >
        <h1>Department of {department}</h1>
        <h1>at The University of Texas at Dallas</h1>
      </div>

      <div
        style={{
          position: 'relative',
          width: '70px',
          height: '0px',
          left: '47%',
          top: '-670px',
          border: '2px solid #BDBDBD',
          transform: 'rotate(-90deg)',
        }}
      ></div>

      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '9%',
          top: '-355px',
          border: '2px solid #BDBDBD',
          transform: 'rotate(-90deg)',
        }}
      ></div>

      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '45%',
          top: '-360px',
          border: '2px solid #BDBDBD',
          transform: 'rotate(-90deg)',
        }}
      ></div>

      {/*Average Difficulty*/}
      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '3%',
          top: '-560px',
          fontSize: '35px',
          color: 'gray',
        }}
      >
        <h2> Average Difficulty </h2>
      </div>

      {/*Average Rating*/}
      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '45%',
          top: '-560px',
          fontSize: '35px',
          color: 'gray',
        }}
      >
        <h2> Rating </h2>
      </div>

      {/*Percent Taking Again*/}
      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '71%',
          top: '-560px',
          fontSize: '35px',
          color: 'gray',
        }}
      >
        <h2> Percent Taking Again </h2>
      </div>

      {/*Square 1*/}

      <div
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          left: '80%',
          top: '40%',
          border: '4px solid #BDBDBD',
          backgroundColor: colorCode[0],
        }}
      ></div>

      {/*Square 2*/}

      <div
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          left: '220%',
          top: '40%',
          border: '4px solid #BDBDBD',
          backgroundColor: colorCode[1],
        }}
      ></div>

      {/*Square 3*/}

      <div
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          left: '360%',
          top: '40%',
          border: '4px solid #BDBDBD',
          backgroundColor: colorCode[2],
        }}
      ></div>

      {/*Average difficulty Numbers*/}
      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '18%',
          top: '-380px',
          fontSize: '35px',
          color: 'black',
        }}
      >
        <h2> 2.1 </h2>
      </div>

      {/*Average Rating Number*/}
      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '48%',
          top: '-380px',
          fontSize: '35px',
          color: 'black',
        }}
      >
        <h2> 4.2 </h2>
      </div>

      {/*Percent Taking Again Numbers*/}
      <div
        style={{
          position: 'relative',
          width: '530px',
          height: '0px',
          left: '83%',
          top: '-380px',
          fontSize: '35px',
          color: 'black',
        }}
      >
        <h2> 80% </h2>
      </div>
    </>
  );
}

CardContents.propTypes = {
  top: PropTypes.string.isRequired,
  left: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  department: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  colorCode: PropTypes.string.isRequired,
  ProfessorRating: PropTypes.string.isRequired,
  avgRating: PropTypes.string.isRequired,
  takingAgain: PropTypes.string.isRequired,
};
