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
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import Carousel from '../../components/common/Carousel/carousel';
import Filters from '../../components/common/Filters/filters';
import ProfessorCard from '../../components/common/ProfessorCard/ProfessorCard';
import { RelatedClasses } from '../../components/common/RelatedClasses/relatedClasses';
import { SearchResultsTable } from '../../components/common/SearchResultsTable/searchResultsTable';
import { BarGraph } from '../../components/graph/BarGraph/BarGraph';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import decodeSearchQueryLabel from '../../modules/decodeSearchQueryLabel/decodeSearchQueryLabel';
import fetchWithCache, {
  cacheIndexGrades,
  expireTime,
} from '../../modules/fetchWithCache';
import SearchQuery, { Professor } from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';

export const Dashboard: NextPage = () => {
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
  const [relatedState, setRelatedState] = useState('loading');

  const [fullGradesData, setFullGradesData] = useState<fullGradesType[]>([]);
  const [gradesData, setGradesData] = useState<gradesType[]>([]);
  const [averageData, setAverageData] = useState([-1, -1, -1]);
  const [studentTotals, setStudentTotals] = useState([-1, -1, -1]);
  const [relatedQueries, setRelatedQueries] = useState<SearchQuery[]>([]);
  const [relatedDisabled, setRelatedDisabled] = useState<boolean>(false);

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

  function removeDuplicates(array1: SearchQuery[], array2: SearchQuery[]) {
    return array1.filter(
      (query1: SearchQuery) =>
        array2.findIndex((query2: SearchQuery) =>
          searchQueryEqual(query1, query2),
        ) < 0,
    );
  }

  function gradesDataFetch(courses: SearchQuery[]) {
    Promise.all(
      courses.map((course: SearchQuery) =>
        fetchWithCache(
          '/api/grades?' +
            Object.keys(course)
              .map(
                (key) =>
                  key +
                  '=' +
                  encodeURIComponent(String(course[key as keyof SearchQuery])),
              )
              .join('&'),
          cacheIndexGrades,
          expireTime,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          },
        ),
      ),
    )
      .then((responses) => {
        responses = responses.map((data) => data.data);
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
              name: searchQueryLabel(courses[index]),
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
        console.log('fullGradesData:');
        console.log(fullGradesData);
      })
      .catch((error) => {
        setGradesState('error');
        console.error('Nebula API', error);
      });
  }

  function professorsDataFetch(courses: SearchQuery[]) {
    //TODO: caching; especially if searching for 1 professor's courses, don't need to call rmp scraper 7 times
    Promise.all(
      courses.map((course: SearchQuery) =>
        fetchWithCache(
          '/api/ratemyprofessorScraper?profFirst=' +
            encodeURIComponent(String(course.profFirst)) +
            '&profLast=' +
            encodeURIComponent(String(course.profLast)),
          cacheIndexGrades,
          expireTime,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          },
        ),
      ),
    )
      .then((responses) => {
        setProfData(responses);
        setProfessorRatingsState('success');
        console.log('profData:');
        console.log(profData);
      })
      .catch((error) => {
        setProfessorRatingsState('error');
        console.error('Professor Scraper', error);
      });
  }

  function autocompleteForSearchResultsFetch(
    searchTerms: SearchQuery[],
    controller: AbortController,
  ): Promise<SearchQuery[]>[] {
    return searchTerms.map((searchTerm) => {
      return fetchWithCache(
        '/api/autocomplete?input=' + searchQueryLabel(searchTerm),
        cacheIndexGrades,
        expireTime,
        {
          // use the search terms to fetch all the result course-professor combinations
          signal: controller.signal,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      ).then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        return data.data as SearchQuery[];
      });
    });
  }

  function fetchSearchResults(
    searchTerms: SearchQuery[],
    filterTerms: SearchQuery[],
  ) {
    // store the search results' data in fullGradesdata and profData
    const controller = new AbortController();
    Promise.all(autocompleteForSearchResultsFetch(searchTerms, controller))
      .then((allSearchTermResults: SearchQuery[][]) => {
        const results: SearchQuery[] = [];
        allSearchTermResults.map((searchTermResults) =>
          searchTermResults.map((searchTermResult) => {
            if (filterTerms.length > 0) {
              filterTerms.map((filterTerm) => {
                if (
                  filterTerm.profFirst === searchTermResult.profFirst &&
                  filterTerm.profLast === searchTermResult.profLast
                ) {
                  results.push(searchTermResult);
                } else if (
                  filterTerm.prefix === searchTermResult.prefix &&
                  filterTerm.number === searchTermResult.number
                ) {
                  results.push(searchTermResult);
                }
              });
            } else {
              results.push(searchTermResult);
            }
          }),
        );
        return results;
      })
      .then((courses: SearchQuery[]) => {
        gradesDataFetch(courses); // get each course-prof's grade data
        professorsDataFetch(courses); // get each professor's rmp data
      })
      .catch((error) => {
        if (error instanceof DOMException) {
          // ignore aborts
        } else {
          console.log(error);
        }
      });
    controller.abort;
  }

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      let array = router.query.searchTerms ?? [];
      if (!Array.isArray(array)) {
        array = array.split(',');
      }
      const searchTerms = array.map((el) => decodeSearchQueryLabel(el));

      //define professors
      setProfessorInvolvingSearchTerms(
        // for RMP scraping
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

      const courseSearchTerms: SearchQuery[] = [];
      const professorSearchTerms: SearchQuery[] = [];

      // split the search terms into professors and courses
      searchTerms.map((searchTerm) => {
        if (searchTerm.profLast !== undefined) {
          professorSearchTerms.push(searchTerm);
        }
        if (searchTerm.prefix !== undefined) {
          courseSearchTerms.push(searchTerm);
        }
      });

      if (courseSearchTerms.length > 0) {
        fetchSearchResults(courseSearchTerms, professorSearchTerms);
      } else if (professorSearchTerms.length > 0) {
        fetchSearchResults(professorSearchTerms, courseSearchTerms);
      }

      if (searchTerms[0] !== undefined) {
        console.log(searchTerms);
        console.log(
          'Here is where I will print all the professors for a course',
        );
      }

      // Related search query list request
      //   fetchData(
      //     searchTerms.map(
      //       (searchTerm: SearchQuery) =>
      //         '/api/autocomplete?' +
      //         Object.keys(searchTerm)
      //           .map(
      //             (key) =>
      //               key +
      //               '=' +
      //               encodeURIComponent(
      //                 String(searchTerm[key as keyof SearchQuery]),
      //               ),
      //           )
      //           .join('&') +
      //         '&limit=10',
      //     ),
      //     cacheIndexRelated,
      //     7889400000, //3 months
      //   )
      //     .then((responses) => {
      //       let result: SearchQuery[] = [];
      //       if (!responses.length) {
      //         result = [];
      //       } else if (responses.length === 1) {
      //         result = responses[0].slice(0, 10);
      //       } else {
      //         //Remove original searchTerms
      //         for (let i = 0; i < responses.length; i++) {
      //           responses[i] = removeDuplicates(responses[i], searchTerms);
      //         }

      //         //Remove duplicates
      //         responses[0] = removeDuplicates(responses[0], responses[1]);
      //         if (responses.length >= 3) {
      //           responses[0] = removeDuplicates(responses[0], responses[2]);
      //           responses[1] = removeDuplicates(responses[1], responses[2]);
      //         }

      //         //Combine to get 10 total, roughly evenly distributed
      //         responses.reverse();
      //         const responseLengths = Array(responses.length).fill(0);
      //         let offset = 0;
      //         for (let i = 0; i < 10; i++) {
      //           if (
      //             responseLengths[(i + offset) % responses.length] >=
      //             responses[(i + offset) % responses.length].length
      //           ) {
      //             offset++;
      //           }
      //           responseLengths[(i + offset) % responses.length]++;
      //         }
      //         result = responses
      //           .map((response, index) => response.slice(0, responseLengths[index]))
      //           .flat();
      //       }
      //       setRelatedQueries(result);
      //       setRelatedState(result.length ? 'success' : 'none');
      //       setRelatedDisabled(responses.length >= 3 ? true : false);
      //     })
      //     .catch((error) => {
      //       setRelatedState('error');
      //       console.error('Related query', error);
      //     });
    }
  }, [router.isReady, router.query]);

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

  let gradesComponent;

  if (gradesState === 'loading') {
    gradesComponent = (
      <>
        <div className="h-full m-4">
          <LinearProgress className="mt-8 pt-2"></LinearProgress>
        </div>
      </>
    );
  } else if (gradesState === 'error') {
    gradesComponent = (
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
    gradesComponent = (
      <>
        <div className="h-full m-4">
          <Card className="h-96 p-4 m-4">
            <Carousel>
              <p>page 1</p>
              <p>page 2</p>
              <p>page 3</p>
            </Carousel>
          </Card>
        </div>
      </>
    );
  }

  let searchResultsComponent;
  const [relatedQuery, setRelatedQuery] = useState<SearchQuery | undefined>(
    undefined,
  );

  if (relatedState === 'error') {
    searchResultsComponent = null;
  } else if (relatedState === 'none') {
    searchResultsComponent = null;
  } else {
    searchResultsComponent = (
      <div className="h-full m-4">
        <SearchResultsTable
          courseResults={fullGradesData}
          distributionData={gradesData}
          averageData={averageData}
          studentTotals={studentTotals}
          professorData={profData}
        />
      </div>
    );
  }

  useEffect(() => {
    if (professorInvolvingSearchTerms.length > 0) {
      setProfessorRatingsState('loading');
      Promise.all(
        professorInvolvingSearchTerms.map((professor) =>
          fetchWithCache(
            '/api/ratemyprofessorScraper?profFirst=' +
              encodeURIComponent(professor.profFirst) +
              '&profLast=' +
              encodeURIComponent(professor.profLast),
            cacheIndexGrades,
            expireTime,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
            },
          ),
        ),
      )
        .then((responses) => {
          responses = responses.map((data) => data.data);
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
  }, [professorInvolvingSearchTerms]);

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
                  text +=
                    ' for ' +
                    professorInvolvingSearchTerms[index].profFirst +
                    ' ' +
                    professorInvolvingSearchTerms[index].profLast;
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
        <Filters manageQuery />
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Grid
              container
              component="main"
              wrap="wrap-reverse"
              className="grow"
              spacing={2}
            >
              <Grid item xs={12} sm={7} md={7}>
                {searchResultsComponent}
              </Grid>
              <Grid
                item
                xs={false}
                sm={searchResultsComponent === null ? 12 : 5}
                md={searchResultsComponent === null ? 12 : 5}
                className="w-full"
              >
                {gradesComponent}
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
