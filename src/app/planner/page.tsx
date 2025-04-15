import type { Metadata } from 'next';
import React from 'react';

import TopMenu from '@/components/navigation/TopMenu/TopMenu';

import Planner from './Planner';
import SyncServerDataToContext from './SyncServerDataToContext';

export const metadata: Metadata = {
  title: 'My Planner',
  description:
    "Choose the perfect classes for you: Nebula Labs's schedule planner to help you build an informed schedule with UT Dallas grade and Rate My Professors data.",
};

/**
 * Returns the My Planner page
 */
export default function Page() {
  return (
    <>
      <TopMenu isPlanner={true} />
      <main className="p-4">
        <Planner />
      </main>
      <SyncServerDataToContext />
    </>
  );
}
