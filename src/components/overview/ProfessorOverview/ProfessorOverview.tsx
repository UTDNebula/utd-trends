'use client';

import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import SingleGradesInfo, {
  LoadingSingleGradesInfo,
} from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo, {
  LoadingSingleProfInfo,
} from '@/components/common/SingleProfInfo/SingleProfInfo';
import type { Grades } from '@/modules/fetchGrades';
import type { Professor } from '@/modules/fetchProfessor';
import type { RMP } from '@/modules/fetchRmp';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

export function LoadingProfessorOverview() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton variant="circular" className="w-32 h-32 self-center" />
      <div className="flex flex-col items-center">
        <Skeleton className="text-2xl font-bold w-[15ch]" />
        <Skeleton className="w-[25ch]" />
        <Skeleton className="w-[20ch]" />
        <Skeleton className="w-[10ch]" />
      </div>
      <LoadingSingleGradesInfo />
      <LoadingSingleProfInfo />
    </div>
  );
}

const fallbackSrc = 'https://profiles.utdallas.edu/img/default.png';

interface Props {
  professor: SearchQuery;
  profData: GenericFetchedData<Professor>;
  grades: GenericFetchedData<Grades>;
  rmp: GenericFetchedData<RMP>;
}

export default function ProfessorOverview({
  professor,
  profData,
  grades,
  rmp,
}: Props) {
  const [src, setSrc] = useState(
    profData.message === 'success' && profData.data.image_uri !== ''
      ? profData.data.image_uri
      : fallbackSrc,
  );

  useEffect(() => {
    setSrc(
      profData.message === 'success' && profData.data.image_uri !== ''
        ? profData.data.image_uri
        : fallbackSrc,
    );
  }, [profData]); // sets the image instantly without reloading the page

  return (
    <div className="flex flex-col gap-2">
      {profData.message === 'success' && (
        <Image
          src={src}
          alt="Headshot"
          height={280}
          width={280}
          className="w-32 h-32 rounded-full self-center"
          onLoad={(result) => {
            if (result.currentTarget.naturalWidth === 0) {
              // Broken image
              setSrc(fallbackSrc);
            }
          }}
          onError={() => {
            setSrc(fallbackSrc);
          }}
          //This image is always 450x450 from UTD Profiles and we don't want to exceed our Vercel Imange Optimization Transformation limit by optimizing it just to 280x280
          unoptimized
        />
      )}
      <div className="flex flex-col items-center">
        {profData.message === 'success' &&
          typeof profData.data !== 'undefined' && (
            <>
              <p className="text-2xl font-bold self-center">
                {searchQueryLabel(professor)}
              </p>
              {profData.data.email !== '' && (
                <Link
                  href={'mailto:' + profData.data.email}
                  target="_blank"
                  className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                >
                  {profData.data.email}
                </Link>
              )}

              {profData.data.office.map_uri !== '' &&
                profData.data.office.building !== '' &&
                profData.data.office.room !== '' && (
                  <p>
                    Office:{' '}
                    <Link
                      href={profData.data.office.map_uri}
                      target="_blank"
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                    >
                      <b>
                        {profData.data.office.building +
                          ' ' +
                          profData.data.office.room}
                      </b>
                    </Link>
                  </p>
                )}
              {profData.data.profile_uri !== '' && (
                <Link
                  href={profData.data.profile_uri}
                  target="_blank"
                  className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                >
                  Faculty Profile
                </Link>
              )}
            </>
          )}
      </div>
      <SingleGradesInfo
        title="# of Students (Overall)"
        course={professor}
        grades={grades}
        gradesToUse="unfiltered"
      />
      <SingleProfInfo rmp={rmp} />
    </div>
  );
}
