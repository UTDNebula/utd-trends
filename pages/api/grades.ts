// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
  data?: {
    _id: string;
    grade_distribution: number[];
  }[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (typeof process.env.REACT_APP_NEBULA_API_KEY === 'undefined') {
    res.status(400).json({ message: 'API key is undefined' });
  } else {
    const headers: HeadersInit = {
      'x-api-key': process.env.REACT_APP_NEBULA_API_KEY,
      Accept: 'application/json',
    };
    if (
      (('prefix' in req.query && typeof req.query.prefix === 'string') ||
        ('number' in req.query && typeof req.query.number === 'string') ||
        ('professorName' in req.query &&
          typeof req.query.professorName === 'string') ||
        ('sectionNumber' in req.query &&
          typeof req.query.sectionNumber === 'string')) &&
      'representation' in req.query &&
      typeof req.query.representation === 'string'
    ) {
      const url = new URL('https://api.utdnebula.com/grades/semester');
      if ('prefix' in req.query && typeof req.query.prefix === 'string') {
        url.searchParams.append('prefix', req.query.prefix);
      }
      if ('number' in req.query && typeof req.query.number === 'string') {
        url.searchParams.append('number', req.query.number);
      }
      if (
        'professorName' in req.query &&
        typeof req.query.professorName === 'string'
      ) {
        url.searchParams.append(
          'first_name',
          req.query.professorName.split(' ')[0],
        );
        url.searchParams.append(
          'last_name',
          req.query.professorName.split(' ')[1],
        );
      }
      if (
        'sectionNumber' in req.query &&
        typeof req.query.sectionNumber === 'string'
      ) {
        url.searchParams.append('section_number', req.query.sectionNumber);
      }
      console.log('href', url.href);
      fetch(url.href, {
        method: 'GET',
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('data', data, data.message);
          if (data.message !== 'success') {
            throw new Error(data.message);
          }
          res.status(200).json({
            message: 'success',
            data: data.data,
          });
        })
        .catch((error) => {
          // DUMMY DATA
          res.status(200).json({
            message: 'success',
            data: [
              {
                _id: '19U',
                grade_distribution: [
                  1154, 3851, 1750, 1337, 1583, 789, 482, 580, 312, 111, 165,
                  116, 370, 209,
                ],
              },
              {
                _id: '21U',
                grade_distribution: [
                  1361, 4162, 1954, 1607, 1703, 883, 651, 693, 313, 130, 198,
                  115, 697, 392,
                ],
              },
              {
                _id: '17F',
                grade_distribution: [
                  11402, 28408, 13501, 10730, 12754, 6352, 4004, 4956, 2720,
                  1118, 1678, 787, 4406, 2383,
                ],
              },
              {
                _id: '18S',
                grade_distribution: [
                  7856, 22871, 10577, 8305, 9770, 4652, 3246, 3883, 2046, 840,
                  1274, 564, 3320, 1866,
                ],
              },
              {
                _id: '22U',
                grade_distribution: [
                  1047, 2902, 1482, 1146, 1226, 722, 420, 493, 272, 110, 137,
                  87, 381, 247,
                ],
              },
              {
                _id: '20U',
                grade_distribution: [
                  1941, 5603, 2460, 1740, 1851, 881, 501, 543, 286, 98, 146, 74,
                  384, 0,
                ],
              },
              {
                _id: '22S',
                grade_distribution: [
                  10958, 22836, 10535, 8106, 8986, 5278, 3362, 3952, 2144, 965,
                  1331, 730, 3876, 2275,
                ],
              },
              {
                _id: '20F',
                grade_distribution: [
                  11647, 24060, 9613, 6511, 7024, 3203, 1721, 1957, 1167, 503,
                  747, 340, 1885, 3446,
                ],
              },
              {
                _id: '21F',
                grade_distribution: [
                  8849, 19387, 8299, 6323, 7544, 3688, 2363, 2998, 1338, 514,
                  919, 413, 2642, 1848,
                ],
              },
              {
                _id: '19S',
                grade_distribution: [
                  9091, 24544, 11752, 9147, 10692, 5627, 3656, 4424, 2302, 931,
                  1519, 658, 3323, 1890,
                ],
              },
              {
                _id: '18U',
                grade_distribution: [
                  1089, 3820, 1738, 1311, 1607, 737, 475, 541, 295, 116, 185,
                  124, 430, 117,
                ],
              },
              {
                _id: '21S',
                grade_distribution: [
                  7936, 22104, 8849, 5915, 6259, 2881, 1411, 1780, 1203, 385,
                  593, 275, 1967, 2730,
                ],
              },
              {
                _id: '22F',
                grade_distribution: [
                  11501, 23540, 11724, 9065, 10293, 5590, 3568, 4265, 2155, 971,
                  1421, 707, 3385, 2335,
                ],
              },
              {
                _id: '19F',
                grade_distribution: [
                  11020, 26080, 12187, 9501, 10943, 5507, 3416, 4264, 2210, 978,
                  1405, 690, 3318, 1694,
                ],
              },
              {
                _id: '20S',
                grade_distribution: [
                  12894, 28863, 10978, 7049, 6768, 3170, 1787, 2061, 879, 333,
                  464, 203, 1254, 2010,
                ],
              },
            ],
          });
          //res.status(400).json({ message: error.message });
        });
    } else {
      res.status(400).json({ message: 'Incorrect query present' });
    }
  }
}
