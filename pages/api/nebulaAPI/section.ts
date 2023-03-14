// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type ErrorState = {
  error: string;
};
type SuccessState = {
  data: {
    name?: string;
    grade_distribution: number[];
    professors?: string[];
    course_reference?: string;
    id?: string;
  };
};
type Data = ErrorState | SuccessState;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (typeof process.env.REACT_APP_NEBULA_API_KEY === 'undefined') {
    res.status(400).json({ error: 'API key is undefined' });
  } else {
    const headers: HeadersInit = {
      'x-api-key': process.env.REACT_APP_NEBULA_API_KEY,
      Accept: 'application/json',
    };
    if ('id' in req.query && typeof req.query.id === 'string') {
      return new Promise<void>((resolve, reject) => {
        fetch('https://api.utdnebula.com/section/' + req.query.id, {
          method: 'GET',
          headers: headers,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message !== 'success') {
              throw new Error(data.data);
            }
            const namesExtra = [
              'https://api.utdnebula.com/course/' + data.data.course_reference,
              ...data.data.professors.map(
                (id: string) => 'https://api.utdnebula.com/professor/' + id,
              ),
            ];
            Promise.all(
              namesExtra.map((url) =>
                fetch(url, {
                  method: 'GET',
                  headers: headers,
                }).then((response) => response.json()),
              ),
            ).then((responses) => {
              let name =
                responses[0].data.subject_prefix +
                ' ' +
                responses[0].data.course_number +
                '.' +
                data.data.section_number +
                ' ' +
                data.data.academic_session.name;
              for (let i = 1; i < responses.length; i++) {
                name +=
                  ', ' +
                  responses[1].data.first_name +
                  ' ' +
                  responses[1].data.last_name;
              }
              res.status(200).json({
                data: {
                  name: name,
                  grade_distribution: data.data.grade_distribution,
                  professors: data.data.professors,
                  course_reference: data.data.course_reference,
                },
              });
              resolve();
            });
          })
          .catch((error) => {
            res.status(400).json({ error: error });
            resolve();
          });
      });
    } else if (
      'prefix' in req.query &&
      typeof req.query.prefix === 'string' &&
      'number' in req.query &&
      typeof req.query.number === 'string' &&
      'professorName' in req.query &&
      typeof req.query.professorName === 'string' &&
      'sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string'
    ) {
      return new Promise<void>((resolve, reject) => {
        const courseUrl = new URL('https://api.utdnebula.com/course/');
        courseUrl.searchParams.append(
          'subject_prefix',
          String(req.query.prefix),
        );
        courseUrl.searchParams.append(
          'course_number',
          String(req.query.number),
        );
        /*const professorUrl = new URL('https://api.utdnebula.com/professor/'); //API doesn't return any data when professor is defined, though it should
        professorUrl.searchParams.append('first_name', req.query.professorName.split(' ')[0]);
        professorUrl.searchParams.append('last_name', req.query.professorName.split(' ')[1]);*/
        const UrlHrefs = [courseUrl.href /*, professorUrl.href*/];
        Promise.all(
          UrlHrefs.map((url) =>
            fetch(url, {
              method: 'GET',
              headers: headers,
            }).then((response) => response.json()),
          ),
        ).then((responses) => {
          const Url = new URL('https://api.utdnebula.com/section');
          Url.searchParams.append(
            'section_number',
            String(req.query.sectionNumber),
          );
          Url.searchParams.append('course_reference', responses[0].data[0]._id);
          //Url.searchParams.append('professors', responses[1].data[0]._id);
          fetch(Url.href, {
            method: 'GET',
            headers: headers,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message !== 'success') {
                throw new Error(data.data);
              }
              res.status(200).json({
                data: {
                  id: data.data[0]._id,
                  grade_distribution: data.data[0].grade_distribution,
                },
              });
              resolve();
            })
            .catch((error) => {
              res.status(400).json({ error: error });
              resolve();
            });
        });
      });
    } else {
      res.status(400).json({ error: 'No id query present' });
    }
  }
}
