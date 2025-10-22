'use client';

import React from 'react';

import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';



export default function PlannerDownloadUI({ downloadRef } : { downloadRef : React.RefObject<HTMLDivElement | null> }) {
  
    return (    
        <div className='bg-black p-4 absolute left-[-9999px] top-0' ref={downloadRef}>
            <div className='flex flex-row mb-4 justify-start gap-2 pl-2'>
                <NebulaLogo className="h-6 w-auto fill-white" />
                <span className='font-extrabold font-display text-white'>UTD TRENDS</span>
                <h1 className='ml-auto mr-2 text-white'>FALL 2025</h1>
            </div>
            <PlannerSchedule />
        </div>
    );
  
}

