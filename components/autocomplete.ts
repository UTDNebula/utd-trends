import autocompleteGraph from '../data/autocomplete_graph.json';
import { DirectedGraph } from 'graphology';

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

type NodeAttributes = {
  character: string;
  data?: SearchQuery;
  visited: boolean;
};

const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
  allowSelfLoops: false,
});
graph.import(autocompleteGraph as Object);
const root = '0';
type QueueItem = {
  node: string;
  characters?: string;
  toNext: boolean;
};

function bfsRecursionToNextData(queue: QueueItem[]) {
  const queueItem = queue.shift();
  //console.log(graph.getNodeAttribute(queueItem?.node, 'character'));
  if (graph.getNodeAttribute(queueItem?.node, 'visited')) {
    return;
  }
  graph.setNodeAttribute(queueItem?.node, 'visited', true);
  const data = graph.getNodeAttribute(queueItem?.node, 'data');
  if (typeof data !== 'undefined') {
    return data;
  } else {
    graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
      queue.push({
        node: neighbor,
        toNext: true,
      });
    });
  }
  return;
}

function bfsRecursion(queue: QueueItem[]) {
  const queueItem = queue.shift();
  if (
    queueItem?.characters?.[0] ===
    graph.getNodeAttribute(queueItem?.node, 'character')
  ) {
    //match
    //console.log('match: ', queueItem?.characters, queueItem?.characters?.length === 1);
    if (queueItem?.characters?.length === 1) {
      //last character
      graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
        //console.log('toNext: ', graph.getNodeAttribute(neighbor, 'character'));
        queue.push({
          node: neighbor,
          toNext: true,
        });
      });
      const data = graph.getNodeAttribute(queueItem?.node, 'data');
      if (typeof data !== 'undefined') {
        //has data
        return data;
      }
    } else {
      graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
        //console.log('queue: ', graph.getNodeAttribute(neighbor, 'character'));
        queue.push({
          node: neighbor,
          characters: queueItem?.characters?.slice(1),
          toNext: false,
        });
      });
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
  let queue: QueueItem[] = [];
  graph.forEachOutNeighbor(root, (neighbor) => {
    queue.push({
      node: neighbor,
      characters: query,
      toNext: query.length === 0, //bfsToNext if blank search string
    });
  });
  let results: SearchQuery[] = [];
  while (queue.length) {
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
