import { fetchLatestSemester } from '@/modules/fetchSections';
import React from 'react';
import Home from './Home';

export default async function Page() {
  const latestSemester = await fetchLatestSemester().catch(() => '');

  return <Home latestSemester={latestSemester} />;
}
