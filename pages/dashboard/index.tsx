import { Card, LinearProgress } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Carousel from '../../components/common/Carousel/carousel';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';
import ProfessorCard from '../../components/common/ProfessorCard/ProfessorCard';

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

type RMPData = {
  averageRating: number;
  averageDifficulty: number;
  department: string;
  firstName: string;
  lastName: string;
  legacyId: string;
  numRatings: number;
  wouldTakeAgainPercentage: number;
};

// @ts-ignore
export const Dashboard: NextPage = () => {
  type datType = {
    name: string;
    data: number[];
  };
  const [dat, setDat] = useState<datType[]>([]);
  const [GPAdat, setGPADat] = useState<datType[]>([]);
  const [averageDat, setAverageDat] = useState<datType[]>([]);
  const [stdevDat, setStdevDat] = useState<datType[]>([]);
  const [profData, setProfData] = useState<RMPData[]>([
    {
      averageRating: 5,
      averageDifficulty: 3,
      department: 'Computer Science',
      firstName: 'Timothy',
      lastName: 'Farage',
      legacyId: '',
      numRatings: 100,
      wouldTakeAgainPercentage: 88,
    },
  ]);

  const [professorInvolvingSearchTerms, setProfessorInvolvingSearchTerms] =
    useState<SearchQuery[]>([]);

  function round(val: number) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }
  const router = useRouter();
  const [gradesState, setGradesState] = useState('loading');
  const [professorRatingsState, setProfessorRatingsState] = useState('loading');

  const [searchBar, setSearchBar] = useState(
    <ExpandableSearchGrid
      onChange={(result: SearchQuery[]) => console.log(result)}
      startingData={[]}
    />,
  );

  useEffect(() => {
    if (professorInvolvingSearchTerms.length > 0) {
      setProfessorRatingsState('loading');
      let call: string = '/api/ratemyprofessorScraper?professors=';
      professorInvolvingSearchTerms.forEach((searchTerm) => {
        // @ts-ignore
        call += encodeURIComponent(searchTerm.professorName) + ',';
      });
      fetch(call.substring(0, call.length - 2), {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setProfData(data);
          setProfessorRatingsState('success');
        })
        .catch((error) => {
          setProfessorRatingsState('error');
          console.log(error);
        });
    } else {
      setProfessorRatingsState('success');
      setProfData([]);
    }
  }, [professorInvolvingSearchTerms]);

  const searchTermsChange = useCallback((searchTerms: SearchQuery[]) => {
    if (searchTerms.length > 0) {
      router.replace(
        {
          pathname: '/dashboard',
          query: { searchTerms: searchTermsURIString(searchTerms) },
        },
        undefined,
        { shallow: true },
      );
    } else {
      router.replace('/dashboard', undefined, { shallow: true });
    }
    setProfessorInvolvingSearchTerms(
      searchTerms.filter(
        (searchQuery) => searchQuery.professorName != undefined,
      ),
    );
    console.log('Index search terms: ', searchTerms);
  }, []);

  useEffect(() => {
    if (router.isReady) {
      console.log('search bar updated');
      setSearchBar(
        <ExpandableSearchGrid
          onChange={searchTermsChange}
          startingData={parseURIEncodedSearchTerms(router.query.searchTerms)}
        />,
      );
    }
  }, [router.isReady]);

  let mainGradesPage;
  let detailedGradesPage;
  let professorRatingsPage;

  if (gradesState === 'loading') {
    mainGradesPage = (
      <>
        <div className="h-full m-4">
          <LinearProgress className="mt-8 pt-2"></LinearProgress>
        </div>
      </>
    );
    detailedGradesPage = (
      <>
        <div className="h-full m-4">
          <LinearProgress className="mt-8 pt-2"></LinearProgress>
        </div>
      </>
    );
  } else if (gradesState === 'error') {
    mainGradesPage = (
      <>
        <div className="h-full m-4">
          <h1 className="text-3xl text-center text-gray-600 font-semibold">
            An error occurred! Please reload the page, and if this problem
            persists, contact Nebula Labs.
          </h1>
        </div>
      </>
    );
    detailedGradesPage = (
      <>
        <div className="h-full m-4">
          <h1 className="text-3xl text-center text-gray-600 font-semibold">
            An error occurred! Please reload the page, and if this problem
            persists, contact Nebula Labs.
          </h1>
        </div>
      </>
    );
  } else {
    mainGradesPage = (
      <>
        <div className="h-full m-4">
          <Card className="h-96 p-4 m-4">
            <GraphChoice
              form="Bar"
              title="Grades"
              xaxisLabels={[
                'A+',
                'A',
                'A-',
                'B+',
                'B',
                'B-',
                'C+',
                'C',
                'C-',
                'D+',
                'D',
                'D-',
                'F',
                'W',
              ]}
              series={dat}
            />
          </Card>
        </div>
      </>
    );
    detailedGradesPage = (
      <>
        <div className="h-full m-4">
          <Card className="h-96 p-4 m-4">
            <GraphChoice
              form="BoxWhisker"
              title="GPA Box and Whisker"
              xaxisLabels={[
                'A+',
                'A',
                'A-',
                'B+',
                'B',
                'B-',
                'C+',
                'C',
                'C-',
                'D+',
                'D',
                'D-',
                'F',
                'W',
              ]}
              series={GPAdat}
            />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Card className="h-96 p-4 m-4">
              <GraphChoice
                form="Bar"
                title="GPA Averages"
                xaxisLabels={['Average']}
                series={averageDat}
              />
            </Card>
            <Card className="h-96 p-4 m-4">
              <GraphChoice
                form="Bar"
                title="GPA Standard Deviations"
                xaxisLabels={['Standard Deviation']}
                series={stdevDat}
              />
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (professorRatingsState === 'loading') {
    professorRatingsPage = (
      <>
        <div className="h-full m-4">
          <LinearProgress className="mt-8 pt-2"></LinearProgress>
        </div>
      </>
    );
  } else if (professorRatingsState === 'error') {
    professorRatingsPage = (
      <>
        <div className="h-full m-4">
          <h1 className="text-3xl text-center text-gray-600 font-semibold">
            An error occurred! Please reload the page, and if this problem
            persists, contact Nebula Labs.
          </h1>
        </div>
      </>
    );
  } else {
    professorRatingsPage = (
      <>
        <div className="h-full m-4">
          {profData.length > 0 ? (
            profData.map((data: RMPData, index: number) => (
              <Card className="h-fit m-4" key={index}>
                <ProfessorCard
                  position="relative"
                  element="Card"
                  professorRating={data.averageRating}
                  averageDifficulty={data.averageDifficulty}
                  takingAgain={data.wouldTakeAgainPercentage}
                  numRatings={data.numRatings}
                  name={data.firstName + ' ' + data.lastName}
                  department={data.department}
                  key={index}
                />
              </Card>
            ))
          ) : (
            <h1 className="text-3xl text-center text-gray-600 font-semibold">
              No professors selected! Search for a professor or one of their
              courses/sections in the search bar to see data about that
              professor.
            </h1>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        {searchBar}
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Carousel>
              {mainGradesPage}
              {detailedGradesPage}
              {professorRatingsPage}
            </Carousel>
          </div>
        </div>
      </div>
    </>
  );
};

function searchTermsURIString(querys: SearchQuery[]): string {
  return querys.map((query) => searchTermURIString(query)).join(',');
}

function searchTermURIString(query: SearchQuery): string {
  let result = '';
  if (query.prefix !== undefined) {
    result += query.prefix;
  }
  if (query.number !== undefined) {
    result += ' ' + query.number;
  }
  if (query.sectionNumber !== undefined) {
    result += '.' + query.sectionNumber;
  }
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  return result.trim();
}

function parseURIEncodedSearchTerms(
  encodedSearchTerms: string | string[] | undefined,
): SearchQuery[] {
  if (encodedSearchTerms === undefined) {
    return [];
  } else if (typeof encodedSearchTerms === 'string') {
    return encodedSearchTerms
      .split(',')
      .map((term) => parseURIEncodedSearchTerm(term));
  } else {
    return encodedSearchTerms.map((term) => parseURIEncodedSearchTerm(term));
  }
}

function parseURIEncodedSearchTerm(encodedSearchTerm: string): SearchQuery {
  let encodedSearchTermParts = encodedSearchTerm.split(' ');
  // Does it start with prefix
  if (/^([A-Z]{2,4})$/.test(encodedSearchTermParts[0])) {
    // If it is just the prefix, return that
    if (encodedSearchTermParts.length == 1) {
      return { prefix: encodedSearchTermParts[0] };
    }
    // Is the second part a course number only
    if (/^([0-9A-Z]{4})$/.test(encodedSearchTermParts[1])) {
      if (encodedSearchTermParts.length == 2) {
        return {
          prefix: encodedSearchTermParts[0],
          number: encodedSearchTermParts[1],
        };
      } else {
        return {
          prefix: encodedSearchTermParts[0],
          number: encodedSearchTermParts[1],
          professorName:
            encodedSearchTermParts[2] + ' ' + encodedSearchTermParts[3],
        };
      }
    }
    // Is the second part a course number and section
    else if (/^([0-9A-Z]{4}\.[0-9A-Z]{3})$/.test(encodedSearchTermParts[1])) {
      let courseNumberAndSection: string[] =
        encodedSearchTermParts[1].split('.');
      if (encodedSearchTermParts.length == 2) {
        return {
          prefix: encodedSearchTermParts[0],
          number: courseNumberAndSection[0],
          sectionNumber: courseNumberAndSection[1],
        };
      } else {
        return {
          prefix: encodedSearchTermParts[0],
          number: courseNumberAndSection[0],
          sectionNumber: courseNumberAndSection[1],
          professorName:
            encodedSearchTermParts[2] + ' ' + encodedSearchTermParts[3],
        };
      }
    }
    // the second part is the start of the name
    else {
      return {
        prefix: encodedSearchTermParts[0],
        professorName:
          encodedSearchTermParts[1] + ' ' + encodedSearchTermParts[2],
      };
    }
  } else {
    return { professorName: encodedSearchTerm.trim() };
  }
}

export default Dashboard;
