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
  { prefix: myPrefixes[2], number: 1337, professors: [myProfessors[0]] },
  { prefix: myPrefixes[2], number: 1336, professors: [myProfessors[1]] },
  {
    prefix: myPrefixes[0],
    number: 2337,
    professors: Array.of(myProfessors[0]),
  },
];

myProfessors[0].classes.push(myClasses[0]);
myProfessors[0].classes.push(myClasses[2]);
myProfessors[1].classes.push(myClasses[1]);
myProfessors[1].classes.push(myClasses[3]);

myPrefixes[0].classes.push(myClasses[0], myClasses[1]);
myPrefixes[2].classes.push(myClasses[2], myClasses[3]);

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

//Add nodes in format: (<prefix> <number> or <prefix><number>) (<professorLast> or <professorFirst> <professorLast>)
for (let i = 0; i < myPrefixes.length; i++) {
  //add all nodes
  //console.log(myPrefixes[i].value);
  const prefixNode = addSearchQueryCharacter(root, myPrefixes[i].value, {
    prefix: myPrefixes[i].value,
  });
  const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
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
    const classSpaceNode = addSearchQueryCharacter(classNode, ' ');
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
  graph.forEachOutNeighbor(prefixSpaceNode, (child) => {
    //support no space between prefix and number
    graph.addEdge(prefixNode, child);
  });
}

//Add nodes in format: (<professorLast> or <professorFirst> <professorLast>) (<prefix> <number> or <prefix><number>)
for (let i = 0; i < myProfessors.length; i++) {
  console.log(myProfessors[i].firstName + ' ' + myProfessors[i].lastName);
  //root -> first name -> last name
  //root -> last name
  const professorFirstNameNode = addSearchQueryCharacter(
    root,
    myProfessors[i].firstName + ' ',
  );
  const professorLastNameFirstCharNode = addSearchQueryCharacter(
    root,
    myProfessors[i].lastName[0],
  );
  graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
  const professorLastNameNode = addSearchQueryCharacter(
    professorLastNameFirstCharNode,
    myProfessors[i].lastName.slice(1) + ' ',
    {
      professorName: myProfessors[i].firstName + ' ' + myProfessors[i].lastName,
    },
  );
  for (let j = 0; j < myProfessors[i].classes.length; j++) {
    console.log(
      myProfessors[i].classes[j].prefix.value +
        ' ' +
        myProfessors[i].classes[j].number,
    );
    const prefixNode = addSearchQueryCharacter(
      professorLastNameNode,
      myProfessors[i].classes[j].prefix.value,
    );
    const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
    const classNodeFirstChar = addSearchQueryCharacter(
      prefixSpaceNode,
      myProfessors[i].classes[j].number.toString()[0],
    );
    graph.addEdge(prefixNode, classNodeFirstChar);
    const classNode = addSearchQueryCharacter(
      classNodeFirstChar,
      myProfessors[i].classes[j].number.toString().slice(1),
      {
        prefix: myProfessors[i].classes[j].prefix.value,
        number: myProfessors[i].classes[j].number,
        professorName:
          myProfessors[i].firstName + ' ' + myProfessors[i].lastName,
      },
    );
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
  toNext: boolean;
};

function bfsToNextData(queue: QueueItem[]) {
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
      toNext: false,
    });
  });
  let results: SearchQuery[] = [];
  while (queue.length) {
    let response: bfsReturn;
    if (queue[0].toNext) {
      response = bfsToNextData(queue);
    } else {
      response = bfsRecursion(queue);
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
    const parsedInput = decodeURIComponent(req.query.input)
      .trim()
      .toUpperCase();
    /*console.log('C', bfs(root, 'C'));
    console.log('CS', bfs(root, 'CS'));
    console.log('CS ', bfs(root, 'CS '));
    console.log('CS 1', bfs(root, 'CS 1'))
    console.log('CS1', bfs(root, 'CS1'));
    console.log('CS 133', bfs(root, 'CS 133'));
    console.log('CS133', bfs(root, 'CS133'));
    console.log('CS 1336', bfs(root, 'CS 1336'));
    console.log('CS 1336 ', bfs(root, 'CS 1336 '));
    console.log('CS 1336 C', bfs(root, 'CS 1336 C'));
    console.log('CS 1336 A', bfs(root, 'CS 1336 A'));
    console.log('CS 1336 CS', bfs(root, 'CS 1336 CS'));
    console.log('CS 1336 AC', bfs(root, 'CS 1336 AC'));
    console.log('A', bfs(root, 'A'));
    console.log('T', bfs(root, 'T'));
    console.log('AR', bfs(root, 'AR'));
    console.log('ARCS', bfs(root, 'ARCS'));
    console.log('TEST', bfs(root, 'TEST'));
    console.log('TEST ', bfs(root, 'TEST '));
    console.log('TEST CS1', bfs(root, 'TEST CS1'));
    console.log('TEST CS 1', bfs(root, 'TEST CS 1'));*/
    res.status(200).json({ data: bfs(root, parsedInput) });
  } else {
    res.status(400).json({ error: 'No input, or invalid type of input' });
  }
}
