'use client';

import { UTDTrendsLogoStandalone } from '@/components/icons/UTDTrendsLogo/UTDTrendsLogo';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';
import React from 'react';

export default function PlannerDownloadUI({
  downloadRef,
}: {
  downloadRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="bg-black p-4 absolute left-[-9999px] top-0"
      ref={downloadRef}
    >
      <div className="flex flex-row mb-4 justify-start gap-2 pl-2 items-center">
        <div className="font-display flex gap-2 items-center select-none text-white">
          <div className="flex flex-row items-center max-sm:hidden">
            <UTDTrendsLogoStandalone className="h-10 w-auto fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="whitespace-nowrap text-lg md:text-xl font-bold leading-5">
              UTD TRENDS
            </span>
            <span className="whitespace-nowrap text-xs md:text-sm font-medium">
              by Nebula Labs
            </span>
          </div>
        </div>
        <h1 className="ml-auto mr-2 text-white">FALL 2025</h1>
      </div>
      <PlannerSchedule />
    </div>
  );
}
