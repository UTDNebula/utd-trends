import React from 'react';
import { CardContents } from './CardContents';
import { Property } from 'csstype';

interface ProfessorCardProps {
  element: string;
  top?: string;
  left?: string;
  height?: string;
  width?: string;
  name: string;
  position: Property.Position;
  text?: string;
  department: string;
  fontSize?: string;
  colorCode: string[];
  professorRating: number;
  averageDifficulty: number;
  takingAgain: number;
}

export const ProfessorCard = (props: ProfessorCardProps) => {
  switch (props.element) {
    case 'Background': {
      return (
        <>
          <div
            style={{
              position: 'relative',
              top: '90px',
              left: '200px',
              height: '50px',
              backgroundColor: '#ffffff',
            }}
          ></div>

          <div
            style={{
              display: 'flex',
              position: props.position,
              top: props.top,
              left: props.left,
              height: props.height,
              width: props.width,
              backgroundColor: '#BCC9FD',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          ></div>
        </>
      );
    }
    case 'Title': {
      return (
        <div
          style={{
            position: props.position,
            top: props.top,
            left: props.left,
            height: props.height,
            fontSize: props.fontSize,
          }}
        >
          <h1>{props.text}</h1>
        </div>
      );
    }
    case 'Card':
    default: {
      return (
        <CardContents
          position="relative"
          top={props.top}
          left={props.left}
          width={props.width}
          height={props.height}
          name={props.name}
          department={props.department}
          colorCode={props.colorCode}
          professorRating={props.professorRating}
          averageDifficulty={props.averageDifficulty}
          takingAgain={props.takingAgain}
          fontSize={props.fontSize}
          text={props.text}
        ></CardContents>
      );
    }
  }
};

export default ProfessorCard;
