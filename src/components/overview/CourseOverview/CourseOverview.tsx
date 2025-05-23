'use client';

import { Skeleton } from '@mui/material';
import React from 'react';

import SingleGradesInfo, {
  LoadingSingleGradesInfo,
} from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import type { Course } from '@/modules/fetchCourse';
import type { Grades } from '@/modules/fetchGrades';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

export function LoadingCourseOverview() {
  const courseComponent = (
    <>
      <p className="text-2xl font-bold self-center w-[min(25ch,100%)]">
        <Skeleton />
      </p>
      <p className="text-lg font-semibold self-center w-[10ch] ">
        <Skeleton />
      </p>
      <p className="font-semibold w-[80%] ">
        <Skeleton />
      </p>
      <Skeleton variant="rounded" className="w-full h-24" />
      <p className="w-[30ch]">
        <Skeleton />
      </p>
      <p className="w-[21ch]">
        <Skeleton />
      </p>
      <p className="w-[24ch]">
        <Skeleton />
      </p>
      <p className="w-[33ch]">
        <Skeleton />
      </p>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      {courseComponent}
      <LoadingSingleGradesInfo />
    </div>
  );
}

function parseDescription(course: Course): {
  formattedDescription: string;
  requisites: string[];
  sameAsText: string;
  offeringFrequency: string;
  courseTitle: string;
  creditHours: string;
} {
  //extracts info from the course description and formats it
  const [descriptionBeforeCreditHours, descriptionAfterCreditHours] =
    course.description.split(/\([\d-]{0,3} semester credit hour[s]?\)/);
  let formattedDescription = descriptionAfterCreditHours || course.description;
  const courseTitle = descriptionAfterCreditHours
    ? descriptionBeforeCreditHours.split(course.course_number + ' - ')[1]
    : course.title;
  const creditHours =
    course.course_number[1] == 'V'
      ? course.description.split(' semester credit hours)')[0].split('(')[1]
      : course.credit_hours.toString();

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
      offeringFrequency = '';
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

  return {
    formattedDescription,
    requisites,
    sameAsText,
    offeringFrequency,
    courseTitle,
    creditHours,
  };
}

interface Props {
  course: SearchQuery;
  courseData: GenericFetchedData<Course>;
  grades: GenericFetchedData<Grades>;
}

export default function CourseOverview({ course, courseData, grades }: Props) {
  let courseComponent = null;
  if (
    courseData.message === 'success' &&
    typeof courseData.data !== 'undefined'
  ) {
    const {
      formattedDescription,
      requisites,
      sameAsText,
      offeringFrequency,
      courseTitle,
      creditHours,
    } = parseDescription(courseData.data);
    courseComponent = (
      <>
        <p className="text-2xl font-bold text-center">{courseTitle}</p>
        <p className="text-lg font-semibold text-center">
          {searchQueryLabel(course) + ' ' + sameAsText}
        </p>
        <p className="font-semibold">{courseData.data.school}</p>
        <p>{formattedDescription + ' ' + creditHours + ' credit hours.'}</p>
        {requisites.map((requisite, index) => {
          if (requisite === '') {
            return null;
          }
          const split = requisite.split(': ');
          return (
            <p key={index}>
              <b>{split[0] + ': '}</b>
              {split[1]}
            </p>
          );
        })}
        {offeringFrequency !== '' && (
          <p>
            <b>Offering Frequency: </b>
            {offeringFrequency}
          </p>
        )}
      </>
    );
  } else {
    courseComponent = (
      <p className="text-lg font-semibold text-center">
        Course information is not available
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {courseComponent}
      <SingleGradesInfo
        title="# of Students (Overall)"
        course={course}
        grades={grades}
        gradesToUse="unfiltered"
      />
    </div>
  );
}
