import { NextApiRequest, NextApiResponse } from 'next';
import { DirectedGraph } from 'graphology';
import autocompleteGraph from '../../data/autocomplete_graph.json';

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

type NodeAttributes = {
  c: string;
  d?: SearchQuery;
  visited?: boolean;
};

const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
  allowSelfLoops: false,
});
graph.import(autocompleteGraph as Object);
const root = '0';
graph.updateEachNodeAttributes((node, attr) => {
  return {
    ...attr,
    visited: false,
  };
});

type QueueItem = {
  node: string;
  characters: string;
  toNext: boolean;
};

function bfsRecursionToNextData(queue: QueueItem[]) {
  const queueItem = queue.shift();
  //console.log(graph.getNodeAttribute(queueItem?.node, 'c'));
  if (graph.getNodeAttribute(queueItem?.node, 'visited')) {
    return;
  }
  graph.setNodeAttribute(queueItem?.node, 'visited', true);
  const data = graph.getNodeAttribute(queueItem?.node, 'd');
  if (typeof data !== 'undefined') {
    return data;
  } else {
    graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
      queue.push({
        node: neighbor,
        characters: '',
        toNext: true,
      });
    });
  }
  return;
}

function bfsRecursion(queue: QueueItem[]) {
  const queueItem = queue.shift();
  if (typeof queueItem === 'undefined') {
    //satisfy typescript possibly undefined error
    return;
  }

  //results
  let queueRecursion = false;
  let queueToNext = false;
  let returnData = false;

  //# of characters matched
  const nodeCharacters = graph.getNodeAttribute(queueItem?.node, 'c');
  let matches = 0;
  while (
    matches < nodeCharacters.length &&
    queueItem?.characters?.[0] === nodeCharacters[0]
  ) {
    matches++;
  }

  if (
    /*queueItem?.characters?.[0] ===
    graph.getNodeAttribute(queueItem?.node, 'c')*/
    nodeCharacters.length === matches ||
    queueItem?.characters?.length === matches
  ) {
    //full match or end of characters to match but all matched
    //console.log('match: ', queueItem?.characters, queueItem?.characters?.length === 1);
    if (queueItem?.characters?.length <= nodeCharacters.length) {
      //last characters
      queueToNext = true;
      returnData = true;
    } else {
      queueRecursion = true;
    }
  } else if (
    matches > 0 &&
    queueItem?.characters?.length < nodeCharacters.length
  ) {
    //partial match
    queueToNext = true;
    returnData = true;
  }

  if (queueRecursion) {
    graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
      //console.log('queue: ', graph.getNodeAttribute(neighbor, 'c'));
      queue.push({
        node: neighbor,
        characters: queueItem?.characters?.slice(matches),
        toNext: false,
      });
    });
  }
  if (queueToNext) {
    graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
      //console.log('toNext: ', graph.getNodeAttribute(neighbor, 'c'));
      queue.push({
        node: neighbor,
        characters: '',
        toNext: true,
      });
    });
  }
  if (returnData) {
    const data = graph.getNodeAttribute(queueItem?.node, 'd');
    if (typeof data !== 'undefined') {
      //has data
      return data;
    }
  }
}

type bfsReturn = SearchQuery | undefined;

export function searchAutocomplete(query: string) {
  query = query.trimStart().toUpperCase();
  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      visited: false,
    };
  });
  let queue: QueueItem[] = [];
  graph.forEachOutNeighbor(root, (neighbor) => {
    queue.push({
      node: neighbor,
      characters: query,
      toNext: query.length === 0, //bfsToNext if blank search string
    });
  });
  let results: SearchQuery[] = [];
  while (queue.length && results.length < 20) {
    let response: bfsReturn;
    if (queue[0].toNext) {
      response = bfsRecursionToNextData(queue);
    } else {
      response = bfsRecursion(queue);
    }
    if (typeof response !== 'undefined') {
      results.push(response);
    }
  }
  return results;
}

type Data = {
  message: string;
  data?: SearchQuery[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    return new Promise<void>((resolve, reject) => {
      res.status(200).json({
        message: 'success',
        data: searchAutocomplete(req.query.input as string),
      });
      resolve();
    });
  } else if (
    ('prefix' in req.query && typeof req.query.prefix === 'string') ||
    ('number' in req.query && typeof req.query.number === 'string') ||
    ('professorName' in req.query &&
      typeof req.query.professorName === 'string') ||
    ('sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string')
  ) {
    const prefexDefined =
      'prefix' in req.query && typeof req.query.prefix === 'string';
    const numberDefined =
      'number' in req.query && typeof req.query.number === 'string';
    const professorNameDefined =
      'professorName' in req.query &&
      typeof req.query.professorName === 'string';
    const sectionNumberDefined =
      'sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string';
    let results: SearchQuery[] = [];

    let query: SearchQuery = {};
    if (prefexDefined) {
      query.prefix = req.query.prefix as string;
    }
    if (numberDefined) {
      query.number = req.query.number as string;
    }
    if (professorNameDefined) {
      query.professorName = req.query.professorName as string;
    }
    if (sectionNumberDefined) {
      query.sectionNumber = req.query.sectionNumber as string;
    }

    return new Promise<void>((resolve, reject) => {
      if (prefexDefined && numberDefined && professorNameDefined) {
        results.push(
          ...searchAutocomplete(
            (req.query.prefix as string) + (req.query.number as string) + ' ',
          ),
        );
      } else if (prefexDefined && numberDefined) {
        results.push(...searchAutocomplete((req.query.prefix as string) + ' '));
      }
      if (results.legnth < 10) {
        results.push(...searchAutocomplete(searchTermURIString(query) + ' '));
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

function searchQueryEqual(query1: SearchQuery, query2: SearchQuery) {
  if (query1.prefix !== query2.prefix) {
    return false;
  }
  if (query1.professorName !== query2.professorName) {
    return false;
  }
  if (query1.number !== query2.number) {
    return false;
  }
  if (query1.sectionNumber !== query2.sectionNumber) {
    return false;
  }
  return true;
}

function searchTermURIString(query: SearchQuery): string {
  let result = '';
  if (query.prefix !== undefined) {
    result += query.prefix;
  }
  if (query.number !== undefined) {
    result += ' ' + query.number;
  }
  if (query.sectionNumber !== undefined) {
    result += '.' + query.sectionNumber;
  }
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  return result.trim();
}
