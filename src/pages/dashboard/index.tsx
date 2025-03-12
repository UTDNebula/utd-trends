import { Card, Grid2 as Grid } from '@mui/material';
import type { NextPage, NextPageContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

import Compare from '@/components/compare/Compare/Compare';
import DashboardEmpty from '@/components/dashboard/DashboardEmpty/DashboardEmpty';
import DashboardError from '@/components/dashboard/DashboardError/DashboardError';
import Carousel from '@/components/navigation/Carousel/Carousel';
import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import CourseOverview from '@/components/overview/CourseOverview/CourseOverview';
import ProfessorOverview from '@/components/overview/ProfessorOverview/ProfessorOverview';
import Filters from '@/components/search/Filters/Filters';
import SearchResultsTable from '@/components/search/SearchResultsTable/SearchResultsTable';
import { compareColors } from '@/modules/colors/colors';
import fetchWithCache, {
  cacheIndexNebula,
  expireTime,
} from '@/modules/fetchWithCache/fetchWithCache';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  convertToProfOnly,
  decodeSearchQueryLabel,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import useGradeStore from '@/modules/useGradeStore/useGradeStore';
import useRmpStore from '@/modules/useRmpStore/useRmpStore';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';

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

// Add this utility function after the existing type definitions
function createColorMap(courses: SearchQuery[]): { [key: string]: string } {
  const colorMap: { [key: string]: string } = {};
  courses.forEach((course, index) => {
    colorMap[searchQueryLabel(course)] =
      compareColors[index % compareColors.length];
  });
  return colorMap;
}

/**
 * Seperates courses and professors from a string of comma-delimited searchTerms or string[] of searchTerms
 * @param searchTermInput
 * @returns an array of courseSearchTerms and professorSearchTerms
 */
function getSearchTerms(searchTermInput: string | string[] | undefined): {
  courseSearchTerms: SearchQuery[];
  professorSearchTerms: SearchQuery[];
} {
  let array = searchTermInput ?? [];
  if (!Array.isArray(array)) {
    array = array.split(','); // if searchTermsInput is a comma-delimited string, make it an array
  }
  const searchTerms = array.map((el) => decodeSearchQueryLabel(el)); // convert an array of strings to an array of SearchQuery's

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

  return { courseSearchTerms, professorSearchTerms };
}

/**
 *
 * @param courseSearchTerms
 * @param professorSearchTerms
 * @returns an empty string or a comma-delimited list of courses and professors, ending with a " - "
 */
function buildPageTitle(
  courseSearchTerms: SearchQuery[],
  professorSearchTerms: SearchQuery[],
): string {
  let pageTitle = '';
  courseSearchTerms.map((term) => {
    pageTitle += searchQueryLabel(term) + ', ';
  });
  professorSearchTerms.map((term) => {
    pageTitle += searchQueryLabel(term) + ', ';
  });
  pageTitle = pageTitle.slice(0, -2) + (pageTitle.length > 0 ? ' - ' : '');
  return pageTitle;
}

export async function getServerSideProps(
  context: NextPageContext,
): Promise<{ props: { pageTitle: string } }> {
  const { courseSearchTerms, professorSearchTerms } = getSearchTerms(
    context.query.searchTerms,
  );

  return {
    props: {
      pageTitle: buildPageTitle(courseSearchTerms, professorSearchTerms),
    },
  };
}

interface Props {
  pageTitle: string;
  grades: {
    [key: string]: GenericFetchedData<GradesType>;
  };
  fetchAndStoreGradesData: (
    course: SearchQuery,
    controller: AbortController,
  ) => Promise<GradesType | null>;
  recalcGrades: (course: SearchQuery) => void;
  recalcAllGrades: (
    results: SearchQuery[],
    academicSessions: string[],
    courseType: string[],
  ) => void;
  rmp: {
    [key: string]: GenericFetchedData<RMPInterface>;
  };
  fetchAndStoreRmpData: (
    course: SearchQuery,
    controller: AbortController,
  ) => void;
}

export const Dashboard: NextPage<Props> = (props: Props): React.ReactNode => {
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
      const { courseSearchTerms, professorSearchTerms } = getSearchTerms(
        router.query.searchTerms,
      );
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
          addCourseTypes(
            compareGrade.data.grades.flatMap((session) =>
              session.data.map((entry) => entry.type),
            ),
          );
        }
      });

      //To cancel on rerender
      const controller = new AbortController();

      //Get course/prof info
      if (courseSearchTerms.length === 1) {
        fetchAndAddRHSGrades(courseSearchTerms[0], controller);
      }
      if (professorSearchTerms.length === 1) {
        fetchAndAddRHSGrades(professorSearchTerms[0], controller);
      }

      //Order search terms
      let searchTerms: [SearchQuery[], SearchQuery[]] = [[], []];
      if (courseSearchTerms.length > 0) {
        searchTerms = [courseSearchTerms, professorSearchTerms];
      } else if (professorSearchTerms.length > 0) {
        searchTerms = [professorSearchTerms, courseSearchTerms];
      }

      //Get results from combos
      if (courseSearchTerms.length > 0 || professorSearchTerms.length > 0) {
        fetchSearchResults(...searchTerms, controller)
          .then((res) => {
            setResults({
              state: 'done',
              data: res,
            });
            getData(res, controller);
          })
          .catch((error) => {
            if (
              !(error instanceof DOMException && error.name == 'AbortError')
            ) {
              setResults({ state: 'error', data: [] });
            }
          });
      } else {
        setResults({
          state: 'error',
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

  // list of all course types for each semester?
  const [courseType, setCourseType] = useState<string[]>([]);

  // selected courseType
  const [chosenCourseType, setChosenCourseType] = useState<string[]>([]);

  //A wrapper on the setter function for chosenSessions that also recalculates GPA and such data for saved grade data based on the new set of chosen sessions
  function addChosenSessions(func: (arg0: string[]) => string[]) {
    setChosenSessions((old) => {
      const newVal = func(old);
      if (results.state === 'done') {
        props.recalcAllGrades(
          [...(results.state === 'done' ? results.data : [])],
          newVal,
          chosenCourseType,
        );
      }
      recalcAllCompareGrades(compare, newVal);
      return newVal;
    });
  }
  
  //A wrapper on the setter function for chosenCourse Type that also recalculates GPA and such data for saved grade data based on the new set of chosen courses types
  function addChosenCourseType(func: (arg0: string[]) => string[]) {
    setChosenCourseType((old) => {
      const newVal = func(old);
      if (results.state === 'done') {
        props.recalcAllGrades(
          [...(results.state === 'done' ? results.data : [])],
          chosenSessions,
          newVal,
        );
      }
      recalcAllCompareGrades(compare, newVal);

      return newVal;
    });
  }

  // same as addacademicSessions, adds course types to a list, removind duplicates
  function addCourseTypes(courseTypes: string[]) {
    setCourseType((oldCourseTypes) => {
      // combine old and new course Types
      oldCourseTypes = oldCourseTypes.concat(courseTypes);
      // remove duplicates
      oldCourseTypes = Array.from(new Set(oldCourseTypes));

      return oldCourseTypes;
    });

    addChosenCourseType((oldCourseTypes) => {
      oldCourseTypes = oldCourseTypes.concat(courseTypes);

      oldCourseTypes = Array.from(new Set(oldCourseTypes));
      return oldCourseTypes;
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

  //On change to results, load new data
  function getData(results: SearchQuery[], controller: AbortController) {
    //Grade data
    //Fetch each result
    for (const result of results) {
      const entry = props.grades[searchQueryLabel(result)];
      //Not already loading
      if (typeof entry === 'undefined' || entry.state === 'error') {
        props
          .fetchAndStoreGradesData(result, controller)
          .then((res: GradesType | null | undefined) => {
            //Add any more academic sessions and courseTypes to list
            if (res) {
              addAcademicSessions(res.grades.map((session) => session._id));
              addCourseTypes(
                res.grades.flatMap((session) =>
                  session.data.map((entry) => entry.type),
                ),
              );
            }
          });
      } else if (entry.state === 'done') {
        //Recalc gpa and such from past stored data for new page
        props.recalcGrades(result);
        //Readd academic sessions and course Types
        addAcademicSessions(entry.data.grades.map((session) => session._id));
        addCourseTypes(
          entry.data.grades.flatMap((session) =>
            session.data.map((entries) => entries.type),
          ),
        );
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
      const entry = props.rmp[searchQueryLabel(professor)];
      //Not already loading
      if (typeof entry === 'undefined' || entry.state === 'error') {
        props.fetchAndStoreRmpData(professor, controller);
      }
    }
  }

  // get data for course and professor overviews
  function fetchAndAddRHSGrades(
    query: SearchQuery,
    controller: AbortController,
  ) {
    //Grade data
    const entry = props.grades[searchQueryLabel(query)];
    //Not already loading
    if (typeof entry === 'undefined' || entry.state === 'error') {
      props.fetchAndStoreGradesData(query, controller);
    }
  }

  //Filtered results
  let includedResults: SearchQuery[] = [];

  //Filter results based on gpa, rmp, and rmp difficulty
  if (router.isReady) {
    includedResults = (results.state === 'done' ? results.data : []).filter(
      (result) => {
        //Remove if over threshold
        const courseGrades = props.grades[searchQueryLabel(result)];
        if (
          typeof courseGrades !== 'undefined' &&
          courseGrades.state === 'done' &&
          courseGrades.data.filtered.gpa === -1
        ) {
          return false;
        }
        if (
          typeof router.query.minGPA === 'string' &&
          typeof courseGrades !== 'undefined' &&
          courseGrades.state === 'done' &&
          courseGrades.data.filtered.gpa < parseFloat(router.query.minGPA)
        ) {
          return false;
        }
        const courseRmp =
          props.rmp[searchQueryLabel(convertToProfOnly(result))];
        if (
          typeof router.query.minRating === 'string' &&
          typeof courseRmp !== 'undefined' &&
          courseRmp.state === 'done' &&
          courseRmp.data.avgRating < parseFloat(router.query.minRating)
        ) {
          return false;
        }
        if (
          typeof router.query.maxDiff === 'string' &&
          typeof courseRmp !== 'undefined' &&
          courseRmp.state === 'done' &&
          courseRmp.data.avgDifficulty > parseFloat(router.query.maxDiff)
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
  const [compareGrades, setCompareGrades, , , recalcAllCompareGrades] =
    useGradeStore();
  //Saved data for their professors
  const [compareRmp, setCompareRmp] = useRmpStore();

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
            props.grades[searchQueryLabel(searchQuery)],
        };
      });
      //Save prof data
      if (typeof searchQuery.profLast !== 'undefined') {
        setCompareRmp((old) => {
          return {
            ...old,
            [searchQueryLabel(convertToProfOnly(searchQuery))]:
              props.rmp[searchQueryLabel(convertToProfOnly(searchQuery))],
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

  const panelLRef = useRef<ImperativePanelHandle>(null);
  const panelRRef = useRef<ImperativePanelHandle>(null);
  // Resets RHS & LHS to 50/50 when double clicking handle
  const handleResizeDoubleClick = () => {
    panelLRef.current?.resize(50);
  };

  // Add this after the compare state declaration
  const colorMap = createColorMap(compare);

  //Main content: loading, error, or normal
  let contentComponent;

  if (
    courses.length === 0 &&
    professors.length === 0 &&
    results.state !== 'loading'
  ) {
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
          grades={props.grades[searchQueryLabel(professors[0])]}
          rmp={props.rmp[searchQueryLabel(professors[0])]}
        />,
      );
    }
    if (courses.length === 1) {
      names.push('Class');
      tabs.push(
        <CourseOverview
          key="course"
          course={courses[0]}
          grades={props.grades[searchQueryLabel(courses[0])]}
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
        colorMap={colorMap}
      />,
    );
    const searchResultsTable = (
      <SearchResultsTable
        resultsLoading={results.state}
        includedResults={includedResults}
        grades={props.grades}
        rmp={props.rmp}
        compare={compare}
        addToCompare={addToCompare}
        removeFromCompare={removeFromCompare}
        colorMap={colorMap}
      />
    );
    const carousel = (
      <Card>
        <Carousel names={names} compareLength={compare.length}>
          {tabs}
        </Carousel>
      </Card>
    );
    contentComponent = (
      <>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Filters
              manageQuery
              academicSessions={academicSessions}
              chosenSessions={chosenSessions}
              addChosenSessions={addChosenSessions}
              courseType={courseType}
              chosenCourseType={chosenCourseType}
              addChosenCourseType={addChosenCourseType}
            />
          </Grid>
          <Grid size={{ xs: false, sm: 6, md: 6 }}></Grid>
        </Grid>
        <div className="sm:hidden">
          {carousel}
          {searchResultsTable}
        </div>
        <PanelGroup
          direction="horizontal"
          className="hidden sm:flex overflow-visible"
        >
          <Panel ref={panelLRef} minSize={40} defaultSize={50}>
            {searchResultsTable}
          </Panel>
          <PanelResizeHandle
            className="mt-4 p-1 mx-1 w-0.5 rounded-full opacity-25 data-[resize-handle-state=drag]:opacity-50 transition ease-in-out bg-transparent hover:bg-royal data-[resize-handle-state=drag]:bg-royal"
            onDoubleClick={handleResizeDoubleClick}
          />
          <Panel
            className="overflow-visible min-w-0"
            ref={panelRRef}
            minSize={30}
            defaultSize={50}
          >
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto mt-4">
              {carousel}
            </div>
          </Panel>
        </PanelGroup>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {'Results - ' + buildPageTitle(courses, professors) + 'UTD TRENDS'}
        </title>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/dashboard"
          key="canonical"
        />
        <meta
          key="og:title"
          property="og:title"
          content={'Results - ' + props.pageTitle + 'UTD TRENDS'}
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/dashboard"
        />
      </Head>
      <div className="w-full bg-light h-full">
        <TopMenu
          resultsLoading={results.state}
          setResultsLoading={() => setResults({ state: 'loading' })}
        />
        <main className="p-4">{contentComponent}</main>
      </div>
    </>
  );
};

export default Dashboard;
