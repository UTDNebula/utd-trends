'use client';
import React, { useRef } from 'react';

import TopMenu from '../../components/navigation/TopMenu/TopMenu';
import Planner from './Planner';
import PlannerDownloadUI from './PlannerDownloadUI';

export default function PlannerPage() {
  const downloadRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <TopMenu isPlanner={true} downloadRef={downloadRef} />
      <main className="p-4">
        <Planner />
      </main>
      <PlannerDownloadUI downloadRef={downloadRef} />
    </>
  );
}
