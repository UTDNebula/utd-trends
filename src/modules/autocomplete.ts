import untypedCoursePrefixNumberTable from '@/data/course_prefix_number_table.json';
import type { NodeAttributes } from '@/scripts/generateAutocompleteGraph';
import {
  convertToCourseOnly,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQuery,
} from '@/types/SearchQuery';
import { DirectedGraph } from 'graphology';

const root = '0';

const coursePrefixNumberTable = untypedCoursePrefixNumberTable as {
  [key: string]: string;
};

export function getGraph(data: object) {
  const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
    allowSelfLoops: false,
  });
  graph.import(data);
  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      visited: false,
    };
  });
  return graph;
}

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

// bfs search from node in DAG, only until next result can be returned
function bfsRecursionToNextData(graph: DirectedGraph, queue: PriorityQueue) {
  const queueItem = queue.dequeue();
  //satisfy typescript possibly undefined error
  if (typeof queueItem === 'undefined') {
    return;
  }
  if (graph.getNodeAttribute(queueItem.data.node, 'visited')) {
    return;
  }
  graph.setNodeAttribute(queueItem.data.node, 'visited', true);
  const data = graph.getNodeAttribute(queueItem.data.node, 'd');
  if (typeof data !== 'undefined') {
    graph.forEachOutNeighbor(queueItem.data.node, (neighbor) => {
      queue.enqueue({
        priority:
          queueItem.priority +
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
    graph.forEachOutNeighbor(queueItem.data.node, (neighbor) => {
      queue.enqueue({
        priority:
          queueItem.priority + graph.getNodeAttribute(neighbor, 'c').length,
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

// bfs search from node in DAG, adding children to priorirty queue if parant matches search string
function bfsRecursion(graph: DirectedGraph, queue: PriorityQueue) {
  const queueItem = queue.dequeue();
  //satisfy typescript possibly undefined error
  if (typeof queueItem === 'undefined') {
    return;
  }

  //results
  let queueRecursion = false;
  let queueToNext = false;
  let returnData = false;

  //# of characters matched
  const nodeCharacters = graph.getNodeAttribute(queueItem.data.node, 'c');
  let matches = 0;
  while (
    matches < nodeCharacters.length &&
    matches < queueItem.data.characters.length
  ) {
    if (queueItem.data.characters[matches] === nodeCharacters[matches]) {
      matches++;
    } else {
      return;
    }
  }

  if (
    nodeCharacters.length === matches ||
    queueItem.data.characters.length === matches
  ) {
    //full match or end of characters to match but all matched
    if (queueItem.data.characters.length === matches) {
      //last characters
      queueToNext = true;
      returnData = true;
    } else {
      queueRecursion = true;
    }
  } else if (
    matches > 0 &&
    queueItem.data.characters.length <= nodeCharacters.length
  ) {
    //partial match
    queueToNext = true;
    returnData = true;
  }

  if (queueRecursion) {
    graph.forEachOutNeighbor(queueItem.data.node, (neighbor) => {
      queue.enqueue({
        priority:
          queueItem.priority + graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: queueItem.data.characters.slice(matches),
          toNext: false,
        },
      });
    });
  }
  if (queueToNext) {
    graph.forEachOutNeighbor(queueItem.data.node, (neighbor) => {
      queue.enqueue({
        priority:
          queueItem.priority + graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
  }
  if (returnData) {
    const data = graph.getNodeAttribute(queueItem.data.node, 'd');
    if (typeof data !== 'undefined') {
      //has data
      return data;
    }
  }
}

//Check that search matches searchBy type
function validateSearch(searchQuery: SearchQuery, searchBy: string) {
  if (searchBy === 'any') {
    return true;
  }
  if (
    searchBy === 'professor' &&
    !('prefix' in searchQuery) &&
    !('number' in searchQuery) &&
    !('sectionNumber' in searchQuery)
  ) {
    return true;
  }
  if (
    searchBy === 'course' &&
    !('profFirst' in searchQuery) &&
    !('profLast' in searchQuery) &&
    Object.keys(searchQuery).length !== 1
  ) {
    return true;
  }
  return false;
}

type bfsReturn = SearchQuery | undefined;

// search autocomplete program using a DAG (more specifically a radix tree) to search for matches until limit is reached
export function searchAutocomplete(
  graph: DirectedGraph,
  query: string,
  limit: number,
  searchBy = 'any',
) {
  query = query.trimStart().toUpperCase();
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

  type SearchQueryWithTitleAndStudents = SearchQuery & {
    title?: string;
    subtitle?: string;
    totalStudents?: number;
  };

  let results: SearchQueryWithTitleAndStudents[] = [];
  while (!queue.isEmpty() && results.length < limit) {
    let response: bfsReturn;
    if (queue.front()?.data?.toNext) {
      response = bfsRecursionToNextData(graph, queue);
    } else {
      response = bfsRecursion(graph, queue);
    }
    if (typeof response !== 'undefined' && validateSearch(response, searchBy)) {
      results.push(response);
    }
  }

  results = results.map((result) => {
    return {
      ...result,
      subtitle:
        coursePrefixNumberTable[searchQueryLabel(convertToCourseOnly(result))],
    };
  });

  return results.filter(
    (option, index, self) =>
      index === self.findIndex((t) => searchQueryEqual(t, option)),
  );
}
