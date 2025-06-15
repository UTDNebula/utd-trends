import React from 'react';

import { fetchLatestSemester } from '@/modules/fetchSections';

import Home from './Home';

export default async function Page() {
  const latestSemester = await fetchLatestSemester();

  return <Home latestSemester={latestSemester} />;
}
