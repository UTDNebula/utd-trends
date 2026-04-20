'use client';

import Header from '@/components/navigation/Header/Header';
import React, { Suspense, useRef } from 'react';
import Planner, { PlannerLoadingSkeleton } from './Planner';
import PlannerDownloadUI from './PlannerDownloadUI';

export default function PlannerPage() {
  const downloadRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Header isPlanner={true} downloadRef={downloadRef} />
      <main className="p-4">
        <Suspense fallback={<PlannerLoadingSkeleton />}>
          <Planner />
        </Suspense>
      </main>
      <PlannerDownloadUI downloadRef={downloadRef} />
    </>
  );
}
