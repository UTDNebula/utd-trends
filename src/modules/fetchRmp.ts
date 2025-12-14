import professor_to_alias from '@/data/professor_to_alias.json';
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
const OVERWRITES = professor_to_alias as { [key: string]: string };

function buildProfessorSearchQuery(names: string[], reviews: boolean) {
  // Generate the query string with N aliased queries
  const queries = names
    .map((_, i) => {
      return `
        prof${i}: newSearch {
          teachers(query: $query${i}) {
            edges {
              node {
                id
                legacyId
                firstName
                lastName
                school { id name }
                department
                avgRating
                numRatings
                avgDifficulty
                wouldTakeAgainPercent
                teacherRatingTags { tagName tagCount }
                ratingsDistribution { total r1 r2 r3 r4 r5 }
                ${
                  reviews
                    ? `ratings (first: 100) {
                    edges {
                      node {
                        comment
                      }
                    }
                  }
                `
                    : ''
                }
              }
            }
          }
        }
      `;
    })
    .join('\n');

  // Build the variable definitions
  const varDefs = names
    .map((_, i) => `$query${i}: TeacherSearchQuery!`)
    .join(', ');

  // Build the final GraphQL document
  const query = `
    query TeacherSearchQuery(${varDefs}) {
      ${queries}
    }
  `;

  // Build the variables object
  const variables = Object.fromEntries(
    names.map((name, i) => [
      `query${i}`,
      {
        text: name,
        schoolID: btoa('School-' + SCHOOL_ID),
      },
    ]),
  );

  return {
    query,
    variables,
  };
}

function getGraphQlUrlProp(names: string[], reviews: boolean) {
  const query = buildProfessorSearchQuery(names, reviews);
  return {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(query),
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
  ratings?: {
    edges: { node: { comment: string } }[];
  };
}

type TeacherSearchResponse = {
  teachers?: {
    edges: { node: RMP }[];
  };
};

function checkProfData(
  data: TeacherSearchResponse | null | undefined,
  checkFirst: string,
  checkLast: string,
) {
  if (!data?.teachers?.edges) {
    return [];
  }

  return data.teachers.edges.filter(
    (prof: { node: RMP }) =>
      prof.node.school.name === SCHOOL_NAME &&
      prof.node.firstName.includes(checkFirst) &&
      prof.node.lastName.includes(checkLast),
  );
}

export default async function fetchRmp(
  query: SearchQuery,
  reviews: boolean = false,
): Promise<RMP | undefined> {
  if (
    typeof query.profFirst !== 'string' ||
    typeof query.profLast !== 'string'
  ) {
    throw new Error('Incorrect query present /Rmp');
  }

  const profFirst = query.profFirst;
  const profLast = query.profLast;

  const singleProfFirst = profFirst.split(' ')[0];
  const name = singleProfFirst + ' ' + profLast;

  // Check for alias
  const aliasName = OVERWRITES[profFirst + ' ' + profLast];

  // Create fetch object for professor
  const graphQlUrlProp = getGraphQlUrlProp(
    aliasName ? [name, aliasName] : [name],
    reviews,
  );

  // Fetch professor info by name with graphQL
  const res = await fetch(RMP_GRAPHQL_URL, graphQlUrlProp);
  if (!res.ok) throw new Error('RMP Request Failed');

  // Check data
  const data = await res.json();
  if (!data?.data?.prof0) {
    throw new Error('Data for professor not found');
  }

  // Remove profs not at UTD and with bad name match
  const aliasNameSplit = aliasName ? aliasName.split(' ') : '';
  const professors = checkProfData(
    data.data.prof0,
    singleProfFirst,
    profLast,
  ).concat(
    aliasName && data?.data?.prof1
      ? checkProfData(
          data.data.prof1,
          aliasNameSplit[0],
          aliasNameSplit[aliasNameSplit.length - 1],
        )
      : [],
  );
  if (!professors.length) {
    return undefined;
  }

  // Pick prof instance with most ratings
  let maxRatingsProfessor = professors[0];
  for (let i = 1; i < professors.length; i++) {
    if (professors[i].node.numRatings > maxRatingsProfessor.node.numRatings) {
      maxRatingsProfessor = professors[i];
    }
  }
  return maxRatingsProfessor.node;
}
