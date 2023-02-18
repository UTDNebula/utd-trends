import { NextApiRequest, NextApiResponse } from 'next';

type SearchQuery = {
  prefix?: string;
  number?: number;
  professorName?: string;
  sectionNumber?: string;
};

type Prefix = {
  classes: Class[];
  professors: Professor[];
  value: string;
};

type Class = {
  prefix: Prefix;
  number: number;
  professors: Professor[];
};

type Professor = {
  classes: Class[];
  firstName: string;
  lastName: string;
};

const classes: Class[] = [];
const prefixes: Prefix[] = [];
const professors: Professor[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    const parsedInput = decodeURIComponent(req.query.input).trim().split(' ');
    console.log('parsed input=', parsedInput);
    switch (parsedInput.length) {
      case 0:
        res.status(400).json({ error: 'No fields detected in input' });
        break;
      case 1:
        res
          .status(200)
          .json({ data: singleFieldSearchResults(parsedInput[0]) });
        break;
      case 2:
        res
          .status(200)
          .json({
            data: doubleFieldSearchResults(parsedInput[0], parsedInput[1]),
          });
        break;
      case 3:
        res
          .status(200)
          .json({
            data: tripleFieldSearchResults(
              parsedInput[0],
              parsedInput[1],
              parsedInput[2],
            ),
          });
        break;
      case 4:
        res
          .status(200)
          .json({
            data: quadrupleFieldSearchResults(
              parsedInput[0],
              parsedInput[1],
              parsedInput[2],
              parsedInput[3],
            ),
          });
        break;
      default:
        res
          .status(400)
          .json({
            error:
              'Something went wrong with the input, such as too many fields',
          });
    }
  } else {
    res.status(400).json({ error: 'No input, or invalid type of input' });
  }
}

function singleFieldSearchResults(field1: string): SearchQuery[] {
  let myProfessors: Professor[] = [
    { classes: [], firstName: 'arcs', lastName: 'test' },
    { classes: [], firstName: 'csre', lastName: 'acse' },
  ];

  let myPrefixes: Prefix[] = [
    { classes: [], professors: myProfessors, value: 'CS' },
    { classes: [], professors: [], value: 'ECS' },
    { classes: [], professors: [], value: 'CE' },
  ];

  let myClasses: Class[] = [
    { prefix: myPrefixes[0], number: 1337, professors: myProfessors },
    {
      prefix: myPrefixes[0],
      number: 2337,
      professors: Array.of(myProfessors[0]),
    },
  ];

  myProfessors[0].classes.push(myClasses[0], myClasses[1]);
  myProfessors[1].classes.push(myClasses[0]);

  myPrefixes[0].classes.push(myClasses[0], myClasses[1]);

  const resultingSet: SearchQuery[] = [];

  let fullPrefixMatched: boolean = false;
  let fullMatchedPrefix: Prefix;

  for (const prefix of myPrefixes) {
    if (prefix.value.toLowerCase() === field1.toLowerCase()) {
      fullPrefixMatched = true;
      fullMatchedPrefix = prefix;
      break;
    }
  }

  if (fullPrefixMatched) {
    // @ts-ignore
    resultingSet.push({ prefix: fullMatchedPrefix.value });
    // @ts-ignore
    fullMatchedPrefix.classes.forEach((_class) => {
      resultingSet.push({
        prefix: fullMatchedPrefix.value,
        number: _class.number,
      });
    });
    return Array.from(
      new Set(resultingSet.map((query) => JSON.stringify(query))),
    ).map((queryString) => JSON.parse(queryString));
  } else {
    let fullProfMatched: boolean = false;
    let fullMatchedProf: Professor;

    for (const prof of myProfessors) {
      if (
        prof.firstName.toLowerCase() === field1.toLowerCase() ||
        prof.lastName.toLowerCase() === field1.toLowerCase()
      ) {
        fullProfMatched = true;
        fullMatchedProf = prof;
        break;
      }
    }

    if (fullProfMatched) {
      // @ts-ignore
      resultingSet.push({
        professorName:
          fullMatchedProf.firstName + ' ' + fullMatchedProf.lastName,
      });
      // @ts-ignore
      fullMatchedProf.classes.forEach((_class) => {
        resultingSet.push({
          prefix: _class.prefix.value,
          number: _class.number,
          professorName:
            fullMatchedProf.firstName + ' ' + fullMatchedProf.lastName,
        });
      });
      return Array.from(
        new Set(resultingSet.map((query) => JSON.stringify(query))),
      ).map((queryString) => JSON.parse(queryString));
    } else {
      const patternFromField: RegExp = new RegExp(field1, 'i');

      myPrefixes
        .filter((prefix) => {
          return patternFromField.exec(prefix.value) != null;
        })
        .sort((a, b) => {
          const aMatch = patternFromField.exec(a.value);
          const bMatch = patternFromField.exec(b.value);
          if (!aMatch) {
            return 1;
          } else if (!bMatch) {
            return -1;
          } else {
            return aMatch.index - bMatch.index;
          }
        })
        .forEach((prefix) => {
          resultingSet.push({ prefix: prefix.value });
        });
      myProfessors
        .filter((professor) => {
          return patternFromField.exec(professor.lastName) != null;
        })
        .sort((a, b) => {
          const aMatch = patternFromField.exec(a.lastName);
          const bMatch = patternFromField.exec(b.lastName);
          if (!aMatch) {
            return 1;
          } else if (!bMatch) {
            return -1;
          } else {
            return aMatch.index - bMatch.index;
          }
        })
        .forEach((professor) => {
          resultingSet.push({
            professorName: professor.firstName + ' ' + professor.lastName,
          });
        });
      myProfessors
        .filter((professor) => {
          return patternFromField.exec(professor.firstName) != null;
        })
        .sort((a, b) => {
          const aMatch = patternFromField.exec(a.firstName);
          const bMatch = patternFromField.exec(b.firstName);
          if (!aMatch) {
            return 1;
          } else if (!bMatch) {
            return -1;
          } else {
            return aMatch.index - bMatch.index;
          }
        })
        .forEach((professor) => {
          resultingSet.push({
            professorName: professor.firstName + ' ' + professor.lastName,
          });
        });

      return Array.from(
        new Set(resultingSet.map((query) => JSON.stringify(query))),
      ).map((queryString) => JSON.parse(queryString));
    }
  }
}

//TODO: method for two fields
function doubleFieldSearchResults(
  field1: string,
  field2: string,
): SearchQuery[] {
  return [];
}

//TODO: method for three fields
function tripleFieldSearchResults(
  field1: string,
  field2: string,
  field3: string,
): SearchQuery[] {
  return [];
}

//TODO: method for four fields
function quadrupleFieldSearchResults(
  field1: string,
  field2: string,
  field3: string,
  field4: string,
): SearchQuery[] {
  return [];
}
