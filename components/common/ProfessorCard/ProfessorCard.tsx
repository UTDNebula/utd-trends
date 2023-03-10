import React from 'react';
import PropTypes from 'prop-types';
import {CardContents} from './CardContents';

export function ProfessorCard ({Element, top, left, height, width, name, position, text, department, fontSize, colorCode, ProfessorRating, avgDifficulty, takingAgain }){
      
  

  switch(Element){

    case "Background" : {
      return (
  
    <>

    <div
        style={{
          position: "relative",
          top: "90px",
          left: "200px",
          height: "50px",
          backgroundColor: '#ffffff',
         
        }}
      >
      </div>


      <div
        style={{
          display: 'flex',
          position: position,
          top: top,
          left: left,
          height: height,
          width: width, 
          backgroundColor: '#BCC9FD',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
  
            
      </div>


      
    </>
      );  
  

    }case "Title" : {
      return(

        <div style={{
          position: position,
          top: top,
          left: left,
          height: height,
          fontSize: fontSize,
        }}
      >

      <h1 >{text}</h1>

      </div>);

    }case "Card" : {
      return(


         <CardContents
           
           position = "relative"
           top = {top}
           left = {left}
           width = {width}
           height = {height}
           name = {name}
           department = {department}
           colorCode = {colorCode}
         ></CardContents>


        );

    }

  }
    

}

ProfessorCard.propTypes = {
  top: PropTypes.string.isRequired,
  left: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
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