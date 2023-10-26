import { NextApiRequest, NextApiResponse } from 'next';

type RateMyProfessorInfo = {
  found: boolean;
  data?: {
    legacyId: string;
    averageRating: number;
    numRatings: number;
    wouldTakeAgainPercentage: number;
    averageDifficulty: number;
    department: string;
    firstName: string;
    lastName: string;
  };
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
  const url = new URL(
    'https://www.ratemyprofessors.com/search/professors/1273?',
  ); //UTD
  url.searchParams.append('q', req.query.professor as string);
  return new Promise<void>((resolve) => {
    fetch(url.href, {
      method: 'GET',
    })
      .then((response) => response.text())
      .then((text) => {
        const regex =
          /"legacyId":(\w+),"avgRating":([\d.]+),"numRatings":(\d+),"wouldTakeAgainPercent":([\d.]+),"avgDifficulty":([\d.]+),"department":"([\w\s]+)","school":.+?,"firstName":"([\w-]+)","lastName":"([\w-]+)"/;
        const regexArray = text.match(regex);
        if (regexArray != null) {
          res.status(200).json({
            message: 'success',
            data: {
              found: true,
              data: {
                legacyId: regexArray[1],
                averageRating: Number(regexArray[2]),
                numRatings: Number(regexArray[3]),
                wouldTakeAgainPercentage: Number(regexArray[4]),
                averageDifficulty: Number(regexArray[5]),
                department: regexArray[6],
                firstName: regexArray[7],
                lastName: regexArray[8],
              },
            },
          });
          resolve();
        } else {
          res.status(200).json({
            message: 'success',
            data: {
              found: false,
            },
          });
          resolve();
        }
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
