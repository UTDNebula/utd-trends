import { NextApiRequest, NextApiResponse } from 'next';

type RateMyProfessorInfo = {
  legacyId: string;
  averageRating: number;
  numRatings: number;
  wouldTakeAgainPercentage: number;
  averageDifficulty: number;
  department: string;
  firstName: string;
  lastName: string;
};

type Data = {
  message: string;
  data?: RateMyProfessorInfo;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!('professor' in req.query && typeof req.query.professor === 'string')) {
    res.status(400).json({ message: 'Incorrect query present' });
  }
  const url = new URL('https://www.ratemyprofessors.com/search/teachers');
  url.searchParams.append('query', req.query.professor as string);
  url.searchParams.append('sid', 'U2Nob29sLTEyNzM='); //UTD
  return new Promise<void>((resolve, reject) => {
    fetch(url.href, {
      method: 'GET',
    })
      .then((response) => response.text())
      .then((text) => {
        const regex =
          /"legacyId":(\w+),"avgRating":([\d.]+),"numRatings":(\d+),"wouldTakeAgainPercent":([\d.]+),"avgDifficulty":([\d.]+),"department":"([\w\s]+)","school":.+?,"firstName":"([\w-]+)","lastName":"([\w-]+)"/;
        var parsedData: RateMyProfessorInfo = {
          averageRating: 0,
          averageDifficulty: 0,
          department: '',
          firstName: '',
          lastName: '',
          legacyId: '',
          numRatings: 0,
          wouldTakeAgainPercentage: 0,
        };
        const regexArray = text.match(regex);
        if (regexArray != null) {
          parsedData.legacyId = regexArray[1];
          parsedData.averageRating = Number(regexArray[2]);
          parsedData.numRatings = Number(regexArray[3]);
          parsedData.wouldTakeAgainPercentage = Number(regexArray[4]);
          parsedData.averageDifficulty = Number(regexArray[5]);
          parsedData.department = regexArray[6];
          parsedData.firstName = regexArray[7];
          parsedData.lastName = regexArray[8];
        }
        res.status(200).json({
          message: 'success',
          data: parsedData,
        });
        resolve();
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
