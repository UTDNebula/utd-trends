import React from 'react';

import Split from '@/components/common/Split/Split';
import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import Filters from '@/components/search/Filters/Filters';

import { LoadingRight } from './Right';
import { LoadingServerLeft } from './ServerLeft';

/**
 * Returns the loading results page
 */
export default async function Page() {
  return (
    <>
      <TopMenu isPlanner={false} />
      <main className="p-4">
        <Filters />
        <Split
          left={<LoadingServerLeft />}
          right={
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto mt-4">
              <LoadingRight />
            </div>
          }
          minLeft={40}
          minRight={30}
          defaultLeft={50}
        />
      </main>
    </>
  );
}
