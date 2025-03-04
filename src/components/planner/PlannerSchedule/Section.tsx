import React from 'react';

type SectionComponentProps = {
  selectedSection: string;
};

const PlannerCoursesTable = (props: SectionComponentProps) => {
  //const SectionComponent = () => {
  return <div>{props.selectedSection}</div>;
};

export default PlannerCoursesTable;
