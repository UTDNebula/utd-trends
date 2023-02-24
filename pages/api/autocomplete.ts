import { NextApiRequest, NextApiResponse } from 'next';
import { DirectedGraph } from 'graphology';

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
  { prefix: myPrefixes[0], number: 1337, professors: [myProfessors[0]] },
  { prefix: myPrefixes[0], number: 1336, professors: [myProfessors[1]] },
  {
    prefix: myPrefixes[0],
    number: 2337,
    professors: Array.of(myProfessors[0]),
  },
];

myProfessors[0].classes.push(myClasses[0], myClasses[1]);
myProfessors[1].classes.push(myClasses[0]);

myPrefixes[0].classes.push(myClasses[0], myClasses[1]);
myPrefixes[2].classes.push(myClasses[0], myClasses[1]);

type NodeAttributes = {
  character: string;
  data?: SearchQuery;
  visited: boolean;
};

const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
  allowSelfLoops: false,
});
let numNodes = 0; //allows a unique name for each node
const root = graph.addNode(numNodes++, {
  character: '',
  visited: false,
});

function addSearchQueryCharacter(
  node: string,
  characters: string,
  data?: SearchQuery,
): string {
  characters = characters.toUpperCase();
  let preExisting = graph.findOutNeighbor(
    node,
    (neighbor, attributes) => attributes.character === characters[0],
  );
  if (typeof preExisting === 'string') {
    if (characters.length <= 1) {
      //console.log('found: ', characters[0], 'end');
      return preExisting;
    }
    //console.log('found: ', characters[0]);
    return addSearchQueryCharacter(preExisting, characters.slice(1), data);
  }
  if (characters.length <= 1) {
    //console.log('new: ', characters[0], 'end');
    const newNode = graph.addNode(numNodes++, {
      character: characters[0],
      data: data,
      visited: false,
    });
    graph.addEdge(node, newNode);
    return newNode;
  }
  //console.log('new: ', characters[0]);
  const newNode = graph.addNode(numNodes++, {
    character: characters[0],
    visited: false,
  });
  graph.addEdge(node, newNode);
  return addSearchQueryCharacter(newNode, characters.slice(1), data);
}

for (let i = 0; i < myPrefixes.length; i++) {
  //add all nodes
  //console.log(myPrefixes[i].value);
  const prefixNode = addSearchQueryCharacter(root, myPrefixes[i].value, {
    prefix: myPrefixes[i].value,
  });
  const prefixSpaceNode = graph.addNode(numNodes++, {
    character: ' ',
    visited: false,
  });
  graph.addEdge(prefixNode, prefixSpaceNode);
  for (let j = 0; j < myPrefixes[i].classes.length; j++) {
    //console.log(myPrefixes[i].classes[j].number);
    const classNode = addSearchQueryCharacter(
      prefixSpaceNode,
      myPrefixes[i].classes[j].number.toString(),
      {
        prefix: myPrefixes[i].value,
        number: myPrefixes[i].classes[j].number,
      },
    );
    const classSpaceNode = graph.addNode(numNodes++, {
      character: ' ',
      visited: false,
    });
    graph.addEdge(classNode, classSpaceNode);
    for (let k = 0; k < myPrefixes[i].classes[j].professors.length; k++) {
      //console.log(myPrefixes[i].classes[j].professors[k].firstName + myPrefixes[i].classes[j].professors[k].lastName);
      //class -> first name -> last name
      //class -> last name
      const professorFirstNameNode = addSearchQueryCharacter(
        classSpaceNode,
        myPrefixes[i].classes[j].professors[k].firstName + ' ',
      );
      const professorLastNameFirstCharNode = addSearchQueryCharacter(
        classSpaceNode,
        myPrefixes[i].classes[j].professors[k].lastName[0],
      );
      graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
      const professorLastNameNode = addSearchQueryCharacter(
        professorLastNameFirstCharNode,
        myPrefixes[i].classes[j].professors[k].lastName.slice(1),
        {
          prefix: myPrefixes[i].value,
          number: myPrefixes[i].classes[j].number,
          professorName:
            myPrefixes[i].classes[j].professors[k].firstName +
            ' ' +
            myPrefixes[i].classes[j].professors[k].lastName,
        },
      );
    }
  }
}

