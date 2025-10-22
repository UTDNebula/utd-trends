import type { Metadata } from 'next';
import React from 'react';

import PlannerPage from './PlannerPage'

export const metadata: Metadata = {
  title: 'My Planner',
  description:
    "Choose the perfect classes for you: Nebula Labs's schedule planner to help you build an informed schedule with UT Dallas grade and Rate My Professors data.",
  openGraph: {
    url: 'https://trends.utdnebula.com/planner',
  },
};

/**
 * Returns the My Planner page
 */
export default function Page() {
  return (
    <>
      <PlannerPage />
    </>
  );
}
