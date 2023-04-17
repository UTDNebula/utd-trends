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
  priority: number;
  data: {
    node: string;
    characters: string;
    toNext: boolean;
  };
};

class PriorityQueue {
  items: QueueItem[];
  constructor() {
    this.items = [];
  }
  enqueue(queueItem: QueueItem) {
    let contain = false;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > queueItem.priority) {
        this.items.splice(i, 0, queueItem);
        contain = true;
        break;
      }
    }
    if (!contain) {
      this.items.push(queueItem);
    }
  }
  dequeue() {
    if (this.isEmpty()) {
      return;
    }
    return this.items.shift();
  }
  front() {
    if (this.isEmpty()) {
      return;
    }
    return this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

function bfsRecursionToNextData(queue: PriorityQueue) {
  const queueItem = queue.dequeue();
  //console.log(graph.getNodeAttribute(queueItem?.data?.node, 'c'));
  if (graph.getNodeAttribute(queueItem?.data?.node, 'visited')) {
    return;
  }
  graph.setNodeAttribute(queueItem?.data?.node, 'visited', true);
  const data = graph.getNodeAttribute(queueItem?.data?.node, 'd');
  if (typeof data !== 'undefined') {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          100 +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
    return data;
  } else {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
  }
  return;
}

function bfsRecursion(queue: PriorityQueue) {
  const queueItem = queue.dequeue();
  if (typeof queueItem?.data === 'undefined') {
    //satisfy typescript possibly undefined error
    return;
  }

  //results
  let queueRecursion = false;
  let queueToNext = false;
  let returnData = false;

  //# of characters matched
  const nodeCharacters = graph.getNodeAttribute(queueItem?.data?.node, 'c');
  let matches = 0;
  while (
    matches < nodeCharacters.length &&
    matches < queueItem?.data?.characters?.length
  ) {
    if (queueItem?.data?.characters?.[matches] === nodeCharacters[matches]) {
      matches++;
    } else {
      return;
    }
  }

  if (
    nodeCharacters.length === matches ||
    queueItem?.data?.characters?.length === matches
  ) {
    //full match or end of characters to match but all matched
    //console.log('match: ', queueItem?.data?.characters, queueItem?.data?.characters?.length === 1);
    if (queueItem?.data?.characters?.length === matches) {
      //last characters
      queueToNext = true;
      returnData = true;
    } else {
      queueRecursion = true;
    }
  } else if (
    matches > 0 &&
    queueItem?.data?.characters?.length <= nodeCharacters.length
  ) {
    //partial match
    queueToNext = true;
    returnData = true;
  }

  if (queueRecursion) {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      //console.log('queue: ', graph.getNodeAttribute(neighbor, 'c'));
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: queueItem?.data?.characters?.slice(matches),
          toNext: false,
        },
      });
    });
  }
  if (queueToNext) {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      //console.log('toNext: ', graph.getNodeAttribute(neighbor, 'c'));
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
  }
  if (returnData) {
    const data = graph.getNodeAttribute(queueItem?.data?.node, 'd');
    if (typeof data !== 'undefined') {
      //has data
      return data;
    }
  }
}

type bfsReturn = SearchQuery | undefined;

export function searchAutocomplete(query: string) {
  query = query.trim().toUpperCase();
  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      visited: false,
    };
  });
  const queue = new PriorityQueue();
  graph.forEachOutNeighbor(root, (neighbor) => {
    queue.enqueue({
      priority: graph.getNodeAttribute(neighbor, 'c').length,
      data: {
        node: neighbor,
        characters: query,
        toNext: query.length === 0, //bfsToNext if blank search string
      },
    });
  });
  let results: SearchQuery[] = [];
  while (!queue.isEmpty() && results.length < 20) {
    let response: bfsReturn;
    if (queue.front()?.data?.toNext) {
      response = bfsRecursionToNextData(queue);
    } else {
      response = bfsRecursion(queue);
    }
    if (typeof response !== 'undefined') {
      results.push(response);
    }
  }
  return results.filter(
    (option, index, self) =>
      index ===
      self.findIndex((t) => {
        if (t.prefix !== option.prefix) {
          return false;
        }
        if (t.professorName !== option.professorName) {
          return false;
        }
        if (t.number !== option.number) {
          return false;
        }
        if (t.sectionNumber !== option.sectionNumber) {
          return false;
        }
        return true;
      }),
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    return new Promise<void>((resolve, reject) => {
      res.status(200).json({
        success: true,
        output: searchAutocomplete(req.query.input as string),
      });
      resolve();
    });
  } else {
    res.status(400).json({ message: 'Incorrect query parameters' });
  }
}
