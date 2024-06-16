import { Card, Grid, LinearProgress } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Carousel from '../../components/common/Carousel/carousel';
import Compare from '../../components/common/Compare/compare';
import CourseOverview from '../../components/common/CourseOverview/courseOverview';
import Filters from '../../components/common/Filters/filters';
import ProfessorOverview from '../../components/common/ProfessorOverview/professorOverview';
import SearchResultsTable from '../../components/common/SearchResultsTable/searchResultsTable';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import decodeSearchQueryLabel from '../../modules/decodeSearchQueryLabel/decodeSearchQueryLabel';
import fetchWithCache, {
  cacheIndexGrades,
  cacheIndexRmp,
  expireTime,
} from '../../modules/fetchWithCache';
import SearchQuery, {
  convertToProfOnly,
} from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../pages/api/ratemyprofessorScraper';

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

function autocompleteForSearchResultsFetch(
  searchTerms: SearchQuery[],
): Promise<SearchQuery[]>[] {
  return searchTerms.map((searchTerm) => {
    return fetchWithCache(
      '/api/autocomplete?limit=50&input=' + searchQueryLabel(searchTerm),
      cacheIndexGrades,
      expireTime,
      {
        // use the search terms to fetch all the result course-professor combinations
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
  return new Promise<SearchQuery[]>((resolve) => {
    // store the search results' data in fullGradesdata and profData
    Promise.all(autocompleteForSearchResultsFetch(searchTerms)).then(
      (allSearchTermResults: SearchQuery[][]) => {
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
        resolve(results);
      },
    );
  });
}

type GradesData = {
  _id: string;
  grade_distribution: number[];
}[];

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
function fetchGradesData(course: SearchQuery, controller: AbortController) {
  return new Promise<GradesType>((resolve, reject) => {
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
        signal: controller.signal,
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    ).then((response) => {
      response = response.data;

      if (response == null) {
        reject();
        return;
      }

      resolve({
        ...calculateGrades(response),
        grades: response,
      });
      return;
    });
  });
}

function fetchRmpData(professor: SearchQuery, controller: AbortController) {
  return new Promise<RateMyProfessorData>((resolve, reject) => {
    fetchWithCache(
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
      if (response.found === 'false') {
        reject();
        return;
      }
      resolve(response.data.data);
      return;
    });
  });
}

export const Dashboard: NextPage = () => {
  const router = useRouter();

  const [courses, setCourses] = useState<SearchQuery[]>([]);
  const [professors, setProfessors] = useState<SearchQuery[]>([]);

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
        if (searchTerm.profLast !== undefined) {
          professorSearchTerms.push(searchTerm);
        }
        if (searchTerm.prefix !== undefined) {
          courseSearchTerms.push(searchTerm);
        }
      });
      setCourses(courseSearchTerms);
      setProfessors(professorSearchTerms);
      setState('loading');
      setResults([]);
      setAcademicSessions([]);
      _setChosenSessions([]);
      setGrades({});
      setRmp({});
    }
  }, [router.isReady, router.query.searchTerms]);

  const [state, setState] = useState('loading');
  const [results, setResults] = useState<SearchQuery[]>([]);

  useEffect(() => {
    //Get results from autocomplete
    if (courses.length > 0) {
      fetchSearchResults(courses, professors)
        .then((res) => {
          setResults(res);
          setState('done');
        })
        .catch((error) => {
          setState('error');
          console.error('Search Results', error);
        });
    } else if (professors.length > 0) {
      fetchSearchResults(professors, courses)
        .then((res) => {
          setResults(res);
          setState('done');
        })
        .catch((error) => {
          setState('error');
          console.error('Search Results', error);
        });
    }
  }, [courses, professors]);

  const [academicSessions, setAcademicSessions] = useState<string[]>([]);
  const [chosenSessions, _setChosenSessions] = useState<string[]>([]);

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

  function addAcademicSessions(sessions: string[]) {
    setAcademicSessions((oldSessions) => {
      oldSessions = oldSessions.concat(sessions);
      oldSessions = oldSessions.filter(
        (value, index, array) => array.indexOf(value) === index,
      );
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
    setChosenSessions((oldSessions) => {
      oldSessions = oldSessions.concat(sessions);
      oldSessions = oldSessions.filter(
        (value, index, array) => array.indexOf(value) === index,
      );
      return oldSessions;
    });
  }

  const [grades, setGrades] = useState<{ [key: string]: GradesType }>({});
  const [rmp, setRmp] = useState<{ [key: string]: RateMyProfessorData }>({});

  const [gradesLoading, setGradesLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});
  const [rmpLoading, setRmpLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});

  useEffect(() => {
    const controller = new AbortController();

    //Get grade data
    const blankGradesLoading: { [key: string]: 'loading' | 'done' | 'error' } =
      {};
    for (const result of results) {
      blankGradesLoading[searchQueryLabel(result)] = 'loading';
    }
    setGradesLoading(blankGradesLoading);
    setGrades({});
    for (const result of results) {
      fetchGradesData(result, controller)
        .then((res) => {
          setGrades((old) => {
            return { ...old, [searchQueryLabel(result)]: res };
          });
          setGradesLoading((old) => {
            old[searchQueryLabel(result)] = res.gpa !== -1 ? 'done' : 'error';
            return old;
          });
          addAcademicSessions(res.grades.map((session) => session._id));
        })
        .catch((error) => {
          setGradesLoading((old) => {
            old[searchQueryLabel(result)] = 'error';
            return old;
          });
          console.error('Grades data for ' + searchQueryLabel(result), error);
        });
    }

    //Get RMP data
    let professorsInResults = results
      .map((result) => convertToProfOnly(result))
      .filter((obj) => Object.keys(obj).length !== 0);
    professorsInResults = removeDuplicates(professorsInResults);
    const blankRmpLoading: { [key: string]: 'loading' | 'done' | 'error' } = {};
    for (const professor of professorsInResults) {
      blankRmpLoading[searchQueryLabel(professor)] = 'loading';
    }
    setRmpLoading(blankRmpLoading);
    setRmp({});
    for (const professor of professorsInResults) {
      fetchRmpData(professor, controller)
        .then((res) => {
          setRmp((old) => {
            return { ...old, [searchQueryLabel(professor)]: res };
          });
          setRmpLoading((old) => {
            old[searchQueryLabel(professor)] = 'done';
            return old;
          });
        })
        .catch((error) => {
          setRmpLoading((old) => {
            old[searchQueryLabel(professor)] = 'error';
            return old;
          });
          console.error('RMP data for ' + searchQueryLabel(professor), error);
        });
    }

    return () => {
      controller.abort();
    };
  }, [results]);

  const [includedResults, setIncludedResults] = useState<SearchQuery[]>([]);

  //set value from query
  useEffect(() => {
    if (router.isReady && typeof router.query.searchTerms !== 'undefined') {
      setIncludedResults(
        results.filter((result) => {
          const courseGrades = grades[searchQueryLabel(result)];
          if (
            typeof router.query.minGPA === 'string' &&
            typeof courseGrades !== 'undefined'
          ) {
            ///TODO
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
        }),
      );
    } else {
      setIncludedResults(results);
    }
  }, [
    router.isReady,
    router.query.minGPA,
    router.query.minRating,
    router.query.maxDiff,
    results,
    grades,
    rmp,
  ]);

  const [compare, setCompare] = useState<SearchQuery[]>([]);
  const [compareGrades, setCompareGrades] = useState<{
    [key: string]: GradesType;
  }>({});
  const [compareRmp, setCompareRmp] = useState<{
    [key: string]: RateMyProfessorData;
  }>({});

  function addToCompare(searchQuery: SearchQuery) {
    if (compare.findIndex((obj) => searchQueryEqual(obj, searchQuery)) === -1) {
      setCompare((old) => old.concat([searchQuery]));
      setCompareGrades((old) => {
        return {
          ...old,
          [searchQueryLabel(searchQuery)]:
            grades[searchQueryLabel(searchQuery)],
        };
      });
      setCompareRmp((old) => {
        return {
          ...old,
          [searchQueryLabel(searchQuery)]: rmp[searchQueryLabel(searchQuery)],
        };
      });
    }
  }

  function removeFromCompare(searchQuery: SearchQuery) {
    if (compare.findIndex((obj) => searchQueryEqual(obj, searchQuery)) !== -1) {
      setCompare((old) =>
        old.filter((el) => !searchQueryEqual(el, searchQuery)),
      );
      setCompareGrades((old) => {
        delete old[searchQueryLabel(searchQuery)];
        return old;
      });
      setCompareRmp((old) => {
        delete old[searchQueryLabel(searchQuery)];
        return old;
      });
    }
  }

  let contentComponent;

  if (state === 'loading') {
    contentComponent = (
      <div className="h-full m-4">
        <LinearProgress className="mt-8 pt-2"></LinearProgress>
      </div>
    );
  } else if (state === 'error') {
    contentComponent = (
      <div className="h-full m-4">
        <h1 className="text-3xl text-center text-gray-600 font-semibold">
          An error occurred! Please reload the page, and if this problem
          persists, contact Nebula Labs.
        </h1>
      </div>
    );
  } else {
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
      />,
    );
    contentComponent = (
      <Grid container component="main" wrap="wrap-reverse" spacing={2}>
        <Grid item xs={12} sm={7} md={7}>
          <SearchResultsTable
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
        <Grid item xs={false} sm={5} md={5}>
          <Card className="h-96 px-4 py-2">
            <Carousel names={names}>{tabs}</Carousel>
          </Card>
        </Grid>
      </Grid>
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
        <main className="p-4">
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
          {contentComponent}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
