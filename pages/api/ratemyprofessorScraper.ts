import { NextApiRequest, NextApiResponse } from 'next';

const RMP_URL = 'https://www.ratemyprofessors.com/search/professors/';
const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';
const SCHOOL_ID = '1273';
const HEADERS = {
  Authorization: 'Basic dGVzdDp0ZXN0',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  'Content-Type': 'application/json',
  Referer: '',
};
const PROFESSOR_QUERY = {
  query:
    'query RatingsListQuery($id: ID!) {node(id: $id) {... on Teacher {legacyId school {id} courseCodes {courseName courseCount} firstName lastName numRatings avgDifficulty avgRating department wouldTakeAgainPercent teacherRatingTags { tagCount tagName } ratingsDistribution { total r1 r2 r3 r4 r5 } }}}',
  variables: {
    id: '',
  },
};

function getProfessorId(text: string, professorName: string): string | null {
  const lowerCaseProfessorName = professorName.toLowerCase();

  let pendingMatch = null;
  const regex =
    /"legacyId":(\d+).*?"numRatings":(\d+).*?"firstName":"(.*?)","lastName":"(.*?)"/g;
  const allMatches: RegExpMatchArray | null = text.match(regex);
  const highestNumRatings = 0;

  if (allMatches) {
    for (const fullMatch of allMatches) {
      for (const match of fullMatch.matchAll(regex)) {
        const numRatings = parseInt(match[2]);
        if (
          lowerCaseProfessorName.includes(
            match[3].split(' ')[0].toLowerCase() + ' ' + match[4].toLowerCase(),
          ) &&
          numRatings >= highestNumRatings
        ) {
          pendingMatch = match[1];
        }
      }
    }
  }

  return pendingMatch;
}

function getGraphQlUrlProp(professorId: string) {
  HEADERS[
    'Referer'
  ] = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${professorId}`;
  PROFESSOR_QUERY.variables.id = btoa(`Teacher-${professorId}`);
  return {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(PROFESSOR_QUERY),
  };
}

export interface RMPInterface {
  avgDifficulty: number;
  avgRating: number;
  courseCodes: {
    courseCount: number;
    courseName: string;
  }[];
  department: string;
  firstName: string;
  lastName: string;
  legacyId: number;
  numRatings: number;
  ratingsDistribution: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
    r5: number;
    total: number;
  };
  school: {
    id: string;
  };
  teacherRatingTags: {
    tagCount: number;
    tagName: string;
  }[];
  wouldTakeAgainPercent: number;
}

type Data = {
  message: string;
  data?: RMPInterface;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (
    !(
      'profFirst' in req.query &&
      typeof req.query.profFirst === 'string' &&
      'profLast' in req.query &&
      typeof req.query.profLast === 'string'
    )
  ) {
    res.status(400).json({ message: 'Incorrect query present' });
    return;
  }
  return new Promise<void>((resolve) => {
    const name = ((req.query.profFirst as string).split(' ')[0] +
      ' ' +
      req.query.profLast) as string;

    // url for promises
    const url = new URL(RMP_URL + SCHOOL_ID + '?'); //UTD
    url.searchParams.append('q', name);

    // fetch professor id from url
    fetch(url.href, { method: 'GET' })
      .then((response) => response.text())
      .then((text) => {
        const professorId = getProfessorId(text, name);
        if (professorId === null) {
          res.status(400).json({ message: 'Professor not found' });
          resolve();
          return;
        }

        // create fetch object for professor id
        const graphQlUrlProp = getGraphQlUrlProp(professorId);

        // fetch professor info by id with graphQL
        fetch(RMP_GRAPHQL_URL, graphQlUrlProp)
          .then((response) => response.json())
          .then((response) => {
            if (
              response != null &&
              Object.hasOwn(response, 'data') &&
              Object.hasOwn(response.data, 'node')
            ) {
              response = response.data.node;
              res.status(200).json({
                message: 'success',
                data: response,
              });
              resolve();
              return;
            }
            res.status(400).json({ message: 'Data for professor not found' });
            resolve();
            return;
          });
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
        return;
      });
  });
}
