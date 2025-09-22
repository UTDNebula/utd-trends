'use client';

import React from 'react';

import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';



export default function PlannerDownloadUI({ downloadRef } : { downloadRef : React.RefObject<HTMLDivElement | null> }) {
  
    return (    
        <div className='bg-black p-4 absolute left-[-9999px]' ref={downloadRef}>
            <div className='flex flex-row mb-4 justify-start'>
                <NebulaLogo className="h-6 w-auto fill-haiti dark:fill-white mr-2 ml-2" />
                UTD TRENDS
                <h1 className='ml-auto mr-2'>FALL 2025</h1>
            </div>
            <PlannerSchedule />
        </div>
    );
  
}

