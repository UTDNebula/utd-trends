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
import SearchQuery, {
  convertToProfOnly,
} from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';
import type { GradesData } from '../../pages/api/grades';
import type { RateMyProfessorData } from '../../pages/api/ratemyprofessorScraper';

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

//Fetch course+prof combos matching a specific course/prof
function autocompleteForSearchResultsFetch(
  searchTerms: SearchQuery[],
  controller: AbortController,
): Promise<SearchQuery[]>[] {
  return searchTerms.map((searchTerm) => {
    return fetchWithCache(
      '/api/autocomplete?limit=50&input=' + searchQueryLabel(searchTerm),
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
      return response.data as SearchQuery[];
    });
  });
}

//Get all course+prof combos for searchTerms and keep only the ones that match filterTerms
//When filterTerms is blank, just gets all searchTerms
//When both paramaters are defined this validates that a combo exists
function fetchSearchResults(
  searchTerms: SearchQuery[],
  filterTerms: SearchQuery[],
  controller: AbortController,
) {
  return Promise.all(
    autocompleteForSearchResultsFetch(searchTerms, controller),
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
function fetchGradesData(course: SearchQuery, controller: AbortController) {
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
      return;
    }
    if (response.data == null) {
      throw new Error('null data');
      return;
    }
    return {
      ...calculateGrades(response.data),
      grades: response.data,
    };
  });
}

//Fetch RMP data from RMP
function fetchRmpData(professor: SearchQuery, controller: AbortController) {
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
      return;
    }
    return response.data;
  });
}

