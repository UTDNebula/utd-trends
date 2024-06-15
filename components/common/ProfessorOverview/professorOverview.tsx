import { Typography } from '@mui/material';
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
    <Typography className="leading-tight">
      prof{searchQueryLabel(professor)}
    </Typography>
  );
};

export default ProfessorOverview;
