import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { CourseData } from '../../../pages/api/course';
import type { GradesType } from '../../../pages/dashboard/index';
import SingleGradesInfo from '../SingleGradesInfo/singleGradesInfo';

type CourseOverviewProps = {
  course: SearchQuery;
  courseData?: CourseData;
  courseLoading: 'loading' | 'done' | 'error';
  grades: GradesType;
  gradesLoading: 'loading' | 'done' | 'error';
};

function parseDescription(
  course: CourseData,
): [string, string[], string, string] {
  //extracts info from the course description and formats it
  const descriptionIntro =
    course.subject_prefix +
    ' ' +
    course.course_number +
    ' - ' +
    course.title +
    '  (' +
    course.credit_hours +
    ' semester credit hours) '; //part of the decription at the start to filter out
  let formattedDescription =
    course.description.indexOf(descriptionIntro) == 0
      ? course.description.substring(descriptionIntro.length)
      : course.description; //first, filter out the intro
  const requisites = ['', '', '']; //holds the text (or empty) for 'Prerequisites', 'Corequisites', and 'Prerequisites or Corequisites'
  const requisiteNames = [
    '. Prerequisite: ',
    '. Corequisite: ',
    '. Prerequisite or Corequisite: ',
    '. Prerequisites: ',
    '. Corequisites: ',
    '. Prerequisites or Corequisites: ',
  ]; //what to look for in the description
  let firstRequisite = 4; //tracks which requisite (pre, co, either) comes first in the description
  let lastRequisite = 4; //tracks the last requisite
  let remainderText = formattedDescription; //the idea is: remainderText contains the block of text at the end of the description. As it falls through the if statements, text is removed from the start until all the requisites are parsed and stored.
  if (remainderText.indexOf(requisiteNames[0]) != -1) {
    requisites[0] = remainderText.substring(
      remainderText.indexOf(requisiteNames[0]) + 2,
    );
    remainderText = requisites[0];
    firstRequisite = 0;
    lastRequisite = 0;
  }
  if (remainderText.indexOf(requisiteNames[3]) != -1) {
    requisites[0] = remainderText.substring(
      remainderText.indexOf(requisiteNames[3]) + 2,
    );
    remainderText = requisites[0];
    firstRequisite = 0;
    lastRequisite = 0;
  }

  if (remainderText.indexOf(requisiteNames[1]) != -1) {
    requisites[1] = remainderText.substring(
      remainderText.indexOf(requisiteNames[1]) + 2,
    );
    remainderText = requisites[1];
    firstRequisite = Math.min(1, firstRequisite);
    lastRequisite = 1;
    if (requisites[0].length != 0)
      requisites[0] = requisites[0].substring(
        0,
        requisites[0].indexOf(requisiteNames[1]) + 1,
      );
  }
  if (remainderText.indexOf(requisiteNames[4]) != -1) {
    requisites[1] = remainderText.substring(
      remainderText.indexOf(requisiteNames[4]) + 2,
    );
    remainderText = requisites[1];
    firstRequisite = Math.min(1, firstRequisite);
    lastRequisite = 1;
    if (requisites[0].length != 0)
      requisites[0] = requisites[0].substring(
        0,
        requisites[0].indexOf(requisiteNames[4]) + 1,
      );
  }

  if (remainderText.indexOf(requisiteNames[2]) != -1) {
    requisites[2] = remainderText.substring(
      remainderText.indexOf(requisiteNames[2]) + 2,
    );
    remainderText = requisites[2];
    firstRequisite = Math.min(2, firstRequisite);
    lastRequisite = 2;
    if (requisites[1].length != 0)
      requisites[1] = requisites[1].substring(
        0,
        requisites[1].indexOf(requisiteNames[2]) + 1,
      );
    else if (requisites[0].length != 0)
      requisites[0] = requisites[0].substring(
        0,
        requisites[0].indexOf(requisiteNames[2]) + 1,
      );
  }
  if (remainderText.indexOf(requisiteNames[5]) != -1) {
    requisites[2] = remainderText.substring(
      remainderText.indexOf(requisiteNames[5]) + 2,
    );
    remainderText = requisites[2];
    firstRequisite = Math.min(2, firstRequisite);
    lastRequisite = 2;
    if (requisites[1].length != 0)
      requisites[1] = requisites[1].substring(
        0,
        requisites[1].indexOf(requisiteNames[5]) + 1,
      );
    else if (requisites[0].length != 0)
      requisites[0] = requisites[0].substring(
        0,
        requisites[0].indexOf(requisiteNames[5]) + 1,
      );
  }
  const sameAsText =
    formattedDescription.lastIndexOf('(Same as ') != -1
      ? formattedDescription.substring(
          formattedDescription.lastIndexOf('(Same as '),
          formattedDescription.lastIndexOf(' ('),
        )
      : '';

  let offeringFrequency = formattedDescription.charAt(
    formattedDescription.length - 1,
  );
  switch (offeringFrequency) {
    case 'S':
      offeringFrequency = 'Each semester';
      break;
    case 'Y':
      offeringFrequency = 'Each year';
      break;
    case 'T':
      offeringFrequency = 'Every two years';
      break;
    case 'R':
      offeringFrequency =
        'Based on student interest and instructor availability';
      break;
    case 'P':
      offeringFrequency = 'Spring';
      break;
    case 'F':
      offeringFrequency = 'Fall';
      break;
    case 'U':
      offeringFrequency = 'Summer';
      break;
    default:
      '';
      break;
  }

  if (firstRequisite != 4 || lastRequisite != 4) {
    formattedDescription = formattedDescription.substring(
      0,
      1 +
        formattedDescription.indexOf(
          formattedDescription.indexOf(requisiteNames[firstRequisite]) != -1
            ? requisiteNames[firstRequisite]
            : requisiteNames[firstRequisite + 3],
        ),
    );
    requisites[lastRequisite] = requisites[lastRequisite].substring(
      0,
      requisites[lastRequisite].lastIndexOf('.') + 1,
    );
  } else
    formattedDescription = formattedDescription.substring(
      0,
      formattedDescription.lastIndexOf('.') + 1,
    );

  return [formattedDescription, requisites, sameAsText, offeringFrequency];
}

const CourseOverview = ({
  course,
  courseData,
  courseLoading,
  grades,
  gradesLoading,
}: CourseOverviewProps) => {
  if (courseLoading === 'done' && courseData != null) {
    const [formattedDescription, requisites, sameAsText, offeringFrequency] =
      parseDescription(courseData);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center">
          <p className="text-2xl font-bold self-center">{courseData.title}</p>
          <p className="text-lg font-semibold self-center">
            {courseData.subject_prefix +
              ' ' +
              courseData.course_number +
              ' ' +
              sameAsText}
          </p>
          <p className="font-semibold">{courseData.school}</p>
          <p>
            {formattedDescription +
              ' ' +
              courseData.credit_hours +
              ' credit hours.'}
          </p>
          <p>{requisites[0]}</p>
          <p>{requisites[1]}</p>
          <p>{requisites[2]}</p>
          <p>{'Offering Frequency: ' + offeringFrequency}</p>
        </div>
        <SingleGradesInfo
          course={course}
          grades={grades}
          gradesLoading={gradesLoading}
        />
      </div>
    );
  }
  //@TODO: maybe remove the tab or prevent creation if loading
  else
    return (
      <>
        <p>Course information is not available</p>
      </>
    );
};

export default CourseOverview;
