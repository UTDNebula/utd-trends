import { NextApiRequest, NextApiResponse } from 'next';

import autocompleteGraph from '../../data/autocomplete_graph.json';
import {
  getGraph,
  searchAutocomplete,
} from '../../modules/autocomplete/autocomplete';
import type SearchQuery from '../../modules/SearchQuery/SearchQuery';

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
      (req.query.searchBy === 'professor' || req.query.searchBy === 'course')
    ) {
      searchBy = req.query.searchBy;
    }
    let limit = 20;
    if ('limit' in req.query && typeof req.query.limit === 'string') {
      limit = Number(req.query.limit);
    }
    return new Promise<void>((resolve) => {
      res.status(200).json({
        message: 'success',
        data: searchAutocomplete(
          graph,
          req.query.input as string,
          limit,
          searchBy,
        ),
      });
      resolve();
    });
  } else {
    res.status(400).json({ message: 'Incorrect query parameters' });
  }
}
