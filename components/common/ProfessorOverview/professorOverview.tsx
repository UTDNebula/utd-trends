import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import fetchWithCache, {
  cacheIndexNebula,
  expireTime,
} from '../../../modules/fetchWithCache';
import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';
import SingleGradesInfo from '../SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '../SingleProfInfo/singleProfInfo';

const fallbackSrc = 'https://profiles.utdallas.edu/img/default.png';

interface ProfessorInterface {
  _id: string;
  email: string;
  first_name: string;
  image_uri: string;
  last_name: string;
  office: {
    building: string;
    room: string;
    map_uri: string;
  };
  //office_hours: any[];
  phone_number: string;
  profile_uri: string;
  sections: string[];
  titles: string[];
}

type ProfessorOverviewProps = {
  professor: SearchQuery;
  grades: GradesType;
  rmp: RateMyProfessorData;
  gradesLoading: 'loading' | 'done' | 'error';
  rmpLoading: 'loading' | 'done' | 'error';
};

const ProfessorOverview = ({
  professor,
  grades,
  rmp,
  gradesLoading,
  rmpLoading,
}: ProfessorOverviewProps) => {
  const [profData, setProfData] = useState<ProfessorInterface | undefined>();
  const [profDataLoading, setProfDataLoading] = useState<
    'loading' | 'done' | 'error'
  >('loading');

  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    fetchWithCache(
      '/api/professor?profFirst=' +
        encodeURIComponent(String(professor.profFirst)) +
        '&profLast=' +
        encodeURIComponent(String(professor.profLast)),
      cacheIndexNebula,
      expireTime,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => {
        if (response.message !== 'success') {
          throw new Error(response.message);
        }
        setProfData(response.data as ProfessorInterface);
        setSrc(response.data.image_uri);
        setProfDataLoading(
          typeof response.data !== 'undefined' ? 'done' : 'error',
        );
      })
      .catch((error) => {
        setProfDataLoading('error');
        console.error('Professor data', error);
      });
  }, [professor]);

  return (
    <div className="flex flex-col gap-2">
      {profDataLoading === 'loading' ? (
        <Skeleton variant="circular" className="w-32 h-32 self-center" />
      ) : (
        <Image
          src={src}
          alt="Headshot"
          height={280}
          width={280}
          className="w-32 h-32 rounded-full self-center"
          onLoadingComplete={(result) => {
            if (result.naturalWidth === 0) {
              // Broken image
              setSrc(fallbackSrc);
            }
          }}
          onError={() => {
            setSrc(fallbackSrc);
          }}
        />
      )}
      <div className="flex flex-col items-center">
        <p className="text-2xl font-bold self-center">
          {searchQueryLabel(professor)}
        </p>
        {profDataLoading === 'loading' && (
          <>
            <Skeleton className="w-[25ch]" />
            <Skeleton className="w-[20ch]" />
            <Skeleton className="w-[10ch]" />
          </>
        )}
        {profDataLoading === 'done' && typeof profData !== 'undefined' && (
          <>
            <Link
              href={'mailto:' + profData.email}
              target="_blank"
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              {profData.email}
            </Link>
            <p>
              Office:{' '}
              <Link
                href={profData.office.map_uri}
                target="_blank"
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              >
                <b>{profData.office.building + ' ' + profData.office.room}</b>
              </Link>
            </p>
            <Link
              href={profData.profile_uri}
              target="_blank"
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              Faculty Profile
            </Link>
          </>
        )}
      </div>
      <SingleGradesInfo
        course={professor}
        grades={grades}
        gradesLoading={gradesLoading}
      />
      <SingleProfInfo rmp={rmp} rmpLoading={rmpLoading} />
    </div>
  );
};

export default ProfessorOverview;
