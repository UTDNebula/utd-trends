import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';
const SCHOOL_ID = '1273';
const SCHOOL_NAME = 'The University of Texas at Dallas';
const HEADERS = {
  Authorization: 'Basic dGVzdDp0ZXN0',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  'Content-Type': 'application/json',
  Referer: 'https://www.ratemyprofessors.com/',
};
const PROFESSOR_SEARCH_QUERY = {
  query: `
    query TeacherSearchQuery($query: TeacherSearchQuery!) {
      newSearch {
        teachers(query: $query) {
          edges {
            node {
              id
              legacyId
              firstName
              lastName
              school {
                id
                name
              }
              department
              avgRating
              numRatings
              avgDifficulty
              wouldTakeAgainPercent
              teacherRatingTags {
                tagName
                tagCount
              }
              ratingsDistribution {
                total
                r1
                r2
                r3
                r4
                r5
              }
            }
          }
        }
      }
    }
  `,
  variables: {
    query: {
      text: '',
      schoolID: btoa('School-' + SCHOOL_ID),
    },
  },
};

function getGraphQlUrlProp(name: string) {
  PROFESSOR_SEARCH_QUERY.variables.query.text = name;
  return {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(PROFESSOR_SEARCH_QUERY),
    cache: 'force-cache',
    next: { revalidate: 3600 },
  };
}

export interface RMP {
  id: string;
  legacyId: string;
  firstName: string;
  lastName: string;
  school: {
    id: string;
    name: string;
  };
  department: string;
  avgRating: number;
  numRatings: number;
  avgDifficulty: number;
  wouldTakeAgainPercent: number;
  teacherRatingTags: {
    tagCount: number;
    tagName: string;
  }[];
  ratingsDistribution: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
    r5: number;
    total: number;
  };
}

export default async function fetchRmp(
  query: SearchQuery,
): Promise<GenericFetchedData<RMP>> {
  try {
    const singleProfFirst = profFirst.split(' ')[0];
    const name = singleProfFirst + ' ' + profLast;

    // create fetch object for professor
    const graphQlUrlProp = getGraphQlUrlProp(name);

    // fetch professor info by name with graphQL
    const res = await fetch(RMP_GRAPHQL_URL, graphQlUrlProp);

    const data = await res.json();

    if (
      data == null ||
      !Object.hasOwn(data, 'data') ||
      !Object.hasOwn(data.data, 'newSearch') ||
      !Object.hasOwn(data.data.newSearch, 'teachers') ||
      !Object.hasOwn(data.data.newSearch.teachers, 'edges')
    ) {
      throw new Error('Data for professor not found');
    }
    //Remove profs not at UTD and with bad name match
    const professors = data.data.newSearch.teachers.edges.filter(
      (prof: { node: RMPInterface }) =>
        prof.node.school.name === SCHOOL_NAME &&
        prof.node.firstName.includes(singleProfFirst) &&
        prof.node.lastName.includes(profLast),
    );
    //Pick prof instance with most ratings
    let maxRatingsProfessor = professors[0];
    for (let i = 1; i < professors.length; i++) {
      if (professors[i].node.numRatings > maxRatingsProfessor.node.numRatings) {
        maxRatingsProfessor = professors[i];
      }
    }
    return {
      message: 'success',
      data: maxRatingsProfessor.node,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
