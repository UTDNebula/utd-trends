import { Card, Grid } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Carousel from '../../components/common/Carousel/carousel';
import Compare from '../../components/common/Compare/compare';
import CourseOverview from '../../components/common/CourseOverview/courseOverview';
import DashboardEmpty from '../../components/common/DashboardEmpty/dashboardEmpty';
import DashboardError from '../../components/common/DashboardError/dashboardError';
import Filters from '../../components/common/Filters/filters';
import ProfessorOverview from '../../components/common/ProfessorOverview/professorOverview';
import SearchResultsTable from '../../components/common/SearchResultsTable/searchResultsTable';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import decodeSearchQueryLabel from '../../modules/decodeSearchQueryLabel/decodeSearchQueryLabel';
import fetchWithCache, {
  cacheIndexNebula,
  cacheIndexRmp,
  expireTime,
} from '../../modules/fetchWithCache';
import type SearchQuery from '../../modules/SearchQuery/SearchQuery';
import { convertToProfOnly } from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';
import type { GradesData } from '../../pages/api/grades';
import type { RateMyProfessorData } from '../../pages/api/ratemyprofessorScraper';

//Limit cached number of grades and rmp data entries
const MAX_ENTRIES = 1000;

type GenericFetchedDataError<T> = {
  state: 'error';
  data?: T;
};
type GenericFetchedDataLoading = {
  state: 'loading';
};
type GenericFetchedDataDone<T> = {
  state: 'done';
  data: T;
};
export type GenericFetchedData<T> =
  | GenericFetchedDataError<T>
  | GenericFetchedDataLoading
  | GenericFetchedDataDone<T>;

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

