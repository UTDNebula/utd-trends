import {
  Card,
  LinearProgress,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
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
  type fullDatType = {
    name: string;
    data: {
      session: number;
      grade_distribution: number[];
    }[];
  };
  type datType = {
    name: string;
    data: number[];
  };
  const [fullGradesData, setFullGradesData] = useState<fullDatType[]>([]);
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

  type academicSessionType = {
    name: string;
    place: number;
  };
  const [possibleAcademicSessions, setPossibleAcademicSessions] = useState<
    academicSessionType[]
  >([
    { name: '2019 Fall', place: 2019.3 },
    { name: '2020 Spring', place: 2020.1 },
    { name: '2020 Summer', place: 2020.2 },
    { name: '2020 Fall', place: 2020.3 },
    { name: '2021 Spring', place: 2021.1 },
  ]);
  const [startingSession, setStartingSession] = useState<number>(0);
  const [endingSession, setEndingSession] = useState<number>(9999);

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
    Promise.all(
      searchTerms.map((searchTerm: SearchQuery) => {
        const url =
          '/api/grades?' +
          Object.keys(searchTerm)
            .map(
              (key) =>
                key +
                '=' +
                encodeURIComponent(
                  String(searchTerm[key as keyof SearchQuery]),
                ),
            )
            .join('&') +
          '&representation=semester';
        if (process.env.NODE_ENV !== 'development') {
          const getItem = localStorage.getItem(url);
          if (getItem !== null) {
            return JSON.parse(getItem);
          }
        }
        return fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message !== 'success') {
              throw new Error(data.message);
            }
            localStorage.setItem(url, JSON.stringify(data));
            return data;
          });
      }),
    )
      .then((responses) => {
        //console.log('data from grid: ', responses);

        //Generate possible academic sessions
        type individualacademicSessionResponse = {
          _id: string;
          grade_distribution: number[];
        };
        setPossibleAcademicSessions(
          responses
            .map((response) =>
              response.data.map((data: individualacademicSessionResponse) => {
                let name: string = data._id;
                name = '20' + name;
                name = name
                  .replace('F', ' Fall')
                  .replace('S', ' Spring')
                  .replace('U', ' Summer');
                let place: number = parseInt(name.split(' ')[0]);
                if (name.split(' ')[1] == 'Spring') {
                  place += 0.1;
                } else if (name.split(' ')[1] == 'Summer') {
                  place += 0.2;
                } else {
                  place += 0.3;
                }
                return { name: name, place: place };
              }),
            )
            .flat()
            .filter(
              (value, index, self) =>
                index ===
                self.findIndex(
                  (t) => t.place === value.place && t.name === value.name,
                ),
            )
            .sort((a, b) => a.place - b.place),
        );

        //Replace _id with number
        setFullGradesData(
          responses.map((response, index) => {
            return {
              name: searchTermURIString(searchTerms[index]),
              data: response.data.map(
                (data: individualacademicSessionResponse) => {
                  let session: number = parseInt('20' + data._id);
                  if (data._id.includes('S')) {
                    session += 0.1;
                  } else if (data._id.includes('U')) {
                    session += 0.2;
                  } else {
                    session += 0.3;
                  }
                  return {
                    session: session,
                    grade_distribution: data.grade_distribution,
                  };
                },
              ),
            };
          }),
        );
        setGradesState('success');
      })
      .catch((error) => {
        setGradesState('error');
        console.error('Nebula API', error);
      });
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

  useEffect(() => {
    const partialGradesData: datType[] = fullGradesData.map((datPoint) => {
      const combined = datPoint.data.reduce(
        (accumulator, academicSession) => {
          if (
            academicSession.session >= startingSession &&
            academicSession.session <= endingSession
          ) {
            return accumulator.map(
              (value, index) =>
                value + academicSession.grade_distribution[index],
            );
          }
          return accumulator;
        },
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      );
      return {
        name: datPoint.name,
        data: combined,
      };
    });

    setDat(
      partialGradesData.map((datPoint) => {
        const total: number = datPoint.data.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        );
        const normalized: number[] = datPoint.data.map((value) =>
          round(value / total),
        );
        return {
          name: datPoint.name,
          data: normalized,
        };
      }),
    );

    let newGPADat: datType[] = [];
    let newAverageDat: datType[] = [];
    let newStdevDat: datType[] = [];
    for (let i = 0; i < partialGradesData.length; i++) {
      const GPALookup = [
        4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
      ];
      let GPAGrades: number[] = [];
      for (let j = 0; j < partialGradesData[i].data.length - 1; j++) {
        GPAGrades = GPAGrades.concat(
          Array(partialGradesData[i].data[j]).fill(GPALookup[j]),
        );
      }
      newGPADat.push({ name: partialGradesData[i].name, data: GPAGrades });
      const mean =
        GPAGrades.reduce((partialSum, a) => partialSum + a, 0) /
        GPAGrades.length;
      newAverageDat.push({
        name: partialGradesData[i].name,
        data: [round(mean)],
      });
      const stdev = Math.sqrt(
        GPAGrades.reduce((partialSum, a) => partialSum + (a - mean) ** 2, 0) /
          GPAGrades.length,
      );
      newStdevDat.push({
        name: partialGradesData[i].name,
        data: [round(stdev)],
      });
    }
    setGPADat(newGPADat);
    setAverageDat(newAverageDat);
    setStdevDat(newStdevDat);
  }, [fullGradesData, startingSession, endingSession]);

  let gradesPage;
  let professorRatingsPage;

  if (gradesState === 'loading') {
    gradesPage = (
      <>
        <div className="h-full m-4">
          <LinearProgress className="mt-8 pt-2"></LinearProgress>
        </div>
      </>
    );
  } else if (gradesState === 'error') {
    gradesPage = (
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
    gradesPage = (
      <>
        <div className="h-full m-4">
          <div className="flex justify-center gap-2">
            <div>
              <InputLabel id="startingSessionLabel">From</InputLabel>
              <Select
                labelId="startingSessionLabel"
                defaultValue={0}
                onChange={(e) => setStartingSession(e.target.value as number)}
              >
                <MenuItem key="First available" value="0">
                  First available
                </MenuItem>
                {possibleAcademicSessions.map(
                  (session: academicSessionType) => (
                    <MenuItem key={session.name} value={session.place}>
                      {session.name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </div>
            <div>
              <InputLabel id="endingSessionLabel">To</InputLabel>
              <Select
                labelId="endingSessionLabel"
                defaultValue={9999}
                onChange={(e) => setEndingSession(e.target.value as number)}
              >
                <MenuItem key="Last available" value="9999">
                  Last available
                </MenuItem>
                {possibleAcademicSessions.map(
                  (session: academicSessionType) => (
                    <MenuItem key={session.name} value={session.place}>
                      {session.name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </div>
          </div>
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
              {gradesPage}
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
