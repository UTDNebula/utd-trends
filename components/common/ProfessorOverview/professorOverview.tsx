import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';

type ProfessorOverviewProps = {
  professor: SearchQuery;
  grades: GradesType;
  rmp: RateMyProfessorData;
};

const ProfessorOverview = ({
  professor,
  grades,
  rmp,
}: ProfessorOverviewProps) => {
  return (
    <>
      <p>prof</p>
      <p>{searchQueryLabel(professor)}</p>
    </>
  );
};

export default ProfessorOverview;
