'use client';

import SingleGradesInfo, {
  LoadingSingleGradesInfo,
} from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo, {
  LoadingSingleProfInfo,
} from '@/components/common/SingleProfInfo/SingleProfInfo';
import { calculateGrades, type GradesData } from '@/modules/fetchGrades';
import type { Professor } from '@/modules/fetchProfessor';
import type { RMP } from '@/modules/fetchRmp';
import { searchQueryLabel, type SearchQuery } from '@/types/SearchQuery';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

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
  profData: Professor;
  grades: GradesData;
  rmp?: RMP;
}

export default function ProfessorOverview({
  professor,
  profData,
  grades,
  rmp,
}: Props) {
  const [src, setSrc] = useState(
    profData.image_uri !== '' ? profData.image_uri : fallbackSrc,
  );
  useEffect(() => {
    setSrc(profData.image_uri);
  }, [profData]);

  return (
    <div className="flex flex-col gap-2">
      {
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
      }
      <div className="flex flex-col items-center">
        {typeof profData !== 'undefined' && (
          <>
            <p className="text-2xl font-bold self-center">
              {searchQueryLabel(professor)}
            </p>
            {profData.email !== '' && (
              <Link
                href={'mailto:' + profData.email}
                target="_blank"
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              >
                {profData.email}
              </Link>
            )}

            {profData.office.map_uri !== '' &&
              profData.office.building !== '' &&
              profData.office.room !== '' && (
                <p>
                  Office:{' '}
                  <Link
                    href={profData.office.map_uri}
                    target="_blank"
                    className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                  >
                    <b>
                      {profData.office.building + ' ' + profData.office.room}
                    </b>
                  </Link>
                </p>
              )}
            {profData.profile_uri !== '' && (
              <Link
                href={profData.profile_uri}
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
        filteredGrades={calculateGrades(grades)}
      />
      {rmp && (
        <SingleProfInfo
          rmp={rmp}
          syllabus={{
            weighting: [
              { label: 'Attendance', value: '5%' },
              { label: 'Class Quiz', value: '20%' },
              { label: 'Projects', value: '20%' },
              { label: 'Midterm', value: '25%' },
              { label: 'Final', value: '30%' },
            ],
            grading: [
              { grade: 'A', range: '90-100' },
              { grade: 'B', range: '80-89.9' },
              { grade: 'C', range: '70-79.9' },
              { grade: 'D', range: '60-69.9' },
              { grade: 'F', range: '0-59.9' },
            ],
            summary:
              'Regular lecture attendance is mandatory. Attendance will be taken randomly at some lectures. Students who fail to follow the class material regularly are inviting scholastic difficulty.',
          }}
        />
      )}
    </div>
  );
}
