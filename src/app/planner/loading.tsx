import Header from '@/components/navigation/Header/Header';
import React from 'react';
import { PlannerLoadingSkeleton } from './Planner';

export default function Loading() {
  return (
    <>
      <Header isPlanner={true} />
      <main className="p-4">
        <PlannerLoadingSkeleton />
      </main>
    </>
  );
}
