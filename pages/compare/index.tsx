import {
  Card,
  FormControl,
  FormHelperText,
  Grid,
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

import { BarGraph } from '../../components/graph/BarGraph/BarGraph';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import SearchQuery, { Professor } from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';

export const Compare: NextPage = () => {
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
  const [averageData, setAverageData] = useState([-1, -1, -1]);
  const [studentTotals, setStudentTotals] = useState([-1, -1, -1]);

  const [included, setIncluded] = useState<boolean[]>([]);

  const [professorInvolvingSearchTerms, setProfessorInvolvingSearchTerms] =
    useState<Professor[]>([]);

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

  function removeDuplicates(array1: SearchQuery[], array2: SearchQuery[]) {
    return array1.filter(
      (query1: SearchQuery) =>
        array2.findIndex((query2: SearchQuery) =>
          searchQueryEqual(query1, query2),
        ) < 0,
    );
  }

  const searchTermsChange = useCallback((searchTerms: SearchQuery[]) => {
    //define professors
    setProfessorInvolvingSearchTerms(
      searchTerms
        .filter(
          (searchQuery) =>
            typeof searchQuery.profFirst !== 'undefined' &&
            typeof searchQuery.profLast !== 'undefined',
        )
        .map((searchQuery) => ({
          profFirst: searchQuery.profFirst,
          profLast: searchQuery.profLast,
        }))
        .filter(
          (professor, index, self) =>
            self.findIndex(
              (element) =>
                professor.profFirst == element.profFirst &&
                professor.profLast == element.profLast,
            ) == index,
        ) as Professor[],
    );

    //Grade data request
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
              response == null
                ? []
                : response.map((data: individualacademicSessionResponse) => {
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
              data:
                response == null
                  ? []
                  : response.map((data: individualacademicSessionResponse) => {
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
                    }),
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
    //Filter out to matching academic session range
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

    const newGradesData: gradesType[] = [];
    const newStudentTotals = [-1, -1, -1];
    const newAverageData: number[] = [];
    for (let i = 0; i < partialGradesData.length; i++) {
      const total: number = partialGradesData[i].data.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      newStudentTotals[i] = total;
      const normalized: number[] = partialGradesData[i].data.map(
        (value) => (value / total) * 100,
      );
      newGradesData[i] = {
        name: partialGradesData[i].name,
        data: normalized,
      };

      const GPALookup = [
        4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
      ];

      newAverageData.push(
        GPALookup.reduce(
          (accumulator, currentValue, index) =>
            accumulator + currentValue * partialGradesData[i].data[index],
          0,
        ) /
          (total -
            partialGradesData[i].data[partialGradesData[i].data.length - 1]),
      );
    }
    setGradesData(newGradesData);
    setStudentTotals(newStudentTotals);
    setAverageData(newAverageData);
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
          <Card className="h-96 p-4 m-4">
            <BarGraph
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
          <div className="flex justify-center gap-2">
            <FormControl
              error={startingSession > endingSession}
              variant="standard"
            >
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
            </FormControl>
            <FormControl
              error={startingSession > endingSession}
              variant="standard"
            >
              <InputLabel id="endingSessionLabel">To</InputLabel>
              <Select
                labelId="endingSessionLabel"
                defaultValue={9999}
                onChange={(e) => setEndingSession(e.target.value as number)}
              >
                {possibleAcademicSessions.map(
                  (session: academicSessionType) => (
                    <MenuItem key={session.name} value={session.place}>
                      {session.name}
                    </MenuItem>
                  ),
                )}
                <MenuItem key="Last available" value="9999">
                  Last available
                </MenuItem>
              </Select>
            </FormControl>
          </div>
          {startingSession > endingSession ? (
            <FormHelperText className="text-center" error={true}>
              Starting academic session must be before ending academic session
            </FormHelperText>
          ) : null}
        </div>
      </>
    );
  }

  //final page(may remove later)
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
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Grid
              container
              component="main"
              wrap="wrap-reverse"
              className="grow"
              spacing={2}
            >
              <Grid item xs={false} sm={12} md={12} className="w-full">
                {gradesPage}
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </>
  );
};

export default Compare;