//Fetch course+prof combos matching a specific course/prof
function combosSearchResultsFetch(
  searchTerm: SearchQuery,
  controller: AbortController,
): Promise<SearchQuery[]> {
  return fetchWithCache(
    '/api/combo?input=' + searchQueryLabel(searchTerm),
    cacheIndexNebula,
    expireTime,
    {
      // use the search terms to fetch all the result course-professor combinations
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  ).then((response) => {
    if (response.message !== 'success') {
      throw new Error(response.message);
    }
    return [searchTerm].concat(
      response.data.map((obj: SearchQuery) => ({
        ...searchTerm,
        ...obj,
      })),
    );
  });
}

//Get all course+prof combos for searchTerms and keep only the ones that match filterTerms
//When filterTerms is blank, just gets all searchTerms
//When both paramaters are defined this validates that a combo exists
function fetchSearchResults(
  searchTerms: SearchQuery[],
  filterTerms: SearchQuery[], //filterTerms is blank if the searchTerms are ALL courses or ALL professors
  controller: AbortController,
) {
  return Promise.all(
    searchTerms.map((searchTerm) =>
      combosSearchResultsFetch(searchTerm, controller),
    ),
  ).then((allSearchTermResults: SearchQuery[][]) => {
    const results: SearchQuery[] = [];
    allSearchTermResults.map((searchTermResults) =>
      searchTermResults.map((searchTermResult) => {
        if (filterTerms.length > 0) {
          filterTerms.map((filterTerm) => {
            if (
              (filterTerm.profFirst === searchTermResult.profFirst &&
                filterTerm.profLast === searchTermResult.profLast) ||
              (filterTerm.prefix === searchTermResult.prefix &&
                filterTerm.number === searchTermResult.number)
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
  });
}

//Find GPA, total, and grade_distribution based on including some set of semesters
function calculateGrades(grades: GradesData, academicSessions?: string[]) {
  let grade_distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const session of grades) {
    if (
      typeof academicSessions === 'undefined' ||
      academicSessions.includes(session._id)
    ) {
      grade_distribution = grade_distribution.map(
        (item, i) => item + session.grade_distribution[i],
      );
    }
  }

  const total: number = grade_distribution.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );

  const GPALookup = [
    4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
  ];
  let gpa = -1;
  if (total !== 0) {
    gpa =
      GPALookup.reduce(
        (accumulator, currentValue, index) =>
          accumulator + currentValue * grade_distribution[index],
        0,
      ) /
      (total - grade_distribution[grade_distribution.length - 1]);
  }

  return {
    gpa: gpa,
    total: total,
    grade_distribution: grade_distribution,
  };
}
export type GradesType = {
  gpa: number;
  total: number;
  grade_distribution: number[];
  grades: GradesData;
};
//Fetch grades by academic session from nebula api
function fetchGradesData(
  course: SearchQuery,
  controller: AbortController,
): Promise<GradesType> {
  return fetchWithCache(
    '/api/grades?' +
      Object.keys(course)
        .map(
          (key) =>
            key +
            '=' +
            encodeURIComponent(String(course[key as keyof SearchQuery])),
        )
        .join('&'),
    cacheIndexNebula,
    expireTime,
    {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  ).then((response) => {
    if (response.message !== 'success') {
      throw new Error(response.message);
    }
    if (response.data == null) {
      throw new Error('null data');
    }
    return {
      ...calculateGrades(response.data),
      grades: response.data, //type GradesData
    };
  });
}

//Fetch RMP data from RMP
function fetchRmpData(
  professor: SearchQuery,
  controller: AbortController,
): Promise<RateMyProfessorData> {
  return fetchWithCache(
    '/api/ratemyprofessorScraper?profFirst=' +
      encodeURIComponent(String(professor.profFirst)) +
      '&profLast=' +
      encodeURIComponent(String(professor.profLast)),
    cacheIndexRmp,
    expireTime,
    {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  ).then((response) => {
    if (response.message !== 'success') {
      throw new Error(response.message);
    }
    return response.data;
  });
}

export const Dashboard: NextPage = () => {
  const router = useRouter();

  //Searches seperated into courses and professors to create combos
  const [courses, setCourses] = useState<SearchQuery[]>([]);
  const [professors, setProfessors] = useState<SearchQuery[]>([]);

  //List of course+prof combos, data on each still needs to be fetched
  const [results, setResults] = useState<GenericFetchedData<SearchQuery[]>>({
    state: 'loading',
  });

  //On search change, seperate into courses and profs, clear data, and fetch new results
  useEffect(() => {
    if (router.isReady) {
      let array = router.query.searchTerms ?? [];
      if (!Array.isArray(array)) {
        array = array.split(',');
      }
      const searchTerms = array.map((el) => decodeSearchQueryLabel(el));

      const courseSearchTerms: SearchQuery[] = [];
      const professorSearchTerms: SearchQuery[] = [];

      // split the search terms into professors and courses
      searchTerms.map((searchTerm) => {
        if (typeof searchTerm.profLast !== 'undefined') {
          professorSearchTerms.push(searchTerm);
        }
        if (typeof searchTerm.prefix !== 'undefined') {
          courseSearchTerms.push(searchTerm);
        }
      });
      setCourses(courseSearchTerms);
      setProfessors(professorSearchTerms);

      //Clear fetched data
      setResults({ state: 'loading' });
      setAcademicSessions([]);
      setChosenSessions([]);
      Object.values(compareGrades).forEach((compareGrade) => {
        if (compareGrade.state === 'done') {
          addAcademicSessions(
            compareGrade.data.grades.map((session) => session._id),
          );
        }
      });

      //To cancel on rerender
      const controller = new AbortController();

      //Get course/prof info
      if (courseSearchTerms.length === 1) {
        if (
          typeof grades[searchQueryLabel(courseSearchTerms[0])] === 'undefined'
        ) {
          fetchAndStoreGradesData(courseSearchTerms[0], controller);
        }
      }
      if (professorSearchTerms.length === 1) {
        if (
          typeof grades[searchQueryLabel(professorSearchTerms[0])] ===
          'undefined'
        ) {
          fetchAndStoreGradesData(professorSearchTerms[0], controller);
        }
        if (
          typeof rmp[searchQueryLabel(professorSearchTerms[0])] === 'undefined'
        ) {
          fetchAndStoreRmpData(professorSearchTerms[0], controller);
        }
      }

      //Get results from combos
      if (courseSearchTerms.length > 0) {
        fetchSearchResults(courseSearchTerms, professorSearchTerms, controller)
          .then((res) => {
            setResults({
              state: 'done',
              data: res,
            });
            getData(res, controller);
          })
          .catch((error) => {
            setResults({ state: 'error', data: [] });
            console.error('Search Results', error);
          });
      } else if (professorSearchTerms.length > 0) {
        fetchSearchResults(professorSearchTerms, courseSearchTerms, controller)
          .then((res) => {
            setResults({
              state: 'done',
              data: res,
            });
            getData(res, controller);
          })
          .catch((error) => {
            setResults({ state: 'error', data: [] });
            console.error('Search Results', error);
          });
      }
      return () => {
        controller.abort();
      };
    }
  }, [router.isReady, router.query.searchTerms]);

  //Compiled list of academic sessions grade data is available for
  const [academicSessions, setAcademicSessions] = useState<string[]>([]);
  //Selected sessions to perform calculations with, starts as all of them
  const [chosenSessions, setChosenSessions] = useState<string[]>([]);

  //A wrapper on the setter function for chosenSessions that also recalculates GPA and such data for saved grade data based on the new set of chosen sessions
  function addChosenSessions(func: (arg0: string[]) => string[]) {
    setChosenSessions((old) => {
      const newVal = func(old);
      if (results.state === 'done') {
        setGrades((oldGrades) => {
          const grades = { ...oldGrades };
          //Relavent keys
          for (const result of [
            ...(results.state === 'done' ? results.data : []),
          ]
            .concat(courses.length === 1 ? courses[0] : [])
            .concat(professors.length === 1 ? professors[0] : [])) {
            const entry = grades[searchQueryLabel(result)];
            if (entry && entry.state === 'done') {
              entry.data = {
                ...entry.data,
                ...calculateGrades(entry.data.grades, newVal),
              };
            }
          }
          return grades;
        });
      }
      setCompareGrades((grades) => {
        Object.keys(grades).forEach((key) => {
          const entry = grades[key];
          if (entry && entry.state === 'done') {
            entry.data = {
              ...entry.data,
              ...calculateGrades(entry.data.grades, newVal),
            };
          }
        });
        return grades;
      });
      return newVal;
    });
  }

  //Add a set of sessions to the compiled list, removing duplicates and keeping a sorted order
  function addAcademicSessions(sessions: string[]) {
    setAcademicSessions((oldSessions) => {
      oldSessions = oldSessions.concat(sessions);
      //Remove duplicates
      oldSessions = oldSessions.filter(
        (value, index, array) => array.indexOf(value) === index,
      );
      //Sort by year and term
      oldSessions.sort((a, b) => {
        let aNum = parseInt(a);
        if (a.includes('S')) {
          aNum += 0.1;
        } else if (a.includes('U')) {
          aNum += 0.2;
        } else {
          aNum += 0.3;
        }
        let bNum = parseInt(b);
        if (b.includes('S')) {
          bNum += 0.1;
        } else if (b.includes('U')) {
          bNum += 0.2;
        } else {
          bNum += 0.3;
        }
        return aNum - bNum;
      });
      return oldSessions;
    });
    //Have new sessions be automatically checked
    addChosenSessions((oldSessions) => {
      oldSessions = oldSessions.concat(sessions);
      //Remove duplicates
      oldSessions = oldSessions.filter(
        (value, index, array) => array.indexOf(value) === index,
      );
      //No need to sort as this does not display to the user
      return oldSessions;
    });
  }

  //Store grades by course+prof combo
  const [grades, setGrades] = useState<{
    [key: string]: GenericFetchedData<GradesType>;
  }>({});
  function addToGrades(key: string, value: GenericFetchedData<GradesType>) {
    setGrades((old) => {
      const newVal = { ...old };
      if (typeof newVal[key] !== 'undefined') {
        newVal[key] = value;
        return newVal;
      }
      if (Object.keys(newVal).length >= MAX_ENTRIES) {
        // Remove the oldest entry
        const oldestKey = Object.keys(newVal)[0];
        delete newVal[oldestKey];
      }
      newVal[key] = value;
      return newVal;
    });
  }
  //Store rmp scores by profs
  const [rmp, setRmp] = useState<{
    [key: string]: GenericFetchedData<RateMyProfessorData>;
  }>({});
  function addToRmp(
    key: string,
    value: GenericFetchedData<RateMyProfessorData>,
  ) {
    setRmp((old) => {
      const newVal = { ...old };
      if (typeof newVal[key] !== 'undefined') {
        newVal[key] = value;
        return newVal;
      }
      if (Object.keys(newVal).length >= MAX_ENTRIES) {
        // Remove the oldest entry
        const oldestKey = Object.keys(newVal)[0];
        delete newVal[oldestKey];
      }
      newVal[key] = value;
      return newVal;
    });
  }

  //Call fetchGradesData and store response
  function fetchAndStoreGradesData(
    course: SearchQuery,
    controller: AbortController,
  ) {
    addToGrades(searchQueryLabel(course), { state: 'loading' });
    fetchGradesData(course, controller)
      .then((res: GradesType) => {
        //Add to storage
        //Set loading status to done, unless total was 0 in calculateGrades
        addToGrades(searchQueryLabel(course), {
          state: res.gpa !== -1 ? 'done' : 'error',
          data: res,
        });
        //Add any more academic sessions to list
        addAcademicSessions(res.grades.map((session) => session._id));
      })
      .catch((error) => {
        //Set loading status to error
        addToGrades(searchQueryLabel(course), { state: 'error' });
        console.error('Grades data for ' + searchQueryLabel(course), error);
      });
  }

  //Call fetchRmpData and store response
  function fetchAndStoreRmpData(
    professor: SearchQuery,
    controller: AbortController,
  ) {
    addToRmp(searchQueryLabel(professor), { state: 'loading' });
    fetchRmpData(professor, controller)
      .then((res: RateMyProfessorData) => {
        //Add to storage
        //Set loading status to done
        addToRmp(searchQueryLabel(professor), {
          state: typeof res !== 'undefined' ? 'done' : 'error',
          data: res,
        });
      })
      .catch((error) => {
        //Set loading status to error
        addToRmp(searchQueryLabel(professor), { state: 'error' });
        console.error('RMP data for ' + searchQueryLabel(professor), error);
      });
  }

  //On change to results, load new data
  function getData(results: SearchQuery[], controller: AbortController) {
    //Grade data
    //Fetch each result
    for (const result of results) {
      const entry = grades[searchQueryLabel(result)];
      //Not already loading
      if (typeof entry === 'undefined') {
        fetchAndStoreGradesData(result, controller);
      } else {
        //Recalc gpa and such from past stored data for new page
        setGrades((oldGrades) => {
          const grades = { ...oldGrades };
          const entry = grades[searchQueryLabel(result)];
          if (entry && entry.state === 'done') {
            entry.data = {
              ...entry.data,
              ...calculateGrades(entry.data.grades),
            };
          }
          return grades;
        });
        //Readd academic sessions
        if (entry.state === 'done') {
          addAcademicSessions(entry.data.grades.map((session) => session._id));
        }
      }
    }

    //RMP data
    //Get list of profs from results
    //Remove duplicates so as not to fetch multiple times
    const professorsInResults = removeDuplicates(
      results
        //Remove course data from each
        .map((result) => convertToProfOnly(result))
        //Remove empty objects (used to be only course data)
        .filter((obj) => Object.keys(obj).length !== 0) as SearchQuery[],
    );
    //Fetch each professor
    //also fetch single profs from search
    if (
      professors.length === 1 &&
      !professorsInResults.some((el) => searchQueryEqual(el, professors[0]))
    ) {
      professorsInResults.push(professors[0]);
    }
    for (const professor of professorsInResults) {
      //Not already loading
      if (typeof rmp[searchQueryLabel(professor)] === 'undefined') {
        fetchAndStoreRmpData(professor, controller);
      }
    }
  }

  //Filtered results
  let includedResults: SearchQuery[] = [];

  //Filter results based on gpa, rmp, and rmp difficulty
  if (router.isReady) {
    includedResults = (results.state === 'done' ? results.data : []).filter(
      (result) => {
        //Remove if over threshold
        const courseGrades = grades[searchQueryLabel(result)];
        if (
          typeof router.query.minGPA === 'string' &&
          typeof courseGrades !== 'undefined' &&
          courseGrades.state === 'done' &&
          courseGrades.data.gpa < parseFloat(router.query.minGPA)
        ) {
          return false;
        }
        const courseRmp = rmp[searchQueryLabel(convertToProfOnly(result))];
        if (
          typeof router.query.minRating === 'string' &&
          typeof courseRmp !== 'undefined' &&
          courseRmp.state === 'done' &&
          courseRmp.data.averageRating < parseFloat(router.query.minRating)
        ) {
          return false;
        }
        if (
          typeof router.query.maxDiff === 'string' &&
          typeof courseRmp !== 'undefined' &&
          courseRmp.state === 'done' &&
          courseRmp.data.averageDifficulty > parseFloat(router.query.maxDiff)
        ) {
          return false;
        }
        return true;
      },
    );
  } else {
    includedResults = results.state === 'done' ? results.data : [];
  }

  //List of course+prof combos saved for comparison
  const [compare, setCompare] = useState<SearchQuery[]>([]);
  //Their saved grade data
  const [compareGrades, setCompareGrades] = useState<{
    [key: string]: GenericFetchedData<GradesType>;
  }>({});
  //Saved data for their professors
  const [compareRmp, setCompareRmp] = useState<{
    [key: string]: GenericFetchedData<RateMyProfessorData>;
  }>({});

  //Add a course+prof combo to compare (happens from search results)
  //copy over data basically
  function addToCompare(searchQuery: SearchQuery) {
    //If not already there
    if (compare.findIndex((obj) => searchQueryEqual(obj, searchQuery)) === -1) {
      //Add to list
      setCompare((old) => old.concat([searchQuery]));
      //Save grade data
      setCompareGrades((old) => {
        return {
          ...old,
          [searchQueryLabel(searchQuery)]:
            grades[searchQueryLabel(searchQuery)],
        };
      });
      //Save prof data
      if (typeof searchQuery.profLast !== 'undefined') {
        setCompareRmp((old) => {
          return {
            ...old,
            [searchQueryLabel(convertToProfOnly(searchQuery))]:
              rmp[searchQueryLabel(convertToProfOnly(searchQuery))],
          };
        });
      }
    }
  }

  //Remove a course+prof combo from compare
  function removeFromCompare(searchQuery: SearchQuery) {
    //If already there
    if (compare.findIndex((obj) => searchQueryEqual(obj, searchQuery)) !== -1) {
      //Remove from list
      setCompare((old) =>
        old.filter((el) => !searchQueryEqual(el, searchQuery)),
      );
      //Remove from saved grade data
      setCompareGrades((old) => {
        delete old[searchQueryLabel(searchQuery)];
        return old;
      });
      //If no other courses in compare have the same professor
      if (
        !compare
          .filter((el) => !searchQueryEqual(el, searchQuery))
          .some((el) => searchQueryEqual(el, convertToProfOnly(searchQuery)))
      ) {
        //Remove from saved rmp data
        setCompareRmp((old) => {
          delete old[searchQueryLabel(convertToProfOnly(searchQuery))];
          return old;
        });
      }
    }
  }

  //Main content: loading, error, or normal
  let contentComponent;

  if (courses.length === 0 && professors.length === 0) {
    contentComponent = <DashboardEmpty />;
  } else if (results.state === 'error') {
    contentComponent = <DashboardError />;
  } else {
    //Add RHS tabs, only add overview tab if one course/prof
    const names = [];
    const tabs = [];
    if (professors.length === 1) {
      names.push('Professor');
      tabs.push(
        <ProfessorOverview
          key="professor"
          professor={professors[0]}
          grades={grades[searchQueryLabel(professors[0])]}
          rmp={rmp[searchQueryLabel(professors[0])]}
        />,
      );
    }
    if (courses.length === 1) {
      names.push('Class');
      tabs.push(
        <CourseOverview
          key="course"
          course={courses[0]}
          grades={grades[searchQueryLabel(courses[0])]}
        />,
      );
    }
    names.push('Compare');
    tabs.push(
      <Compare
        key="compare"
        courses={compare}
        grades={compareGrades}
        rmp={compareRmp}
        removeFromCompare={removeFromCompare}
      />,
    );
    contentComponent = (
      <>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <Filters
              manageQuery
              academicSessions={academicSessions}
              chosenSessions={chosenSessions}
              addChosenSessions={addChosenSessions}
            />
          </Grid>
          <Grid item xs={false} sm={6} md={6}></Grid>
        </Grid>
        <Grid container component="main" wrap="wrap-reverse" spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <SearchResultsTable
              resultsLoading={results.state}
              includedResults={includedResults}
              grades={grades}
              rmp={rmp}
              compare={compare}
              addToCompare={addToCompare}
              removeFromCompare={removeFromCompare}
            />
          </Grid>
          <Grid item xs={false} sm={6} md={6} className="w-full">
            <div className="sticky top-0 gridsm:max-h-screen overflow-y-auto pt-4">
              <Card>
                <Carousel names={names}>{tabs}</Carousel>
              </Card>
            </div>
          </Grid>
        </Grid>
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
      <div className="w-full bg-light h-full">
        <TopMenu />
        <main className="p-4">{contentComponent}</main>
      </div>
    </>
  );
};

export default Dashboard;
