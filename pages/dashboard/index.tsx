import {
  Card,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';

import Carousel from '../../components/common/Carousel/carousel';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';
import ProfessorCard from '../../components/common/ProfessorCard/ProfessorCard';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import SearchQuery from '../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';

export const Dashboard: NextPage = () => {
  /* Helper functions */

  //Increment these to reset cache on next deployment
  const cacheIndexGrades = 0;
  const cacheIndexProfessor = 0;

  function getCache(key: string, cacheIndex: number) {
    if (process.env.NODE_ENV !== 'development') {
      const getItem = localStorage.getItem(key);
      if (getItem !== null) {
        const parsedItem = JSON.parse(getItem);
        if (
          !('cacheIndex' in parsedItem) ||
          cacheIndex !== parsedItem.cacheIndex ||
          !('expiry' in parsedItem) ||
          !('value' in parsedItem) ||
          new Date().getTime() > parsedItem.expiry
        ) {
          localStorage.removeItem(key);
        } else {
          return parsedItem.value;
        }
      }
    }
    return false;
  }

  function setCache(
    key: string,
    cacheIndex: number,
    data: object,
    expireTime: number,
  ) {
    localStorage.setItem(
      key,
      JSON.stringify({
        value: data,
        expiry: new Date().getTime() + expireTime,
        cacheIndex: cacheIndex,
      }),
    );
  }

  const fetchData = useCallback(
    (urls: string[], cacheIndex: number, expireTime: number) => {
      return Promise.all(
        urls.map((url) => {
          const cache = getCache(url, cacheIndexProfessor);
          if (cache) {
            return cache;
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
              setCache(url, cacheIndex, data.data, expireTime);
              return data.data;
            });
        }),
      );
    },
    [],
  );

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkModeElevation = prefersDarkMode ? 3 : 1;

  /* Grades data */

  type fullGradesType = {
    name: string;
    data: {
      session: number;
      grade_distribution: number[];
    }[];
  };

  type gradesType = {
    name: string;
    data: number[];
  };

  const [gradesState, setGradesState] = useState('loading');

  const [fullGradesData, setFullGradesData] = useState<fullGradesType[]>([]);
  const [gradesData, setGradesData] = useState<gradesType[]>([]);
  const [GPAData, setGPAData] = useState<gradesType[]>([]);
  const [averageData, setAverageData] = useState<gradesType[]>([]);
  const [stdevData, setStdevData] = useState<gradesType[]>([]);
  const [studentTotals, setStudentTotals] = useState([-1, -1, -1]);

  const [included, setIncluded] = useState<boolean[]>([]);

  const [professorInvolvingSearchTerms, setProfessorInvolvingSearchTerms] =
    useState<string[]>([]);

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

  const searchTermsChange = useCallback(
    (searchTerms: SearchQuery[]) => {
      setProfessorInvolvingSearchTerms(
        searchTerms
          .filter(
            (searchQuery) => typeof searchQuery.professorName !== 'undefined',
          )
          .map((searchQuery) => searchQuery.professorName)
          .filter(
            (professorName, index, self) =>
              self.indexOf(professorName) == index,
          ) as string[],
      );
      fetchData(
        searchTerms.map(
          (searchTerm: SearchQuery) =>
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
              .join('&'),
        ),
        cacheIndexGrades,
        7889400000, //3 months
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
                response.map((data: individualacademicSessionResponse) => {
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
                name: searchQueryLabel(searchTerms[index]),
                data: response.map(
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
    },
    [fetchData],
  );

  useEffect(() => {
    const partialGradesData: gradesType[] = fullGradesData.map((datPoint) => {
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

    const newDat: gradesType[] = [];
    const newStudentTotals = [-1, -1, -1];
    for (let i = 0; i < partialGradesData.length; i++) {
      const total: number = partialGradesData[i].data.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      newStudentTotals[i] = total;
      const normalized: number[] = partialGradesData[i].data.map(
        (value) => (value / total) * 100,
      );
      newDat[i] = {
        name: partialGradesData[i].name,
        data: normalized,
      };
    }
    setGradesData(newDat);
    setStudentTotals(newStudentTotals);

    const newGPADat: gradesType[] = [];
    const newAverageDat: gradesType[] = [];
    const newStdevDat: gradesType[] = [];
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
        data: [mean],
      });
      const stdev = Math.sqrt(
        GPAGrades.reduce((partialSum, a) => partialSum + (a - mean) ** 2, 0) /
          GPAGrades.length,
      );
      newStdevDat.push({
        name: partialGradesData[i].name,
        data: [stdev],
      });
    }
    setGPAData(newGPADat);
    setAverageData(newAverageDat);
    setStdevData(newStdevDat);
  }, [fullGradesData, startingSession, endingSession]);

  let gradesPage;

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
          <Card className="h-96 p-4 m-4" elevation={darkModeElevation}>
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
              yaxisFormatter={(value) => Number(value).toFixed(0) + '%'}
              series={gradesData.filter((dat, index) => included[index])}
              includedColors={included}
            />
          </Card>
          <Card className="h-96 p-4 m-4" elevation={darkModeElevation}>
            <GraphChoice
              form="BoxWhisker"
              title="GPA Box and Whisker"
              yaxisFormatter={(value) => Number(value).toFixed(2)}
              series={GPAData.filter((dat, index) => included[index])}
            />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Card className="h-96 p-4 m-4" elevation={darkModeElevation}>
              <GraphChoice
                form="Vertical"
                title="GPA Averages"
                xaxisLabels={['Average']}
                yaxisFormatter={(value) => Number(value).toFixed(2)}
                series={averageData.filter((dat, index) => included[index])}
              />
            </Card>
            <Card className="h-96 p-4 m-4" elevation={darkModeElevation}>
              <GraphChoice
                form="Vertical"
                title="GPA Standard Deviations"
                xaxisLabels={['Standard Deviation']}
                yaxisFormatter={(value) => Number(value).toFixed(2)}
                series={stdevData.filter((dat, index) => included[index])}
              />
            </Card>
          </div>
        </div>
      </>
    );
  }

  /* Professor Data */

  type profType = {
    found: boolean;
    data: {
      averageRating: number;
      averageDifficulty: number;
      department: string;
      firstName: string;
      lastName: string;
      legacyId: string;
      numRatings: number;
      wouldTakeAgainPercentage: number;
    };
  };

  const [professorRatingsState, setProfessorRatingsState] = useState('loading');

  const [profData, setProfData] = useState<profType[]>([]);

  useEffect(() => {
    if (professorInvolvingSearchTerms.length > 0) {
      setProfessorRatingsState('loading');
      fetchData(
        professorInvolvingSearchTerms.map(
          (professorName) =>
            '/api/ratemyprofessorScraper?professor=' +
            encodeURIComponent(professorName),
        ),
        cacheIndexProfessor,
        2629800000, //1 month
      )
        .then((responses) => {
          setProfData(responses);
          setProfessorRatingsState('success');
        })
        .catch((error) => {
          setProfessorRatingsState('error');
          console.error('Professor Scraper', error);
        });
    } else {
      setProfessorRatingsState('success');
      setProfData([]);
    }
  }, [fetchData, professorInvolvingSearchTerms]);

  let professorRatingsPage;

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
            profData.map((data: profType, index: number) => {
              if (!included[index]) {
                return null;
              }
              if (!data.found) {
                let text = 'Data not found';
                if (
                  typeof professorInvolvingSearchTerms[index] !== 'undefined'
                ) {
                  text += ' for ' + professorInvolvingSearchTerms[index];
                }
                return (
                  <Card
                    className="h-fit m-4"
                    key={index}
                    elevation={darkModeElevation}
                  >
                    <Typography className="text-2xl text-center m-4">
                      {text}
                    </Typography>
                  </Card>
                );
              }
              return (
                <Card
                  className="h-fit m-4"
                  key={index}
                  elevation={darkModeElevation}
                >
                  <ProfessorCard
                    professorRating={data.data.averageRating}
                    averageDifficulty={data.data.averageDifficulty}
                    takingAgain={data.data.wouldTakeAgainPercentage}
                    numRatings={data.data.numRatings}
                    name={data.data.firstName + ' ' + data.data.lastName}
                    department={data.data.department}
                    key={index}
                  />
                </Card>
              );
            })
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

  /* Final page */

  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/dashboard"
          key="canonical"
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/dashboard"
        />
      </Head>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        <ExpandableSearchGrid
          onChange={searchTermsChange}
          setIncluded={setIncluded}
          studentTotals={studentTotals}
        />
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

export default Dashboard;