/*reduces graph size by compressing chains of nodes each with only one child
to a single node with a character value of several characters. I couldn't get
this work with my bfs implemintation as the bfs needs to know the difference
between each character.
Requires readding an attribute to nodes representing their place as either a
prefix, number, or prof name. I called this depth: 0, 1, 2.
-Tyler
*/
/*function checkForSingleChild(node: string) {
  if (graph.outDegree(node) > 1) {
    graph.forEachOutNeighbor(node, neighbor => checkForSingleChild(neighbor));
  } else {
    graph.forEachOutNeighbor(node, (singleChild, attributes) => { //will only return once
      if (graph.getNodeAttribute(node, 'depth') !== attributes.depth) {
        checkForSingleChild(singleChild);
      } else {
        graph.updateNodeAttribute(node, 'character', n => n + attributes.character);
        if (typeof attributes.data !== 'undefined') {
          graph.setNodeAttribute(node, 'data', attributes.data);
        }
        graph.forEachOutNeighbor(singleChild, grandchild => {
          graph.dropEdge(singleChild, grandchild);
          graph.addEdge(node, grandchild);
        });
        graph.dropNode(singleChild);
        checkForSingleChild(node);
      }
    });
  }
}
checkForSingleChild(root);*/

type QueueItem = {
  node: string;
  characters?: string;
  matched: boolean;
};

function bfsToNextData(queue: QueueItem[]) {
  const queueItem = queue.shift();
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
        matched: false,
      });
    });
  }
  return;
}

function bfsRecursion(queue: QueueItem[]) {
  const queueItem = queue.shift();
  const data = graph.getNodeAttribute(queueItem?.node, 'data');
  const hasData = typeof data !== 'undefined';
  const lastChar = queueItem?.characters?.length === 1;
  if (
    queueItem?.characters?.[0] ===
    graph.getNodeAttribute(queueItem?.node, 'character')
  ) {
    //match
    if (lastChar) {
      graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
        queue.push({
          node: neighbor,
          matched: false,
        });
      });
      if (hasData) {
        return data;
      }
    } else {
      graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
        queue.push({
          node: neighbor,
          characters: queueItem?.characters?.slice(1),
          matched: true,
        });
      });
    }
  } else {
    if (lastChar) {
      if (!hasData) {
        graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
          queue.push({
            node: neighbor,
            matched: false,
          });
        });
      }
    }
  }
}

type bfsReturn = SearchQuery | undefined;

function bfs(node: string, characters: string) {
  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      visited: false,
    };
  });
  let queue: QueueItem[] = [];
  graph.forEachOutNeighbor(node, (neighbor) => {
    queue.push({
      node: neighbor,
      characters: characters,
      matched: true,
    });
  });
  let results: SearchQuery[] = [];
  while (queue.length) {
    let response: bfsReturn;
    if (queue[0].matched) {
      response = bfsRecursion(queue);
    } else {
      response = bfsToNextData(queue);
    }
    if (typeof response !== 'undefined') {
      results.push(response);
    }
  }
  return results;
}

type ErrorState = {
  error: string;
};
type SuccessState = {
  data: SearchQuery[];
};
type Data = ErrorState | SuccessState;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    const parsedInput = decodeURIComponent(req.query.input).trim().toUpperCase();
    /*console.log(bfs(root, 'C'));
    console.log(bfs(root, 'CS'));
    console.log(bfs(root, 'CS '));
    console.log(bfs(root, 'CS 1'));
    console.log(bfs(root, 'CS 133'));
    console.log(bfs(root, 'CS 1336'));
    console.log(bfs(root, 'CS 1336 '));
    console.log(bfs(root, 'CS 1336 C'));
    console.log(bfs(root, 'CS 1336 A'));
    console.log(bfs(root, 'CS 1336 CS'));
    console.log(bfs(root, 'CS 1336 AC'));*/
    res.status(200).json({ data: bfs(root, parsedInput) });
  } else {
    res.status(400).json({ error: 'No input, or invalid type of input' });
  }
}
