import {
  Card,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Carousel from '../../components/common/Carousel/carousel';
import Filters from '../../components/common/Filters/filters';
import { SearchResultsTable } from '../../components/common/SearchResultsTable/searchResultsTable';
import { BarGraph } from '../../components/graph/BarGraph/BarGraph';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import decodeSearchQueryLabel from '../../modules/decodeSearchQueryLabel/decodeSearchQueryLabel';
import fetchWithCache, {
  cacheIndexGrades,
  cacheIndexRmp,
  expireTime,
} from '../../modules/fetchWithCache';
import SearchQuery, {
  convertToProfOnly,
  Professor,
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
      '/api/autocomplete?input=' + searchQueryLabel(searchTerm),
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

type GradesType = {
  session: number;
  grade_distribution: number[];
}[];
function fetchGradesData(course: SearchQuery, controller: AbortController) {
  return new Promise<GradesType>((resolve) => {
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
        resolve([]);
        return;
      }

      //Replace _id with number
      type individualacademicSessionResponse = {
        _id: string;
        grade_distribution: number[];
      };
      resolve(
        response.map((data: individualacademicSessionResponse) => {
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
      );
    });
  });
}

function fetchRmpData(professor: SearchQuery, controller: AbortController) {
  return new Promise<RateMyProfessorData>((resolve) => {
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
      resolve(response.data.data);
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

  const [grades, setGrades] = useState<{ [key: string]: GradesType }>({});
  const [rmp, setRmp] = useState<{ [key: string]: RateMyProfessorData }>({});

  useEffect(() => {
    const controller = new AbortController();

    //Get grade data
    setGrades({});
    for (const result of results) {
      fetchGradesData(result, controller)
        .then((res) => {
          setGrades((old) => {
            return { ...old, [searchQueryLabel(result)]: res };
          });
        })
        .catch((error) => {
          console.error('Grades data', error);
        });
    }

    //Get RMP data
    let professorsInResults = results
      .map((result) => convertToProfOnly(result))
      .filter((obj) => Object.keys(obj).length !== 0);
    professorsInResults = removeDuplicates(professorsInResults);
    setRmp({});
    for (const professor of professorsInResults) {
      fetchRmpData(professor, controller)
        .then((res) => {
          setRmp((old) => {
            return { ...old, [searchQueryLabel(professor)]: res };
          });
        })
        .catch((error) => {
          console.error('RMP data', error);
        });
    }

    //TODO: Filters
    /*const router = useRouter();
    useEffect(() => {
      if (router.isReady) {
        let array = router.query.searchTerms ?? [];
        if (!Array.isArray(array)) {
          array = array.split(',');
        }
        const searchTerms = array.map((el) => decodeSearchQueryLabel(el));
        
        if (searchTerms.length === 1) {
          //sent to autocomplete to finish
          
        }
      }
    }, [router.isReady, router.query]);*/
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
    contentComponent = (
      <Grid
        container
        component="main"
        wrap="wrap-reverse"
        spacing={2}
      >
        <Grid item xs={12} sm={7} md={7}>
          <SearchResultsTable
            includedResults={includedResults}
            grades={grades}
            rmp={rmp}
          />
        </Grid>
        <Grid item xs={false} sm={5} md={5}>
          <Card className="h-96 px-4 py-2">
            <Carousel>
              <p>page 1</p>
              <p>page 2</p>
              <p>page 3</p>
            </Carousel>
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
            <Filters manageQuery />
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