export const Dashboard: NextPage = () => {
  const router = useRouter();

  //Searches seperated into courses and professors to create combos
  const [courses, setCourses] = useState<SearchQuery[]>([]);
  const [professors, setProfessors] = useState<SearchQuery[]>([]);

  //State for loading list of results
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');
  //List of course+prof combos, data on each still needs to be fetched
  const [results, setResults] = useState<SearchQuery[]>([]);

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
      setState('loading');
      setAcademicSessions([]);
      _setChosenSessions([]);
      setGrades({});
      setRmp({});
      setGradesLoading({});
      setRmpLoading({});

      //To cancel on rerender
      const controller = new AbortController();

      //Get course/prof info
      if (courseSearchTerms.length === 1) {
        fetchAndStoreGradesData(courseSearchTerms[0], controller);
      }
      if (professorSearchTerms.length === 1) {
        fetchAndStoreGradesData(professorSearchTerms[0], controller);
        fetchAndStoreRmpData(professorSearchTerms[0], controller);
      }

      //Get results from autocomplete
      if (courseSearchTerms.length > 0) {
        fetchSearchResults(courseSearchTerms, professorSearchTerms, controller)
          .then((res) => {
            setResults(res);
            setState('done');
            getData(res, controller);
          })
          .catch((error) => {
            setState('error');
            console.error('Search Results', error);
          });
      } else if (professorSearchTerms.length > 0) {
        fetchSearchResults(professorSearchTerms, courseSearchTerms, controller)
          .then((res) => {
            setResults(res);
            setState('done');
            getData(res, controller);
          })
          .catch((error) => {
            setState('error');
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
  const [chosenSessions, _setChosenSessions] = useState<string[]>([]);

  //A wrapper on the setter function for chosenSessions that also recalculates GPA and such data for saved grade data based on the new set of chosen sessions
  function setChosenSessions(func: (arg0: string[]) => string[]) {
    _setChosenSessions((old) => {
      const newVal = func(old);
      setGrades((grades) => {
        Object.keys(grades).forEach((key) => {
          grades[key] = {
            ...grades[key],
            ...calculateGrades(grades[key].grades, newVal),
          };
        });
        return grades;
      });
      setCompareGrades((grades) => {
        Object.keys(grades).forEach((key) => {
          grades[key] = {
            ...grades[key],
            ...calculateGrades(grades[key].grades, newVal),
          };
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
    setChosenSessions((oldSessions) => {
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
  const [grades, setGrades] = useState<{ [key: string]: GradesType }>({});
  //Store rmp scores by profs
  const [rmp, setRmp] = useState<{ [key: string]: RateMyProfessorData }>({});

  //Loading states for each result and prof in results
  const [gradesLoading, setGradesLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});
  const [rmpLoading, setRmpLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});

  //Call fetchGradesData and store response
  function fetchAndStoreGradesData(
    course: SearchQuery,
    controller: AbortController,
  ) {
    setGradesLoading((old) => {
      return {
        ...old,
        [searchQueryLabel(course)]: 'loading',
      };
    });
    fetchGradesData(course, controller)
      .then((res) => {
        //Add to storage
        setGrades((old) => {
          return { ...old, [searchQueryLabel(course)]: res };
        });
        //Set loading status to done, unless total was 0 in calculateGrades
        setGradesLoading((old) => {
          return {
            ...old,
            [searchQueryLabel(course)]: res.gpa !== -1 ? 'done' : 'error',
          };
        });
        //Add any more academic sessions to list
        addAcademicSessions(res.grades.map((session) => session._id));
      })
      .catch((error) => {
        //Set loading status to error
        setGradesLoading((old) => {
          return { ...old, [searchQueryLabel(course)]: 'error' };
        });
        console.error('Grades data for ' + searchQueryLabel(course), error);
      });
  }

  //Call fetchRmpData and store response
  function fetchAndStoreRmpData(
    professor: SearchQuery,
    controller: AbortController,
  ) {
    setRmpLoading((old) => {
      return {
        ...old,
        [searchQueryLabel(professor)]: 'loading',
      };
    });
    fetchRmpData(professor, controller)
      .then((res) => {
        //Add to storage
        setRmp((old) => {
          return { ...old, [searchQueryLabel(professor)]: res };
        });
        //Set loading status to done
        setRmpLoading((old) => {
          return {
            ...old,
            [searchQueryLabel(professor)]:
              typeof res !== 'undefined' ? 'done' : 'error',
          };
        });
      })
      .catch((error) => {
        //Set loading status to error
        setRmpLoading((old) => {
          return { ...old, [searchQueryLabel(professor)]: 'error' };
        });
        console.error('RMP data for ' + searchQueryLabel(professor), error);
      });
  }

  //On change to results, load new data
  function getData(results: SearchQuery[], controller: AbortController) {
    //Grade data
    //Fetch each result
    for (const result of results) {
      //Not already loading
      if (typeof gradesLoading[searchQueryLabel(result)] === 'undefined') {
        fetchAndStoreGradesData(result, controller);
      }
    }

    //RMP data
    //Get lsit of profs from results
    let professorsInResults = results
      //Remove course data from each
      .map((result) => convertToProfOnly(result))
      //Remove empty objects (used to be only course data)
      .filter((obj) => Object.keys(obj).length !== 0);
    //Remove duplicates so as not to fetch multiple times
    professorsInResults = removeDuplicates(professorsInResults);
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
      if (typeof rmpLoading[searchQueryLabel(professor)] === 'undefined') {
        fetchAndStoreRmpData(professor, controller);
      }
    }
  }

  //Filtered results
  let includedResults: SearchQuery[] = [];

  //Filter results based on gpa, rmp, and rmp difficulty
  if (router.isReady) {
    includedResults = results.filter((result) => {
      //Remove if over threshold
      const courseGrades = grades[searchQueryLabel(result)];
      if (
        typeof router.query.minGPA === 'string' &&
        typeof courseGrades !== 'undefined' &&
        courseGrades.gpa < parseFloat(router.query.minGPA)
      ) {
        return false;
      }
      const courseRmp = rmp[searchQueryLabel(convertToProfOnly(result))];
      if (
        typeof router.query.minRating === 'string' &&
        typeof courseRmp !== 'undefined' &&
        courseRmp.averageRating < parseFloat(router.query.minRating)
      ) {
        return false;
      }
      if (
        typeof router.query.maxDiff === 'string' &&
        typeof courseRmp !== 'undefined' &&
        courseRmp.averageDifficulty > parseFloat(router.query.maxDiff)
      ) {
        return false;
      }
      return true;
    });
  } else {
    includedResults = results;
  }

  //List of course+prof combos saved for comparison
  const [compare, setCompare] = useState<SearchQuery[]>([]);
  //Their saved grade data
  const [compareGrades, setCompareGrades] = useState<{
    [key: string]: GradesType;
  }>({});
  //Saved data for their professors
  const [compareRmp, setCompareRmp] = useState<{
    [key: string]: RateMyProfessorData;
  }>({});

  //Loading states for each compare course and prof in compare
  const [compareGradesLoading, setCompareGradesLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});
  const [compareRmpLoading, setCompareRmpLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
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
      setCompareGradesLoading((old) => {
        return {
          ...old,
          [searchQueryLabel(searchQuery)]:
            gradesLoading[searchQueryLabel(searchQuery)],
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
        setCompareRmpLoading((old) => {
          return {
            ...old,
            [searchQueryLabel(convertToProfOnly(searchQuery))]:
              rmpLoading[searchQueryLabel(convertToProfOnly(searchQuery))],
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
      setCompareGradesLoading((old) => {
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
        setCompareRmpLoading((old) => {
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
  } else if (state === 'error') {
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
          gradesLoading={
            gradesLoading[searchQueryLabel(professors[0])] ?? 'loading'
          }
          rmpLoading={rmpLoading[searchQueryLabel(professors[0])] ?? 'loading'}
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
          gradesLoading={
            gradesLoading[searchQueryLabel(courses[0])] ?? 'loading'
          }
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
        gradesLoading={compareGradesLoading}
        rmpLoading={compareRmpLoading}
      />,
    );
    contentComponent = (
      <>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={7} md={7}>
            <Filters
              manageQuery
              academicSessions={academicSessions}
              chosenSessions={chosenSessions}
              setChosenSessions={setChosenSessions}
            />
          </Grid>
          <Grid item xs={false} sm={5} md={5}></Grid>
        </Grid>
        <Grid container component="main" wrap="wrap-reverse" spacing={2}>
          <Grid item xs={12} sm={7} md={7}>
            <SearchResultsTable
              resultsLoading={state}
              includedResults={includedResults}
              grades={grades}
              rmp={rmp}
              gradesLoading={gradesLoading}
              rmpLoading={rmpLoading}
              compare={compare}
              addToCompare={addToCompare}
              removeFromCompare={removeFromCompare}
            />
          </Grid>
          <Grid item xs={false} sm={5} md={5} className="w-full">
            <Card>
              <Carousel names={names}>{tabs}</Carousel>
            </Card>
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
