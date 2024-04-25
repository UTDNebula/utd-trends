import { NextApiRequest, NextApiResponse } from 'next';

import autocompleteGraph from '../../data/autocomplete_graph.json';
import {
  getGraph,
  searchAutocomplete,
} from '../../modules/autocomplete/autocomplete';
import SearchQuery from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';

const graph = getGraph(autocompleteGraph as object);

type Data = {
  message: string;
  data?: SearchQuery[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    let searchBy = 'any';
    if (
      'searchBy' in req.query &&
      typeof req.query.searchBy === 'string' &&
      (req.query.searchBy === 'professor' ||
        req.query.searchBy === 'course' ||
        req.query.searchBy === 'both')
    ) {
      searchBy = req.query.searchBy;
    }
    return new Promise<void>((resolve) => {
      res.status(200).json({
        message: 'success',
        data: searchAutocomplete(
          graph,
          req.query.input as string,
          20,
          searchBy,
        ),
      });
      resolve();
    });
  } else if (
    ('prefix' in req.query && typeof req.query.prefix === 'string') ||
    ('number' in req.query && typeof req.query.number === 'string') ||
    ('profFirst' in req.query &&
      typeof req.query.profFirst === 'string' &&
      'profLast' in req.query &&
      typeof req.query.profLast === 'string') ||
    ('sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string')
  ) {
    const prefexDefined =
      'prefix' in req.query && typeof req.query.prefix === 'string';
    const numberDefined =
      'number' in req.query && typeof req.query.number === 'string';
    const professorNameDefined =
      'profFirst' in req.query &&
      typeof req.query.profFirst === 'string' &&
      'profLast' in req.query &&
      typeof req.query.profLast === 'string';
    const sectionNumberDefined =
      'sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string';
    let results: SearchQuery[] = [];

    const query: SearchQuery = {};
    if (prefexDefined) {
      query.prefix = req.query.prefix as string;
    }
    if (numberDefined) {
      query.number = req.query.number as string;
    }
    if (professorNameDefined) {
      query.profFirst = req.query.profFirst as string;
      query.profLast = req.query.profLast as string;
    }
    if (sectionNumberDefined) {
      query.sectionNumber = req.query.sectionNumber as string;
    }

    let limit = 20;
    if ('limit' in req.query && typeof req.query.limit === 'string') {
      limit = Number(req.query.limit);
    }

    return new Promise<void>((resolve) => {
      if (
        prefexDefined &&
        numberDefined &&
        sectionNumberDefined &&
        professorNameDefined
      ) {
        results.push(
          ...searchAutocomplete(
            graph,
            (req.query.prefix as string) +
              (req.query.number as string) +
              '.' +
              (req.query.sectionNumber as string) +
              ' ',
            limit,
          ),
        );
      } else if (prefexDefined && numberDefined && professorNameDefined) {
        results.push(
          ...searchAutocomplete(
            graph,
            (req.query.prefix as string) + (req.query.number as string) + ' ',
            limit,
          ),
        );
      }
      if (results.length < limit) {
        results.push(
          ...searchAutocomplete(graph, searchQueryLabel(query) + ' ', limit),
        );
        results = results.filter(
          (query1: SearchQuery, index, self) =>
            self.findIndex((query2: SearchQuery) =>
              searchQueryEqual(query1, query2),
            ) === index,
        );
      }
      results = results.filter((result) => !searchQueryEqual(result, query));
      res.status(200).json({
        message: 'success',
        data: results,
      });
      resolve();
    });
  } else {
    res.status(400).json({ message: 'Incorrect query parameters' });
  }
}
