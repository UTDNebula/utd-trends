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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ('professors' in req.query && typeof req.query.professors === 'string') {
    var profNames: string[] = req.query.professors.split(',');

    var professorUrls: string[] = [];

    for (let i = 0; i < profNames.length; i++) {
      professorUrls.push(
        `https://www.ratemyprofessors.com/search/teachers?query=${encodeURIComponent(
          profNames[i],
        )}&sid=U2Nob29sLTEyNzM=`,
      );
    }
    return new Promise<void>((resolve, reject) => {
      Promise.all(professorUrls.map((u) => fetch(u)))
        .then((responses) => Promise.all(responses.map((res) => res.text())))
        .then((texts) => {
          const regex =
            /"legacyId":(\w+),"avgRating":([\d.]+),"numRatings":(\d+),"wouldTakeAgainPercent":([\d.]+),"avgDifficulty":([\d.]+),"department":"([\w\s]+)","school":.+?,"firstName":"([\w-]+)","lastName":"([\w-]+)"/;
          const result = texts.map((page) => {
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
            const regexArray = page.match(regex);
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
            return parsedData;
          });
          res.status(200).json(result);
          resolve();
        });
    });
  }
}
