'use client';

import Header from '@/components/navigation/Header/Header';
import React, { useRef } from 'react';
import Planner from './Planner';
import PlannerDownloadUI from './PlannerDownloadUI';

export default function PlannerPage() {
  const downloadRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Header isPlanner={true} downloadRef={downloadRef} />
      <main className="p-4">
        <Planner />
      </main>
      <PlannerDownloadUI downloadRef={downloadRef} />
    </>
  );
}
